import React from 'react';
import socketIOClient from 'socket.io-client';

import getConfig from 'next/config';
const {publicRuntimeConfig} = getConfig();
const {ENDPOINT_PORT} = publicRuntimeConfig;

//************************************************ */
// High Order Component that wraps around a page component 
//to recieve rows/socket/endpoint AKA connectivity to c++ and nodejs
//************************************************ */
function WithData(BaseComponent) {
  class App extends React.Component {
    _isMounted = false;

    constructor(props){
      super(props);

      var endpoint = "10.0.0.109:" + ENDPOINT_PORT;

      this.state = {
        data_packet: {pressure_low: 80, pressure_high: 310, relay_start: 1, relay_stop: 0, relay_bleed: 0, relay_motor: 0, relay_pump: 0, relay_chiller: 0,
           timer_mode2: 10, timer_mode4: 0, timer_start_relay: 2, timer_stop_relay: 1, timer_bleed_relay: 0, timer_motor_relay: 0, 
           timer_shut_down_counter: 2, current_mode: 2, start_stop: 0, compressor: 1},
           // null,
        endpoint: endpoint,
        socket: socketIOClient(endpoint)
      };      
    }

    componentDidMount() {
        //_isMounted checks if the component is mounted before calling api to prevent memory leak
      this._isMounted = true;
      const { endpoint,socket } = this.state;
      socket.on("FromC", async data => {
          if(this._isMounted) {
            try{
              var json = await JSON.parse(data);
              this.setState({ data_packet: json.nitrogenData });
              
            }
            catch(error){
              console.log(error);
            }
          }
      }); 
    }

    componentWillUnmount(){
        this._isMounted = false;
        const {socket} = this.state;
        socket.disconnect();
    }

    render() {
      return <BaseComponent {...this.state} />;
    }
  }

  return App;
}

export default WithData;