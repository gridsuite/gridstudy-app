import React from 'react';
import Button from '@material-ui/core/Button';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import {Handle} from "react-flow-renderer";

const ModelNode = (props) => {
    return (
        <>
            <Handle
                type="source"
                position="bottom"
                style={{ background: '#555' }}
                onConnect={(params) => console.log('handle onConnect', params)}
                isConnectable={true}
            />
            <Handle
                type="target"
                position="top"
                style={{ background: '#555' }}
                onConnect={(params) => console.log('handle onConnect', params)}
                isConnectable={true}
            />
            <Button
                variant="contained"
                color="primary"
                disableElevation
                startIcon={<PlayArrowIcon/>}
            >
                Model
            </Button>
        </>
    );
};

export default ModelNode;