'use strict';

//override node.js core modules (!!!) to allow offline local dns resolution on windows
if (process.env.NODE_ENV === 'development') { require('node-offline-localhost').always(); }

var config = require('../config');
var clients = {
  mongoose: require('mongoose').createConnection(
    config.dbPath, {
      user: config.credentials.mongoDB.userName,
      pass: config.credentials.mongoDB.password,
      server: {
        ssl: true,
        sslCA: config.certs.rootCertificate
      }
    }
  ),
  redis: require('redis').createClient({
    password: config.credentials.redis.password
  })
};

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