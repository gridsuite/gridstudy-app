/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from "react";
import {green, grey, orange, red} from "@material-ui/core/colors";
import PlayIcon from "@material-ui/icons/PlayArrow";
import SplitButton from "./util/split-button";
import PropTypes from "prop-types";

export const RunningStatus = {
    SUCCEED: 'SUCCEED',
    FAILED: 'FAILED',
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
};

function getStyle(runningStatus) {
    switch (runningStatus) {
        case RunningStatus.SUCCEED:
            return {
                backgroundColor: green[500],
                color: 'black',
            };
        case RunningStatus.FAILED:
            return {
                backgroundColor: red[500],
                color: 'black',
            };
        case RunningStatus.RUNNING:
            return {
                backgroundColor: orange[500],
                color: 'black',
            };
        case RunningStatus.IDLE:
        default:
            return {
                backgroundColor: grey[500],
                '&:hover': {
                    backgroundColor: grey[700],
                },
                color: 'white',
            };
    }
}

const RunButton = (props) => {

    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const handleClick = () => {
        if (props.onStartClick) {
            props.onStartClick(getRunnable());
        }
    }

    function getRunnable() {
        return props.runnables[selectedIndex];
    }

    function getRunningStatus() {
        return props.getStatus(getRunnable());
    }

    const runningStatus = getRunningStatus();

    return (
        <SplitButton fullWidth
                     options={props.runnables}
                     selectedIndex={selectedIndex}
                     onSelectionChange={index => setSelectedIndex(index)}
                     onClick={handleClick}
                     style={getStyle(runningStatus)}
                     buttonDisabled={runningStatus !== RunningStatus.IDLE}
                     selectionDisabled={runningStatus === RunningStatus.RUNNING}
                     startIcon={runningStatus === RunningStatus.IDLE ? <PlayIcon /> : null}
                     text={props.getText ? props.getText(getRunnable(), getRunningStatus()) : ''}/>
    );
};

RunButton.propTypes = {
    runnables: PropTypes.array,
    getStatus: PropTypes.func,
    getText: PropTypes.func,
    onStartClick: PropTypes.func,
}

export default RunButton;

