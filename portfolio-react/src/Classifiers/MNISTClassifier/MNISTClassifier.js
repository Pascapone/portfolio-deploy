import React, { useRef, useState, useContext } from "react";
import CanvasDraw from "react-canvas-draw";
import { Grid, Image, Button, Segment } from "semantic-ui-react";
import { StatusbarContext } from "../../Context";

const StatusTypes = require('../../configs/status.json');


const MNISTClassifier = () => {
    const canvasRef = useRef();

    const { globalStatus, setGlobalStatus } = useContext(StatusbarContext);

    const [result, setResult] = useState("None"); 
    
    const ClearCanvas = () => {
        canvasRef.current.clear();
        setGlobalStatus({ 'status' : StatusTypes.Ready, 'statusText' : 'Canvas cleared' })
    };

    const PredictDigit = async () => {
        setGlobalStatus({ 'status' : StatusTypes.Loading, 'statusText' : 'Predicting...' })
        const image = canvasRef.current.getSaveData();        
        if (JSON.parse(image).lines.length > 0) {  
            setResult('Predicting...');    
            const response = await fetch('/api/classify-mnist', {
                method: "POST",
                body: image,
            });
    
            if (response.status === 200) {
                const text = await response.text();
                setResult(text);
                setGlobalStatus({ 'status' : StatusTypes.Ready, 'statusText' : `Prediction complete: ${text}` })
            } else {
                setGlobalStatus({ 'status' : StatusTypes.Error, 'statusText' : 'Error from API' })
                setResult("Error from API.");
            }
        }
        else{
            setGlobalStatus({ 'status' : StatusTypes.Failed, 'statusText' : 'Empty canvas' })
        }
    };

    return (
        <div style={{paddingBottom : 40}}>            
            <h1>MNIST Classifier</h1>
            <div style={{paddingBottom: 20}}>
            <div style={{width : 500, margin : 'auto'}}>
                <Segment>
                    You can draw a digit and let the classifier guess which number it is.<br/>
                    (One is currently only working reliable with [I] and not the classical [1]. <br/>
                    The mnist dataset mostly consists of [I]-examples. Fix incoming.)             
                </Segment>
            </div>
            </div>  
            <div style={{width : 500, margin : 'auto'}}>
                <Segment>            
                    <div style={{
                        margin: 'auto', 
                        width : 202,
                        height : 202, 
                        border: '1px solid black',
                        }}>
                        <CanvasDraw ref={canvasRef} canvasWidth={200} canvasHeight={200} brushRadius={20} loadTimeOffset={1}/>
                    </div>  
                    <Grid centered columns={5} style={{marginTop : 1}}>
                        <Grid.Row>
                            <Grid.Column textAlign="center">
                                <Button onClick={PredictDigit}>Predict</Button> 
                            </Grid.Column>
                            <Grid.Column textAlign="center">
                                <Button onClick={ClearCanvas}>Clear</Button> 
                            </Grid.Column>
                        </Grid.Row>    
                        <Grid.Row>
                            <h4>Prediction: {result}</h4>
                        </Grid.Row> 
                    </Grid>    
                    </Segment>     
            </div> 
        </div>
    );
};

export default MNISTClassifier;