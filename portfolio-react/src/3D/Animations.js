import { AnimationLoader } from './AnimationSystem'
import { TranslateToTween, RotateToTween, AnimationSequenceStep, FBXAnimation } from './AnimationSystem';
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Vector3 } from 'three';

import idleAnimationFBX from '../FBX/Animations/Idle.fbx'
import runningAnimationFBX from '../FBX/Animations/Running.fbx'
import jumpToFreeHangFBX from '../FBX/Animations/Jump To Freehang.fbx'
import hangingIdleFBX from '../FBX/Animations/Hanging Idle.fbx'
import bracedToFreeHangFBX from '../FBX/Animations/Braced To Free Hang.fbx'
import standRightTurnFBX from '../FBX/Animations/Right Turn.fbx'
import standLeftTurnFBX from '../FBX/Animations/Left Turn.fbx'
import hardLandingFBX from '../FBX/Animations/Hard Landing.fbx'
import fallingIdleFBX from '../FBX/Animations/Falling Idle.fbx'
import pullHeavyObjectFBX from '../FBX/Animations/Pull Heavy Object.fbx'
import textingWhileStandingFBX from '../FBX/Animations/Texting While Standing.fbx'
import wavingFBX from '../FBX/Animations/Waving.fbx'
import wipingSweatFBX from '../FBX/Animations/Wiping Sweat.fbx'

gsap.registerPlugin(CustomEase);



export const FBXAnimationNames = { Idle : 'Idle',
                                  Running : 'Running',
                                  JumpToFreehang : 'JumpToFreehang',                                  
                                  HangingIdle : 'HangingIdle',
                                  BracedToFreeHang : 'BracedToFreeHang',
                                  StandRightTurn : 'StandRightTurn',
                                  StandLeftTurn : 'StandLeftTurn',
                                  HardLanding : 'HardLanding',
                                  FallingIdle : 'FallingIdle',
                                  PullHeavyObject : 'PullHeavyObject',
                                  TextingWhileStanding : 'TextingWhileStanding', 
                                  Waving : 'Waving',
                                  WipingSweat : 'WipingSweat'                              
                                }

const idleAnimation = new AnimationLoader(FBXAnimationNames.Idle, idleAnimationFBX);
const runningAnimation = new AnimationLoader(FBXAnimationNames.Running, runningAnimationFBX);
const jumpToFreeHang = new AnimationLoader(FBXAnimationNames.JumpToFreeHang, jumpToFreeHangFBX);
const hangingIdle = new AnimationLoader(FBXAnimationNames.HangingIdle, hangingIdleFBX);
const bracedToFreeHang = new AnimationLoader(FBXAnimationNames.BracedToFreeHang, bracedToFreeHangFBX);
const standRightTurn = new AnimationLoader(FBXAnimationNames.StandRightTurn, standRightTurnFBX);
const standLeftTurn = new AnimationLoader(FBXAnimationNames.StandLeftTurn, standLeftTurnFBX);
const hardLanding = new AnimationLoader(FBXAnimationNames.HardLanding, hardLandingFBX);
const fallingIdle = new AnimationLoader(FBXAnimationNames.FallingIdle, fallingIdleFBX);
const pullHeavyObject = new AnimationLoader(FBXAnimationNames.PullHeavyObject, pullHeavyObjectFBX);
const textingWhileStanding = new AnimationLoader(FBXAnimationNames.TextingWhileStanding, textingWhileStandingFBX);
const waving = new AnimationLoader(FBXAnimationNames.Waving, wavingFBX);
const wipingSweat = new AnimationLoader(FBXAnimationNames.WipingSweat, wipingSweatFBX);

export const kyleAnimationLoaders = [idleAnimation,
                                    runningAnimation,
                                    jumpToFreeHang,
                                    hangingIdle,
                                    bracedToFreeHang,
                                    standRightTurn,
                                    standLeftTurn,
                                    hardLanding,
                                    fallingIdle,
                                    pullHeavyObject,
                                    textingWhileStanding,
                                    waving,
                                    wipingSweat];

                               
export const kyleAnimations = [
                                new FBXAnimation(FBXAnimationNames.Idle, FBXAnimationNames.Idle),
                                new FBXAnimation(FBXAnimationNames.Running, FBXAnimationNames.Running),
                                new FBXAnimation(FBXAnimationNames.JumpToFreehang, FBXAnimationNames.JumpToFreeHang),                                
                                new FBXAnimation(FBXAnimationNames.HangingIdle, FBXAnimationNames.HangingIdle),
                                new FBXAnimation(FBXAnimationNames.BracedToFreeHang, FBXAnimationNames.BracedToFreeHang),
                                
                                new FBXAnimation(FBXAnimationNames.StandRightTurn, FBXAnimationNames.StandRightTurn), 
                                new FBXAnimation(FBXAnimationNames.StandLeftTurn, FBXAnimationNames.StandLeftTurn), 
                                new FBXAnimation(FBXAnimationNames.HardLanding, FBXAnimationNames.HardLanding),
                                new FBXAnimation(FBXAnimationNames.FallingIdle, FBXAnimationNames.FallingIdle),
                                new FBXAnimation(FBXAnimationNames.PullHeavyObject, FBXAnimationNames.PullHeavyObject),
                                new FBXAnimation(FBXAnimationNames.TextingWhileStanding, FBXAnimationNames.TextingWhileStanding),
                                new FBXAnimation(FBXAnimationNames.Waving, FBXAnimationNames.Waving),  
                                new FBXAnimation(FBXAnimationNames.WipingSweat, FBXAnimationNames.WipingSweat)                                   
                              ]


const jumpToFreeHangEase = CustomEase.create("custom", "M0,0 C0.29,0 0.238,-0.02 0.27,0.086 0.32,0.342 0.338,0.47 0.364,0.61 0.41,0.802 0.434,0.824 0.502,0.93 0.579,1.05 0.69,1.024 0.8,1 0.852,0.988 0.901,1 1,1");

export const createIntroSequence = (fieldOfView, sceneRatio, cameraZ) => {
  
  const hScreenEdgeByZPosition = (z) => {
    var hFOV = 2 * Math.atan(Math.tan(fieldOfView/2 * Math.PI/180) * sceneRatio)          
    var x = Math.tan(hFOV/2) * (z-cameraZ);
    return Math.abs(x);
  }

  const introSequence = [    
    new AnimationSequenceStep(FBXAnimationNames.Running, 3, 0.5, 
      [
        new TranslateToTween(3, 'none', new Vector3(0, -1, 1))
      ]),  
    new AnimationSequenceStep(FBXAnimationNames.Idle, 0.5, 0.5, 
      [
        new TranslateToTween(0.5, 'power1.out', new Vector3(0, -1, 2))
      ]),               
    new AnimationSequenceStep(FBXAnimationNames.JumpToFreehang, 2, 0.5,
      [
        new TranslateToTween(2, jumpToFreeHangEase, new Vector3(0, 0.3, 2))
      ]),
    new AnimationSequenceStep(FBXAnimationNames.HangingIdle, 0.5, 0.5),
    new AnimationSequenceStep(FBXAnimationNames.BracedToFreeHang, 1, 0.5,
      [
        new TranslateToTween(0.7, 'power1.in', new Vector3(0, 0.6, 2))
      ]),   
    new AnimationSequenceStep(FBXAnimationNames.FallingIdle, 0.5, 0.5,
      [
        new TranslateToTween(0.5, 'power1.in', new Vector3(0, 0.1, 2)),                               
      ], 'Navbar Pull'),  
    new AnimationSequenceStep(FBXAnimationNames.HardLanding, 1, 0.1,
      [
        new TranslateToTween(0.4, 'none', new Vector3(0, -1, 2)),                               
      ]), 
    new AnimationSequenceStep(FBXAnimationNames.Idle, 0.5, 0.5),
    new AnimationSequenceStep(FBXAnimationNames.StandRightTurn, 0.8, 0.2,
    [
      new RotateToTween(0.8, 'power1.inOut', new Vector3(0, -Math.PI/2, 0))
    ]),    
    new AnimationSequenceStep(FBXAnimationNames.Running, 2, 0.7, 
      [
        new TranslateToTween(2, 'power1.in', new Vector3(-hScreenEdgeByZPosition(2) + 0.8, -1, 2), false)
      ]),

    new AnimationSequenceStep(FBXAnimationNames.Idle, 0.5, 0.5,
      [
      new TranslateToTween(0.5, 'power1.out', new Vector3(-hScreenEdgeByZPosition(2) + 0.3, -1, 2), false)
      ]),
    new AnimationSequenceStep(FBXAnimationNames.PullHeavyObject, 4, 0.5, 
      [
        new TranslateToTween(70/60, 'power1.inOut', new Vector3(0, 0, -1), true, true)
      ], 'Pull Name'),
    new AnimationSequenceStep(FBXAnimationNames.WipingSweat, 2, 0.5),
    new AnimationSequenceStep(FBXAnimationNames.StandLeftTurn, 1, 0.2,
      [
        new RotateToTween(0.8, 'none', new Vector3(0, 0, 0))
      ], 'Turn To Camera'),
    new AnimationSequenceStep(FBXAnimationNames.Idle, 0.5, 0.5),
    new AnimationSequenceStep(FBXAnimationNames.TextingWhileStanding, 11, 0.5, [], 'Kyle Texting'),
    
    // DEBUG
    // new AnimationSequenceStep(FBXAnimationNames.Idle, 2, 0.5, [
    //   new TranslateToTween(0.5, 'none', new Vector3(0, -1, 2), false, false) 
    // ]),
    // new AnimationSequenceStep(FBXAnimationNames.TextingWhileStanding, 11, 0.5, [], 'Kyle Texting'),
  ];

  return introSequence;
}

export const wavingSequence = [
  new AnimationSequenceStep(FBXAnimationNames.Waving, 3.5, 0.5),
]




            