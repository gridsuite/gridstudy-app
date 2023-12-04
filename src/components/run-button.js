/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import SplitButton from './utils/split-button';
import { RunningStatus } from './utils/running-status';
import { PARAM_DEVELOPER_MODE } from '../utils/config-params';
import { useParameterState } from './dialogs/parameters/parameters';

const RunButton = ({
    runnables,
    getStatus,
    getText,
    onStartClick,
    actionOnRunnable,
    computationStopped,
    disabled,
}) => {
    const intl = useIntl();

    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    function getOptions(runningStatus, runnables) {
        switch (runningStatus) {
            case RunningStatus.SUCCEED:
            case RunningStatus.FAILED:
            case RunningStatus.IDLE:
                return runnables;
            case RunningStatus.RUNNING:
                return Array.of(intl.formatMessage({ id: 'StopComputation' }));
            default:
                return [];
        }
    }

    function isRunning() {
        return getRunningStatus() === RunningStatus.RUNNING;
    }

    const handleClick = () => {
        if (onStartClick) {
            onStartClick(getRunnable());
        }
    };

    const getRunnable = useCallback(() => {
        if (selectedIndex < runnables.length) {
            return runnables[selectedIndex];
        }
        // selectedIndex out of range, then return first runnable
        // (possible cause: developer mode is disabled and runnable list is now smaller)
        return runnables[0];
    }, [runnables, selectedIndex]);

    useEffect(() => {
        if (!enableDeveloperMode) {
            // a computation may become unavailable when developer mode is disabled, then switch on first one
            setSelectedIndex(0);
        }
    }, [enableDeveloperMode, setSelectedIndex]);

    const getRunningStatus = useCallback(() => {
        return getStatus(getRunnable());
    }, [getRunnable, getStatus]);

    let buttonDisabled =
        (selectedIndex === 0 && getRunningStatus() !== RunningStatus.IDLE) ||
        (selectedIndex === 1 && isRunning()) ||
        (selectedIndex === 4 /* Dynamic simulation button is selected */ &&
            getStatus(runnables[0]) !==
                RunningStatus.SUCCEED); /* Load flow button's status must SUCCEED */

    return (
        <SplitButton
            options={getOptions(getRunningStatus(), runnables)}
            selectedIndex={selectedIndex}
            onSelectionChange={(index) => setSelectedIndex(index)}
            onClick={handleClick}
            runningStatus={getRunningStatus()}
            buttonDisabled={disabled || buttonDisabled}
            selectionDisabled={disabled}
            text={getText ? getText(getRunnable(), getRunningStatus()) : ''}
            actionOnRunnable={() => actionOnRunnable(getRunnable())}
            isRunning={isRunning()}
            computationStopped={computationStopped}
        />
    );
};

RunButton.propTypes = {
    runnables: PropTypes.array.isRequired,
    getStatus: PropTypes.func.isRequired,
    getText: PropTypes.func.isRequired,
    onStartClick: PropTypes.func,
    actionOnRunnable: PropTypes.func.isRequired,
    computationStopped: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
};

export default RunButton;
