#!/usr/bin/env node

const path = require('path');

// Load and run the actual server using full path
require(path.join(__dirname, 'server', 'server.js')); 