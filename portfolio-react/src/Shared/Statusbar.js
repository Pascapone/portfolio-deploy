import React from "react";
import { Segment } from 'semantic-ui-react'
import { StatusLight } from '@adobe/react-spectrum'

const Statusbar = (props) => {
    const height = 35
    return (
        <div style={{position : 'absolute', 
            zIndex: 2,  
            bottom : 0,            
            marginBottom : 0,
            paddingBottom : 0}}>
            <Segment style={{height : height, margin : 'auto', paddingTop : 3, paddingLeft : 2, width : window.innerWidth}} textAlign="left">
                <StatusLight variant={props.status}>{props.statusText}</StatusLight>
            </Segment>     
        </div>
    )
}

export default Statusbar;