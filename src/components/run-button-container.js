/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import SensiParametersSelector from './dialogs/sensi/sensi-parameters-selector';
import RunButton from './run-button';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    startLoadFlow,
    startSecurityAnalysis,
    startSensitivityAnalysis,
    startShortCircuitAnalysis,
    startDynamicSimulation,
    stopSecurityAnalysis,
    stopSensitivityAnalysis,
    stopShortCircuitAnalysis,
    stopDynamicSimulation,
} from '../utils/rest-api';
import { RunningStatus } from './util/running-status';

import ContingencyListSelector from './dialogs/contingency-list-selector';
import {
    addLoadflowNotif,
    addSANotif,
    addSensiNotif,
    addShortCircuitNotif,
    addDynamicSimulationNotif,
} from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { PARAM_DEVELOPER_MODE } from '../utils/config-params';
import { useParameterState } from './dialogs/parameters/parameters';
import DynamicSimulationParametersSelector from './dialogs/dynamicsimulation/dynamic-simulation-parameters-selector';

export function RunButtonContainer({
    studyUuid,
    currentNode,
    loadFlowStatus,
    securityAnalysisStatus,
    sensiStatus,
    shortCircuitStatus,
    dynamicSimulationStatus,
    setIsComputationRunning,
    runnable,
    disabled,
}) {
    const [loadFlowStatusState, setLoadFlowStatusState] =
        useState(loadFlowStatus);
    const [securityAnalysisStatusState, setSecurityAnalysisStatusState] =
        useState(securityAnalysisStatus);
    const [sensiStatusState, setSensiStatusState] = useState(sensiStatus);
    const [shortCircuitStatusState, setShortCircuitStatusState] =
        useState(shortCircuitStatus);
    const [dynamicSimulationStatusState, setDynamicSimulationStatusState] =
        useState(dynamicSimulationStatus);

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const [showContingencyListSelector, setShowContingencyListSelector] =
        useState(false);

    const [showSensiParametersSelector, setShowSensiParametersSelector] =
        useState(false);

    const [
        showDynamicSimulationParametersSelector,
        setShowDynamicSimulationParametersSelector,
    ] = useState(false);

    const [computationStopped, setComputationStopped] = useState(false);

    const [ranLoadflow, setRanLoadflow] = useState(false);

    const [ranSA, setRanSA] = useState(false);

    const [ranSensi, setRanSensi] = useState(false);

    const [ranShortCircuit, setRanShortCircuit] = useState(false);

    const [ranDynamicSimulation, setRanDynamicSimulation] = useState(false);

    const intl = useIntl();

    const { snackError } = useSnackMessage();

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
            setLoadFlowStatusState(loadFlowStatus);
            dispatch(addLoadflowNotif());
        } else if (
            ranSA &&
            studyUpdatedForce?.eventData?.headers?.updateType ===
                'securityAnalysisResult'
        ) {
            setSecurityAnalysisStatusState(securityAnalysisStatus);
            dispatch(addSANotif());
        } else if (
            ranSensi &&
            studyUpdatedForce?.eventData?.headers?.updateType ===
                'sensitivityAnalysisResult'
        ) {
            setSensiStatusState(sensiStatus);
            dispatch(addSensiNotif());
        } else if (
            ranShortCircuit &&
            studyUpdatedForce?.eventData?.headers?.updateType ===
                'shortCircuitAnalysisResult'
        ) {
            setShortCircuitStatusState(shortCircuitStatus);
            dispatch(addShortCircuitNotif());
        } else if (
            ranDynamicSimulation &&
            studyUpdatedForce?.eventData?.headers?.updateType ===
                'dynamicSimulationResult'
        ) {
            setDynamicSimulationStatusState(dynamicSimulationStatus);
            dispatch(addDynamicSimulationNotif());
        }
    }, [
        dispatch,
        studyUpdatedForce,
        ranSA,
        ranLoadflow,
        ranSensi,
        ranShortCircuit,
        ranDynamicSimulation,
        loadFlowStatus,
        sensiStatus,
        shortCircuitStatus,
        dynamicSimulationStatus,
        securityAnalysisStatus,
    ]);

    const ACTION_ON_RUNNABLES = {
        text: intl.formatMessage({ id: 'StopComputation' }),
        action: (action) => {
            if (action === runnable.SECURITY_ANALYSIS) {
                setSecurityAnalysisStatusState(RunningStatus.IDLE);
                stopSecurityAnalysis(studyUuid, currentNode?.id);
                setComputationStopped(!computationStopped);
            } else if (action === runnable.SENSITIVITY_ANALYSIS) {
                setSensiStatusState(RunningStatus.IDLE);
                stopSensitivityAnalysis(studyUuid, currentNode?.id);
                setComputationStopped(!computationStopped);
            } else if (action === runnable.SHORT_CIRCUIT_ANALYSIS) {
                setShortCircuitStatusState(RunningStatus.IDLE);
                stopShortCircuitAnalysis(studyUuid, currentNode?.id);
                setComputationStopped(!computationStopped);
            } else if (action === runnable.DYNAMIC_SIMULATION) {
                setDynamicSimulationStatusState(RunningStatus.IDLE);
                stopDynamicSimulation(studyUuid, currentNode?.id);
                setComputationStopped(!computationStopped);
            }
        },
    };

    const handleStartSecurityAnalysis = (contingencyListNames) => {
        // close the contingency list selection window
        setShowContingencyListSelector(false);

        setComputationStopped(false);
        setSecurityAnalysisStatusState(RunningStatus.RUNNING);
        // start server side security analysis
        startSecurityAnalysis(
            studyUuid,
            currentNode?.id,
            contingencyListNames
        ).catch(() => setSecurityAnalysisStatusState(RunningStatus.FAILED));
    };

    const handleStartSensi = (sensiConfiguration) => {
        // close the contingency list selection window
        setShowSensiParametersSelector(false);
        setComputationStopped(false);
        setSensiStatusState(RunningStatus.RUNNING);
        // start server side security analysis
        startSensitivityAnalysis(
            studyUuid,
            currentNode?.id,
            sensiConfiguration
        ).catch(() => {
            setSensiStatusState(RunningStatus.FAILED);
        });
    };

    const handleStartDynamicSimulation = ({
        mappingName,
        dynamicSimulationConfiguration,
    }) => {
        // close the dialog
        setShowDynamicSimulationParametersSelector(false);

        setComputationStopped(false);
        setDynamicSimulationStatusState(RunningStatus.RUNNING);

        // start server side dynamic simulation
        startDynamicSimulation(
            studyUuid,
            currentNode?.id,
            mappingName,
            dynamicSimulationConfiguration
        ).catch((error) => {
            setDynamicSimulationStatusState(RunningStatus.FAILED);
            snackError({
                messageTxt: error.message,
                headerId: 'DynamicSimulationRunError',
            });
        });
    };

    const startComputation = (action) => {
        if (action === runnable.LOADFLOW) {
            setLoadFlowStatusState(RunningStatus.RUNNING);
            startLoadFlow(studyUuid, currentNode?.id)
                .then(setRanLoadflow(true))
                .catch((error) => {
                    setLoadFlowStatusState(RunningStatus.FAILED);
                    snackError({
                        messageTxt: error.message,
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
            setShortCircuitStatusState(RunningStatus.RUNNING);
            startShortCircuitAnalysis(studyUuid, currentNode?.id)
                .then(setRanShortCircuit(true))
                .catch((error) => {
                    setShortCircuitStatusState(RunningStatus.FAILED);
                    snackError({
                        messageTxt: error.message,
                        headerId: 'startShortCircuitError',
                    });
                });
        } else if (action === runnable.DYNAMIC_SIMULATION) {
            setShowDynamicSimulationParametersSelector(true);
            setRanDynamicSimulation(true);
        }
    };

    const getRunningStatus = useCallback(
        (runnableType) => {
            if (runnableType === runnable.LOADFLOW) {
                return loadFlowStatusState;
            } else if (runnableType === runnable.SECURITY_ANALYSIS) {
                return securityAnalysisStatusState;
            } else if (runnableType === runnable.SENSITIVITY_ANALYSIS) {
                return sensiStatusState;
            } else if (runnableType === runnable.SHORT_CIRCUIT_ANALYSIS) {
                return shortCircuitStatusState;
            } else if (runnableType === runnable.DYNAMIC_SIMULATION) {
                return dynamicSimulationStatusState;
            }
        },
        [
            runnable.LOADFLOW,
            runnable.SECURITY_ANALYSIS,
            runnable.SENSITIVITY_ANALYSIS,
            runnable.SHORT_CIRCUIT_ANALYSIS,
            runnable.DYNAMIC_SIMULATION,
            loadFlowStatusState,
            securityAnalysisStatusState,
            sensiStatusState,
            shortCircuitStatusState,
            dynamicSimulationStatusState,
        ]
    );

    const getRunningText = (runnableName, runnableStatus) => {
        return runnableName;
    };

    useEffect(() => {
        setLoadFlowStatusState(loadFlowStatus);
    }, [loadFlowStatus]);
    useEffect(() => {
        setSensiStatusState(sensiStatus);
    }, [sensiStatus]);
    useEffect(() => {
        setShortCircuitStatusState(shortCircuitStatus);
    }, [shortCircuitStatus]);
    useEffect(() => {
        setSecurityAnalysisStatusState(securityAnalysisStatus);
    }, [securityAnalysisStatus]);
    useEffect(() => {
        setDynamicSimulationStatusState(dynamicSimulationStatus);
    }, [dynamicSimulationStatus]);

    const runnables = useMemo(() => {
        let runnables = [runnable.LOADFLOW, runnable.SECURITY_ANALYSIS];
        if (enableDeveloperMode) {
            // SHORTCIRCUIT is currently a dev feature
            runnables.push(runnable.SHORT_CIRCUIT_ANALYSIS);
            // SENSI is currently a dev feature
            runnables.push(runnable.SENSITIVITY_ANALYSIS);
            // DYNAMICSIMULATION is currently a dev feature
            runnables.push(runnable.DYNAMIC_SIMULATION);
        }
        return runnables;
    }, [runnable, enableDeveloperMode]);

    useEffect(() => {
        setIsComputationRunning(
            runnables.some(function (runnable) {
                return getRunningStatus(runnable) === RunningStatus.RUNNING;
            })
        );
    }, [setIsComputationRunning, getRunningStatus, runnables]);

    return (
        <>
            <RunButton
                runnables={runnables}
                actionOnRunnable={ACTION_ON_RUNNABLES}
                getStatus={getRunningStatus}
                onStartClick={startComputation}
                getText={getRunningText}
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
                    {showSensiParametersSelector && (
                        <SensiParametersSelector
                            open={showSensiParametersSelector}
                            onClose={() =>
                                setShowSensiParametersSelector(false)
                            }
                            onStart={handleStartSensi}
                            currentNodeUuid={currentNode?.id}
                        />
                    )}
                    {showDynamicSimulationParametersSelector && (
                        <DynamicSimulationParametersSelector
                            open={showDynamicSimulationParametersSelector}
                            onClose={() =>
                                setShowDynamicSimulationParametersSelector(
                                    false
                                )
                            }
                            onStart={handleStartDynamicSimulation}
                            studyUuid={studyUuid}
                            currentNodeUuid={currentNode?.id}
                        />
                    )}
                </div>
            )}
        </>
    );
}

RunButtonContainer.propTypes = {
    runnable: PropTypes.object,
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
    dynamicSimulationStatus: PropTypes.string,
};
