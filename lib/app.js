'use strict';

//override node.js core modules (!!!) to allow offline local dns resolution on windows
if (process.env.NODE_ENV === 'development') { require('node-offline-localhost').always(); }

var config = require('../config');
var clients = require('./clients')(config);
var express = require('express');
var helmet = require('helmet');
var limiterWrapper = require('./limiter.wrapper')(clients.redis);
var logger = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
  
var app = express();

app.use(helmet());
if (app.get('env') !== 'development') { app.use(limiterWrapper); }
app.use(logger(app.get('env') === 'development' ? 'dev' : 'combined'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

require('../routes')(app, config, clients);

module.exports = app;