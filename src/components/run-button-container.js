/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import SensiParametersSelector from './dialogs/sensi-parameters-selector';
import RunButton from './run-button';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    startLoadFlow,
    startSecurityAnalysis,
    startSensitivityAnalysis,
    startShortCircuitAnalysis,
    stopSecurityAnalysis,
    stopSensitivityAnalysis,
    stopShortCircuitAnalysis,
} from '../utils/rest-api';
import { RunningStatus } from './util/running-status';
import LoopIcon from '@mui/icons-material/Loop';
import DoneIcon from '@mui/icons-material/Done';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PlayIcon from '@mui/icons-material/PlayArrow';
import ContingencyListSelector from './dialogs/contingency-list-selector';
import makeStyles from '@mui/styles/makeStyles';
import {
    addLoadflowNotif,
    addSANotif,
    addSensiNotif,
    addShortCircuitNotif,
} from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { PARAM_DEVELOPER_MODE } from '../utils/config-params';
import { useParameterState } from './dialogs/parameters/parameters';

const useStyles = makeStyles((theme) => ({
    rotate: {
        animation: 'spin 1000ms infinite',
    },
}));

export function RunButtonContainer({
    studyUuid,
    currentNode,
    loadFlowStatus,
    securityAnalysisStatus,
    sensiStatus,
    shortCircuitStatus,
    setIsComputationRunning,
    runnable,
    disabled,
}) {
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const [showContingencyListSelector, setShowContingencyListSelector] =
        useState(false);

    const [showSensiParametersSelector, setShowSensiParametersSelector] =
        useState(false);

    const [computationStopped, setComputationStopped] = useState(false);

    const [ranLoadflow, setRanLoadflow] = useState(false);

    const [ranSA, setRanSA] = useState(false);

    const [ranSensi, setRanSensi] = useState(false);

    const [ranShortCircuit, setRanShortCircuit] = useState(false);

    const intl = useIntl();

    const { snackError } = useSnackMessage();

    const classes = useStyles();

    const dispatch = useDispatch();

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const isModificationsInProgress = useSelector(
        (state) => state.isModificationsInProgress
    );
    useEffect(() => {
        if (
            ranLoadflow &&
            studyUpdatedForce?.eventData?.headers?.updateType === 'loadflow'
        ) {
            dispatch(addLoadflowNotif());
        } else if (
            ranSA &&
            studyUpdatedForce?.eventData?.headers?.updateType ===
                'securityAnalysisResult'
        ) {
            dispatch(addSANotif());
        } else if (
            ranSensi &&
            studyUpdatedForce?.eventData?.headers?.updateType ===
                'sensitivityAnalysisResult'
        ) {
            dispatch(addSensiNotif());
        } else if (
            ranShortCircuit &&
            studyUpdatedForce?.eventData?.headers?.updateType ===
                'shortCircuitAnalysisResult'
        ) {
            dispatch(addShortCircuitNotif());
        }
    }, [
        dispatch,
        studyUpdatedForce,
        ranSA,
        ranLoadflow,
        ranSensi,
        ranShortCircuit,
    ]);

    const ACTION_ON_RUNNABLES = {
        text: intl.formatMessage({ id: 'StopComputation' }),
        action: (action) => {
            if (action === runnable.SECURITY_ANALYSIS) {
                stopSecurityAnalysis(studyUuid, currentNode?.id);
                setComputationStopped(!computationStopped);
            } else if (action === runnable.SENSITIVITY_ANALYSIS) {
                stopSensitivityAnalysis(studyUuid, currentNode?.id);
                setComputationStopped(!computationStopped);
            } else if (action === runnable.SHORT_CIRCUIT_ANALYSIS) {
                stopShortCircuitAnalysis(studyUuid, currentNode?.id);
                setComputationStopped(!computationStopped);
            }
        },
    };

    const handleStartSecurityAnalysis = (contingencyListNames) => {
        // close the contingency list selection window
        setShowContingencyListSelector(false);

        setComputationStopped(false);

        // start server side security analysis
        startSecurityAnalysis(studyUuid, currentNode?.id, contingencyListNames);
    };

    const handleStartSensi = (
        variablesFiltersUuids,
        contingencyListUuids,
        branchFiltersUuids
    ) => {
        // close the contingency list selection window
        setShowSensiParametersSelector(false);

        setComputationStopped(false);

        // start server side security analysis
        startSensitivityAnalysis(
            studyUuid,
            currentNode?.id,
            variablesFiltersUuids,
            contingencyListUuids,
            branchFiltersUuids
        );
    };

    const startComputation = (action) => {
        if (action === runnable.LOADFLOW) {
            startLoadFlow(studyUuid, currentNode?.id)
                .then(setRanLoadflow(true))
                .catch((errorMessage) => {
                    snackError({
                        messageTxt: errorMessage,
                        headerId: 'startLoadFlowError',
                    });
                });
        } else if (action === runnable.SECURITY_ANALYSIS) {
            setShowContingencyListSelector(true);
            setRanSA(true);
        } else if (action === runnable.SENSITIVITY_ANALYSIS) {
            setShowSensiParametersSelector(true);
            setRanSensi(true);
        } else if (action === runnable.SHORT_CIRCUIT_ANALYSIS) {
            startShortCircuitAnalysis(studyUuid, currentNode?.id)
                .then(setRanShortCircuit(true))
                .catch((errorMessage) => {
                    snackError({
                        messageTxt: errorMessage,
                        headerId: 'ShortCircuitError',
                    });
                });
        }
    };

    const getRunningStatus = useCallback(
        (runnableType) => {
            if (runnableType === runnable.LOADFLOW) {
                return loadFlowStatus;
            } else if (runnableType === runnable.SECURITY_ANALYSIS) {
                return securityAnalysisStatus;
            } else if (runnableType === runnable.SENSITIVITY_ANALYSIS) {
                return sensiStatus;
            } else if (runnableType === runnable.SHORT_CIRCUIT_ANALYSIS) {
                return shortCircuitStatus;
            }
        },
        [
            loadFlowStatus,
            securityAnalysisStatus,
            sensiStatus,
            shortCircuitStatus,
            runnable,
        ]
    );

    const getRunningText = (runnableName, runnableStatus) => {
        return runnableName;
    };

    const getRunningIcon = (status) => {
        switch (status) {
            case RunningStatus.RUNNING:
                return <LoopIcon className={classes.rotate} />;
            case RunningStatus.SUCCEED:
                return <DoneIcon />;
            case RunningStatus.FAILED:
                return <ErrorOutlineIcon />;
            case RunningStatus.IDLE:
            default:
                return <PlayIcon />;
        }
    };

    const RUNNABLES = useMemo(() => {
        let runnables = [runnable.LOADFLOW, runnable.SECURITY_ANALYSIS];
        if (enableDeveloperMode) {
            // SENSI is currently a dev feature
            runnables.push(runnable.SENSITIVITY_ANALYSIS);
            // SHORTCIRCUIT is currently a dev feature
            runnables.push(runnable.SHORT_CIRCUIT_ANALYSIS);
        }
        return runnables;
    }, [runnable, enableDeveloperMode]);

    useEffect(() => {
        setIsComputationRunning(
            RUNNABLES.some(function (runnable) {
                return getRunningStatus(runnable) === RunningStatus.RUNNING;
            })
        );
    }, [setIsComputationRunning, getRunningStatus, RUNNABLES]);

    return (
        <>
            <RunButton
                runnables={RUNNABLES}
                actionOnRunnable={ACTION_ON_RUNNABLES}
                getStatus={getRunningStatus}
                onStartClick={startComputation}
                getText={getRunningText}
                getStartIcon={getRunningIcon}
                computationStopped={computationStopped}
                disabled={isModificationsInProgress || disabled}
            />
            {!disabled && (
                <div>
                    <ContingencyListSelector
                        open={showContingencyListSelector}
                        onClose={() => setShowContingencyListSelector(false)}
                        onStart={handleStartSecurityAnalysis}
                        currentNodeUuid={currentNode?.id}
                    />
                    <SensiParametersSelector
                        open={showSensiParametersSelector}
                        onClose={() => setShowSensiParametersSelector(false)}
                        onStart={handleStartSensi}
                        currentNodeUuid={currentNode?.id}
                    />
                </div>
            )}
        </>
    );
}

RunButtonContainer.propTypes = {
    runnables: PropTypes.arrayOf(PropTypes.string),
    actionOnRunnable: PropTypes.shape({
        action: PropTypes.func,
        text: PropTypes.string,
    }),
    currentNode: PropTypes.object,
    status: PropTypes.func,
    onStartClick: PropTypes.func,
    text: PropTypes.func,
    startIcon: PropTypes.func,
    computationStopped: PropTypes.bool,
    disabled: PropTypes.bool,
};
