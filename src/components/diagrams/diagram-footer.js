/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import IconButton from '@mui/material/IconButton';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS } from './diagram-common';

const useStyles = makeStyles((theme) => ({
    counterText: {
        bottom: theme.spacing(4),
        left: theme.spacing(1),
        position: 'absolute',
    },
    incrementCounterIcon: {
        bottom: theme.spacing(0),
        left: theme.spacing(3.5),
        position: 'absolute',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: 'transparent',
        },
    },
    decrementCounterIcon: {
        bottom: theme.spacing(0),
        left: theme.spacing(0),
        position: 'absolute',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: 'transparent',
        },
    },
    fullScreenIcon: {
        bottom: theme.spacing(1),
        right: theme.spacing(2),
        position: 'absolute',
        cursor: 'pointer',
    },
}));

const DiagramFooter = (props) => {
    const classes = useStyles();

    const {
        onStopFullScreen,
        onStartFullScreen,
        onIncrementCounter,
        onDecrementCounter,
    } = props;
    const handleStopFullScreen = useCallback(
        () => onStopFullScreen && onStopFullScreen(),
        [onStopFullScreen]
    );
    const handleStartFullScreen = useCallback(
        () => onStartFullScreen && onStartFullScreen(),
        [onStartFullScreen]
    );
    const handleIncrementCounter = useCallback(
        () => onIncrementCounter && onIncrementCounter(),
        [onIncrementCounter]
    );
    const handleDecrementCounter = useCallback(
        () => onDecrementCounter && onDecrementCounter(),
        [onDecrementCounter]
    );
    const nbVoltageLevels = useSelector(
        (state) => state.networkAreaDiagramNbVoltageLevels
    );
    const networkAreaDiagramDepth = useSelector(
        (state) => state.networkAreaDiagramDepth
    );

    return (
        <div style={{ display: 'flex' }}>
            {props.showCounterControls && (
                <>
                    {props.showCounterValue && (
                        <Typography className={classes.counterText}>
                            {props.counterText + props.counterValue}
                        </Typography>
                    )}
                    <IconButton
                        disabled={
                            nbVoltageLevels >
                            NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS
                        }
                        className={classes.incrementCounterIcon}
                    >
                        <AddCircleIcon onClick={handleIncrementCounter} />
                    </IconButton>
                    <IconButton
                        disabled={networkAreaDiagramDepth === 0}
                        className={classes.decrementCounterIcon}
                    >
                        <RemoveCircleIcon onClick={handleDecrementCounter} />
                    </IconButton>
                </>
            )}
            {props.showFullscreenControl && (
                <>
                    {props.fullScreenActive && (
                        <FullscreenExitIcon
                            onClick={handleStopFullScreen}
                            className={classes.fullScreenIcon}
                        />
                    )}
                    {!props.fullScreenActive && (
                        <FullscreenIcon
                            onClick={handleStartFullScreen}
                            className={classes.fullScreenIcon}
                        />
                    )}
                </>
            )}
        </div>
    );
};

DiagramFooter.defaultProps = {
    showCounterControls: false,
    showCounterValue: true,
    showFullscreenControl: false,
    counterText: '',
    counterValue: 0,
    fullscreenActive: false,
};

DiagramFooter.propTypes = {
    showCounterControls: PropTypes.bool,
    showCounterValue: PropTypes.bool,
    counterText: PropTypes.string,
    counterValue: PropTypes.number,
    onIncrementCounter: PropTypes.func,
    onDecrementCounter: PropTypes.func,
    showFullscreenControl: PropTypes.bool,
    fullScreenActive: PropTypes.any,
    onStopFullScreen: PropTypes.func,
    onStartFullScreen: PropTypes.func,
};

export default DiagramFooter;
