import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from "three";
import { Vector3 } from "three";

gsap.registerPlugin(CustomEase);

// const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export class FBXAnimation{
  constructor(name, actionAnimationName){
    this.name = name;
    this.actionAnimationName = actionAnimationName;
    this.animationAction = null;    
  }  

  reset(){
    this.animationAction.reset()    
  }  
}

class CustomEventTracker{
  constructor(){
    this.events = []
  }

  addEvent(name, listener){
    this.events.push({name, listener});
  }

  cleanUp(){
    this.events.forEach( (event) => {
      document.removeEventListener(event.name, event.listener);
    })
  }
}

export const customEventTracker = new CustomEventTracker();

export class AnimationSequenceStep{
  constructor(fbxAnimationName, duration, fadeInDuration, tweenActions = null, name=null){    
    this.fbxAnimationName = fbxAnimationName;
    this.duration =  duration;
    this.fadeInDuration = fadeInDuration;
    this.tweenActions = tweenActions ? tweenActions : [];
    this.name = name;
    
    if(name){
      this.eventStartName = `Sequence Step Start ${name}`;
      this.eventFinishedName = `Sequence Step Finished ${name}`;
      this.sequenceStepStartEvent = new Event(this.eventStartName);
      this.sequenceStepFinishedEvent = new Event(this.eventFinishedName);      
    }    
  }

  invokeFinished(){
    if(this.sequenceStepFinishedEvent){
      document.dispatchEvent(this.sequenceStepFinishedEvent)
    }  
  }

  invokeStart(){
    if(this.sequenceStepStartEvent){
      document.dispatchEvent(this.sequenceStepStartEvent)
    }    
  }

  addEventListener(type, listener, options){
    if(this.name){
      if(type === 'start'){
        document.addEventListener(this.eventStartName, listener, options);
        customEventTracker.addEvent(this.eventStartName, listener);
      }
      if(type === 'finished'){
        document.addEventListener(this.eventFinishedName, listener, options);
        customEventTracker.addEvent(this.eventFinishedName, listener);
      }  
    }      
  }
}

export class AnimationLoader{
  constructor(name, filePath){
    this.name = name;
    this.filePath = filePath;     
  }
}

export class Tween{
  constructor(duration, gsapEase, local = false, loop=false, followupTweens=null){
    this.duration = duration;
    this.gsapEase = gsapEase;
    this.local = local;
    this.loop = loop;
    this.followupTweens = followupTweens;
    
    this.running = false;
    this.gsapTween =  null;
  }

  play(sceneObject){
  
  }

  stop(){

  }

  onComplete = () => {
    
  }
}

export class TranslateToTween extends Tween{
  constructor(duration, gsapEase, position, local=false, loop=false, followupTweens=null){
    super(duration, gsapEase, local, loop, followupTweens);
    this.position = position; 

  }

  play(sceneObject){
    if(this.running) return;

    this.sceneObject = sceneObject;
    var position = new Vector3();
    position.copy(this.position);    

    if(this.local){

      position.applyEuler(new THREE.Euler(sceneObject.rotation.x, sceneObject.rotation.y, sceneObject.rotation.z));

      position.add(sceneObject.position);         
    }   

    this.gsapTween = gsap.to(sceneObject.position, { duration : this.duration, ease : this.gsapEase, 
      x : position.x, y : position.y, z : position.z, onComplete : this.onComplete })
    this.running = true;
  
  }

  stop(){
    this.gsapTween.kill()
    this.running = false;

    if(this.followupTweens){
      for(const tween of this.followupTweens){
        tween.play(this.sceneObject);
      }
    }
  }  

  onComplete = () => {

    if(this.loop && this.local && this.running){
      this.running = false;
      this.play(this.sceneObject);
    }
    else{
      if(this.followupTweens){
        for(const tween of this.followupTweens){
          tween.play(this.sceneObject);
        }
      }
      this.running = false;
    }
  }
}

export class RotateToTween extends Tween{
  constructor(duration, gsapEase, rotation, local=false, loop=false, followupTweens=null){
    super(duration, gsapEase, local, loop, followupTweens);
    this.rotation = rotation;     

    this.progress = 0;
    this.startAngle = 0;
    this.sceneObject = null;
    this.startQuat = null;
  }

  play(sceneObject){
    if(this.running) return;  

    this.progress = 0;
    this.sceneObject = sceneObject;

    var objectEuler = new THREE.Euler(sceneObject.rotation.x, sceneObject.rotation.y, sceneObject.rotation.z);
    var targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(this.rotation.x, this.rotation.y, this.rotation.z));;
    this.startQuat = new THREE.Quaternion().setFromEuler(objectEuler);


    if(this.local){   
      var q = new THREE.Quaternion().copy(this.startQuat);
      q.multiply(targetQuat)
      targetQuat = q;
    }

    this.targetQuat = targetQuat;        
    this.startAngle = this.startQuat.angleTo(targetQuat)

    this.gsapTween = gsap.to(this, { duration : this.duration, ease : this.gsapEase, 
      progress : 1, onComplete : this.onComplete, onUpdate : this.onUpdate })
    this.running = true;   
  }

  onUpdate = () => {
    var currentQuat = new THREE.Quaternion().copy(this.startQuat)
    currentQuat.rotateTowards(this.targetQuat, this.progress*this.startAngle);
    this.sceneObject.setRotationFromQuaternion(currentQuat); 
  }

  stop(){
    this.gsapTween.kill()
    this.running = false;

    if(this.followupTweens){
      for(const tween of this.followupTweens){
        tween.play(this.sceneObject);
      }
    }
  }

  onComplete = () => {    

    if(this.loop && this.local && this.running){
      this.running = false;
      this.play(this.sceneObject);
    }
    else{
      if(this.followupTweens){
        for(const tween of this.followupTweens){
          tween.play(this.sceneObject);
        }
      }      
      this.running = false;
    }    
  }
}

class AnimationHandler{
  constructor(mixer, sceneObject){
    this.mixer = mixer;
    this.sceneObject = sceneObject;
    this.fbxAnimations = [];     
    this.activeAnimation = null;    
  }

  update(elapsedTime, deltaTime){    
    this.mixer.update( deltaTime ); 
  }  

  playAnimation(name, fadeDuration=0, loop=true){   
    var nextAnimation = this.fbxAnimations[name];    
        
    console.log(name)
    console.log(nextAnimation)
    console.log(this.fbxAnimations)
    if(loop){
      nextAnimation.animationAction.setLoop(THREE.LoopRepeat);
    }
    else{
      nextAnimation.animationAction.setLoop(THREE.LoopOnce);
    }

    if(this.activeAnimation){ 
      if(this.activeAnimation.animationAction !== nextAnimation.animationAction){        
        nextAnimation.reset();
        this.activeAnimation.animationAction.crossFadeTo(nextAnimation.animationAction, fadeDuration, true).play(); 
      }            
    }
    else{
      nextAnimation.reset();
      nextAnimation.animationAction.play()
    }
    this.activeAnimation = nextAnimation;
  }   
}

export class AnimationSequenceHandler{
  constructor(animationHandler, defaultAnimationName, defaultAnimationFadeDuration){
    this.animationSequence = [];
    this.currentAnimationSequenceStep = null;    
    this.sequenceStepTime = 0;
    this.animationHandler = animationHandler;
    this.defaultAnimationName = defaultAnimationName;
    this.defaultAnimationFadeDuration = defaultAnimationFadeDuration;
    this.sequenceFinished = false;
  }

  addSequenceStep(sequenceStep){
    this.animationSequence.push(sequenceStep);
  }

  loadSequence(sequence){
    sequence.forEach( (step) => {
      this.addSequenceStep(step);
    }) 
  }

  getNextSequenceStep(){
    return this.animationSequence.shift();
  }

  addListenerToStep(sequenceStepName, type, listener, options){
    if(this.animationSequence.length){
 
      for(const step of this.animationSequence){
        if(step.name === sequenceStepName){   
          step.addEventListener(type, listener, options); 
          break;
        }
      }      
    }
  }

  update(deltaTime, sceneObject){
    if(!this.sequenceFinished) this.sequenceStepTime += deltaTime;
    
    if(this.animationSequence.length){ 
      
      if(this.sequenceFinished) this.sequenceFinished = false;

      if(!this.currentAnimationSequenceStep || this.sequenceStepTime >= this.currentAnimationSequenceStep.duration){       
         
          let nextAnimationStep = this.getNextSequenceStep();
          this.sequenceStepTime = 0;
          this.animationHandler.playAnimation(nextAnimationStep.fbxAnimationName, nextAnimationStep.fadeInDuration)

          if(this.currentAnimationSequenceStep){
            for(const tween of this.currentAnimationSequenceStep.tweenActions){
              tween.stop()
            }

            this.currentAnimationSequenceStep.invokeFinished();
          }
          
          for(const tween of nextAnimationStep.tweenActions){
            tween.play(sceneObject);
          }          

          this.currentAnimationSequenceStep = nextAnimationStep;     
          this.currentAnimationSequenceStep.invokeStart(); 
      }      
    }
    else{
      if(!this.sequenceFinished && this.currentAnimationSequenceStep && this.sequenceStepTime >= this.currentAnimationSequenceStep.duration - this.defaultAnimationFadeDuration){
        
        for(const tween of this.currentAnimationSequenceStep.tweenActions){
          tween.stop()
        }
        
        this.currentAnimationSequenceStep.invokeFinished();

        this.currentAnimationSequenceStep = null;
        this.sequenceStepTime = 0;
        this.animationHandler.playAnimation(this.defaultAnimationName, this.defaultAnimationFadeDuration)
        this.sequenceFinished = true;
      }
    }
  }
}

export class FBXModel{
  constructor(modelPath, scene, position, rotation, scale, animationLoaders = null, castShadow =true, receiveShadow = true, fbxAnimations, fbxLoader){
    
    this.modelPath = modelPath;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.castShadow = castShadow;
    this.receiveShadow = receiveShadow;
    this.scene = scene;
    this.animationLoaders = animationLoaders;
    this.fbxAnimations = fbxAnimations;

    this.modelLoaded = false;
    
    this.sceneObject = null;
    this.mixer = null;
    this.animationActions = {};
    this.animationHandler = null;  
    this.animationSequenceHandler = null; 
    this.rootBonePositionOffset = null; 

    this.loopListeners = [];

    this.loader = fbxLoader;

    this.loadModel(animationLoaders);
  }

  loadAnimation(animationFilePath, animationName){    
    this.loader.load( animationFilePath, ( object ) => {   
      object.animations[0].name = animationName;
  
      const animationAction = this.mixer.clipAction(object.animations[0]);  
      this.animationActions[animationName] = animationAction; 
              
    })
  }

  addAnimationLoopListender(objectWithInvokeFunction){
    this.loopListeners.push(objectWithInvokeFunction)
  }

  loadAnimations(animationLoaders){

    this.animationHandler = new AnimationHandler(this.mixer, this.sceneObject);
    
    if(!animationLoaders.length) return;

    for (const animation of animationLoaders){

      this.loadAnimation(animation.filePath, animation.name)
      
    }
  }
  
  loadModel(animationLoaders  = null){
    this.loader.load( this.modelPath, ( sceneObject ) => {   

        if(sceneObject.animations){
          for(const animation of sceneObject.animations){
            const animationAction = this.mixer.clipAction(animation);                
            this.animationActions[animation.name] = animationAction;
          }
        }

        sceneObject.scale.set(this.scale.x, this.scale.y, this.scale.z);
        sceneObject.position.set(this.position.x, this.position.y, this.position.z);        
        sceneObject.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);

        this.mixer = new THREE.AnimationMixer( sceneObject );

        this.mixer.addEventListener( 
          'finished', () => { } );

        this.mixer.addEventListener( 
          'loop', () => {             
            if( this.loopListeners.length ){
              for(const listener of this.loopListeners){            
                listener.invokeLoopListener();
              }
            }
          } );          
        
        sceneObject.traverse(  ( child ) => {

            if ( child.isMesh ) {  
              child.castShadow = this.castShadow;
              child.receiveShadow = this.receiveShadow;    
            } 
          }
        )    

        this.loadAnimations(animationLoaders)

        this.scene.add( sceneObject );
        console.log('KYLE SCENE OBJECT !!!!!!!!!!', sceneObject.children[1].skeleton.bones[25].children[5])
        sceneObject.children[1]['ParentFBX'] = this;
        sceneObject.smartphone = sceneObject.children[1].skeleton.bones[25].children[5];
        sceneObject.smartphone.visible = false;
        console.log(sceneObject);
        this.sceneObject = sceneObject;
        
      });
  }

  playAnimation(name, fadeDuration=0, loop){
    if(this.modelLoaded){
      this.animationHandler.playAnimation(name, fadeDuration, loop);
    }
    else{
      console.log('Model or animations not loaded')
    }
  }

  update(elapsedTime, deltaTime){
    this.animationHandler.update(elapsedTime, deltaTime, this.sceneObject);
    if(this.animationSequenceHandler){
      this.animationSequenceHandler.update(deltaTime, this.sceneObject);
    }
  }
}

