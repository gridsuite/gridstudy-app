import React from 'react';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import {Handle} from "react-flow-renderer";
import IconButton from "@material-ui/core/IconButton";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    model: {
        background: "darkseagreen",
    },
}));

const ModelNode = (props) => {
    const classes = useStyles();

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
            <IconButton variant="outlined" className={classes.model} disableElevation>
                <PlayArrowIcon/>
            </IconButton>
        </>
    );
};

export default ModelNode;