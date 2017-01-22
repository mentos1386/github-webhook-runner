'use strict';
const express    = require('express');
const server     = express();
const bodyParser = require('body-parser');
const _          = require('lodash');
const crypto     = require('crypto');
const bufferEq   = require('buffer-equal-constant-time');

// Use bodyParser
server.use(bodyParser.json({ type : 'application/json' }));

// Trust NGINX proxy
server.set('trust proxy');

function signData( secret, data ) {
  return 'sha1=' + crypto.createHmac('sha1', secret).update(data).digest('hex');
}

// Load all hooks
const hooks = require('require-all')({
  dirname : __dirname + '/hooks'
});

// Load hook secrets
const secrets = require('./secrets');

// Route for hooks
server.post('/:webhook', ( req, res ) => {
  const webhook = req.params.webhook;

  // Try to find hook
  const hook = _.find(_.keys(hooks), hook => hook === webhook);
  if ( !hook ) {
    console.log(`ACCESS : ${req.ip} : Used wrong hook`);
    return res.status(404).send();
  }

  const payload        = req.body;
  const providedSecret = req.headers[ 'x-hub-signature' ] || '';
  const hookData       = _.find(secrets, { name : webhook });

  // Verify secret, if wrong, return 404
  if ( !bufferEq(new Buffer(providedSecret), new Buffer(signData(hookData.secret, JSON.stringify(payload)))) ) {
    console.log(`ACCESS : ${req.ip} : Used wrong secret`);
    return res.status(404).send();
  }

  // Request verified, proceed
  hook.run(payload);

  // Return 200
  res.send(200)
});

server.listen(3001, () => console.log('Webhook runner started'));
