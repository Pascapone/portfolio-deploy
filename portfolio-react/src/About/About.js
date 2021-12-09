import React, { useEffect, useRef } from 'react';
import { Grid, Image, Button, Segment, Form, Modal } from "semantic-ui-react";
import gsap from 'gsap';
import { ReactDOM } from 'react';


const About = () => {   
    let skillsRef = useRef([])

    const opacities = [];
    const tweens = [];

    const skills = [{name : 'Abaqus', skill : 3},
                    {name : 'Ansys', skill : 1},
                    {name : 'C#', skill : 3},
                    {name : 'C++', skill : 2},
                    {name : 'CreoParametrics', skill : 2},
                    {name : 'Javascript', skill : 2},
                    {name : 'LabView', skill : 3},
                    {name : 'Matlab', skill : 3},
                    {name : 'Python', skill : 4},  
                    {name : 'React', skill : 2},
                    {name : 'Solidity', skill : 2},  
                    {name : 'Tensorflow', skill : 3}, 
                    {name : 'PyTorch', skill : 1}, 
                    {name : 'Unity', skill : 3},];  

    useEffect(() => {
        const delay = 0.1;
        const duration = 0.2;
        var delayTracker = 0;

        for(var i = 0; i<skillsRef.current.length; i++){
            tweens.push(
                gsap.to(skillsRef.current[i], { duration : duration, ease : 'none', opacity : opacities[i], 
                    delay : delayTracker, onComplete : onSkillVisible})
            )
            delayTracker += delay;
        }
        return () => {
            for(const tween of tweens){
                tween.kill()
            }
        }
    }, [])    
    
    function onSkillVisible() {
        if(this.vars.opacity === 1){
            tweens.push(
                gsap.to(this._targets[0], { duration : 2, ease : 'power1.inOut', scaleX : 1 +  (Math.random()-1)/10, scaleY : 1 +  (Math.random()-1)/10, yoyo : true, repeat : -1})
            )   
        }    
    }   

    const RenderSkills = () => {
        var renderArray = [];
        

        skills.forEach( (element) => {
            let skill = (       
                <Grid.Column width={6}>
                    <Grid.Column>
                        <span style={{ fontFamily : 'Roboto-Medium', fontSize : 15, marginLeft : 10 }}>{element.name}</span>
                    </Grid.Column>
                </Grid.Column>
            ); 
         
            let skillPointArray = []
            for(var i = 1; i <= 5; i++){
                let opacity;
                if(i <= element.skill){
                    opacity = 1;
                }
                else{
                    opacity = 0.25;
                }               
                opacities.push(opacity);

                const skillPoint = (
                    <Grid.Column>
                        <div style={{backgroundColor : '#03cffc', width : 20, height : 20, borderRadius : '50%',
                            background: 'radial-gradient(circle at 12px 12px, #03cffc, #4287f5)', opacity : 0, tweenName : 'Test'}}
                            ref={el => skillsRef.current.push(el)}></div>
                    </Grid.Column>
                )               

                skillPointArray.push(
                    skillPoint
                )
            }

            renderArray.push(
                <Grid.Row columns={2}>
                    {skill}
                    <Grid.Column>
                        <Grid>
                            <Grid.Row columns={5}>
                                {skillPointArray}
                            </Grid.Row>
                        </Grid>
                    </Grid.Column> 
                </Grid.Row>
            )
        })
        return renderArray;
    }

    return(
        <div>            
            <h1>About</h1> 
            <Segment style={{width : 600, margin : 'auto', textAlign : 'justify', padding :40}}>
                <span style={{}}>
                    I'm a mechanical engineer and a self taught programmer.
                    During university i fell in love with programming and tried to pick
                    every class that had something to do with programming. Since the offer
                    was limited, i dove deep into all kinds of programming challenges during my free time.<br/>
                    <br/>
                    At university i accepted a job for programming a human machine interface
                    and the measurement systems for an engine test bench (LabView).  
                    On my seccond job i had to analyse a lot of data for a steel casting company.
                    Since matlab wasnt available at this institue, i was looking for open source alternatives
                    and quickly decided to go with python. Since i was doing data analysis and EDA, it was
                    only a small step to machine learning.                    
                </span>
                <div style={{marginTop : 40}}>
                    <h3 style={{marginBottom : 20}}>Skills:</h3>
                    
                    <Grid>                        
                        <RenderSkills/>
                    </Grid>                 
                </div>
            </Segment>
        </div>
        
    )
}

export default About