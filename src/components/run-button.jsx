/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import SplitButton from './utils/split-button';
import RunningStatus from './utils/running-status';
import ComputingType from './computing-status/computing-type';

const RunButton = ({ runnables, activeRunnables, getStatus, computationStopped, disabled }) => {
    const intl = useIntl();

    const runnablesText = useMemo(
        () => Object.fromEntries(activeRunnables.map((k) => [k, intl.formatMessage({ id: runnables[k].messageId })])),
        [intl, runnables, activeRunnables]
    );
    const [selectedRunnable, setSelectedRunnable] = useState(activeRunnables[0]);

    function getOptions() {
        switch (getRunningStatus()) {
            case RunningStatus.SUCCEED:
            case RunningStatus.FAILED:
            case RunningStatus.IDLE:
                return Object.values(runnablesText);
            case RunningStatus.RUNNING:
                return Array.of(intl.formatMessage({ id: 'StopComputation' }));
            default:
                return [];
        }
    }

    useEffect(() => {
        if (!activeRunnables.includes(selectedRunnable)) {
            // a computation may become unavailable when developer mode is disabled, then switch on first one
            setSelectedRunnable(activeRunnables[0]);
        }
    }, [activeRunnables, selectedRunnable, setSelectedRunnable]);

    const getRunningStatus = useCallback(() => {
        return getStatus(selectedRunnable);
    }, [selectedRunnable, getStatus]);

    function isButtonDisable() {
        if (selectedRunnable === ComputingType.LOAD_FLOW) {
            // We run once loadflow analysis, as it will always return the same result for one hypothesis
            return getRunningStatus() !== RunningStatus.IDLE;
        }

        if (selectedRunnable === ComputingType.DYNAMIC_SIMULATION) {
            // Load flow button's status must be "SUCCEED"
            return (
                getRunningStatus() === RunningStatus.RUNNING ||
                getStatus(ComputingType.LOAD_FLOW) !== RunningStatus.SUCCEED
            );
        }

        if (selectedRunnable === ComputingType.DYNAMIC_SECURITY_ANALYSIS) {
            // Dynamic simulation button's status must be "SUCCEED"
            return (
                getRunningStatus() === RunningStatus.RUNNING ||
                getStatus(ComputingType.DYNAMIC_SIMULATION) !== RunningStatus.SUCCEED
            );
        }

        // We can run only 1 computation at a time
        return getRunningStatus() === RunningStatus.RUNNING;
    }

    return (
        <SplitButton
            options={getOptions()}
            selectedIndex={activeRunnables.indexOf(selectedRunnable)}
            onSelectionChange={(index) => setSelectedRunnable(activeRunnables[index])}
            onClick={runnables[selectedRunnable].startComputation}
            runningStatus={getRunningStatus()}
            buttonDisabled={disabled || isButtonDisable()}
            selectionDisabled={disabled}
            text={runnablesText[selectedRunnable] || ''}
            actionOnRunnable={runnables[selectedRunnable].actionOnRunnable}
            computationStopped={computationStopped}
        />
    );
};

RunButton.propTypes = {
    runnables: PropTypes.objectOf(
        PropTypes.exact({
            messageId: PropTypes.string.isRequired,
            startComputation: PropTypes.func,
            actionOnRunnable: PropTypes.func.isRequired,
        }).isRequired
    ).isRequired,
    activeRunnables: PropTypes.arrayOf(PropTypes.string).isRequired,
    getStatus: PropTypes.func.isRequired,
    computationStopped: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
};

export default RunButton;
