import React from 'react';
import { Routes, Route } from "react-router-dom";
import Home from './Home/Home';
import About from './About/About';
import MNISTClassiefier from './Classifiers/MNISTClassifier/MNISTClassifier';
import ImageClassifier from './Classifiers/ImagenetClassifier/ImagenetClassifier';
import Astar from './Pathfinding/Astar/Astar';
import KNearest from './Clustering/KNearest/KNearest';
import Notebooks from './Notebooks/Notebooks';

const AppRoutes = (props)=> {
    console.log('APP ROUTES RENDER')
    return (     
        <Routes>
            <Route path="/" element={<Home homeKyleTextingTrrigger={props.homeKyleTextingTrrigger}/>} />        
            <Route path="/about" element={<About />} />    
            <Route path="/mnist-classifier" element={<MNISTClassiefier />} /> 
            <Route path="/imagenet-classifier" element={<ImageClassifier />} />   
            <Route path="/astar-pathfinding" element={<Astar />} />  
            <Route path="/knearest" element={<KNearest />} />
            <Route path="/notebooks" element={<Notebooks />} />  
        </Routes>
    );
};

export default AppRoutes;