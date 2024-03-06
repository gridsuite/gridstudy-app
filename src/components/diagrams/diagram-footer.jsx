/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback } from 'react';
import Typography from '@mui/material/Typography';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import IconButton from '@mui/material/IconButton';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PropTypes from 'prop-types';

const styles = {
    counterText: (theme) => ({
        bottom: theme.spacing(4),
        left: theme.spacing(1),
        position: 'absolute',
    }),
    incrementCounterIcon: (theme) => ({
        padding: 0,
        bottom: theme.spacing(1),
        left: theme.spacing(5.5),
        position: 'absolute',
        cursor: 'pointer',
    }),
    decrementCounterIcon: (theme) => ({
        padding: 0,
        bottom: theme.spacing(1),
        left: theme.spacing(2),
        position: 'absolute',
        cursor: 'pointer',
    }),
    fullScreenIcon: (theme) => ({
        bottom: theme.spacing(1),
        right: theme.spacing(2),
        position: 'absolute',
        cursor: 'pointer',
    }),
};

const DiagramFooter = (props) => {
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

    return (
        <div style={{ display: 'flex' }}>
            {props.showCounterControls && (
                <>
                    {props.showCounterValue && (
                        <Typography sx={styles.counterText}>
                            {props.counterText + props.counterValue}
                        </Typography>
                    )}
                    <IconButton
                        onClick={handleIncrementCounter}
                        disabled={props.incrementCounterDisabled}
                        sx={styles.incrementCounterIcon}
                    >
                        <AddCircleIcon />
                    </IconButton>
                    <IconButton
                        onClick={handleDecrementCounter}
                        disabled={props.decrementCounterDisabled}
                        sx={styles.decrementCounterIcon}
                    >
                        <RemoveCircleIcon />
                    </IconButton>
                </>
            )}
            {props.showFullscreenControl && (
                <>
                    {props.fullScreenActive && (
                        <FullscreenExitIcon
                            onClick={handleStopFullScreen}
                            sx={styles.fullScreenIcon}
                        />
                    )}
                    {!props.fullScreenActive && (
                        <FullscreenIcon
                            onClick={handleStartFullScreen}
                            sx={styles.fullScreenIcon}
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
    decrementCounterDisabled: true,
    incrementCounterDisabled: false,
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
    decrementCounterDisabled: PropTypes.bool,
    incrementCounterDisabled: PropTypes.bool,
};

export default DiagramFooter;
