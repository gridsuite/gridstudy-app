import React from 'react';
import { CircularProgress } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { FormattedMessage } from 'react-intl';

const useStyles = makeStyles((theme) => ({
    overlay: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'grey',
        opacity: '0.8',
        zIndex: 99,
        fontSize: 15,
    },
}));

const LoaderWithOverlay = ({
    color,
    loaderSize,
    loadingMessageText,
    isFixed,
}) => {
    const classes = useStyles();

    return (
        <div
            className={classes.overlay}
            style={{ position: isFixed ? 'fixed' : 'absolute' }}
        >
            <CircularProgress color={color} size={loaderSize} />
            <FormattedMessage id={loadingMessageText} />
        </div>
    );
};

export default LoaderWithOverlay;
