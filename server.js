const express = require('express');
const path = require('path');
const next = require('next');
const logger = require('./logs');

const expressValidator = require('express-validator');
const http = require("http");
const favicon = require('serve-favicon');
const cors = require('cors');
const dotenv = require('dotenv');
const {setupIo, setupTCP} = require('./sockets'); 

dotenv.config();
const app = express();
const server = http.createServer(app);

//Create and maintain socket connections..
const HOST = '10.0.0.109'; //for c++ socket
const SOCKET_PORT = 8081; //for c++ socket

//Handle Database
const database = require('./lib/db');

//Handles both socketio and c++ sockets
setupIo(server, HOST, SOCKET_PORT);
setupTCP(HOST,SOCKET_PORT,database);

const PORT = process.env.PORT || 8000;
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

//var machines = require('./api/machines/machines');

global.SERVER_APP_ROOT = __dirname;

nextApp
  .prepare()
  .then(() => {

    app.use(favicon(__dirname + '/public/static/favicon.ico'));
    app.use(expressValidator());

    //app.use('/api/machines', machines);
    
    app.use(cors({ origin: '*' }));

    //This is how we can send variables like settings from mysql to nextjs
    var settings = require('./settings.js');
    app.get('/', (req, res) => {

      settings.doGetAll(nextApp, database,req,res);
      
      //settings.handleRequest(nextApp, database, req, res);
    });

    app.get('/api/history', async (req,res) => {
      const sql = 'Select * from air_dryer ORDER BY read_date DESC';
      try{
        const results = await database.query(sql, []);
        logger.info("Got History");
        res.json(results);
      }
      catch(error){
        logger.error("History: " + err);
        res.send("");
      }
    });

    app.get('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(PORT, err => {
      if (err) throw err;
      logger.info(`> Ready on 10.0.0.109:${PORT}`);
    });


  })
  .catch(ex => {
    logger.error(ex.stack);
    process.exit(1);
  });

  if(dev) {
    process.once('uncaughtException', function(err) {
      logger.error('FATAL: Uncaught exception.');
      logger.error(err.stack||err);
      setTimeout(function(){
        process.exit(1);
      }, 100);
    });
  }