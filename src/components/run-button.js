/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import SplitButton from './utils/split-button';
import { PARAM_DEVELOPER_MODE } from '../utils/config-params';
import { useParameterState } from './dialogs/parameters/parameters';
import { RunningStatus } from './utils/running-status';

const RunButton = (props) => {
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    function getOptions(runningStatus, runnables, actionOnRunnable) {
        switch (runningStatus) {
            case RunningStatus.SUCCEED:
            case RunningStatus.FAILED:
            case RunningStatus.IDLE:
                return runnables;
            case RunningStatus.RUNNING:
                return Array.of(actionOnRunnable.text);
            default:
                return '';
        }
    }

    function isRunning() {
        return getRunningStatus() === RunningStatus.RUNNING;
    }

    const handleClick = () => {
        if (props.onStartClick) {
            props.onStartClick(getRunnable());
        }
    };

    const getRunnable = useCallback(() => {
        if (selectedIndex < props.runnables.length) {
            return props.runnables[selectedIndex];
        }
        // selectedIndex out of range, then return first runnable
        // (possible cause: developer mode is disabled and runnable list is now smaller)
        return props.runnables[0];
    }, [props.runnables, selectedIndex]);

    useEffect(() => {
        if (!enableDeveloperMode) {
            // a computation may become unavailable when developer mode is disabled, then switch on first one
            setSelectedIndex(0);
        }
    }, [enableDeveloperMode, setSelectedIndex]);

    const getRunningStatus = useCallback(() => {
        return props.getStatus(getRunnable());
    }, [getRunnable, props]);

    let buttonDisabled =
        props.disabled ||
        (selectedIndex === 0 && getRunningStatus() !== RunningStatus.IDLE) ||
        (selectedIndex === 1 && isRunning()) ||
        (selectedIndex === 4 /* Dynamic simulation button is selected */ &&
            props.getStatus(props.runnables[0]) !==
                RunningStatus.SUCCEED); /* Load flow button's status must SUCCEED */

    let selectionDisabled =
        props.disabled || (selectedIndex === 0 && isRunning());

    function handleActionOnRunnable() {
        props.actionOnRunnable.action(getRunnable());
    }

    return (
        <SplitButton
            options={getOptions(
                getRunningStatus(),
                props.runnables,
                props.actionOnRunnable
            )}
            selectedIndex={selectedIndex}
            onSelectionChange={(index) => setSelectedIndex(index)}
            onClick={handleClick}
            runningStatus={getRunningStatus()}
            buttonDisabled={buttonDisabled}
            selectionDisabled={selectionDisabled}
            text={
                props.getText
                    ? props.getText(getRunnable(), getRunningStatus())
                    : ''
            }
            actionOnRunnable={handleActionOnRunnable}
            isRunning={isRunning()}
            computationStopped={props.computationStopped}
        />
    );
};

RunButton.propTypes = {
    runnables: PropTypes.array.isRequired,
    getStatus: PropTypes.func.isRequired,
    getText: PropTypes.func.isRequired,
    onStartClick: PropTypes.func,
    actionOnRunnable: PropTypes.object.isRequired,
    computationStopped: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
};

export default RunButton;
