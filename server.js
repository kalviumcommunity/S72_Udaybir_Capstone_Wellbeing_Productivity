#!/usr/bin/env node

const path = require('path');

// Redirect to the server directory
process.chdir(path.join(__dirname, 'server'));

// Load and run the actual server
require('./server.js'); 