import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    overlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'grey',
        opacity: '0.8',
        zIndex: 99,
    },
}));

const LoaderWithOverlay = ({ color, size }) => {
    const classes = useStyles();

    return (
        <div className={classes.overlay} id={color}>
            <CircularProgress color={color} size={size} />
        </div>
    );
};

export default LoaderWithOverlay;
