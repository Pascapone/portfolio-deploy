import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as THREE from "three";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import colonnaMT from '../Fonts/Colonna MT_Regular.json';
import { Mesh } from "three";

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const sigmoid_instrumented = (t, alpha) => 1/(1 + Math.exp(-alpha*t)) - 0.5;

const EndOfSequenceMode = {
  RepeatSequence : 1,
  LoopLastAnimation : 2,
  FadeToNewSequence : 3
}

const EaseFunctions = {
  Linear : () =>{
     return (x) => {
       return x;
     };
  },
  SigmoidInOut : (steepness) => {
    return (x) => {
      return (0.5/sigmoid_instrumented(1, steepness))*sigmoid_instrumented(2*x - 1, steepness) + 0.5;
    }
  },
  BezierInOut : () => {
    return (x) => {
      return x * x * (3.0 - 2.0 * x);
    }
  },
  SigmoidOut : (steepness) => {
    return (x) => {
      return sigmoid_instrumented(x,steepness)/sigmoid_instrumented(1,steepness);
    }
  },
  SigmoidIn : (steepness) => {
    return (x) => {
      return sigmoid_instrumented(x - 1,steepness)/sigmoid_instrumented(1,steepness) + 1;
    }
  },
};

class AnimationSequenceStep{
  constructor(name, duration, fadeDuration, targetPosition = null, targetRotation = null, 
      easeInOutFunction  = EaseFunctions.Linear()){
    this.animation = name;
    this.duration = duration;
    this.fadeDuration = fadeDuration;
    this.targetPosition = targetPosition;
    this.targetRotation = targetRotation;
    this.easeInOutFunction = easeInOutFunction;
  }
}

class AnimationSequence{
  constructor(name, endOfSequenceMode, followupSequenceName = null){
    this.name = name;
    this.endOfSequenceMode = endOfSequenceMode;
    this.followupSequenceName = followupSequenceName;

    this.startTime = -1;
    this.running = false;
    this.endOfSequence = false;
    this.activeAnimation = null;
    this.sequence = [];
    this.animationQueue = [];
    this.nextSequence = null;
    this.stepTime = 0;
  }

  startSequence(startTime){
    this.startTime = startTime;    
    this.stepTime = 0;
    this.endOfSequence = false;
    this.updateQueue();
    this.running = true;
  }

  stopSequence(){
    this.running = false;
    this.startTime = 0;
    this.stepTime = 0;
    this.endOfSequence = true;
  }

  addSequenceStep(sequenceStep) {
    this.sequence.push(sequenceStep);
    this.updateQueue();
  }

  removeSequenceStep(index){
    this.sequence.pop(index);
    this.updateQueue();
  }

  setFollowUpSequence(name){
    this.followupSequenceName = name;
  }

  updateQueue() {
    this.animationQueue = [];
    this.sequence.forEach( element => {this.animationQueue.push(element)});
  }

  getNextAnimationStepFromQueue(){
    if (this.animationQueue.length){
      return this.animationQueue.shift();
    }
    else{
      console.log('Queue empty')
      return null
    }    
  }
  
}

class AnimationHandler{
  constructor(animationSequences, mixer, sceneObject){
    this.animationSequences = animationSequences;
    this.mixer = mixer;
    this.sceneObject = sceneObject;
    this.setSceneObjectInitial();
    this.activeAnimation = null;
    this.setActiveAnimationSequence('Default');
  }

  update(elapsedTime, delta){    
    this.mixer.update( delta );
    this.playAnimationSequence(elapsedTime, delta);   
  }

  setActiveAnimationSequence(name){
    this.activeAnimationSequence = this.animationSequences[name]
  }

  setSceneObject(sceneObject){
    this.sceneObject = sceneObject;
  }

  setSceneObjectInitial(){
    this.sceneObjectInitial = { position : [this.sceneObject.position.x, this.sceneObject.position.y, this.sceneObject.position.z],
       rotation : [this.sceneObject.rotation.x, this.sceneObject.rotation.y, this.sceneObject.rotation.z]}
  }

  handleEndOfSequence(elapsedTime, delta){
    this.activeAnimationSequence.endOfSequence = true;    
    console.log('End of Sequence')
    switch (this.activeAnimationSequence.endOfSequenceMode) {
      case EndOfSequenceMode.RepeatSequence:
        this.activeAnimationSequence.startSequence(elapsedTime);     
        break;
      case EndOfSequenceMode.LoopLastAnimation:        
        break;
      case EndOfSequenceMode.FadeToNewSequence:
        this.fadeToNewSequence();
        break;        
      default:
        break;
    }    

    console.log('Sequence Ended')
  }

  fadeToNewSequence(){
    var activeAnimation = this.activeAnimationSequence.activeAnimation;
    if(this.activeAnimationSequence.followupSequenceName){
      this.activeAnimationSequence.stopSequence();
      this.setActiveAnimationSequence(this.activeAnimationSequence.followupSequenceName);
      this.activeAnimationSequence.activeAnimation = activeAnimation;
      console.log(this.activeAnimationSequence.name);
    }
    else{
      this.activeAnimationSequence.stopSequence();
      this.setActiveAnimationSequence('Default');
      this.activeAnimationSequence.activeAnimation = activeAnimation;
      console.log('No Follow UP!')
    }       
  }

  updatePosition(progress){
    if(this.activeAnimationSequence.activeAnimation.targetPosition){      
      this.sceneObject.position.x = this.sceneObjectInitial.position[0] + (this.activeAnimationSequence.activeAnimation.targetPosition[0] - this.sceneObjectInitial.position[0])*progress;
      this.sceneObject.position.y = this.sceneObjectInitial.position[1] + (this.activeAnimationSequence.activeAnimation.targetPosition[1] - this.sceneObjectInitial.position[1])*progress;
      this.sceneObject.position.z = this.sceneObjectInitial.position[2] + (this.activeAnimationSequence.activeAnimation.targetPosition[2] - this.sceneObjectInitial.position[2])*progress;
    }
  }

  updateRotation(progress){   
    if(this.activeAnimationSequence.activeAnimation.targetRotation){ 
      this.sceneObject.rotation.x = this.sceneObjectInitial.rotation[0] + (this.activeAnimationSequence.activeAnimation.targetRotation[0] - this.sceneObjectInitial.rotation[0])*progress;
      this.sceneObject.rotation.y = this.sceneObjectInitial.rotation[1] + (this.activeAnimationSequence.activeAnimation.targetRotation[1] - this.sceneObjectInitial.rotation[1])*progress;
      this.sceneObject.rotation.z = this.sceneObjectInitial.rotation[2] + (this.activeAnimationSequence.activeAnimation.targetRotation[2] - this.sceneObjectInitial.rotation[2])*progress;   
    }
  }

  calculateAnimationProgress(){
    const duration = this.activeAnimationSequence.activeAnimation.duration;      
    var stepTime = this.activeAnimationSequence.stepTime;
    var progress = clamp(1 - (duration-stepTime) / duration, 0, 1);
    return this.activeAnimationSequence.activeAnimation.easeInOutFunction(progress);
  }

  getNextAnimation(){
    console.log('Get Next Animation')
    var nextAnimation = this.activeAnimationSequence.getNextAnimationStepFromQueue();
    this.setSceneObjectInitial();
    nextAnimation.animation.enabled = true;
    return nextAnimation;
  }

  playAnimation(name, fade=null){
    if(fade && this.activeAnimation){
      this.activeAnimation.crossFadeTo(nextAnimation.animation, nextAnimation.fadeDuration, true).play();
    }
  }

  playAnimationSequence(elapsedTime, delta){
    if(!this.activeAnimationSequence.running){
      console.log('Start Sequence')
      
      this.activeAnimationSequence.startSequence(elapsedTime); 
      this.activeAnimationSequence.startTime = elapsedTime;
      
    }  
    
    if(this.activeAnimationSequence.activeAnimation){
      this.activeAnimationSequence.stepTime = elapsedTime - this.activeAnimationSequence.startTime;     
      const progress = this.calculateAnimationProgress()
      this.updatePosition(progress);
      this.updateRotation(progress);
      console.log(this.kyleSkeletonHelper)
      //console.log(this.sceneObject.children[1].skeleton.bones[1].position)
    }
    
    if (this.activeAnimationSequence.animationQueue.length){
      if(!this.activeAnimationSequence.activeAnimation || this.activeAnimationSequence.stepTime >= this.activeAnimationSequence.activeAnimation.duration){   
        console.log('Next Animation');  
        if(this.activeAnimationSequence.activeAnimation){
          var nextAnimation = this.getNextAnimation();
          if ( nextAnimation.animation != this.activeAnimationSequence.activeAnimation.animation){
            this.activeAnimationSequence.activeAnimation.animation.crossFadeTo(nextAnimation.animation, nextAnimation.fadeDuration, true).play();          
          }    
          this.activeAnimationSequence.activeAnimation = nextAnimation;           
          this.activeAnimationSequence.startTime = elapsedTime; 
        }
        else{
          var nextAnimation = this.getNextAnimation();
          nextAnimation.animation.play()
          this.activeAnimationSequence.activeAnimation = nextAnimation;
        }        
      }
    }
    else{
      if(this.activeAnimationSequence.stepTime >= this.activeAnimationSequence.activeAnimation.duration && !this.activeAnimationSequence.endOfSequence){
        this.handleEndOfSequence(elapsedTime, delta);
      }
    }   
  }
}

class AnimationLoader{
  constructor(name, filePath){
    this.name = name;
    this.filePath = filePath;
  }
}

class FBXModel{
  constructor(modelPath, scene, position, rotation, scale, animationSequences, animationLoaders = null, castShadow =true, receiveShadow = true){
    this.modelPath = modelPath;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.animationLoaders = animationLoaders;
    this.castShadow = castShadow;
    this.receiveShadow = receiveShadow;
    this.animationSequences = animationSequences;
    this.scene = scene;

    this.modelLoaded = false;
    this.animationsLoaded = false;
    this.loader = new FBXLoader();
    this.sceneObject = null;
    this.mixer = null;
    this.animationActions = {};
    this.animationHandler = null;    

    this.loadModel();
  }

  loadAnimations(){

    for (const animation of this.animationLoaders){
 
      this.loader.load( animation.filePath, ( object ) => {   
                     
          object.animations[0].name = animation.name;
      
          const animationAction = this.mixer.clipAction(object.animations[0]);                
          this.animationActions[animation.name] = animationAction;   
          
          if( animation.name == this.animationLoaders.at(-1).name){ 

            this.animationHandler = new AnimationHandler(this.animationSequences, this.mixer, this.sceneObject); 
            this.modelLoaded = true;    

          }

        }

      )

    }

  }
  
  loadModel(){
    this.loader.load( this.modelPath, ( sceneObject ) => {   

        sceneObject.scale.set(this.scale.x, this.scale.y, this.scale.z);
        sceneObject.position.set(this.position.x, this.position.y, this.position.z);      
        sceneObject.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);

        this.mixer = new THREE.AnimationMixer( sceneObject );
        
        sceneObject.traverse(  ( child ) => {

            if ( child.isMesh ) {  
              child.castShadow = this.castShadow;
              child.receiveShadow = this.receiveShadow;    
            } 
          }
        )    

        this.loadAnimations()

        this.scene.add( sceneObject );
        this.sceneObject = sceneObject;
        }    
    );
  }

  playAnimation(name){

  }

}

class Render3DTest extends Component {
  constructor(props) {
    super(props);
    const font = new FontLoader().parse(colonnaMT)
    const textOptions = {
      font : font,
      size: 2,
      height: 0.2,
      depth : 1
    };  
    this.state = { width: 1000, height : 1000/16*9, sceneRatio : 16/9, font : font, 
      textOptions};
  }  
  
  componentDidMount() { 
    const AnimationNames = {
      Idle: 'Idle',
      Running : 'Running',
      JumpToFreehang : 'JumpToFreehang',
      HangingIdle : 'HangingIdle',
      FreehangDrop : 'FreehangDrop',
      Jump : 'Jump',
      HangLand : 'HangLand',
      StandToFreehang : 'StandToFreehang'
    }
    
    let animationActions = {
      Idle : null,
      Running : null,
      JumpToFreehang : null,
      HangingIdle : null,
      FreehangDrop : null,
      Jump : null,
      HangLand : null,
      StandToFreehang : null,
    }
    
    const loadAnimations = [  { name: AnimationNames.Running, path : 'FBX/Animations/Running.fbx'},
                              { name: AnimationNames.Idle, path : 'FBX/Animations/Idle.fbx'},
                              { name: AnimationNames.JumpToFreehang, path : 'FBX/Animations/Jump To Freehang.fbx'},
                              { name: AnimationNames.HangingIdle, path : 'FBX/Animations/Hanging Idle.fbx'},
                              { name: AnimationNames.FreehangDrop, path : 'FBX/Animations/Freehang Drop.fbx'},
                              { name: AnimationNames.Jump, path : 'FBX/Animations/Jump.fbx'},
                              { name: AnimationNames.HangLand, path : 'FBX/Animations/Hang Land.fbx'},
                              { name: AnimationNames.StandToFreehang, path : 'FBX/Animations/Stand To Freehang.fbx'}]
                              
    

    this.animationSequences = {}  

    
    
    // const loadModelKyle = (scene) => {
    //   const loader = new FBXLoader();
    //   loader.load( 'FBX/Kyle.fbx', ( sceneObject ) => {
    //     sceneObject.scale.set(0.01, 0.01, 0.01)
    //     sceneObject.position.set(1, -1, 1.5) //-30
    //     let mixer = new THREE.AnimationMixer( sceneObject );
        
    //     sceneObject.traverse( function ( child ) {
    
    //         if ( child.isMesh ) {
    
    //           child.castShadow = true;
    //           child.receiveShadow = true;
    
    //         } 
    //       }
    //     )   
        
    //     for (const animation of loadAnimations){
    //       loader.load( animation.path, ( object ) => {              
    //           object.animations[0].name = animation.name;
          
    //           const animationAction = mixer.clipAction(object.animations[0]);                
    //           animationActions[animation.name] = animationAction;   
              
    //           if( animation.name == loadAnimations.at(-1).name){    
    //             let animationSequences = createKyleAnimationSequences();
    //             this.kyleAnimationHandler = new AnimationHandler(animationSequences, mixer, this.robot);
                                        
    //           }
    //         }
    //       )
    //     }

    //     scene.add( sceneObject );
    //     this.robot = sceneObject;
    //     return sceneObject
    //   } );
    // }   

    

    // Scene Setup
    this.scene = new THREE.Scene();    
    this.camera = new THREE.PerspectiveCamera( 75, this.state.sceneRatio, 0.1, 1000 );
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize( this.state.width, this.state.height);
    this.camera.position.z = 5;
    this.mount.appendChild( this.renderer.domElement );

    const kyleAnimationLoaders = [new AnimationLoader('Idle', 'FBX/Animations/Idle.fbx'),
                                  new AnimationLoader('Running', 'FBX/Animations/Running.fbx')]

    const createKyleAnimationSequences = () => {
      let animationSequences = {};
      var animationSequence = new AnimationSequence('Default', EndOfSequenceMode.RepeatSequence, 'Seccond');      
      animationSequence.addSequenceStep(new AnimationSequenceStep('Idle', 1, 0.5, [0, 0, 0],[0, 0, 0], EaseFunctions.SigmoidOut(5)));  
      animationSequence.addSequenceStep(new AnimationSequenceStep('Running', 5, 0.5, [0, 0, 0],[0, 0, 0], EaseFunctions.Linear(1)));   
      animationSequences[animationSequence.name] = animationSequence;     

      return animationSequences;
    }

    this.kyleRobot = new FBXModel('FBX/kyle.fbx', this.scene, new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0),
                    new THREE.Vector3(0.01,0.01,0.01), createKyleAnimationSequences(), kyleAnimationLoaders, true, true);

    // Controls
    // var orbitControls = new OrbitControls(camera, renderer.domElement);
    // orbitControls.enableDamping = true;
    // orbitControls.target.set(0, 1, 0);
        
    // Load FBX Model    
    // var robot = loadModelKyle(this.scene);    

    // Plane
    var geometry = new THREE.PlaneGeometry( 100, 40, 10 );
    var material = new THREE.MeshStandardMaterial( { color: "#ffffff", roughness : 0, metalness : 0  } );
    var plane = new THREE.Mesh( geometry, material );
    this.scene.add( plane );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1;
    plane.receiveShadow = true;

    // Lighting
    var hemisphereLight = new THREE.HemisphereLight("#ffffff" ,"#ffffff", 0.6);
    this.scene.add(hemisphereLight);

    var directionalLight = new THREE.DirectionalLight("#ffffff", 1);
    this.scene.add(directionalLight);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow =  true;

    this.clock = new THREE.Clock()
    this.start()

    
  }

  componentWillUnmount(){
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.update)
    }
  }
  stop = () => {
    cancelAnimationFrame(this.frameId)
  }

  renderScene = () => {
    this.renderer.render(this.scene, this.camera)
  }
  
  // Update Frame Loop
  update =  () => {  
    var delta = this.clock.getDelta()
    var elapsedTime = this.clock.getElapsedTime()
    
    // if(this.kyleAnimationHandler){
    //   // if(!this.kyleAnimationHandler.sceneObject){
    //   //   console.log('SET')
    //   //   this.kyleAnimationHandler.setSceneObject(this.robot);
    //   // }      
    //   this.kyleAnimationHandler.update(elapsedTime, delta)
    //   if(!this.kyleSkeletonHelper){
    //     this.kyleSkeletonHelper = new THREE.SkeletonHelper(this.robot)
    //   }
    //   try {
    //     const position = new THREE.Vector3();
    //     console.log(this.kyleSkeletonHelper.bones[0].getWorldPosition(position))
    //   } catch (error) {
    //     console.log('Error')
    //   }   
    // }   

    if(this.kyleRobot){
      // console.log(this.kyleRobot.modelLoaded)
    }
    
    this.renderScene()
    this.frameId = window.requestAnimationFrame(this.update)
  };    

  render() {
    return (
      <div style={{ margin : 'auto', width : this.state.width, height : this.state.height , padding : 0 }}>
        <div style={{ width : this.state.width, height : this.state.height, padding : 0}} 
          ref={(mount) => { this.mount = mount }} />
      </div>
    )
  }
}

export default Render3DTest;