import React, { useState, useEffect, useContext, createContext } from 'react';
import AstarSidebar from './AstarSidebar';
import { Grid, Segment } from 'semantic-ui-react'
import RenderGrid from '../RenderGrid';
import { PathfindingContext, StatusbarContext } from '../../Context';

const pathfindingConfig = require('../../configs/pathfinding.json');

const NodeType = pathfindingConfig['nodeTypes']
const NodeColors = pathfindingConfig['nodeColors']

const StatusTypes = require('../../configs/status.json')

const Astar = () => {    
    const { globalStatus, setGlobalStatus } = useContext(StatusbarContext)   

    const [nodeSize, setNodeSize] = useState(50);
    const [rerender, setRerender] = useState(true)
    const [selectedNodeType, setSelectedNodeType] = useState('obstacle')
    const [clearGrid, setClearGrid] = useState(false)
    const [pathfindingGrid, setPathfindingGrid] = useState([])
    const [result, setResult] = useState('Ready')
    const [showFCost, setShowFCost] = useState(false)
    const [pathfindingRunning, setPathfindingRunning] = useState(false)

    const rows = 8;
    const cols = 16;

    if(clearGrid){
        setGlobalStatus({ 'status' : StatusTypes.Ready, 'statusText' : 'Grid cleared' })
    }

    const HandleResize = () => {
        // setNodeSize((window.innerWidth - gridMargin * 2) / 16)
    };   
    
    const handlePopulateGridClick = async (numObstacles, stickPercentage) => {
        setGlobalStatus({ 'status' : StatusTypes.Loading, 'statusText' : 'Populating Grid' }) 
        
        const response = await fetch('/api/populate-grid', {
            method : 'POST',
            body : JSON.stringify({numObstacles, stickPercentage, rows, cols})
        })

        if (response.status == 200){
            const text = await response.text(); 
            const createdGrid  = JSON.parse(text)['grid']
            
            createdGrid.forEach( row => {
                row.forEach( node => {
                    pathfindingGrid[node.row][node.col].nodeType = node.nodeType
                })
            })
            setPathfindingGrid(pathfindingGrid)
            setRerender(!rerender)
            setGlobalStatus({ 'status' : StatusTypes.Ready, 'statusText' : 'Grid Populated' })
        }
        else{
            setGlobalStatus({ 'status' : StatusTypes.Error, 'statusText' : 'Error from API' })
        }
    }

    const handleFindPathClick = async (animationTime) => {  
        setGlobalStatus({ 'status' : StatusTypes.Loading, 'statusText' : 'Finding Path' })  
        if (pathfindingGrid) {    
            let grid = pathfindingGrid
            grid.forEach(row => {
                row.forEach(element => {                 
                    if(element.nodeType == NodeType.Path || element.nodeType == NodeType.Explored || element.nodeType == NodeType.Open){
                        element.nodeType = NodeType.Unblocked
                    }
                })                
            })       
            setPathfindingGrid(grid)

            setResult("Pathfining...") 
            const response = await fetch('/api/astar-find-path', {
                method: "POST",
                body: JSON.stringify(grid),
            });

            if (response.status === 200) {
                const text = await response.text();                
                handleResult(text, grid, animationTime)
            } else {
                setPathfindingRunning(false)
                setGlobalStatus({ 'status' : StatusTypes.Error, 'statusText' : 'Error from API' })
                setResult("Error from API.");
            }
        }   
    }

    const timeout = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const handleResult = async (text, grid, animationTime) => {
        let result = JSON.parse(text)
        let resultPath = result['path']
        let status = result['status']
        let gridHistory = result['gridHistory']
        let currentRerender = rerender

        if(status == "success" || status == "blocked"){
            setGlobalStatus({ 'status' : StatusTypes.Loading, 'statusText' : 'Playing animation' }) 
            for(const step of gridHistory){
                for(const row of step){
                    for(const node of row){
                        const nodeType = grid[node.row][node.col].nodeType
                        if(nodeType != NodeType['Finish'] && nodeType != NodeType['Start']){
                            grid[node.row][node.col].nodeType = node.nodeType
                        }  

                        if(node.nodeType == NodeType['Explored'] || node.nodeType == NodeType['Open']){
                            grid[node.row][node.col].fCost = node.fCost;
                        }            
                        else{
                            grid[node.row][node.col].fCost = 0
                        }          
                    }
                }
                setPathfindingGrid(grid);
                currentRerender = !currentRerender
                setRerender(currentRerender)
                await timeout(animationTime);            
            }   
            
            if(status == 'success'){
                for(const element of resultPath){
                    if(grid[element.row][element.col].nodeType != NodeType['Finish']){
                        grid[element.row][element.col].nodeType = NodeType['Path']
    
                        setPathfindingGrid(grid)
                        currentRerender = !currentRerender
                        setRerender(currentRerender)
                        await timeout(animationTime); 
                    }                     
                }
                setGlobalStatus({ 'status' : StatusTypes.Ready, 'statusText' : 'Pathfinding successful' }) 
            } 
            else{
                setGlobalStatus({ 'status' : StatusTypes.Failed, 'statusText' : 'Path blocked' }) 
            }           
                        
            setResult(status);     
                   
        }
        else{
            setGlobalStatus({ 'status' : StatusTypes.Error, 'statusText' : 'Error from API' }) 
            setResult(status); 
        }

        setPathfindingRunning(false)
    } 

    useEffect(() => {        
        window.addEventListener("resize", HandleResize, false);       
        }, []);

    return(
        <PathfindingContext.Provider value={{pathfindingGrid, setPathfindingGrid , clearGrid, setClearGrid, 
            selectedNodeType, setSelectedNodeType, handleFindPathClick, showFCost, setShowFCost, result, setResult,
            pathfindingRunning, setPathfindingRunning, handlePopulateGridClick}}>
            {/* <div style={{paddingBottom : 40, minWidth : 40, backgroundColor : 'violet'}}> */}
                <Grid style={{pointerEvents : 'none', width : window.innerWidth}}>
                    <Grid.Column width={2} style={{zIndex: 1, pointerEvents : 'auto'}}>
                        <div style={{position : 'absolute', zIndex: 1, left : 20}}>
                            <AstarSidebar/> 
                        </div>
                    </Grid.Column>
                    <Grid.Column width={14}>
                        <h1>A* Pathfinding</h1>
                        <Segment style={{ width : cols * (nodeSize+2) + 70, height : rows * (nodeSize+4) + 40, 
                            margin : 'auto', pointerEvents : 'auto'}}>
                        <div style={{height : rows * (nodeSize+4), width : cols * (nodeSize+2), margin : "auto", marginTop : 20}}>
                            <Grid>
                                
                                <RenderGrid width={nodeSize}
                                    height={nodeSize} 
                                    rows={rows} 
                                    cols={cols} 
                                    setRerender={setRerender} 
                                    rerender={rerender}
                                    />                                
                            </Grid>
                        </div>
                        </Segment>
                    </Grid.Column>
                </Grid>      
            {/* </div> */}
        </PathfindingContext.Provider>
    )
}

export default Astar