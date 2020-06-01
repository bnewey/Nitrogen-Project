import React, {useEffect} from 'react';


import { makeStyles } from '@material-ui/core/styles';
import {Paper,  ButtonGroup, Button} from '@material-ui/core';

import CircularProgress from '@material-ui/core/CircularProgress';

import cogoToast from 'cogo-toast';

import dynamic from 'next/dynamic';

const { Stage, Layer, Rect, Text } = dynamic(()=> import('react-konva'), { ssr: false});
const Konva = dynamic(()=> import('konva'), {ssr:false}) ;


const MachineCanvas = ({data_packet , endpoint}) => {
    const classes = useStyles();

    const [color, setColor] = React.useState('green');

    const handleClick = (event) => {
        setColor(Konva.Util.getRandomColor());
    }
  return(
      <>
      <Stage width={100} height={100}>
        <Layer>
            <Rect
                x={20}
                y={20}
                width={50}
                height={50}
                fill={color}
                shadowBlur={5}
                onClick={event => handleClick(event)}
            />
        </Layer>
      </Stage>
      </>
  )
}

export default MachineCanvas;

const useStyles = makeStyles(theme => ({
    root:{

    },
}));