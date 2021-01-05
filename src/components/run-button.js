/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import PropTypes from 'prop-types';
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
        backgroundColor: '#0ca789',
        color: '#fdfdfd',
        border: '1px solid #0ca789',
        '&:nth-child(1)': {
            minWidth: 270,
            border: 'none',
        },
        '&:nth-child(2)': {
            border: 'none',
            borderLeft: '1px solid #92b1ab',
        },
        '&:disabled, &:hover': {
            backgroundColor: '#0ca789',
            color: '#fdfdfd',
        },
    },
    failed: {
        backgroundColor: '#d85050',
        color: '#fdfdfd',
        border: '1px solid #d85050',
        '&:nth-child(1)': {
            minWidth: 270,
            border: 'none',
        },
        '&:nth-child(2)': {
            border: 'none',
            borderLeft: '1px solid #c58585',
        },
        '&:disabled, &:hover': {
            backgroundColor: '#d85050',
            color: '#fdfdfd',
        },
    },
    running: {
        backgroundColor: '#242424',
        color: '#fdfdfd',
        border: theme.palette.type === 'dark' ? '1px solid #808080' : 'none',
        '&:nth-child(1)': {
            minWidth: 270,
            color: '#fdfdfd',
        },
        '&:nth-child(2)': {
            border: 'none',
            borderLeft: '1px solid #4a4a4a',
        },
        '&:hover': {
            backgroundColor: '#242424',
            color: '#fdfdfd',
        },
    },
    idle: {
        backgroundColor: '#242424',
        color: '#fdfdfd',
        border: theme.palette.type === 'dark' ? '1px solid #808080' : 'none',
        '&:nth-child(1)': {
            minWidth: 270,
            color: '#fdfdfd',
        },
        '&:nth-child(2)': {
            border: 'none',
            borderLeft: '1px solid #4a4a4a',
        },
        '&:hover': {
            backgroundColor: '#242424',
            color: '#fdfdfd',
        },
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

    let disabled =
        (selectedIndex === 0 && runningStatus !== RunningStatus.IDLE) ||
        (selectedIndex === 1 && runningStatus === RunningStatus.RUNNING);

    return (
        <SplitButton
            fullWidth
            options={props.runnables}
            selectedIndex={selectedIndex}
            onSelectionChange={(index) => setSelectedIndex(index)}
            onClick={handleClick}
            className={getStyle(runningStatus)}
            buttonDisabled={disabled}
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
