import React, {useRef, useState, useEffect} from 'react';

import {makeStyles,Fab, Modal, Backdrop, Fade, Grid, TextField, Button} from '@material-ui/core';

import SettingsIcon from '@material-ui/icons/Settings';

import cogoToast from 'cogo-toast';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../UI/ConfirmYesNo';

import socketIOClient from 'socket.io-client';

import Mode from '../../js/Mode';


const HelpModal = (props) => {

    const {endpoint, socket} = props;
    const classes = useStyles();

    //Modal Props
    const [modeModalOpen, setModeModalOpen] = React.useState(false);
    
    //Functional State
    const [shouldSave, setShouldSave] = React.useState(false);
    const [modeVariables, setModeVariables] = React.useState(null);


    useEffect(()=>{
        console.log("MODE var", modeVariables);
        if(modeModalOpen && (!modeVariables || modeVariables == [])) {
            Mode.getModeVariables()
            .then( data => { console.log(data);setModeVariables(data); })
            .catch( error => {
                console.warn(error);
                cogoToast.error(`Error getting mode variables`, {hideAfter: 4});
            })
        }
        

        return(()=>{
            setModeVariables(null);
            setShouldSave(false);
        })
    },[modeModalOpen])

    const handleModeModalOpen = (event) => {
        setModeModalOpen(!modeModalOpen);
    }

    const handleModeModalClose = () => {
        setModeModalOpen(false);
    };

    const onChangeValue = (event, tag) => {
        
        let newValue = event.target.value;
        if(newValue == null ){
            cogoToast.error(`Bad value!`, {hideAfter: 3});
            return;
        }
        if(newValue > 999 || newValue < 0){
            cogoToast.error(`Too big or too small number!`, {hideAfter: 3});
            return;
        }

        //Get the index of our value to change
        let indexOfMV;
        modeVariables.map((item, i)=> {
            if(item.tag == tag){
                indexOfMV=i;
                return true;
            }
        });

        //Copy modeVariables to temp array
        var variableCopy = [...modeVariables];

        
        if(indexOfMV == null){
            cogoToast.error(`Couldnt find variable!`, {hideAfter: 3});
            return;
        }
        //Edit tmp array and set real array
        variableCopy[indexOfMV].value = newValue;
        setModeVariables(variableCopy)
        //We should save if save is hit
        setShouldSave(true);


    }

    const handleCancel = (event) =>{
        setModeModalOpen(false);
    }

    const handleSave = (event, arrayToSave) =>{
        if(!arrayToSave || arrayToSave == []){
            cogoToast.error(`Error getting mode variables`, {hideAfter: 4});
            return;
        }

        if(!shouldSave){
            handleModeModalClose();
            return;
        }

        //have a confirm that will say restart is required or self restart C++
        const save = () => {
             Mode.setModeVariables(arrayToSave)
            .then( data => { 
                cogoToast.success(`Saved Mode Variables, restarting...`, {hideAfter: 4});
                socket.emit('RestartNitrogen', "RestartNitrogen");
                setShouldSave(false);
                handleModeModalClose();
            })
            .catch( error => {
                console.warn(error);
                cogoToast.error(`Error saving mode variables`, {hideAfter: 4});
            });
        }

        confirmAlert({
            customUI: ({onClose}) => {
                return(
                    <ConfirmYesNo onYes={save} onClose={onClose} customMessage="Saving will restart the application. Are you sure?"/>
                );
            }
        })
        
    }

    return(
        <>
        <Fab color="primary" aria-label="add" className={classes.settingsButton} onClick={handleModeModalOpen}>
          <SettingsIcon color="#fff" className={classes.settingsIcon}/>
        </Fab>

        <Modal aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={modeModalOpen}
            onClose={handleModeModalClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
             }}>
            <Fade in={modeModalOpen}>
                <div className={classes.container}>
                {modeVariables ? 
                <Grid container >  
                    <div className={classes.modalTitleDiv}>
                        <span id="transition-modal-title" className={classes.modalTitle}>
                            Mode Variable Settings
                        </span>
                    </div>
                    <Grid item xs={12} className={classes.paper}>
                        <div className={classes.form_container}>
                            <Grid container space-around>
                                <Grid item xs={12} className={classes.inputs_div}>
                                    <span className={classes.input_group_label}>Timers</span>
                                    { modeVariables.map((setting, i)=>{
                                            return(
                                                <>
                                                {i==8 ? <><span className={classes.input_group_label}>Pressure Limits</span></> : <></>}
                                                {i==13 ? <><span className={classes.input_group_label}>Other Settings</span></> : <></>}
                                                <div className={classes.input_container_div}>
                                                    <div className={classes.label_div}><label className={classes.input_label} for={`input-${setting.id}`}>{setting.name}:</label></div>
                                                    <div className={classes.input_div}><input className={classes.input} 
                                                            type="number" 
                                                            id={`input-${setting.id}`}  
                                                            defaultValue={setting.value}
                                                            onChange={event => onChangeValue(event, setting.tag)}
                                                            />
                                                    </div>
                                                </div> 
                                                </>
                                                
                                            )
                                        })}
                                    
                                    
                                </Grid>
                            </Grid>
                        </div>
                    </Grid>
                    <Grid item xs={12} className={classes.paper}>
                        <div className={classes.footer_div}>
                        <Button variant="contained" color="primary" onClick={event => handleCancel(event)}>
                            Cancel
                        </Button>
                        <Button variant="contained" color="primary" onClick={event => handleSave(event, modeVariables)}>
                            Save
                        </Button>
                        </div>
                    </Grid>
                </Grid>
                : <></>}
                </div>
            </Fade>
        </Modal>

        </>
    );
};

export default HelpModal;


const useStyles = makeStyles(theme => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1 !important',
        '&& div':{
            outline: 'none',
        },
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: '2% 3% 3% 3% !important',
        position: 'relative',
        width: '100%',
        overflowY: 'auto',
        maxHeight: '665px',

        background: 'linear-gradient(white 30%, rgba(255, 255, 255, 0)), linear-gradient(rgba(255, 255, 255, 0), white 70%) 0 100%, radial-gradient(farthest-side at 50% 0, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)), radial-gradient(farthest-side at 50% 100%, rgba(0, 0, 0, .52), rgba(0, 0, 0, 0)) 0 100%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 40px, 100% 40px, 100% 14px, 100% 14px',
        /* Opera doesn't support this in the shorthand */
        backgroundAttachment: 'local, local, scroll, scroll',
    },
    container: {
        width: '60%',
        maxWidth: '60%',
        textAlign: 'center',
    },
    modalTitleDiv:{
        backgroundColor: '#5b7087',
        padding: '5px 0px 5px 0px',
        width: '100%',
    },
    modalTitle: {
        fontSize: '18px',
        fontWeight: '300',
        color: '#fff',
    },
    settingsButton:{
        position: 'fixed',
        bottom: '2%',
        right: '1%',
        backgroundColor: '#414d59',
        '&:hover':{
          backgroundColor: '#7895af',
        }
    },
    settingsIcon:{
    
    },
    form_container:{
        background: '#ececec',
        borderRadius: '4px',
        width: '25%',
    },
    inputs_div:{
        
        
    },
    input_container_div:{
        padding: '0% 1%',
        backgroundColor: '#efefef',
        
        display: 'block',
    },
    input_label:{
        fontSize: '13px',
        fontWeight: '500',
        color: '#3b2323',
    },
    label_div:{
        textAlign: 'right',
        clear: 'both',
        float:'left',
        marginRight:'15px',
    },
    input_div:{
        textAlign: 'right',
    },
    input:{
        margin: '0% 1% 0% 2%',
        maxWidth: '20%',
        width: '20%',
    },
    input_group_label:{
        fontWeight: '500',
        fontSize: '18px',
        color: '#fff',
        backgroundColor:'#858c98',
        textAlign: 'center',
        display: 'block',
    },
    footer_div:{

    },


    
  }));

