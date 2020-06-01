import React, {useEffect} from 'react';

import Router, {useRouter} from 'next/router';

import { makeStyles } from '@material-ui/core/styles';
import {Paper,  ButtonGroup, Button} from '@material-ui/core';


import Grid from '@material-ui/core/Grid';
import { mergeClasses } from '@material-ui/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

import socketIOClient from 'socket.io-client';
import { Z_BLOCK } from 'zlib';

import SplitButton from '../Machine/Buttons/SplitButton';
import MachineCanvas from './MachineCanvas';
import { textAlign } from '@material-ui/system';

import cogoToast from 'cogo-toast';


const UiTableWithStyles = ({data_packet ,socket,  endpoint}) => {
  const router = useRouter();

  const [startBool, setStartBool] = React.useState(false);
  const [currentModeString, setCurrentModeString] = React.useState([]);

  //Handling Current Mode
  useEffect(()=>{
    var mode = data_packet ? data_packet.current_mode : null;

    if(mode == null || isNaN(mode)){
      return;
    }
    if(mode > 6 || mode < 0){
      return;
    }
    
    let tmp;
    switch(mode) {
      case 2:
        tmp=`MODE: 2 - Turning On Nitrogen Generator. P(l): ${data_packet.pressure_low} P(h): ${data_packet.pressure_high}`;
        break;
      case 3:
        tmp=`MODE: 3 - Turning Off Nitrogen Generator. P(l): ${data_packet.pressure_low} P(h): ${data_packet.pressure_high}`;
      break;
      case 4:
        tmp=`MODE: 4 - Turn On High Pressure Generator. P(l): ${data_packet.pressure_low} P(h): ${data_packet.pressure_high}`;
      break;
      case 5:
        tmp=`MODE: 5 - Turn Off High Pressure Generator. P(l): ${data_packet.pressure_low} P(h): ${data_packet.pressure_high}`;
      break;
      case 6:
        tmp="MODE: 6 - Checking if making High Pressure";
      break;
      case 0:
        tmp="IDLE";
        if(data_packet.start_stop == 0){
          tmp="STOPPED"
        }
        break;
      case 1:
        tmp=`MODE 1 - Stopped. P(l): ${data_packet.pressure_low} P(h): ${data_packet.pressure_high}`;
        break;
      default:
        console.warning("Possible bad value coming from current_mode ", mode);
        cogoToast.warn(`Bad mode input. Check Console`, {hideAfter: 4});
      break;  
    }

    if(currentModeString.length == 0){
      setCurrentModeString([tmp]);
    }
    //Add tmp to beginning of array
    if(currentModeString.length > 0 && currentModeString[0] != tmp){
      setCurrentModeString([tmp, ...currentModeString]);

      //Remove last on list
      if(currentModeString.length > 10 ){
        setCurrentModeString([tmp, ...currentModeString].filter((item, i)=> i != currentModeString.length ));
      }
    }
    

  }, [data_packet]);

  //Handling Start/Stop Indicator Button Position
  useEffect(()=>{
    var start_stop = data_packet ? data_packet.start_stop : null;

    if(start_stop == null){
      return;
    }
    if(start_stop == 1 ){
      setStartBool(true);
    }
    if(start_stop == 0){
      setStartBool(false);
    }


  },[data_packet]);

  //only works inside a functional component
  const classes = useStyles();


  //Add in machine names and image url for css
  const machines = [
    "air_compressor", "air_dryer", "tank_1", "tank1_3", "tank2_3", "tank3_3", "generator", "nitrogen_tank"
  ];
  const images = [
    "url(/static/sm_grey_box.png)", "url(/static/sm_light_blue.png)", "url(/static/green_tank.png)", "url(/static/big_grey_tank.png)",
      "url(/static/big_grey_tank.png)", "url(/static/big_grey_tank.png)", "url(/static/generator_grey.png)", "url(/static/sm_green_tank.png)"
  ]

  //Onclick function for each machine to send to detail page
  const machineClicked = function(name, i){
    //var image = images[i].substring(4, images[i].length -1 );
    //router.push( `/m/${name}?image=${image}`);
  }


  const array = machines.map((item, i)=>{
    return ({  
                id: i, 
                name: item, 
                pressure: i==7 ? data_packet.pressure_high : i==5 ? data_packet.pressure_low : 0,
                temp: 0,
                machine: item,
                imageURL: images[i]
            });
  });

  const handleStartClick = (event) =>{
      socket.emit('Turn On All Machines', "all_machines");
      setStartBool(true);
      cogoToast.success("Starting...", {hideAfter: 4});
  }
  

  const handleStopClick = (event) =>{
      socket.emit('Turn Off All Machines', "all_machines");
      setStartBool(false);
      cogoToast.success("Stopping...", {hideAfter: 4});
  }
  

  return (
    <Paper classes={{root:classes.root}} className={classes.root}>
      
      <Grid container  spacing={2} justify="center" className={classes.container}>
          <Grid item  xs={2} className={classes.start_stop_button_div}>
            <ButtonGroup className={classes.buttonGroup}>
              <Button onClick={event => handleStartClick(event)} className={classes.button_start} className={startBool ? classes.start_on : classes.start_off }>START</Button>
              <Button onClick={event => handleStopClick(event)} className={classes.button_stop} className={startBool ? classes.stop_off : classes.stop_on }>STOP</Button>
            </ButtonGroup>
          </Grid>
          <Grid item xs={4} >
           <div className={classes.current_mode_div}>
            <span className={classes.mode_label}>Current Mode</span>
            { currentModeString.length > 0 ? 
                <>
                { currentModeString.map((string,i)=>
                <span className={i == 0 ? classes.mode_text : classes.mode_text_quiet}>{string}</span> 
                )}</>
              : <></> }
            </div>
          </Grid>
          <Grid item xs={6} >
           <div className={classes.timer_container_div}>
              {!data_packet.error ? <>
                 {data_packet.timer_mode2 ? <div className={classes.timer_div}><span className={classes.timer_label}>Mode 2 Wait</span><span className={classes.timer_text}>{data_packet.timer_mode2}</span> </div> : <></> } 
                 {data_packet.timer_mode4 ? <div className={classes.timer_div}><span className={classes.timer_label}>Mode 4 Wait</span><span className={classes.timer_text}>{data_packet.timer_mode4}</span> </div> : <></> } 
                 {data_packet.timer_motor_relay ? <div className={classes.timer_div}><span className={classes.timer_label}>Motor</span><span className={classes.timer_text}>{data_packet.timer_motor_relay}</span> </div> : <></> } 
                 {data_packet.timer_shut_down_counter ? <div className={classes.timer_div}><span className={classes.timer_label}>Shut Down</span><span className={classes.timer_text}>{data_packet.timer_shut_down_counter}</span> </div> : <></> } 
                 {data_packet.timer_bleed_relay ? <div className={classes.timer_div}><span className={classes.timer_label}>Bleed</span><span className={classes.timer_text}>{data_packet.timer_bleed_relay}</span> </div> : <></> } 
                 {data_packet.timer_start_relay ? <div className={classes.timer_div}><span className={classes.timer_label}>Start</span><span className={classes.timer_text}>{data_packet.timer_start_relay}</span> </div> : <></> } 
                 {data_packet.timer_stop_relay ? <div className={classes.timer_div}><span className={classes.timer_label}>Stop</span><span className={classes.timer_text}>{data_packet.timer_stop_relay}</span> </div> : <></> } 
                 
                 </>
                :
              <></>}
            </div>
          </Grid>
                
        
      </Grid>
      
      <br/>
      
      <Grid justify="space-around" container spacing={2} className={classes.grid_container}>
        { /*array.map((row, i) => (
            <Grid item xs={1} key={i} className={ i == 0 || i==1 ||i==6 ? classes.grid_machine_large : classes.grid_machine_small }>          
              <div className={classes.clickableDiv} onClick={() => {machineClicked(row.name, i)}} > 
              <Paper classes={{root:classes.machine}} className={  i == 0 || i==1 ||i==6 ? classes.machine_type_1 : classes.machine_type_2} style={{backgroundImage: `${row.imageURL}`}}> 
              <span className={classes.sm_box_green}>{row.temp}&#176;</span>
              <br/><span className={classes.sm_box_green}>{row.pressure != null ? <>{row.pressure}</> : <div ><CircularProgress/></div>}</span>
              </Paper> 
              </div>
              <br/><label className={classes.Label}>{row.name}</label><hr/>
              {<div className={classes.SplitButtonWrapper}>
            <SplitButton endpoint={endpoint} name={row.machine} options={['Turn On', 'Turn Off', 'Restart']}/>
              </div>}
            </Grid>
        ))*/}
        {/*data_packet && data_packet.error != 0 ?
        <>
        <div className={classes.pressure_div}>
          <span className={classes.pressure_label}>Low Pressure</span>
            <span className={classes.pressure_text}>{data_packet.pressure_low}</span>
        </div>
        <div className={classes.pressure_div}>
          <span className={classes.pressure_label}>High Pressure</span>
          <span className={classes.pressure_text}>{data_packet.pressure_high}</span>
        </div>
        </>
        :<></>*/}

        <>
        <Grid justify="space-around" container spacing={2} className={classes.grid_container}>
          <Grid item xs={1} key='low_pressure_tank' className={ classes.grid_machine_large }>          
              <div classes={{root:classes.machine}} className={classes.low_pressure_machine}> 
                { data_packet.pressure_low != null ? 
                  <span className={classes.sm_box_green}>{data_packet.pressure_low}</span>
                : <CircularProgress /> 
                }
              </div> 
              <br/><label className={classes.Label}>Nitrogen Tank</label><hr/>
          </Grid>
          <Grid item xs={1} key='low_pressure_tank' className={ classes.grid_machine_large }>          
              <div classes={{root:classes.machine}} 
                  className={data_packet.compressor ? 
                    (data_packet.id % 2 == 0 ? classes.compressor_green : classes.compressor_green_0)
                    : 
                    classes.compressor_red}> 
                
              </div> 
              <br/><label className={data_packet.compressor ? classes.Label : classes.LabelOff}>Compressor {data_packet.compressor ? "On": "Off"}</label><hr/>
          </Grid>
          <Grid item xs={1} key='nitrogen_tank' className={ classes.grid_machine_large }>          
              <div classes={{root:classes.machine}} className={classes.low_pressure_machine_green}> 
                { data_packet.pressure_high  != null ? 
                <span className={classes.sm_box_green}>{data_packet.pressure_high}</span>
                : <CircularProgress />
                }
              </div> 
              <br/><label className={classes.Label}>High Pressure Tank</label><hr/>
         </Grid>
         </Grid>
        </>
        
        {/*<MachineCanvas endpoint={endpoint} data_packet={data_packet}/>*/}
      </Grid>

    </Paper>
  )
}


const NitrogenUi = ({data_packet, endpoint, socket}) => {
  
    return (
      <div>{data_packet  ?  
        <div><UiTableWithStyles data_packet={data_packet} socket={socket} endpoint={endpoint}/></div> 
        : <div ><CircularProgress style={{marginLeft: "47%"}}/></div>
      } </div>
    );
}

export default NitrogenUi;

const useStyles = makeStyles(theme => ({
  root: {
    width: 'auto',
    padding: '2% 3% 4% 3%',
    backgroundColor: '#ffffff',
    boxShadow: '-11px 12px 6px -5px rgba(0,0,0,0.2), 0px 0px 1px 0px rgba(0,0,0,0.14), 0px 0px 1px -1px rgba(0,0,0,0.12)',
  },
  container:{
    alignItems: 'center',
    background: 'linear-gradient( #ecebeb, #9e9e9e)',
    borderRadius: '10px',
    border: '1px solid #ababab',
  },
  machine:{
    boxShadow: '0px 0px 15px 3px rgba(0,46,84,.13), 0px 0px 4px -2px rgba(0,0,0,0.14), 0px 0px 38px -18px rgba(0,0,0,0.12)',
    backgroundColor: '#fff',
    padding: '110px 15px 94px 15px',
    textAlign: 'center',
    color: theme.palette.text.primary
  },
  Label:{
    fontSize: '20px', 
  },
  LabelOff:{
    color: '#ececec',
    backgroundColor: '#4b4b4b',
    padding: '2%',
    fontSize: '20px',

  },
  machine_type_1: {
    height: '288px',
    width: '200px', 
  },
  machine_type_2: {
    height: '288px',
    width: '148px'
  },
  grid_container:{
    backgroundColor: '#e5efe994',
    borderRadius: '4px',
  },
  grid_machine_large: {
    margin: '1.5% .5% 1.5% .5%',
    minWidth: '216px',
    textAlign: 'center'
  },
  grid_machine_small: {
    margin: '1.5% .5% 1.5% .5%',
    minWidth: '165px',
    textAlign: 'center'
  },
  sm_box_red: {
    fontSize: '29px',
    color: '#c11f1f',
    fontWeight: 'bold'
  },
  sm_box_green: {
    fontSize: '29px',
    color: '#0aff0a',
    fontWeight: 'bold',
    backgroundColor: '#000000',
    padding: '6%',
    borderRadius: '10px',
    border: '1px solid #e5d400',
  },
  SplitButtonWrapper: {
    fontSize: '14px'
  },
  clickableDiv: {
    cursor: 'pointer',
    "&:hover, &:focus": {
      boxShadow: '0px 4px 10px 7px rgba(30, 33, 29, 0.37)'
    },
  },
  start_stop_button_div:{
    textAlign: 'center',
  },
  current_mode_div:{
    backgroundColor: '#ebebeb',
    minWidth: '100px',
    borderRadius: '4px',
    padding: '1%',
    width: '90%',
    textAlign: 'center',
    boxShadow: 'inset 0px 0px 4px 2px rgba(0, 0, 0, 0.37)',
    overflowY:'auto',
    maxHeight: '80px',
    minHeight: '70px',
  },
  mode_label:{
    display:'block',
    fontWeight: '600',
    fontSize: '15px',
    color: '#d87e0f',

  },
  mode_text:{
    display:'block',
    fontWeight: '500',
    fontSize: '10px',
    color: '#414d5a',
  },
  mode_text_quiet:{
    display:'block',
    fontWeight: '400',
    fontSize: '10px',
    color: '#414d5aaa',
  },
  timer_container_div:{
    display:'flex',
    justifyContent: 'flex-start',
    alignContent: 'center',
    backgroundColor:'#e6f7ff',
    padding: '1%',
    borderRadius: '3px',
    boxShadow: 'inset 0px 0px 3px 2px rgba(0, 0, 0, 0.27)',
    minHeight: '50px',
  },
  timer_div:{
    margin: '0% 2%',
    padding: '0% 1%',
    textAlign: 'center',
    '& span':{
      textAlign: 'center',
    },
    borderRadius: '4px',
    background: 'linear-gradient(0deg, #e6f7ff, #beccd2d9)',
    minWidth: '16%',
  },
  timer_label:{
    color: '#165391',
    display:'block',
    fontWeight: '500',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
  },
  timer_text:{
    textAlign: 'center',
    fontSize: '16px',
  },
  buttonGroup:{
  },
  start_on:{
    backgroundColor: '#41df00',
    '&:hover':{
      backgroundColor: '#31a900',
    },
    fontWeight: '600',
    fontSize: '20px',
    color: '#a5a5a5',
    boxShadow: 'inset 0px 0px 4px 2px rgba(0, 0, 0, 0.37)',
  },
  start_off:{
    background: 'linear-gradient( #45ee00, #44ac19)',
    '&:hover':{
      background: 'linear-gradient( #45ee00, #357f16)',
    },
    fontWeight: '600',
    fontSize: '20px',
    color: '#ececec',
    boxShadow: '0px 0px 4px 2px rgba(0, 0, 0, 0.37)',
  },
  stop_on:{
    backgroundColor: '#d41e00',
    '&:hover':{
      backgroundColor: '#801200',
    },
    fontWeight: '600',
    fontSize: '20px',
    color: '#a5a5a5',
    boxShadow: 'inset 0px 0px 4px 2px rgba(0, 0, 0, 0.37)',
  },
  stop_off:{
    background: 'linear-gradient( #e32000, #8f1400)',
    '&:hover':{
      background: 'linear-gradient( #8f1400,#3b0800 )',
    },
    fontWeight: '600',
    fontSize: '20px',
    color: '#ececec',
    boxShadow: '0px 0px 4px 2px rgba(0, 0, 0, 0.37)',
  },
  //Remove later 
  pressure_label:{
    display:'block',
    fontSize: '25px',
    fontWeight: '500',
    color: '#054010',
    textAlign: 'center',
  },
  //Remove Later
  pressure_text:{
    padding: '15%',
    display:'block',
    fontSize: '60px',
    fontWeight: '600',
    color: '#054010',
    textAlign: 'center',
  },
  //Remove Later
  pressure_div:{
    padding: '1% 3%',
    margin: '2%',
    borderRadius: '20px',
    backgroundColor: '#9fe291',
  },
  //Temp machines
  low_pressure_machine:{
    backgroundImage: 'url(/static/blue_tank.png)',
    backgroundRepeat:'no-repeat',
    height: '250px',
    width: '80px',
    position: 'relative',
    backgroundPosition: 'center',
    backgroundSize: 'contain' ,
    padding: '50% 0%',
    margin: '0 30%',
    textAlign: 'center',
  },
  low_pressure_machine_green:{
    backgroundImage: 'url(/static/red_tank.png)',
    backgroundRepeat:'no-repeat',
    height: '250px',
    width: '80px',
    position: 'relative',
    backgroundPosition: 'center',
    backgroundSize: 'contain' ,
    padding: '50% 0%',
    margin: '0 30%',
    textAlign: 'center',
  },

  compressor_green_0:{
    backgroundImage: 'url(/static/green_comp0.png)',
    backgroundRepeat:'no-repeat',
    height: '240px',
    width: '185px',
    position: 'relative',
    backgroundPosition: 'bottom',
    backgroundSize: 'contain' ,
    padding: '37% 0%',
    margin: '0 5%',
    textAlign: 'center',
  },
  compressor_green:{
    backgroundImage: 'url(/static/green_comp.png)',
    backgroundRepeat:'no-repeat',
    height: '240px',
    width: '185px',
    position: 'relative',
    backgroundPosition: 'bottom',
    backgroundSize: 'contain' ,
    padding: '37% 0%',
    margin: '0 5%',
    textAlign: 'center',
  },
  compressor_red:{
    backgroundImage: 'url(/static/red_comp.png)',
    backgroundRepeat:'no-repeat',
    height: '240px',
    width: '185px',
    position: 'relative',
    backgroundPosition: 'bottom',
    backgroundSize: 'contain' ,
    padding: '37% 0%',
    margin: '0 5%',
    textAlign: 'center',
  },



}));