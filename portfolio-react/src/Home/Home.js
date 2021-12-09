import React, { useContext, useEffect, useState } from 'react';
import Typing from 'react-typing-animation';
import gsap from 'gsap';
import { Context3D } from '../Context';
import { Button } from "semantic-ui-react";


const Home = (props) => {  
    const [showText, setShowText] = useState(false)
    
    const { render3DLoaded, handleFinishedTyping } = useContext(Context3D);

    if(props.homeKyleTextingTrrigger != showText){
        setShowText(true); 
    }  

    const handleGithubClicked = () => {
        window.open("https://github.com/Pascapone/portfolio-deploy");
    }

    useEffect(() => {
        return () => {
        }
    }, [])    

    return(
        <div style={{ position : 'absolute', left : '60%', right : '5%', top : 120, bottom : '0%', textAlign : 'justify'}}>              
               
            {showText && !props.showTextWithoutTyping ? 
            <div>
                <Typing startDelay={2500} speed={6}>
                    <span style={{ fontFamily : 'Roboto-Thin', fontSize : 20 }}>Welcome!</span>
                </Typing>
                <Typing startDelay={2800} speed={6} onFinishedTyping={handleFinishedTyping}>
                    <span style={{ fontFamily : 'Roboto-Thin', fontSize : 20 }}>This is the homepage of Pascal Schott.
                    Most of the content of this website is machine learning related. It is still under development and
                    will likely change in the comming weeks. Most of the projects are designed to be visually appealing.
                    A notebook section with more sophisticated machine learning examples will follow next.</span>
                </Typing>
            </div>
            :
            <div/>
            }
            {props.showTextWithoutTyping ? 
            <div>
                <div>
                    <span style={{ fontFamily : 'Roboto-Thin', fontSize : 20 }}>Welcome!</span>
                </div>
                <div>
                    <span style={{ fontFamily : 'Roboto-Thin', fontSize : 20 }}>This is the homepage of Pascal Schott.
                    Most of the content of this website is machine learning related. It is still under development and
                    will likely change in the comming weeks. Most of the projects are designed to be visually appealing.
                    A notebook section with more sophisticated machine learning examples will follow next.</span>
                </div>
                <Button
                basic
                color='blue'
                content='Github'
                icon='github'
                label={{
                    as: 'a',
                    basic: true,
                    color: 'blue',
                    pointing: 'left',
                    content: 'Pascal Schott',
                }}
                style={{ marginTop : 20 }}
                onClick={handleGithubClicked}
                /> 
            </div>
            :
            <div/>
            }            
        </div>
    );
};

export default Home;