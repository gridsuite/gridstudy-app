/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import PropTypes from 'prop-types';

import { green, grey, orange, red } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';

import SplitButton from './util/split-button';

export const RunningStatus = {
    SUCCEED: 'SUCCEED',
    FAILED: 'FAILED',
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
};

const useStyles = makeStyles((theme) => ({
    succeed: {
        backgroundColor: green[500],
        color: 'black',
        '&:disabled': {
            backgroundColor: green[500],
            color: 'black',
        },
        '&:hover': {
            backgroundColor: green[700],
        },
    },
    failed: {
        backgroundColor: red[500],
        color: 'black',
        '&:disabled': {
            backgroundColor: red[500],
            color: 'black',
        },
        '&:hover': {
            backgroundColor: red[700],
        },
    },
    running: {
        backgroundColor: orange[500],
        color: 'black',
        '&:disabled': {
            backgroundColor: orange[500],
            color: 'black',
        },
    },
    idle: {
        backgroundColor: grey[500],
        '&:hover': {
            backgroundColor: grey[700],
        },
        color: 'white',
    },
}));

const RunButton = (props) => {
    const classes = useStyles();

    const [selectedIndex, setSelectedIndex] = React.useState(0);

    function getStyle(runningStatus) {
        switch (runningStatus) {
            case RunningStatus.SUCCEED:
                return classes.succeed;
            case RunningStatus.FAILED:
                return classes.failed;
            case RunningStatus.RUNNING:
                return classes.running;
            case RunningStatus.IDLE:
            default:
                return classes.idle;
        }
    }

    const handleClick = () => {
        if (props.onStartClick) {
            props.onStartClick(getRunnable());
        }
    };

    function getRunnable() {
        return props.runnables[selectedIndex];
    }

    function getRunningStatus() {
        return props.getStatus(getRunnable());
    }

    const runningStatus = getRunningStatus();

    return (
        <SplitButton
            fullWidth
            options={props.runnables}
            selectedIndex={selectedIndex}
            onSelectionChange={(index) => setSelectedIndex(index)}
            onClick={handleClick}
            className={getStyle(runningStatus)}
            buttonDisabled={runningStatus !== RunningStatus.IDLE}
            selectionDisabled={runningStatus === RunningStatus.RUNNING}
            startIcon={props.getStartIcon(getRunningStatus())}
            text={
                props.getText
                    ? props.getText(getRunnable(), getRunningStatus())
                    : ''
            }
        />
    );
};

RunButton.propTypes = {
    runnables: PropTypes.array.isRequired,
    getStatus: PropTypes.func.isRequired,
    getText: PropTypes.func.isRequired,
    getStartIcon: PropTypes.func.isRequired,
    onStartClick: PropTypes.func,
};

export default RunButton;
