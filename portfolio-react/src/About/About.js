import React, { useEffect, useRef } from 'react';
import { Grid, Segment } from "semantic-ui-react";
import gsap from 'gsap';

const About = () => {   
    const skillsRef = useRef([])
    skillsRef.current = [];

    const opacities = [];
    const tweens = [];    

    const skills = [{name : 'Abaqus', skill : 3},
                    {name : 'Ansys', skill : 1},
                    {name : 'C#', skill : 3},
                    {name : 'C++', skill : 2},
                    {name : 'CreoParametrics', skill : 3},
                    {name : 'Javascript', skill : 3},
                    {name : 'LabView', skill : 3},
                    {name : 'Matlab', skill : 3},
                    {name : 'Python', skill : 4},  
                    {name : 'React', skill : 2},
                    {name : 'Solidity', skill : 2},  
                    {name : 'Tensorflow', skill : 3}, 
                    {name : 'PyTorch', skill : 1}, 
                    {name : 'Unity', skill : 3},];  
  

    const mounted = useRef();
    useEffect(() => {
        if (!mounted.current) {
            playSkillsAnimation();
            console.log('About Did Mount!')
            mounted.current = true;            
        } 
        else {
            console.log('About Did Update!')
        }

        return () => {    
            console.log('About Did Unmount!')   
            killAllTweens();            
        }
    }, []);
 
    const killAllTweens = () => {
        for(const tween of tweens){
            tween.kill()
        }

        tweens.length = 0;
    }

    const playSkillsAnimation = () => {        
        var delay = 0;
        const delayStep = 0.1;
        skillsRef.current.forEach( (el, i) => {      
            gsap.to(el, {duration : 1, ease : 'none', opacity : opacities[i], 
                delay : delay, onComplete : onSkillVisible});
            delay += delayStep;
        })
        
    }
    
    function onSkillVisible() {
        if(this.vars.opacity === 1){
            tweens.push(
                gsap.to(this._targets[0], { duration : 2, ease : 'power1.inOut', 
                scaleX : 1 +  (Math.random()-1)/9, 
                scaleY : 1 +  (Math.random()-1)/9, 
                yoyo : true, repeat : -1, delay : Math.random()})
            )   
        }    
    }   

    
    const addToRef = (el) => {
        if(el && !skillsRef.current.includes(el)){
            skillsRef.current.push(el);
        }
    }

    return(
        <div>            
            <h1>About</h1> 
            <Segment style={{width : 600, margin : 'auto', textAlign : 'justify', padding :40}}>
                <h3>Pascal Schott</h3>
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
                        {                          
                            skills.map( ({name, skill}) => {
                                let skillRender = (       
                                    <Grid.Column width={6}>
                                        <Grid.Column>
                                            <span style={{ fontFamily : 'Roboto-Medium', fontSize : 15, marginLeft : 10 }}>{name}</span>
                                        </Grid.Column>
                                    </Grid.Column>
                                ); 

                                let skillPointArray = []
                                for(var i = 1; i <= 5; i++){
                                    let opacity;
                                    if(i <= skill){
                                        opacity = 1;
                                    }
                                    else{
                                        opacity = 0.25;
                                    }       
                                    
                                    const key = `${name}_Skillpoint_${i}`;
                                    opacities.push(opacity);

                                    const skillPoint = (
                                        <Grid.Column key={`${name} Skillpoint ${i} Column`}>
                                            <div style={{backgroundColor : '#03cffc', width : 20, height : 20, borderRadius : '50%',
                                                background: 'radial-gradient(circle at 12px 12px, #03cffc, #4287f5)', opacity : 0, tweenName : 'Test'}}
                                                key={key} ident={key} ref={addToRef}></div>
                                        </Grid.Column>
                                    )               

                                    skillPointArray.push(
                                        skillPoint
                                    )
                                };

                                return (
                                    <Grid.Row columns={2} key={`${name}`}>
                                        {skillRender}
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
                        }
                    </Grid>                 
                </div>
            </Segment>
        </div>
        
    )
}

export default About