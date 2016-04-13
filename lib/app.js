'use strict';

//override node.js core modules (!!!) to allow offline local dns resolution on windows
if (process.env.NODE_ENV === 'development') { require('../utils').offline(); }

var express = require('express');
var helmet = require('helmet');
var limiterWrapper = require('./limiter.wrapper');
var logger = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var config = require('../config');
var mongoose = require('mongoose').connect(config.dbPath);

var app = express();

app.use(helmet());
app.use(limiterWrapper());
app.use(logger(app.get('env') === 'development' ? 'dev' : 'combined'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

require('../models')(config);
require('../routes')(app, config);

module.exports = app;