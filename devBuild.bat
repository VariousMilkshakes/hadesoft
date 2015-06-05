echo off
START nodemon server.js
START stylus --watch ./stylus/ --import ./stylus/nebula.styl --out ./public/stylesheets/