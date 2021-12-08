import React, { useState, useContext } from 'react'
import { Menu } from 'semantic-ui-react'
import {Slider, Picker, Item, Switch } from '@adobe/react-spectrum'
import { ClusterinContext } from '../../Context'

const KNearestSidebar = (props) => { 
  const {handlePopulateGraphClick, setNClusters, setNSamples, setStd,
    handleFindClustersClicked, setAnimationTime, clusteringRunning, setClusteringRunning} = useContext(ClusterinContext)

  const handleItemClick = (e, { name }) => {
    switch (name) {
      case 'clear':
        break;
      case 'find': 
        if(!clusteringRunning){
          handleFindClustersClicked()
          setClusteringRunning(true)
        }        
        break;    
      case 'populate':
        if(!clusteringRunning){
          handlePopulateGraphClick()
        }
        break;
      default:
        break;
    }
  }  

  const handleAnimationTimeChanged = (value) => {
    setAnimationTime(value)
  }

  const handleDataPointsChanged = (value) => {
    setNSamples(value)
  }

  const handleClustersChanged = (value) => {
    setNClusters(value)
  }

  const handleStdChanged = (value) => {
    setStd(value)
  }

  return (       
    <Menu vertical visible={false}>
        <Menu.Item header
          name='header'
        >         
          K-Nearest Neighbors
        </Menu.Item>   
        <Menu.Item name='populate'
          onClick={handleItemClick}>       
          Populate Graph
        </Menu.Item>
        <Menu.Item name='find'
          onClick={handleItemClick}>        
          Find Clusters
        </Menu.Item>  
        <Menu.Item >          
          <Slider width={150} 
          label="Animation Time" 
          defaultValue={500}
          minValue={250}
          maxValue={1000}
          getValueLabel={(value) => `${value} ms`}
          onChangeEnd={handleAnimationTimeChanged}
          />        
        </Menu.Item> 
        <Menu.Item >          
          <Slider width={150} 
          label="Data Points" 
          defaultValue={50}
          minValue={0}
          maxValue={100}
          onChangeEnd={handleDataPointsChanged}/>        
        </Menu.Item>  
        <Menu.Item >          
          <Slider width={150} 
          label="Clusters" 
          defaultValue={2}
          minValue={1}
          maxValue={10}
          onChangeEnd={handleClustersChanged}/>        
        </Menu.Item> 
        <Menu.Item >          
          <Slider width={150} 
          label="Standard Deviation" 
          defaultValue={1}
          minValue={0}
          maxValue={3} 
          step={0.01}
          onChangeEnd={handleStdChanged}/>        
        </Menu.Item>  
      </Menu>   
  )
}

export default KNearestSidebar;