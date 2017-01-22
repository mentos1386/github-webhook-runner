'use strict';
const express    = require('express');
const server     = express();
const bodyParser = require('body-parser');
const _          = require('lodash');

// Use bodyParser
app.use(bodyParser.json({ type : 'application/json' }));

// Load all hooks
const hooks = require('require-all')({
  dirname : __dirname + '/hooks'
});

// Load hook secrets
const secrets = require('./secrets');

server.get('/:webhook', ( req, res ) => {
  const webhook = req.params.webhook;

  // If hook isn't found, return 400
  if ( !_.find(_.keys(hooks), hook => hook === webhook) ) res.status(400).send();

  const payload        = req.body;
  const providedSecret = payload && payload.hook && payload.hook.config ? payload.hook.config.secret : null;
  const hook           = _.find(secrets, { name : webhook });

  // Verify secret
  if ( hook.secret !== providedSecret ) res.status(400).send();

  // Request verified, proceed
  hook.run(payload);

  // Return 200
  res.send(200)
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
