import React, { useContext, useEffect, useRef } from "react";

import * as THREE from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Quaternion, Vector3 } from "three";

import { SphericalMorphShader } from './SphericalMorphShader.js';

import readexFont from '../Fonts/Readex Pro_Bold.json';

import { FBXModel, RotateToTween, TranslateToTween, customEventTracker, AnimationSequenceHandler } from './AnimationSystem';
import { FBXAnimationNames, kyleAnimationLoaders, createIntroSequence, kyleAnimations, wavingSequence } from './Animations';

import { Context3D } from "../Context";

import kyleModel from '../FBX/Kyle.fbx'


import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

const cameraWheelEase = CustomEase.create("custom", "M0,0 C0.12,0 0.148,0.6 0.348,0.6 0.498,0.6 0.562,0.342 0.6,0 0.6,0 0.616,-0.116 0.698,-0.116 0.778,-0.116 0.828,0.1 0.9,0.1 0.968,0.1 0.98,0 1,0 ");
const vignetteWheelEase = CustomEase.create("custom", "M0,0 C0.118,0.016 0.148,0.6 0.348,0.6 0.498,0.6 0.562,0.342 0.6,0 0.6,0 0.628,0 0.71,0 0.79,0 0.816,0 0.888,0 0.956,0 0.98,0 1,0 ");

const Render3D = (props) => {

  const mount = useRef(null)   
  
  const {handleOnFinishedLoading3D, handleNavbarPulled, setRender3DLoaded, handleKyleTexting } = useContext(Context3D);
  const canvasMarginRight = 10;
  const canvasMarginBottom = 36;

  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();


  const world = {};

  world.mouseOverObject = null;
  world.mouseOverCanvas = false; 
  
  const fieldOfView = 75;

  world.sceneWidth = window.innerWidth - canvasMarginRight;
  world.sceneHeight = window.innerHeight - canvasMarginBottom;
  world.sceneRatio = world.sceneWidth/world.sceneHeight;  

  world.sceneInitiated = false;

  world.keyIsPressed = {
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

    // Document Events & Canvas Events

    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener('keydown', handleKeyDown, false); 
    document.addEventListener('keyup', handleKeyUp, false);  

    const canvas = document.getElementById('RenderCanvas');
    canvas.addEventListener('mouseenter', onMouseEnterCanvas);
    canvas.addEventListener('mouseleave', onMouseLeaveCanvas);
    window.addEventListener( 'mousemove', onMouseMove, false );

    canvas.addEventListener('wheel', onMouseWheel);


    // Scene Setup

    world.scene = new THREE.Scene();     
    world.scene.background = new THREE.Color( 0xffffff );  
    
    world.camera = new THREE.PerspectiveCamera( fieldOfView, world.sceneRatio, 0.1, 1000 );
    world.camera.position.z = 5;

    world.renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false });
    world.renderer.shadowMap.enabled = true;
    world.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    world.renderer.setSize( world.sceneWidth, world.sceneHeight);
    world.renderer.setPixelRatio(window.devicePixelRatio); 

    mount.current.appendChild( world.renderer.domElement );
    
    
    //Post Processing

    const rtParameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
      stencilBuffer: true
    };

    world.composerScene = new EffectComposer( world.renderer, new THREE.WebGLRenderTarget( world.sceneWidth, world.sceneHeight, rtParameters ) );
    world.composerScene.setPixelRatio(window.devicePixelRatio);
    world.composerScene.setSize(world.sceneWidth, world.sceneHeight);
    
    world.composerScene.addPass(new RenderPass(world.scene, world.camera)); 

    const shaderVignette = VignetteShader;
    world.effectVignette = new ShaderPass( shaderVignette );
    world.effectVignette.uniforms[ "offset" ].value = 0;
		world.effectVignette.uniforms[ "darkness" ].value = 0; 
    world.composerScene.addPass(world.effectVignette);

    world.effectSphericalMorph = new ShaderPass(SphericalMorphShader);
    world.effectSphericalMorph.material['uniforms']['resolutionW'].value = world.sceneWidth;
    world.effectSphericalMorph.material['uniforms']['resolutionH'].value = world.sceneHeight;
    world.effectSphericalMorph.material['uniforms']['blend'].value = 0;
    world.effectSphericalMorph.material['uniforms']['blur'].value = 1.5;
    world.composerScene.addPass(world.effectSphericalMorph);
 
    world.FXAA = new ShaderPass(FXAAShader);
    world.FXAA.material['uniforms']['resolution'].value.x = 1 / (world.sceneWidth);
    world.FXAA.material['uniforms']['resolution'].value.y = 1 / (world.sceneHeight);
    world.FXAA.renderToScreen = false;
    world.composerScene.addPass(world.FXAA)   
      

    // Kyle Model  

    const loadingManger = new THREE.LoadingManager();
    
    loadingManger.onStart = (url, loaded, total) => {   
      console.log(url, loaded, total);
    }

    loadingManger.onProgress = (url, loaded, total) => {
      console.log(url, loaded, total);
    }

    loadingManger.onLoad = () => {      
      console.log('LOADED')
      world.modelsLoaded = true;
    }

    const loader = new FBXLoader(loadingManger);

    world.kyleRobot = new FBXModel(kyleModel, world.scene, new THREE.Vector3(0, -1, -10), new THREE.Vector3(0,0,0),
    new THREE.Vector3(0.01,0.01,0.01), kyleAnimationLoaders, true, true, kyleAnimations, loader);
          

    // Pascal Text

    const font = new FontLoader().parse(readexFont);

    const textConfig = {
      font: font,
      size: 0.6,
      height: 0.0001,      
    }

    world.pascalSchottText = new THREE.Object3D(); 
    const textColor = '#4e8dc2'

    var geometry = new TextGeometry( 'Pascal',  textConfig);  
    var material = new THREE.MeshStandardMaterial( { color: textColor, roughness : 0, metalness : 0  } );
    var pascalText =  new THREE.Mesh( geometry, material );
    world.pascalSchottText.add( pascalText );
    pascalText.position.x = -2
    pascalText.position.y = 0.8

    geometry = new TextGeometry( 'Schott',  textConfig);  
    material = new THREE.MeshStandardMaterial( { color: textColor, roughness : 0, metalness : 0  } );
    var schottText =  new THREE.Mesh( geometry, material );
    world.pascalSchottText.add( schottText );
    schottText.position.x = -2.1
    schottText.position.y = 0

    world.scene.add(world.pascalSchottText);    
    world.pascalSchottText.position.z = 2.2;

    world.pascalSchottText.position.x = -hScreenEdgeByZPosition(world.pascalSchottText.position.z) + -1;
    

    // Plane

    geometry = new THREE.PlaneGeometry( 100, 40, 10 );
    material = new THREE.MeshStandardMaterial( { color: "#ffffff", roughness : 0, metalness : 0  } );
    var plane = new THREE.Mesh( geometry, material );
    world.scene.add( plane );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1;
    plane.receiveShadow = true;


    // Lighting

    var hemisphereLight = new THREE.HemisphereLight("#ffffff" ,"#ffffff", 0.6);
    world.scene.add(hemisphereLight);

    var directionalLight = new THREE.DirectionalLight("#ffffff", 1);
    world.scene.add(directionalLight);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow =  true;


    // Clock

    world.clock = new THREE.Clock()


    // Start Update Loop

    start()
    

    return () => {
      customEventTracker.cleanUp();
      stop();
      mount.current.removeChild(world.renderer.domElement);
    } 
  }, [])


function onWindowResize(){

  world.sceneWidth = window.innerWidth-canvasMarginRight;
  world.sceneHeight = window.innerHeight-canvasMarginBottom;

  world.sceneRatio = world.sceneWidth/world.sceneHeight;

  world.renderer.setSize( world.sceneWidth, world.sceneHeight);
  world.composerScene.setSize(world.sceneWidth, world.sceneHeight);

  world.camera.aspect = world.sceneRatio;
  world.camera.updateProjectionMatrix();
  
  world.effectSphericalMorph.material['uniforms']['resolutionW'].value = world.sceneWidth;
  world.effectSphericalMorph.material['uniforms']['resolutionH'].value = world.sceneHeight;

  world.FXAA.material['uniforms']['resolution'].value.x = 1 / (world.sceneWidth);
  world.FXAA.material['uniforms']['resolution'].value.y = 1 / (world.sceneHeight);

}

const start = () => {
  if (!world.frameId) {
    world.frameId = requestAnimationFrame(update)
  }
}
const stop = () => {
  cancelAnimationFrame(world.frameId)
}

const renderScene = (deltaTime) => {
  world.composerScene.render(deltaTime);
}

const handleKeyPressed = (elapsedTime, deltaTime) => {
  for(const [key, value] of Object.entries(world.keyIsPressed)){
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

const onMouseEnterCanvas = () => {
  world.mouseOverCanvas = true;
}

const onMouseLeaveCanvas = () => {
  world.mouseOverCanvas = false;
}

const onCompleteCameraEase = () => {
  world.cameraTweenRunning = false;
}

const onMouseWheel = () => {
  if(!world.cameraTweenRunning){

    world.cameraTweenRunning = true;
    const duration = 2;

    gsap.to(world.camera.position, {duration : duration, ease : cameraWheelEase, z : 8,
      onComplete : onCompleteCameraEase})

    gsap.to(world.effectVignette.uniforms[ "darkness" ], {duration : duration, ease : vignetteWheelEase, value : 1.1,
      })

    gsap.to(world.effectVignette.uniforms[ "offset" ], {duration : duration, ease : vignetteWheelEase, value : 0.95,
    })

    gsap.to(world.effectSphericalMorph.uniforms[ "blend" ], {duration : duration, ease : cameraWheelEase, value : 1,
      })          
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
 
}

const raycastMouse = () => {

  raycaster.setFromCamera( mouse, world.camera );

  const intersects = raycaster.intersectObjects( world.scene.children );
    
    if(intersects.length){
      for ( let i = 0; i < intersects.length; i ++ ) {
        if(world.mouseOverObject !== intersects[ i ].object){
          if(world.mouseOverObject){
            onMouserLeave(world.mouseOverObject);
          }
          world.mouseOverObject = intersects[ i ].object  
          onMouseEnterObject(world.mouseOverObject)
        }                       
        break;
  
      }
    }
    else{
      if(world.mouseOverObject){
        onMouserLeave(world.mouseOverObject);
      }
      world.mouseOverObject = null;
    }        
}

const initScene = () => {

  for(const fbxAnimation of world.kyleRobot.fbxAnimations){
    fbxAnimation.animationAction = world.kyleRobot.animationActions[fbxAnimation.actionAnimationName];
    world.kyleRobot.animationHandler.fbxAnimations[fbxAnimation.name] = fbxAnimation;
  }
 
  world.kyleRobot.animationSequenceHandler = new AnimationSequenceHandler(world.kyleRobot.animationHandler, 'Idle', 0.5);

  const introSequence = createIntroSequence(fieldOfView, world.sceneRatio, world.camera.position.z);
  world.kyleRobot.animationSequenceHandler.loadSequence(introSequence);   

  var moveTextTween = new TranslateToTween(70/60, 'power1.inOut', new Vector3(1, 0, 0), true, true, 
    [new TranslateToTween(4, 'power1.inOut', new Vector3(0, 0, -0.3), true, false),
     new RotateToTween(2, 'power1.inOut', new Vector3(0, 0.1, 0), false, false, 
      [
        new RotateToTween(2, 'power1.inOut', new Vector3(0, 0, 0), false, false)
      ])
    ]  
  );


  // Animation Sequence Events

  world.kyleRobot.animationSequenceHandler.addListenerToStep('Pull Name', 'start', () => moveTextTween.play(world.pascalSchottText), false)
  world.kyleRobot.animationSequenceHandler.addListenerToStep('Pull Name', 'finished', () => moveTextTween.stop(), false)

  world.kyleRobot.animationSequenceHandler.addListenerToStep('Navbar Pull', 'start', () => handleNavbarPulled(), false)

  world.kyleRobot.animationSequenceHandler.addListenerToStep('Turn To Camera', 'finished', () => lookAtPositionTween(
    world.kyleRobot.sceneObject, world.camera.position, 1, 'power1'), false
  )

  world.kyleRobot.animationSequenceHandler.addListenerToStep('Kyle Texting', 'start', () => {
    handleKyleTexting();
    world.kyleRobot.sceneObject.smartphone.visible = true;
  }, false)

  world.kyleRobot.animationSequenceHandler.addListenerToStep('Kyle Texting', 'finished', () => {   
    world.kyleRobot.sceneObject.smartphone.visible = false;
  }, false)
  
  

  world.sceneInitiated = true;
  handleOnFinishedLoading3D();
  setRender3DLoaded(true);
}

// Update Frame Loop

const update =  () => {  
  var deltaTime = world.clock.getDelta();
  var elapsedTime = world.clock.getElapsedTime();  
  
  handleKeyPressed(elapsedTime, deltaTime);
    
  if(world.kyleRobot && world.modelsLoaded){        

    if(!world.sceneInitiated){         
      initScene();
    }

    world.kyleRobot.update(elapsedTime, deltaTime);

    if(world.mouseOverCanvas){
      raycastMouse();
    }   
  }   

  renderScene(deltaTime)

  world.frameId = window.requestAnimationFrame(update)    
};   

const handleKeyDown = (e) => {
  switch (e.code){
    case 'Space':
      break;
    case 'Digit1':
      world.kyleRobot.playAnimation(FBXAnimationNames.Idle, 1);
      break;
    case 'Digit2':
      world.kyleRobot.playAnimation(FBXAnimationNames.Running, 1);
        break;
    case 'Digit3':
      world.kyleRobot.playAnimation(FBXAnimationNames.JumpToFreehangRootMotion, 0.2, false);
      break;
    case 'Digit4':             
      break;
    case 'Digit5':     
      break;
    default:
      if(e.code in world.keyIsPressed){
        world.keyIsPressed[e.code] = true;
      }       
      break;
  }      
}

const handleKeyUp = (e) => {
  switch (e.code){
    case 'Space':
      break;       
    default:
      if(e.code in world.keyIsPressed){
        world.keyIsPressed[e.code] = false;
      }        
      break;
  }      
}

const hScreenEdgeByZPosition = (z) => {
  var hFOV = 2 * Math.atan(Math.tan(fieldOfView/2 * Math.PI/180) * world.sceneRatio)          
  var x = Math.tan(hFOV/2) * (z-world.camera.position.z);
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