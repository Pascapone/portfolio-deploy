import React, { useContext, useEffect } from "react";
import { Dropdown, Menu } from 'semantic-ui-react'
import { useNavigate } from 'react-router';

import { StatusbarContext } from "../Context";


const StatusTypes = require('../configs/status.json')

const Navbar = () => {
  const { globalStatus, setGlobalStatus } = useContext(StatusbarContext)
  let navigate = useNavigate(); 

  const handleNavigate = (routerLink) => {
    navigate(routerLink)
    setGlobalStatus({'status' : StatusTypes.Ready, 'statusText' : 'Ready'})
  }

  return (      
    <Menu pointing>
      <Menu.Item>
        <img src='./images/Logo.png' />
      </Menu.Item>      
      <Menu.Item
        name='home'
        onClick={() => handleNavigate('/')}
      />        
      <Dropdown item text='Classifiers'>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => handleNavigate('/mnist-classifier')}>MNIST Classifier</Dropdown.Item>
          <Dropdown.Item onClick={() => handleNavigate('/imagenet-classifier')}>Imagenet Classifier</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Dropdown item text='Pathfinding'>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => handleNavigate('/astar-pathfinding')}>A* Pathfinding</Dropdown.Item>     
        </Dropdown.Menu>
      </Dropdown>
      <Dropdown item text='Clustering'>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => handleNavigate('/knearest')}>K-Nearest Neighbors</Dropdown.Item>     
        </Dropdown.Menu>
      </Dropdown>
      <Menu.Item
        name='notebooks'
        onClick={() => handleNavigate('/notebooks')}
      />
      <Menu.Item
        name='about'
        onClick={() => handleNavigate('/about')}
      />
    </Menu>
  );
};

export default Navbar;