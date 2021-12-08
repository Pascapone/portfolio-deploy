import './App.css';
import 'semantic-ui-css/semantic.min.css';

import React, { useState, useEffect, useContext, useRef } from 'react';

import AppRoutes from './AppRoutes';
import Navbar from './Shared/Navbar';
import {Provider, defaultTheme } from '@adobe/react-spectrum';
import { Loader, Dimmer } from 'semantic-ui-react';

import Statusbar from './Shared/Statusbar';
import { StatusbarContext, Context3D } from './Context';

import Render3D from './3D/Render3D';

import gsap from "gsap";

import WebFont from 'webfontloader';

WebFont.load({
    custom: {
      families: ['Roboto-Thin'],
    },
  });

const status = require('./configs/status.json');

function App() {
  const [windowSize, setWindowSize] = useState( {"height" : window.innerHeight, "width" : window.innerWidth} );
  const [globalStatus, setGlobalStatus] = useState( {'status' : status.Ready, 'statusText' : 'Ready'} );
  const [render3DLoaded, setRender3DLoaded] = useState(false);
  const [render3DVisibility, setRender3DVisibility] = useState('hidden');
  const [homeKyleTextingTrrigger, setHomeKyleTextingTrrigger] = useState(false)
                      
  
  const navbar = useRef();

  const handleResize = () => {
    setWindowSize({ "height" : window.innerHeight, "width" : window.innerWidth });
  };

  const handleOnFinishedLoading3D = () => {    
    setRender3DVisibility('visible')  
  } 

  const handleNavbarPulled = () => {
    gsap.to(navbar.current, {duration : 2, ease : 'bounce', top : 0})
  }

  const handleKyleTexting = () => {
    console.log('TRIGGER APP TEXTING')
    setHomeKyleTextingTrrigger(true);
  }

  useEffect(() => {      
      
      window.addEventListener("resize", handleResize, false);     
      }, []);


  return (
    <div className="App">  
      <Provider theme={defaultTheme} colorScheme="light" >
        <div style={{ backgroundColor : "#ffffff"}}>
        <StatusbarContext.Provider value={{globalStatus, setGlobalStatus}}>
          <Context3D.Provider value={{handleOnFinishedLoading3D, handleNavbarPulled, render3DLoaded, setRender3DLoaded,
            handleKyleTexting}}
          >
            <div ref={navbar} style={{position : 'absolute', top : -60, zIndex : 10, width : windowSize.width}}>          
              <Navbar/>
            </div>  
            <div style={{visibility : render3DVisibility}}>
              <Render3D innerHeight = {window.innerHeight} innerWidth = {window.innerWidth}/>  
            </div>
            <div style={{overflowY: "scroll", marginLeft : '1%', marginRight : '1%', height : window.innerHeight - 105, marginTop : 60 }} >
              {!render3DLoaded ? 
                <div>
                <Dimmer active inverted>
                <Loader size='massive'>Loading</Loader> 
                </Dimmer> 
                </div>    
                :
                <div/>  
              }  
              <AppRoutes homeKyleTextingTrrigger={homeKyleTextingTrrigger}/> 
            </div>    
            <Statusbar status={globalStatus.status} statusText={globalStatus.statusText}/>
          </Context3D.Provider>
        </StatusbarContext.Provider>
        </div>
      </Provider>
    </div>
  );
};

export default App;
