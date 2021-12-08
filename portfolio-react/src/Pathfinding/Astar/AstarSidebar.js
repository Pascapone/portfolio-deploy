import React, { useState, useContext } from 'react'
import { Menu } from 'semantic-ui-react'
import {Slider, Picker, Item, Switch } from '@adobe/react-spectrum'
import { PathfindingContext } from '../../Context';

const AstarSidebar = (props) => {
  const [obstacleValue, setObstacleValue] = useState(20)  
  const [animationTime, setAnimationTime] = useState(500)
  const [stickPercentage, setStickPercentage] = useState(0.5)

  const {selectedNodeType, setSelectedNodeType, clearGrid, setClearGrid, handleFindPathClick,
    showFCost, setShowFCost, pathfindingRunning, setPathfindingRunning, handlePopulateGridClick} = useContext(PathfindingContext)

  const handleItemClick = (e, { name }) => {
    switch (name) {
      case 'clear':
        if(!pathfindingRunning){
          setClearGrid(true)
        }
        break;
      case 'find':        
        if(!pathfindingRunning){
          handleFindPathClick(animationTime)
          setPathfindingRunning(true)
        }        
        break;    
      case 'populate':
        handlePopulateGridClick(obstacleValue, stickPercentage)
        break;
      default:
        break;
    }
  }

  const handelShowFCostChange = (value) => {
    setShowFCost(value)
  }

  const handleObstacleValueChange = (value) => {
    setObstacleValue(value)
  }

  const handleStickyPercentageValueChange = (value) => {
    setStickPercentage(value)
  }

  const handleNodeTypeChanged = (value) => {
    setSelectedNodeType(value)
  }

  const handleAnimationTimeChange = (value) => {
    setAnimationTime(value)
  }

  return (       
    <Menu vertical visible={false}>
        <Menu.Item header
          name='header'
        >         
          Grid Controll
        </Menu.Item>   
        <Menu.Item name='populate'
          onClick={handleItemClick}>       
          Populate Grid
        </Menu.Item>  
        <Menu.Item name='clear'
          onClick={handleItemClick}
        >        
          Clear Grid
        </Menu.Item>  
        <Menu.Item name='find'
          onClick={handleItemClick}
        >        
          Find Path
        </Menu.Item>  
        <Menu.Item >          
          <Slider width={150} 
          label="Animation Time" 
          defaultValue={500}
          minValue={0}
          maxValue={1000}
          getValueLabel={(value) => `${value} ms`}
          onChange={handleAnimationTimeChange} />        
        </Menu.Item>  
        <Menu.Item>
          <Switch onChange={handelShowFCostChange}>Show F-Cost</Switch>
        </Menu.Item>
        <Menu.Item >          
          <Slider width={150} 
          label="Obstacles" 
          defaultValue={20}
          minValue={0}
          maxValue={40} 
          onChange={handleObstacleValueChange}/>        
        </Menu.Item>  
        <Menu.Item >          
          <Slider width={150} 
          label="Stick Percentage" 
          defaultValue={0.5}
          minValue={0}
          maxValue={1} 
          step={0.01}
          formatOptions={{style: 'percent', minimumFractionDigits: 0}}
          onChange={handleStickyPercentageValueChange}/>        
        </Menu.Item>   
        <Menu.Item >
          <Picker label="Choose Node Type" width={150} onSelectionChange={handleNodeTypeChanged} defaultSelectedKey={'obstacle'}>
            <Item key="obstacle">Obstacle</Item>
            <Item key="start">Start</Item>
            <Item key="finish">Finish</Item>
            <Item key="unblocked">Unblocked</Item>
          </Picker>
        </Menu.Item>     
      </Menu>   
  )
}

export default AstarSidebar;