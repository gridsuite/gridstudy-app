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
} from '../utils/rest-api';
import { RunningStatus } from './utils/running-status';

import ContingencyListSelector from './dialogs/contingency-list-selector';
import {
    addLoadflowNotif,
    addSANotif,
    addSensiNotif,
    addShortCircuitNotif,
    addDynamicSimulationNotif,
    addVoltageInitNotif,
    setAnalysisStatus,
} from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { PARAM_DEVELOPER_MODE } from '../utils/config-params';
import { useParameterState } from './dialogs/parameters/parameters';
import DynamicSimulationParametersSelector, {
    checkDynamicSimulationParameters,
} from './dialogs/dynamicsimulation/dynamic-simulation-parameters-selector';
import { AnalysisType } from './analysis-status/analysis-type';

export function RunButtonContainer({
    studyUuid,
    currentNode,
    loadFlowStatus,
    setIsComputationRunning,
    disabled,
}) {
    const [loadFlowStatusState, setLoadFlowStatusState] =
        useState(loadFlowStatus);

    const securityAnalysisStatus = useSelector(
        (state) => state.analysisStatus[AnalysisType.SECURITY]
    );

    const sensitivityStatus = useSelector(
        (state) => state.analysisStatus[AnalysisType.SENSITIVITY]
    );
    const shortCircuitStatus = useSelector(
        (state) => state.analysisStatus[AnalysisType.SHORTCIRCUIT]
    );
    const dynamicSimulationStatus = useSelector(
        (state) => state.analysisStatus[AnalysisType.DYNAMIC_SIMULATION]
    );
    const voltageInitStatus = useSelector(
        (state) => state.analysisStatus[AnalysisType.VOLTAGE_INIT]
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
            [AnalysisType.LOADFLOW]: intl.formatMessage({ id: 'LoadFlow' }),
            [AnalysisType.SECURITY]: intl.formatMessage({
                id: 'SecurityAnalysis',
            }),
            [AnalysisType.SENSITIVITY]: intl.formatMessage({
                id: 'SensitivityAnalysis',
            }),
            [AnalysisType.SHORTCIRCUIT]: intl.formatMessage({
                id: 'ShortCircuitAnalysis',
            }),
            [AnalysisType.DYNAMIC_SIMULATION]: intl.formatMessage({
                id: 'DynamicSimulation',
            }),
            [AnalysisType.VOLTAGE_INIT]: intl.formatMessage({
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
        loadFlowStatus,
    ]);

    useEffect(() => {
        setLoadFlowStatusState(loadFlowStatus);
    }, [loadFlowStatus, currentNode]);

    const ACTION_ON_RUNNABLES = {
        text: intl.formatMessage({ id: 'StopComputation' }),
        action: (action) => {
            if (action === runnable[AnalysisType.SECURITY]) {
                dispatch(
                    setAnalysisStatus(AnalysisType.SECURITY, RunningStatus.IDLE)
                );
                stopSecurityAnalysis(studyUuid, currentNode?.id);
                setComputationStopped(!computationStopped);
            } else if (action === runnable[AnalysisType.SENSITIVITY]) {
                dispatch(
                    setAnalysisStatus(
                        AnalysisType.SENSITIVITY,
                        RunningStatus.IDLE
                    )
                );
                stopSensitivityAnalysis(studyUuid, currentNode?.id);
                setComputationStopped(!computationStopped);
            } else if (action === runnable[AnalysisType.SHORTCIRCUIT]) {
                dispatch(
                    setAnalysisStatus(
                        AnalysisType.SHORTCIRCUIT,
                        RunningStatus.IDLE
                    )
                );
                stopShortCircuitAnalysis(studyUuid, currentNode?.id);
                setComputationStopped(!computationStopped);
            } else if (action === runnable[AnalysisType.DYNAMIC_SIMULATION]) {
                dispatch(
                    setAnalysisStatus(
                        AnalysisType.DYNAMIC_SIMULATION,
                        RunningStatus.IDLE
                    )
                );
                stopDynamicSimulation(studyUuid, currentNode?.id);
                setComputationStopped(!computationStopped);
            } else if (action === runnable[AnalysisType.VOLTAGE_INIT]) {
                dispatch(
                    setAnalysisStatus(
                        AnalysisType.VOLTAGE_INIT,
                        RunningStatus.IDLE
                    )
                );
                stopVoltageInit(studyUuid, currentNode?.id);
                setComputationStopped(!computationStopped);
            }
        },
    };

    const handleStartSecurityAnalysis = (contingencyListNames) => {
        // close the contingency list selection window
        setShowContingencyListSelector(false);

        setComputationStopped(false);
        dispatch(
            setAnalysisStatus(AnalysisType.SECURITY, RunningStatus.RUNNING)
        );
        // start server side security analysis
        startSecurityAnalysis(
            studyUuid,
            currentNode?.id,
            contingencyListNames
        ).catch(() =>
            dispatch(
                setAnalysisStatus(AnalysisType.SECURITY, RunningStatus.FAILED)
            )
        );
    };

    const handleStartSensi = (sensiConfiguration) => {
        // close the contingency list selection window
        setShowSensiParametersSelector(false);
        setComputationStopped(false);
        dispatch(
            setAnalysisStatus(AnalysisType.SENSITIVITY, RunningStatus.RUNNING)
        );
        // start server side security analysis
        startSensitivityAnalysis(
            studyUuid,
            currentNode?.id,
            sensiConfiguration
        ).catch(() => {
            dispatch(
                setAnalysisStatus(
                    AnalysisType.SENSITIVITY,
                    RunningStatus.FAILED
                )
            );
        });
    };

    const handleStartDynamicSimulation = (dynamicSimulationConfiguration) => {
        // close the dialog
        setShowDynamicSimulationParametersSelector(false);

        setComputationStopped(false);
        dispatch(
            setAnalysisStatus(
                AnalysisType.DYNAMIC_SIMULATION,
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
                setAnalysisStatus(
                    AnalysisType.DYNAMIC_SIMULATION,
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
        if (action === runnable[AnalysisType.LOADFLOW]) {
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
        } else if (action === runnable[AnalysisType.SECURITY]) {
            setShowContingencyListSelector(true);
            setRanSA(true);
        } else if (action === runnable[AnalysisType.SENSITIVITY]) {
            setShowSensiParametersSelector(true);
            setRanSensi(true);
        } else if (action === runnable[AnalysisType.SHORTCIRCUIT]) {
            dispatch(
                setAnalysisStatus(
                    AnalysisType.SHORTCIRCUIT,
                    RunningStatus.RUNNING
                )
            );
            startShortCircuitAnalysis(studyUuid, currentNode?.id)
                .then(setRanShortCircuit(true))
                .catch((error) => {
                    dispatch(
                        setAnalysisStatus(
                            AnalysisType.SHORTCIRCUIT,
                            RunningStatus.FAILED
                        )
                    );
                    snackError({
                        messageTxt: error.message,
                        headerId: 'startShortCircuitError',
                    });
                });
        } else if (action === runnable[AnalysisType.VOLTAGE_INIT]) {
            dispatch(
                setAnalysisStatus(
                    AnalysisType.VOLTAGE_INIT,
                    RunningStatus.RUNNING
                )
            );
            startVoltageInit(studyUuid, currentNode?.id)
                .then(setRanVoltageInit(true))
                .catch((error) => {
                    dispatch(
                        setAnalysisStatus(
                            AnalysisType.VOLTAGE_INIT,
                            RunningStatus.FAILED
                        )
                    );
                    snackError({
                        messageTxt: error.message,
                        headerId: 'startVoltageInitError',
                    });
                });
        } else if (action === runnable[AnalysisType.DYNAMIC_SIMULATION]) {
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
            if (runnableType === runnable[AnalysisType.LOADFLOW]) {
                return loadFlowStatusState;
            } else if (runnableType === runnable[AnalysisType.SECURITY]) {
                return securityAnalysisStatus;
            } else if (runnableType === runnable[AnalysisType.SENSITIVITY]) {
                return sensitivityStatus;
            } else if (runnableType === runnable[AnalysisType.SHORTCIRCUIT]) {
                return shortCircuitStatus;
            } else if (
                runnableType === runnable[AnalysisType.DYNAMIC_SIMULATION]
            ) {
                return dynamicSimulationStatus;
            } else if (runnableType === runnable[AnalysisType.VOLTAGE_INIT]) {
                return voltageInitStatus;
            }
        },
        [
            runnable,
            loadFlowStatusState,
            securityAnalysisStatus,
            sensitivityStatus,
            shortCircuitStatus,
            dynamicSimulationStatus,
            voltageInitStatus,
        ]
    );

    const getRunningText = (runnableName) => {
        return runnableName;
    };

    const runnables = useMemo(() => {
        let runnables = [
            runnable[AnalysisType.LOADFLOW],
            runnable[AnalysisType.SECURITY],
            runnable[AnalysisType.SENSITIVITY],
        ];
        if (enableDeveloperMode) {
            // SHORTCIRCUIT is currently a dev feature
            runnables.push(runnable[AnalysisType.SHORTCIRCUIT]);
            // DYNAMICSIMULATION is currently a dev feature
            runnables.push(runnable[AnalysisType.DYNAMIC_SIMULATION]);
            // VOLTAGEINIT is currently a dev feature
            runnables.push(runnable[AnalysisType.VOLTAGE_INIT]);
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
};
