import React, { Component, useContext, useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import * as THREE from "three";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import colonnaMT from '../Fonts/Colonna MT_Regular.json';
import robotFont from '../Fonts/Roboto Black_Italic.json';
import readexFont from '../Fonts/Readex Pro_Bold.json';


import { AnimationLoader, FBXModel, RotateToTween, TranslateToTween, customEventTracker, AnimationSequenceHandler } from './AnimationSystem';
import { FBXAnimationNames, kyleAnimationLoaders, createIntroSequence, kyleAnimations, wavingSequence } from './Animations';
import { Quaternion, Vector3 } from "three";

import { Context3D } from "../Context";

import kyleModel from '../FBX/Kyle.fbx'

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

const Render3D = (props) => {
  const mount = useRef(null)

   
  
  const {handleOnFinishedLoading3D, handleNavbarPulled, render3DLoaded, setRender3DLoaded, handleKyleTexting } = useContext(Context3D);
  const canvasMarginRight = 37;
  const canvasMarginBottom = 60;

  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let mouseOverObject = null;

  let mouseOverCanvas = false;

  let frameId;
  let renderer;
  let scene;
  let camera;
  let keyIsPressed;
  let clock;
  let kyleRobot;
  let sceneInitiated;
  let pascalSchottText;
  let modelsLoaded;

  const fieldOfView = 75;

  const sceneWidth = window.innerWidth - canvasMarginRight
  const sceneHeight = window.innerHeight - canvasMarginBottom
  const sceneRatio = sceneWidth/sceneHeight    

  sceneInitiated = false;

  keyIsPressed = {
    Numpad1 : false,
    Numpad2 : false,
    Numpad3 : false,
    Numpad4 : false,
    Numpad5 : false,
    Numpad6 : false,
    ArrowLeft : false,
    ArrowRight : false,
    ArrowUp : false,
    ArrowDown : false,
  }

  useEffect(() => {

    const onMouseEnterCanvas = () => {
      mouseOverCanvas = true;
    }
  
    const onMouseLeaveCanvas = () => {
      mouseOverCanvas = false;
    }

    // Document Events & Canvas Events

    window.addEventListener( 'resize', onWindowResize, false );

    document.addEventListener('keydown', handleKeyDown, false); 
    document.addEventListener('keyup', handleKeyUp, false);  

    const canvas = document.getElementById('RenderCanvas');
    canvas.addEventListener('mouseenter', onMouseEnterCanvas);
    canvas.addEventListener('mouseleave', onMouseLeaveCanvas);
    window.addEventListener( 'mousemove', onMouseMove, false );

    // Scene Setup
    scene = new THREE.Scene();       
    
    camera = new THREE.PerspectiveCamera( fieldOfView, sceneRatio, 0.1, 1000 );
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize( sceneWidth, sceneHeight);
    camera.position.z = 5;

    mount.current.appendChild( renderer.domElement );
    
    // Load FBX Model

    // Kyle Model  

    const loadingManger = new THREE.LoadingManager();
    
    loadingManger.onStart = (url, loaded, total) => {   
    }

    loadingManger.onLoad = () => {      
      console.log('LOADED')
      modelsLoaded = true;
    }

    const loader = new FBXLoader(loadingManger);

    kyleRobot = new FBXModel(kyleModel, scene, new THREE.Vector3(0, -1, -10), new THREE.Vector3(0,0,0),
    new THREE.Vector3(0.01,0.01,0.01), kyleAnimationLoaders, true, true, kyleAnimations, loader);
          
    // Pascal Text
    const font = new FontLoader().parse(readexFont);

    const textConfig = {
      font: font,
      size: 0.6,
      height: 0.0001,      
    }

    pascalSchottText = new THREE.Object3D(); 
    const textColor = '#4e8dc2'

    var geometry = new TextGeometry( 'Pascal',  textConfig);  
    var material = new THREE.MeshStandardMaterial( { color: textColor, roughness : 0, metalness : 0  } );
    var pascalText =  new THREE.Mesh( geometry, material );
    pascalSchottText.add( pascalText );
    pascalText.position.x = -2
    pascalText.position.y = 0.8

    var geometry = new TextGeometry( 'Schott',  textConfig);  
    var material = new THREE.MeshStandardMaterial( { color: textColor, roughness : 0, metalness : 0  } );
    var schottText =  new THREE.Mesh( geometry, material );
    pascalSchottText.add( schottText );
    schottText.position.x = -2.1
    schottText.position.y = 0

    scene.add(pascalSchottText);    
    pascalSchottText.position.z = 2.2;

    pascalSchottText.position.x = -hScreenEdgeByZPosition(pascalSchottText.position.z) + -1;
    

    // Plane
    var geometry = new THREE.PlaneGeometry( 100, 40, 10 );
    var material = new THREE.MeshStandardMaterial( { color: "#ffffff", roughness : 0, metalness : 0  } );
    var plane = new THREE.Mesh( geometry, material );
    scene.add( plane );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1;
    plane.receiveShadow = true;

    // Lighting
    var hemisphereLight = new THREE.HemisphereLight("#ffffff" ,"#ffffff", 0.6);
    scene.add(hemisphereLight);

    var directionalLight = new THREE.DirectionalLight("#ffffff", 1);
    scene.add(directionalLight);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow =  true;

    // Clock
    clock = new THREE.Clock()

    // Start Update Loop
    start()

    

    return () => {
      customEventTracker.cleanUp();
      stop();
      mount.current.removeChild(renderer.domElement);
    } 
  }, [])


function onWindowResize(){

  camera.aspect = (window.innerWidth-canvasMarginRight) / (window.innerHeight-canvasMarginBottom);
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth-canvasMarginRight, (window.innerHeight-canvasMarginBottom) );

}

const start = () => {
  if (!frameId) {
    frameId = requestAnimationFrame(update)
  }
}
const stop = () => {
  cancelAnimationFrame(frameId)
}

const renderScene = () => {
  renderer.render(scene, camera)
}

const handleKeyPressed = (elapsedTime, deltaTime) => {
  for(const [key, value] of Object.entries(keyIsPressed)){
    if(value){
      switch (key) {
        case 'Numpad1':
          break;
        case 'Numpad2':
          break;
        case 'Numpad3':
          break;
        case 'Numpad4':            
          break;
        case 'Numpad5':           
          break;
        case 'Numpad6':
          break;
        case 'ArrowUp':
          break;
        case 'ArrowDown':
          break;
        case 'ArrowRight':
          break;
        case 'ArrowLeft':
          break;
        default:
          break;
      }
    }
  }
}

const onMouseEnterObject = (obj) => {
  if(obj && obj.ParentFBX){
    if(obj.ParentFBX.animationSequenceHandler.sequenceFinished){
      obj.ParentFBX.animationSequenceHandler.loadSequence(wavingSequence);
    }
  }
}

const onMouserLeave = (obj) => {
  // if(obj && obj.ParentFBX){
  //   if(obj.ParentFBX.animationSequenceHandler.sequenceFinished){
  //     obj.ParentFBX.animationHandler.playAnimation(FBXAnimationNames.Idle, 1)
  //   }
  // }
}

const raycastMouse = () => {

  raycaster.setFromCamera( mouse, camera );

  const intersects = raycaster.intersectObjects( scene.children );
    
    if(intersects.length){
      for ( let i = 0; i < intersects.length; i ++ ) {
        if(mouseOverObject != intersects[ i ].object){
          if(mouseOverObject){
            onMouserLeave(mouseOverObject);
          }
          mouseOverObject = intersects[ i ].object  
          onMouseEnterObject(mouseOverObject)
        }                       
        break;
  
      }
    }
    else{
      if(mouseOverObject){
        onMouserLeave(mouseOverObject);
      }
      mouseOverObject = null;
    }        
}

const initScene = () => {

  for(const fbxAnimation of kyleRobot.fbxAnimations){
    fbxAnimation.animationAction = kyleRobot.animationActions[fbxAnimation.actionAnimationName];
    kyleRobot.animationHandler.fbxAnimations[fbxAnimation.name] = fbxAnimation;
  }
 
  kyleRobot.animationSequenceHandler = new AnimationSequenceHandler(kyleRobot.animationHandler, 'Idle', 0.5);

  const introSequence = createIntroSequence(fieldOfView, sceneRatio, camera.position.z);
  kyleRobot.animationSequenceHandler.loadSequence(introSequence);   

  var moveTextTween = new TranslateToTween(70/60, 'power1.inOut', new Vector3(1, 0, 0), true, true, 
    [new TranslateToTween(4, 'power1.inOut', new Vector3(0, 0, -0.3), true, false),
     new RotateToTween(2, 'power1.inOut', new Vector3(0, 0.1, 0), false, false, 
      [
        new RotateToTween(2, 'power1.inOut', new Vector3(0, 0, 0), false, false)
      ])
    ]  
  );


  // Animation Sequence Events
  kyleRobot.animationSequenceHandler.addListenerToStep('Pull Name', 'start', () => moveTextTween.play(pascalSchottText), false)
  kyleRobot.animationSequenceHandler.addListenerToStep('Pull Name', 'finished', () => moveTextTween.stop(), false)

  kyleRobot.animationSequenceHandler.addListenerToStep('Navbar Pull', 'start', () => handleNavbarPulled(), false)

  kyleRobot.animationSequenceHandler.addListenerToStep('Turn To Camera', 'finished', () => lookAtPositionTween(
    kyleRobot.sceneObject, camera.position, 1, 'power1'), false
  )

  kyleRobot.animationSequenceHandler.addListenerToStep('Kyle Texting', 'start', () => {
    handleKyleTexting();
    kyleRobot.sceneObject.smartphone.visible = true;
  }, false)

  kyleRobot.animationSequenceHandler.addListenerToStep('Kyle Texting', 'finished', () => {   
    kyleRobot.sceneObject.smartphone.visible = false;
  }, false)
  
  

  sceneInitiated = true;
  handleOnFinishedLoading3D();
  setRender3DLoaded(true);
}

// Update Frame Loop
const update =  () => {  
  var deltaTime = clock.getDelta();
  var elapsedTime = clock.getElapsedTime();  
  
  handleKeyPressed(elapsedTime, deltaTime);
    
  if(kyleRobot && modelsLoaded){        

    if(!sceneInitiated){         
      initScene();
    }

    kyleRobot.update(elapsedTime, deltaTime);

    if(mouseOverCanvas){
      raycastMouse();
    }   
  }   

  renderScene()

  frameId = window.requestAnimationFrame(update)    
};   

const handleKeyDown = (e) => {
  switch (e.code){
    case 'Space':
      break;
    case 'Digit1':
      kyleRobot.playAnimation(FBXAnimationNames.Idle, 1);
      break;
    case 'Digit2':
      kyleRobot.playAnimation(FBXAnimationNames.Running, 1);
        break;
    case 'Digit3':
      kyleRobot.playAnimation(FBXAnimationNames.JumpToFreehangRootMotion, 0.2, false);
      break;
    case 'Digit4':             
      break;
    case 'Digit5':     
      break;
    default:
      if(e.code in keyIsPressed){
        keyIsPressed[e.code] = true;
      }       
      break;
  }      
}

const handleKeyUp = (e) => {
  switch (e.code){
    case 'Space':
      break;       
    default:
      if(e.code in keyIsPressed){
        keyIsPressed[e.code] = false;
      }        
      break;
  }      
}

const hScreenEdgeByZPosition = (z) => {
  var hFOV = 2 * Math.atan(Math.tan(fieldOfView/2 * Math.PI/180) * sceneRatio)          
  var x = Math.tan(hFOV/2) * (z-camera.position.z);
  return Math.abs(x);
}

const lookAtPositionTween = (sceneObject, target, duration, ease='none', onlyY=true) => {       

  var forwardSceneObject = new Vector3(0,0,1).applyEuler(new THREE.Euler(sceneObject.rotation.x, sceneObject.rotation.y, sceneObject.rotation.z));
  var targetPosition = new Vector3().copy(target)      
  var targetDirection = targetPosition.sub(new Vector3().copy(sceneObject.position));

  var quat = new Quaternion().setFromUnitVectors(forwardSceneObject, targetDirection.normalize());
  var currentQuat = new Quaternion().setFromEuler(sceneObject.rotation);
  
  currentQuat.multiply(quat);

  var targetEuler = new THREE.Euler().setFromQuaternion(currentQuat);

  if(onlyY){
    targetEuler.x = sceneObject.rotation.x;
    targetEuler.z = sceneObject.rotation.z;
  }

  new RotateToTween(duration, ease, targetEuler).play(sceneObject);
}

function onMouseMove( event ) {

  mouse.x = ( event.clientX / (window.innerWidth - canvasMarginRight) ) * 2 - 1;
  mouse.y = - ( event.clientY / (window.innerHeight - canvasMarginBottom) ) * 2 + 1;       

}

 
  return (
    <div id='RenderCanvas' style={{ margin : 'auto', padding : 0, position : 'absolute',  width : window.innerWidth-canvasMarginRight, height : window.innerHeight-canvasMarginBottom, top: 0}}>
      <div style={{  padding : 0, width : window.innerWidth-canvasMarginRight, height : window.innerHeight-canvasMarginBottom}} 
        ref={mount} />
    </div>
  )
  
}

export default Render3D;