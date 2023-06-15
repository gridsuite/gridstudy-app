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
    startVoltageInit,
    stopVoltageInit,
    stopLoadFlow,
} from '../utils/rest-api';
import { RunButtonType, RunningStatus } from './utils/running-status';

import ContingencyListSelector from './dialogs/contingency-list-selector';
import {
    addLoadflowNotif,
    addSANotif,
    addSensiNotif,
    addShortCircuitNotif,
    addDynamicSimulationNotif,
    addVoltageInitNotif,
    setRunButtonStatus,
} from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { PARAM_DEVELOPER_MODE } from '../utils/config-params';
import { useParameterState } from './dialogs/parameters/parameters';
import DynamicSimulationParametersSelector, {
    checkDynamicSimulationParameters,
} from './dialogs/dynamicsimulation/dynamic-simulation-parameters-selector';

export function RunButtonContainer({
    studyUuid,
    currentNode,
    setIsComputationRunning,
    disabled,
}) {
    const loadFlowStatusState = useSelector(
        (state) => state.runButtonStatus[RunButtonType.LOADFLOW]
    );

    const securityAnalysisStatusState = useSelector(
        (state) => state.runButtonStatus[RunButtonType.SECURITY_ANALYSIS]
    );
    const sensiStatusState = useSelector(
        (state) => state.runButtonStatus[RunButtonType.SENSI]
    );
    const shortCircuitStatusState = useSelector(
        (state) => state.runButtonStatus[RunButtonType.SHORTCIRCUIT]
    );
    const dynamicSimulationStatusState = useSelector(
        (state) => state.runButtonStatus[RunButtonType.DYNAMIC_SIMULATION]
    );
    const voltageInitStatusState = useSelector(
        (state) => state.runButtonStatus[RunButtonType.VOLTAGE_INIT]
    );

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

    const [ranVoltageInit, setRanVoltageInit] = useState(false);

    const intl = useIntl();

    const { snackError } = useSnackMessage();

    const dispatch = useDispatch();

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const isModificationsInProgress = useSelector(
        (state) => state.isModificationsInProgress
    );

    const runnable = useMemo(() => {
        return {
            LOADFLOW: intl.formatMessage({ id: 'LoadFlow' }),
            SECURITY_ANALYSIS: intl.formatMessage({
                id: 'SecurityAnalysis',
            }),
            SENSITIVITY_ANALYSIS: intl.formatMessage({
                id: 'SensitivityAnalysis',
            }),
            SHORT_CIRCUIT_ANALYSIS: intl.formatMessage({
                id: 'ShortCircuitAnalysis',
            }),
            DYNAMIC_SIMULATION: intl.formatMessage({
                id: 'DynamicSimulation',
            }),
            VOLTAGE_INIT: intl.formatMessage({
                id: 'VoltageInit',
            }),
        };
    }, [intl]);

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
        } else if (
            ranDynamicSimulation &&
            studyUpdatedForce?.eventData?.headers?.updateType ===
                'dynamicSimulationResult'
        ) {
            dispatch(addDynamicSimulationNotif());
        } else if (
            ranVoltageInit &&
            studyUpdatedForce?.eventData?.headers?.updateType ===
                'voltageInitResult'
        ) {
            dispatch(addVoltageInitNotif());
        }
    }, [
        dispatch,
        studyUpdatedForce,
        ranSA,
        ranLoadflow,
        ranSensi,
        ranShortCircuit,
        ranDynamicSimulation,
        ranVoltageInit,
    ]);

    const ACTION_ON_RUNNABLES = {
        text: intl.formatMessage({ id: 'StopComputation' }),
        action: (action) => {
            switch (action) {
                case runnable.LOADFLOW:
                    dispatch(
                        setRunButtonStatus(
                            RunButtonType.LOADFLOW,
                            RunningStatus.IDLE
                        )
                    );
                    stopLoadFlow(studyUuid, currentNode?.id);
                    break;
                case runnable.SECURITY_ANALYSIS:
                    dispatch(
                        setRunButtonStatus(
                            RunButtonType.SECURITY_ANALYSIS,
                            RunningStatus.IDLE
                        )
                    );
                    stopSecurityAnalysis(studyUuid, currentNode?.id);
                    break;
                case runnable.SENSITIVITY_ANALYSIS:
                    dispatch(
                        setRunButtonStatus(
                            RunButtonType.SENSI,
                            RunningStatus.IDLE
                        )
                    );
                    stopSensitivityAnalysis(studyUuid, currentNode?.id);
                    break;
                case runnable.SHORT_CIRCUIT_ANALYSIS:
                    dispatch(
                        setRunButtonStatus(
                            RunButtonType.SHORTCIRCUIT,
                            RunningStatus.IDLE
                        )
                    );
                    stopShortCircuitAnalysis(studyUuid, currentNode?.id);
                    break;
                case runnable.DYNAMIC_SIMULATION:
                    dispatch(
                        setRunButtonStatus(
                            RunButtonType.DYNAMIC_SIMULATION,
                            RunningStatus.IDLE
                        )
                    );
                    stopDynamicSimulation(studyUuid, currentNode?.id);
                    break;
                case runnable.VOLTAGE_INIT:
                    dispatch(
                        setRunButtonStatus(
                            RunButtonType.VOLTAGE_INIT,
                            RunningStatus.IDLE
                        )
                    );
                    stopVoltageInit(studyUuid, currentNode?.id);
                    break;
                default:
                    // optional: handle the case where action is not recognized
                    break;
            }
            setComputationStopped(!computationStopped);
        },
    };

    const handleStartSecurityAnalysis = (contingencyListNames) => {
        // close the contingency list selection window
        setShowContingencyListSelector(false);

        setComputationStopped(false);
        dispatch(
            setRunButtonStatus(
                RunButtonType.SECURITY_ANALYSIS,
                RunningStatus.RUNNING
            )
        );
        // start server side security analysis
        startSecurityAnalysis(
            studyUuid,
            currentNode?.id,
            contingencyListNames
        ).catch(() =>
            dispatch(
                setRunButtonStatus(
                    RunButtonType.SECURITY_ANALYSIS,
                    RunningStatus.FAILED
                )
            )
        );
    };

    const handleStartSensi = (sensiConfiguration) => {
        // close the contingency list selection window
        setShowSensiParametersSelector(false);
        setComputationStopped(false);
        dispatch(
            setRunButtonStatus(RunButtonType.SENSI, RunningStatus.RUNNING)
        );
        // start server side security analysis
        startSensitivityAnalysis(
            studyUuid,
            currentNode?.id,
            sensiConfiguration
        ).catch(() => {
            dispatch(
                setRunButtonStatus(RunButtonType.SENSI, RunningStatus.FAILED)
            );
        });
    };

    const handleStartDynamicSimulation = (dynamicSimulationConfiguration) => {
        // close the dialog
        setShowDynamicSimulationParametersSelector(false);

        setComputationStopped(false);
        dispatch(
            setRunButtonStatus(
                RunButtonType.DYNAMIC_SIMULATION,
                RunningStatus.RUNNING
            )
        );

        // start server side dynamic simulation
        return startDynamicSimulation(
            studyUuid,
            currentNode?.id,
            dynamicSimulationConfiguration
        ).catch((error) => {
            dispatch(
                setRunButtonStatus(
                    RunButtonType.DYNAMIC_SIMULATION,
                    RunningStatus.FAILED
                )
            );
            snackError({
                messageTxt: error.message,
                headerId: 'DynamicSimulationRunError',
            });
        });
    };

    const startComputation = (action) => {
        if (action === runnable.LOADFLOW) {
            dispatch(
                setRunButtonStatus(
                    RunButtonType.LOADFLOW,
                    RunningStatus.RUNNING
                )
            );
            startLoadFlow(studyUuid, currentNode?.id)
                .then(setRanLoadflow(true))
                .catch((error) => {
                    dispatch(
                        setRunButtonStatus(
                            RunButtonType.LOADFLOW,
                            RunningStatus.FAILED
                        )
                    );
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
            dispatch(
                setRunButtonStatus(
                    RunButtonType.SHORTCIRCUIT,
                    RunningStatus.RUNNING
                )
            );
            startShortCircuitAnalysis(studyUuid, currentNode?.id)
                .then(setRanShortCircuit(true))
                .catch((error) => {
                    dispatch(
                        setRunButtonStatus(
                            RunButtonType.SHORTCIRCUIT,
                            RunningStatus.FAILED
                        )
                    );
                    snackError({
                        messageTxt: error.message,
                        headerId: 'startShortCircuitError',
                    });
                });
        } else if (action === runnable.VOLTAGE_INIT) {
            dispatch(
                setRunButtonStatus(
                    RunButtonType.VOLTAGE_INIT,
                    RunningStatus.RUNNING
                )
            );
            startVoltageInit(studyUuid, currentNode?.id)
                .then(setRanVoltageInit(true))
                .catch((error) => {
                    dispatch(
                        setRunButtonStatus(
                            RunButtonType.VOLTAGE_INIT,
                            RunningStatus.FAILED
                        )
                    );
                    snackError({
                        messageTxt: error.message,
                        headerId: 'startVoltageInitError',
                    });
                });
        } else if (action === runnable.DYNAMIC_SIMULATION) {
            checkDynamicSimulationParameters(studyUuid)
                .then((isValid) => {
                    if (!isValid) {
                        // open parameters selector to configure mandatory params
                        setShowDynamicSimulationParametersSelector(true);
                        setRanDynamicSimulation(true);
                    } else {
                        // start server side dynamic simulation directly
                        startDynamicSimulation(
                            studyUuid,
                            currentNode?.id
                        ).catch((error) => {
                            snackError({
                                messageTxt: error.message,
                                headerId: 'DynamicSimulationRunError',
                            });
                        });
                    }
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'DynamicSimulationRunError',
                    });
                });
        }
    };

    const getRunningStatus = useCallback(
        (runnableType) => {
            switch (runnableType) {
                case runnable.LOADFLOW:
                    return loadFlowStatusState;
                case runnable.SECURITY_ANALYSIS:
                    return securityAnalysisStatusState;
                case runnable.SENSITIVITY_ANALYSIS:
                    return sensiStatusState;
                case runnable.SHORT_CIRCUIT_ANALYSIS:
                    return shortCircuitStatusState;
                case runnable.DYNAMIC_SIMULATION:
                    return dynamicSimulationStatusState;
                case runnable.VOLTAGE_INIT:
                    return voltageInitStatusState;
                default:
                    return null;
            }
        },
        [
            runnable.LOADFLOW,
            runnable.SECURITY_ANALYSIS,
            runnable.SENSITIVITY_ANALYSIS,
            runnable.SHORT_CIRCUIT_ANALYSIS,
            runnable.DYNAMIC_SIMULATION,
            runnable.VOLTAGE_INIT,
            loadFlowStatusState,
            securityAnalysisStatusState,
            sensiStatusState,
            shortCircuitStatusState,
            dynamicSimulationStatusState,
            voltageInitStatusState,
        ]
    );

    const getRunningText = (runnableName) => {
        return runnableName;
    };

    const runnables = useMemo(() => {
        let runnables = [
            runnable.LOADFLOW,
            runnable.SECURITY_ANALYSIS,
            runnable.SENSITIVITY_ANALYSIS,
        ];
        if (enableDeveloperMode) {
            // SHORTCIRCUIT is currently a dev feature
            runnables.push(runnable.SHORT_CIRCUIT_ANALYSIS);
            // DYNAMICSIMULATION is currently a dev feature
            runnables.push(runnable.DYNAMIC_SIMULATION);
            // VOLTAGEINIT is currently a dev feature
            runnables.push(runnable.VOLTAGE_INIT);
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
    voltageInitStatus: PropTypes.string,
};
