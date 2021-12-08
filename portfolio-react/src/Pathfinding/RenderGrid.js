import React, { useContext } from 'react';
import { Segment, Grid } from 'semantic-ui-react'
import { PathfindingContext } from '../Context';

const pathfindingConfig = require('../configs/pathfinding.json');

const NodeType = pathfindingConfig['nodeTypes']
const NodeColors = pathfindingConfig['nodeColors']

class Node{
    constructor(row, col, nodeType){
        this.row = row;
        this.col = col;
        this.nodeType = nodeType;
        this.fCost = 0;
    }
}

const getNodeTypeByString = (selectedNodeType) => {
    let nodeType = 1
    switch (selectedNodeType) {
        case 'obstacle':
            nodeType = NodeType.Obstacle
            break;
        case 'start':
            nodeType = NodeType.Start
            break; 
        case 'unblocked':
            nodeType = NodeType.Unblocked
            break;
        case 'finish':
            nodeType = NodeType.Finish
            break;
        default:
            nodeType = NodeType.Unblocked
            break;
    }    
    return nodeType;
}

const CreateGrid = (props) => {
    let grid = []
    for (let row = 0; row < props.rows; row++) { 
        let nodeRow = []
        for (let col = 0; col < props.cols; col++) {
            nodeRow.push(new Node(row, col, NodeType.Unblocked))
        }
        grid.push(nodeRow);
    }
    props.setPathfindingGrid(grid);
    return grid
}

const RenderGrid = (props) => {
    const {pathfindingGrid, setPathfindingGrid, clearGrid, setClearGrid, selectedNodeType, 
        showFCost, result, setResult, pathfindingRunning } = useContext(PathfindingContext)
    let grid = pathfindingGrid

    if(grid.length === 0){
        grid = CreateGrid({rows: props.rows, cols: props.cols, setPathfindingGrid: setPathfindingGrid})
    }

    if(clearGrid){
        grid.forEach(row => {
            row.forEach(node => {            
                    node.nodeType = NodeType.Unblocked;  
                    node.fCost = 0;           
            })
        });
        setClearGrid(false);
    }    

    const handleNodeClicked = (e) => {
        if(pathfindingRunning){
            return null
        }

        const id = e.target.id.split('/');
        const row = id[0]
        const col = id[1]   

        if (result !== 'Ready'){
            grid.forEach(row => {
                row.forEach(node => {
                    if(node.nodeType === NodeType.Open || node.nodeType === NodeType.Explored || node.nodeType === NodeType.Path){
                        node.nodeType = NodeType.Unblocked;
                    }
                })
            });
            setResult('Ready')
        }

        if(selectedNodeType === 'start' || selectedNodeType === 'finish'){
            grid.forEach(row => {
                row.forEach(node => {
                    if(node.nodeType === NodeType.Start && selectedNodeType === 'start'){
                        node.nodeType = NodeType.Unblocked;
                    }
                    else if(node.nodeType === NodeType.Finish && selectedNodeType === 'finish'){
                        node.nodeType = NodeType.Unblocked;
                    }
                })
            });
        }
    
        grid[row][col].nodeType = getNodeTypeByString(selectedNodeType); 
        setPathfindingGrid(grid);  
        props.setRerender(!props.rerender);
    }

    let renderGrid = []
    for (let row = 0; row < props.rows; row++) {        
        let renderRow = []
        for (let col = 0; col < props.cols; col++) {        
            const node = grid[row][col]  
            let color = NodeColors[node.nodeType]            
            
            renderRow.push(
                <Grid.Column style={{margin: 0, padding : 0}} key={'col-' + row.toString() + '/' + col.toString()}>
                    <Segment style={{margin: 2, height : props.height, backgroundColor: color, padding : 0, width : props.width}}
                        textAlign='center'
                        onClick={handleNodeClicked} 
                        id={row.toString() + '/' + col.toString()}
                        key={'seg-' + row.toString() + '/' + col.toString()}
                    >
                        {node.nodeType !== NodeType['Unblocked'] && node.nodeType !== NodeType['Obstacle'] && showFCost ? 
                            node.fCost
                        :
                            <div></div>
                        }                        
                    </Segment>
                </Grid.Column>
            )            
        } 
        renderGrid.push(<Grid.Row style={{margin: 0, padding : 0}} columns={16} key={'row-' + row.toString()}>{renderRow}</Grid.Row>)     
    }
    return renderGrid;
}

export default RenderGrid;