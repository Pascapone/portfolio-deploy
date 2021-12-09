import React from 'react';
import { Segment, Icon } from "semantic-ui-react";

const Notebooks = () => {
    return(
        <div>            
            <h1>Notebooks</h1>
            <Segment style={{ width  : 600, margin : 'auto' }}>
                <span>Work in progress...</span>
                <div style={{ marginTop : 20 }}>
                <Icon name='hourglass outline' size='big'/>    
                </div>           
            </Segment>            
        </div>
    )
}

export default Notebooks