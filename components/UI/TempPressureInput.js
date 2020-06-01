import React, {useState, useEffect} from "react";

import { makeStyles } from '@material-ui/core/styles';
import { Paper , Grid, TextField, Button} from '@material-ui/core';

import socketIOClient from 'socket.io-client';

const TempPressureInput = (props) => {

    const classes = useStyles();
    const {endpoint} = props;

    const [lowPressure, setLowPressure] = React.useState(null);
    const [highPressure, setHighPressure] = React.useState(null);

    const handleTempPressureSend = (event, lowP, highP) => {
        if( isNaN(lowP) || isNaN(highP)){
            console.error("Low Pressure or High Pressue is not a number");
            return;
        }
        if( (lowP / 100 >= 10) || (highP / 100 >= 10)){
            console.error("Low Pressure or High Pressure values are too high!");
            return;
        }

        const socket = socketIOClient(endpoint);
        socket.emit('Temp_Pressures', lowP, highP);
    }

    const handleChangeLow = (event) => {
        setLowPressure(event.target.value);
    };

    const handleChangeHigh = (event) => {
        setHighPressure(event.target.value);
    };

    return(
        <>
        <Paper className={classes.root}>
            <Grid container spacing={3}>  
                <Grid item xs={3}>
                    <div>
                        <span>Low Pressure Input:</span>
                    </div>
                    <div>
                        <TextField id="standard-basic" value={lowPressure} onChange={handleChangeLow}/>
                    </div>
                </Grid>
                <Grid item xs={3}>
                    <div>
                        <span>High Pressure Input:</span>
                    </div>
                    <div>
                        <TextField id="standard-basic" value={highPressure} onChange={handleChangeHigh}/>
                    </div>
                </Grid>
                <Grid item xs={2}>
                    <div>
                        <Button variant="contained" onClick={event => handleTempPressureSend(event, lowPressure, highPressure)}>Send</Button>
                    </div>
                </Grid>
            </Grid>
            
        </Paper>
        </>
    );

}

export default TempPressureInput;

const useStyles = makeStyles(theme => ({
    root: {
      display: 'flex',
      width: 'auto',
      padding: '.2% 0% .2% 3%',
      margin: '1% 0% 1% 0%',
      backgroundColor: '#b2b2b2',
      boxShadow: "-10px 12px 10px -5px rgba(0,0,0,0.45), 0px 0px 1px 0px rgba(0,0,0,0.14), 0px 0px 1px -1px rgba(0,0,0,0.12)"
    }
  }));

 