/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';

import SplitButton from './utils/split-button';
import RunningStatus from './utils/running-status';
import { ComputingType } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { SelectOptionsDialog } from '../utils/dialogs';
import { DialogContentText } from '@mui/material';

const RunButton = ({ runnables, activeRunnables, getStatus, computationStopped, disabled }) => {
    const intl = useIntl();
    const isDirtyComputationParameters = useSelector((state) => state.isDirtyComputationParameters);
    const [isLaunchingPopupOpen, setIsLaunchingPopupOpen] = useState(false);

    // a transient state which is used only for a run with popup dialog
    const [runWithDebug, setRunWithDebug] = useState(false);

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
        if (
            selectedRunnable === 'LOAD_FLOW_WITHOUT_RATIO_TAP_CHANGERS' ||
            selectedRunnable === 'LOAD_FLOW_WITH_RATIO_TAP_CHANGERS'
        ) {
            // We run once loadflow analysis, as it will always return the same result for one hypothesis
            return getRunningStatus() !== RunningStatus.IDLE;
        }

        if (selectedRunnable === ComputingType.DYNAMIC_SIMULATION) {
            // Load flow button's status must be "SUCCEED"
            return (
                getRunningStatus() === RunningStatus.RUNNING ||
                (getStatus('LOAD_FLOW_WITHOUT_RATIO_TAP_CHANGERS') !== RunningStatus.SUCCEED &&
                    getStatus('LOAD_FLOW_WITH_RATIO_TAP_CHANGERS') !== RunningStatus.SUCCEED)
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

    const attemptStartComputation = useCallback(
        (debug) => {
            if (isDirtyComputationParameters) {
                setIsLaunchingPopupOpen(true);
                setRunWithDebug(debug);
            } else {
                runnables[selectedRunnable].startComputation(debug);
            }
        },
        [isDirtyComputationParameters, runnables, selectedRunnable]
    );

    const handleLaunchingPopupClose = useCallback(() => {
        setIsLaunchingPopupOpen(false);
    }, []);

    const handleLaunchingPopup = useCallback(() => {
        setIsLaunchingPopupOpen(false);
        runnables[selectedRunnable].startComputation(runWithDebug);
    }, [runnables, selectedRunnable, runWithDebug]);

    return (
        <>
            <SplitButton
                options={getOptions()}
                selectedIndex={activeRunnables.indexOf(selectedRunnable)}
                onSelectionChange={(index) => setSelectedRunnable(activeRunnables[index])}
                onClick={attemptStartComputation}
                runningStatus={getRunningStatus()}
                buttonDisabled={disabled || isButtonDisable()}
                selectionDisabled={disabled}
                text={runnablesText[selectedRunnable] || ''}
                actionOnRunnable={runnables[selectedRunnable].actionOnRunnable}
                computationStopped={computationStopped}
            />
            <SelectOptionsDialog
                title={''}
                open={isLaunchingPopupOpen}
                onClose={handleLaunchingPopupClose}
                onClick={handleLaunchingPopup}
                child={
                    <DialogContentText>
                        <FormattedMessage id="launchComputationConfirmQuestion" />
                    </DialogContentText>
                }
                validateKey={'dialog.button.launch'}
            />
        </>
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
