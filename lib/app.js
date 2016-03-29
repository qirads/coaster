'use strict';

//override node.js core modules (!!!) to allow offline local dns resolution on windows
if (process.env.NODE_ENV === 'development') { require('../utils').offline(); }

var express = require('express');
var helmet = require('helmet');
var limiterWrapper = require('./limiter.wrapper')
var logger = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var config = require('../config');

var app = express();

app.use(helmet());
app.use(limiterWrapper(app));
app.use(logger(app.get('env') === 'development' ? 'dev' : 'combined'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

require('../models')(config);
require('../routes')(app, config);

app.spinUp = function() { mongoose.connect(config.dbPath); };
app.spinDown = function() { mongoose.disconnect(); };

module.exports = app;