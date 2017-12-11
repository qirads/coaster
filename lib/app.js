'use strict';

require('dotenv').config();

//override node.js core modules (!!!) to allow offline local dns resolution on windows
if (process.env.NODE_ENV === 'development') { require('node-offline-localhost').always(); }

var clients = require('./clients');
var express = require('express');
var helmet = require('helmet');
var limiterWrapper = require('./limiter.wrapper')(clients.redis);
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
  
var app = express();

app.use(helmet());
if (process.env.NODE_ENV !== 'development') { app.use(limiterWrapper); }
app.use(logger(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(bodyParser.json());
app.use(cors());

require('../routes')(app, clients);

module.exports = app;