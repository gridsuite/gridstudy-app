import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';

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
    message: {
        position: 'absolute',
        lineHeight: 1.2,
    },
}));

const LoaderWithOverlay = ({
    color,
    loaderSize,
    loadingMessageText,
    loadingMessageSize,
    loaderMessageSpace,
}) => {
    const classes = useStyles();

    return (
        <div className={classes.overlay} id={color}>
            <CircularProgress color={color} size={loaderSize} />
            <div
                className={classes.message}
                style={{
                    fontSize: loadingMessageSize,
                    marginTop: loaderMessageSpace,
                }}
            >
                <FormattedMessage id={loadingMessageText} />
            </div>
        </div>
    );
};

export default LoaderWithOverlay;
