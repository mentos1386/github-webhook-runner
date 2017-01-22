'use strict';
const express    = require('express');
const server     = express();
const bodyParser = require('body-parser');
const _          = require('lodash');

// Use bodyParser
server.use(bodyParser.json({ type : 'application/json' }));

// Trust NGINX proxy
server.set('trust proxy', 'loopback');

// Load all hooks
const hooks = require('require-all')({
  dirname : __dirname + '/hooks'
});

// Load hook secrets
const secrets = require('./secrets');

// Route for hooks
server.post('/:webhook', ( req, res ) => {
  const webhook = req.params.webhook;

  // If hook isn't found, return 404
  if ( !_.find(_.keys(hooks), hook => hook === webhook) ) {
    console.log(`ACCESS : ${req.ip} : Used wrong hook`);
    return res.status(404).send();
  }

  const payload        = req.body;
  const providedSecret = payload && payload.hook && payload.hook.config ? payload.hook.config.secret : null;
  const hook           = _.find(secrets, { name : webhook });

  // Verify secret, if wrong, return 404
  if ( hook.secret !== providedSecret ) {
    console.log(`ACCESS : ${req.ip} : Used wrong secret`);
    return res.status(404).send();
  }

  // Request verified, proceed
  hook.run(payload);

  // Return 200
  res.send(200)
});

server.listen(3001, () => console.log('Webhook runner started'));
