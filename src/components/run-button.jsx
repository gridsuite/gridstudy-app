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
import { ComputingType, RunningStatus } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { SelectOptionsDialog } from '../utils/dialogs';
import { DialogContentText, useMediaQuery } from '@mui/material';
import { LOAD_FLOW_RUNNABLES } from './run-button.constant';

/** @typedef {{ context: { runnable: string }, debug: boolean }} PendingRunButtonComputation */

const RunButton = ({
    runnables,
    activeRunnables,
    getStatus,
    computationStopped,
    disabled,
    canRun = () => true,
    getReachedQuota = () => undefined,
}) => {
    const intl = useIntl();
    const isDirtyComputationParameters = useSelector((state) => state.isDirtyComputationParameters);
    const isBelowMd = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const isBelowLg = useMediaQuery((theme) => theme.breakpoints.down('lg'));
    const [pendingComputation, setPendingComputation] = useState(
        /** @type {PendingRunButtonComputation | null} */ (null)
    );

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
            case RunningStatus.PRELOADING:
            default:
                return [];
        }
    }

    // only one computation can run at a time on a node, so we can take the first running one found
    const runningRunnable = useMemo(
        () =>
            activeRunnables.find((runnable) => {
                const status = getStatus(runnable);
                return status === RunningStatus.RUNNING || status === RunningStatus.PRELOADING;
            }),
        [activeRunnables, getStatus]
    );

    useEffect(() => {
        if (runningRunnable) {
            // always show the running computation (ex : when switching to a node with a computation already running)
            setSelectedRunnable(runningRunnable);
        } else if (!activeRunnables.includes(selectedRunnable)) {
            // a computation may become unavailable when developer mode is disabled, then switch on first one
            setSelectedRunnable(activeRunnables[0]);
        }
    }, [runningRunnable, activeRunnables, selectedRunnable]);

    const getRunningStatus = useCallback(() => {
        return getStatus(selectedRunnable);
    }, [selectedRunnable, getStatus]);

    // the button label is shortened on small screens, the options keep the full labels
    function getButtonText() {
        const messageId = runnables[selectedRunnable].messageId;
        if (isBelowMd) {
            return intl.formatMessage({ id: `runButton.short.${messageId}` });
        }
        if (isBelowLg) {
            return intl.formatMessage({ id: `runButton.medium.${messageId}` });
        }
        return intl.formatMessage({ id: messageId });
    }

    function isButtonDisable() {
        if (!canRun(selectedRunnable) || getReachedQuota(selectedRunnable)) {
            return true;
        }
        if (getRunningStatus() === RunningStatus.PRELOADING) {
            return true;
        }

        if (LOAD_FLOW_RUNNABLES.includes(selectedRunnable)) {
            // We run once loadflow analysis, as it will always return the same result for one hypothesis
            return getRunningStatus() !== RunningStatus.IDLE;
        }

        if (selectedRunnable === ComputingType.DYNAMIC_SIMULATION) {
            // Load flow button's status must be "SUCCEED"
            return (
                getRunningStatus() === RunningStatus.RUNNING ||
                !LOAD_FLOW_RUNNABLES.some((runnable) => getStatus(runnable) === RunningStatus.SUCCEED)
            );
        }

        if (selectedRunnable === ComputingType.DYNAMIC_SECURITY_ANALYSIS) {
            // Dynamic simulation button's status must be "SUCCEED"
            return (
                getRunningStatus() === RunningStatus.RUNNING ||
                getStatus(ComputingType.DYNAMIC_SIMULATION) !== RunningStatus.SUCCEED
            );
        }

        if (selectedRunnable === ComputingType.DYNAMIC_MARGIN_CALCULATION) {
            // Load flow button's status must be "SUCCEED"
            return (
                getRunningStatus() === RunningStatus.RUNNING ||
                !LOAD_FLOW_RUNNABLES.some((runnable) => getStatus(runnable) === RunningStatus.SUCCEED)
            );
        }

        // We can run only 1 computation at a time
        return getRunningStatus() === RunningStatus.RUNNING;
    }

    const attemptStartComputation = useCallback(
        (debug) => {
            if (isDirtyComputationParameters) {
                setPendingComputation({ context: { runnable: selectedRunnable }, debug });
            } else {
                runnables[selectedRunnable].startComputation(debug);
            }
        },
        [isDirtyComputationParameters, runnables, selectedRunnable]
    );

    const handleLaunchingPopupClose = useCallback(() => {
        setPendingComputation(null);
    }, []);

    const handleLaunchingPopup = useCallback(() => {
        if (pendingComputation) {
            setPendingComputation(null);
            runnables[pendingComputation.context.runnable].startComputation(pendingComputation.debug);
        }
    }, [runnables, pendingComputation]);

    return (
        <>
            <SplitButton
                options={getOptions()}
                selectedIndex={activeRunnables.indexOf(selectedRunnable)}
                onSelectionChange={(index) => setSelectedRunnable(activeRunnables[index])}
                onClick={attemptStartComputation}
                runningStatus={getRunningStatus()}
                buttonDisabled={disabled || isButtonDisable()}
                selectionDisabled={disabled || getRunningStatus() === RunningStatus.PRELOADING}
                text={getButtonText()}
                actionOnRunnable={runnables[selectedRunnable].actionOnRunnable}
                computationStopped={computationStopped}
                reachedQuotas={activeRunnables.map(getReachedQuota)}
            />
            <SelectOptionsDialog
                title={''}
                open={pendingComputation !== null}
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
    canRun: PropTypes.func,
    getReachedQuota: PropTypes.func,
};

export default RunButton;
