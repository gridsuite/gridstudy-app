import React from 'react';
import Button from '@material-ui/core/Button';
import {Handle} from "react-flow-renderer";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    hypo: {
        background: "steelblue",
        textTransform: 'none',
    },
}));

const HypoNode = (props) => {
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
            <Button
                variant="outlined"
                className={classes.hypo}
                disableElevation
            >
                Toto
            </Button>
        </>
    );
};

export default HypoNode;