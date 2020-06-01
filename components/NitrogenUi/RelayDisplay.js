import React from 'react';


import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';


import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

import socketIOClient from 'socket.io-client';


const util = require('../../util/util');

const relays = [
    {name: "Start Relay", tag: "relay_start"},
    {name: "Stop Relay", tag: "relay_stop"},
    {name: "Bleed Relay", tag: "relay_bleed"},
    {name: "Motor Relay", tag: "relay_motor"},
    {name: "Pump Relay", tag: "relay_pump"},
    {name: "Chiller Relay", tag: "relay_chiller"},
];

const RelayDisplay = (props) => {

    const {data_packet} = props;


    const classes = useStyles();

    const handleRelayDivClassName = (tag) => {

        if(!data_packet){
            return classes.relay_div_no_data;
        }
        if(data_packet.error){
            return classes.relay_div_no_data;
        }
        if(data_packet && data_packet[tag] !=null){
            if(data_packet[tag] == 1){
                return classes.relay_div_1;
            }
            if(data_packet[tag] == 0){
                return classes.relay_div_0;
            }
        }
    }

    return (
        <Paper className={classes.root}>
            <Grid container spacing={3}>
                {relays.map((relay, i)=>
                    <Grid item xs={2}>
                        <div className={handleRelayDivClassName(relay.tag)}>
                            <span >
                                {relay.name}
                            </span>
                        </div>
                    </Grid>
                )}
            </Grid>
            
        </Paper>
    )
}


export default RelayDisplay;

const useStyles = makeStyles(theme => ({
    root: {
      width: 'auto',
      padding: '1% 2% 1% 2%',
      margin: '1%',
      backgroundColor: '#78808b',
      boxShadow: '-11px 12px 6px -5px rgba(0,0,0,0.2), 0px 0px 1px 0px rgba(0,0,0,0.14), 0px 0px 1px -1px rgba(0,0,0,0.12)',
    },
    relay_div_0:{
        backgroundColor: '#ececec',
        borderRadius: '3px',
        padding: '3% 1%',
        textAlign: 'center',
        fontWeight: '500',
        fontSize: '16px',
        color: '#5c5b5b',
        cursor: 'default',
    },
    relay_div_1:{
        backgroundColor: '#41df00',
        borderRadius: '3px',
        padding: '3% 1%',
        textAlign: 'center',
        fontWeight: '500',
        fontSize: '16px',
        color: '#0a4300',
        cursor: 'default',
    },
    relay_div_no_data:{
        backgroundColor: '#a49696',
        borderRadius: '3px',
        padding: '3% 1%',
        textAlign: 'center',
        color: '#4e4e4e',
        fontWeight: '400',
        fontSize: '16px',
        cursor: 'default',
    },
  
  }));