const express = require('express');
var async = require("async");
const router = express.Router();

const logger = require('../../logs');
//Handle Database
const database = require('./db');

router.post('/getModeVariables', async (req,res) => {

    const sql = 'Select * from mode_variables ORDER BY id ASC';

    try{
        const results = await database.query(sql, []);
        logger.info("Got Mode Variables");
        res.json(results);
    }
    catch(error){
        logger.error("Mode (getModeVariables): " + error);
        res.sendStatus(400);
    }
});

router.post('/setModeVariables', async (req,res) => {
    var modeVariables;
    if(req.body){
        modeVariables = req.body.modeVariables;
    }

    const sql = 'UPDATE mode_variables SET value= ? WHERE tag = ? ';

    async.forEachOf(modeVariables, async (setting, i, callback) => {
        //will automatically call callback after successful execution
        try{
            const results = await database.query(sql, [setting.value, setting.tag]);
            return;
        }
        catch(error){     
            //callback(error);         
            throw error;                 
        }
    }, err=> {
        if(err){
            logger.error(`Mode (setModeVariables):  ` + err);
            res.sendStatus(400);
        }else{
            logger.info(`setModeVariables success`);
            res.sendStatus(200);
        }
    })
});

module.exports = router;