import React, { useState, useEffect, useContext } from "react";
import KNearestSidebar from "./KNearestSidebar";
import { ClusterinContext, StatusbarContext } from "../../Context";
import { Scatter, CartesianGrid, XAxis, YAxis, ZAxis, ComposedChart, Cell  } from 'recharts'
import { Grid } from "semantic-ui-react";

const status = require('../../configs/status.json')

const colors = [
    '#7FFF00', // Chartreuse
    '#7FFFD4', // Aquamarine
    '#FF7F50', // Coral
    '#5F9EA0', // CadetBlue
    '#8A2BE2', // BlueViolet
    '#008B8B', // DarkCyan
    '#DC143C', // Crimson
    '#696969', // DimGrey
    '#FF00FF', // Magenta
    '#FFFF00'  // Yellow
]

const KNearest = () => {
    const {globalStatus, setGlobalStatus} = useContext(StatusbarContext)

    const [nClusters, setNClusters] = useState(2)
    const [nSamples, setNSamples] = useState(50)
    const [std, setStd] = useState(1)
    const [points, setPoints] = useState([])
    const [classifiers, setClassifiers] = useState([])
    const [animationTime, setAnimationTime] = useState(500)
    const [clusteringRunning, setClusteringRunning] = useState(false)   

    document.body.style.overflow='hidden'

    const handleResize = () => {
        
    }

    useEffect(() => {        
        window.addEventListener("resize", handleResize, false);  
        window.addEventListener("scroll", handleResize, false);     
        }, []);

    const timeout = async (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const handlePopulateGraphClick = async () => {
        const respone = await fetch('/api/generate-clusters', {
            method : 'POST', 
            body : JSON.stringify({"centers" : nClusters, "n_samples" : nSamples, 'cluster_std' : std})
        })

        if (respone.status == 200){
            const text = await respone.text()
            const points = JSON.parse(text)
            if (classifiers.length > 0){
                setClassifiers([])
            }
            setGlobalStatus({ 'status' : status.Ready,  'statusText' : 'Clusters created' })
            setPoints(points)
        }
        else{
            setGlobalStatus({ 'status' : status.Error,  'statusText' : 'Error from API' })
        }
    }

    const handleFindClustersClicked = async () => {
        setGlobalStatus({ 'status' : status.Loading,  'statusText' : 'Classifying clusters' })    

        if(points.length == 0){
            setGlobalStatus({ 'status' : status.Failed,  'statusText' : 'No points to classify' });
            await timeout(0)
            setClusteringRunning(false);
            return
        }

        const response = await fetch('/api/knearest', { 
            method : 'POST',
            body : JSON.stringify({points, nClusters})
        })

        if (response.status == 200){
            const text = await response.text()
            const result = JSON.parse(text)
            
            setGlobalStatus({ 'status' : status.Loading,  'statusText' : 'Animation playing' }) 

            for(const iter of result['iteration_tracker']){
                setPoints(iter['points'])
                setClassifiers(iter['classifiers'])
                await timeout(animationTime);  
            }            

            setPoints(result['points'])
            setClusteringRunning(false)

            setGlobalStatus({ 'status' : status.Ready,  'statusText' : 'Classifying clusters completed' }) 
        }
        else{
            setGlobalStatus({ 'status' : status.Ready,  'statusText' : 'Clusters created' })
            setClusteringRunning(false)
        }
    }

    return(        
        <ClusterinContext.Provider value={{handlePopulateGraphClick, setNClusters, setNSamples, setStd, 
            handleFindClustersClicked, setAnimationTime, clusteringRunning, setClusteringRunning}}>
            <div style={{paddingBottom : 40, minWidth : 1050}}>  
                <Grid>
                    <Grid.Column width={2} style={{zIndex: 1}}>
                        <KNearestSidebar/>
                    </Grid.Column>
                    <Grid.Column width={14}>
                        <h1>K-Nearest Neighbors</h1>
                        <div>
                            <ComposedChart width={800}
                                height={450}
                                style={{margin : 'auto'}}
                                >
                                    <CartesianGrid />
                                    <XAxis dataKey="x" name="x" type="number"/>
                                    <YAxis dataKey="y" name="y" />
                                    <ZAxis dataKey="z" name="z" type="number" range={[50, 200]}/>
                                    <Scatter name="Points" data={points} fill="#8884d8">
                                        {points.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={colors[entry['classifier']]} />
                                        ))}
                                    </Scatter>
                                    <Scatter name="Clasifiers" data={classifiers} shape="cross" fill="#8884d8">
                                        {points.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={colors[index]} />
                                        ))}
                                    </Scatter>
                            </ComposedChart>
                        </div>   
                    </Grid.Column>
                </Grid>                 
            </div>    
        </ClusterinContext.Provider>
    )
}

export default KNearest