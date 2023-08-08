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
import { RunningStatus } from './utils/running-status';

import ContingencyListSelector from './dialogs/contingency-list-selector';
import {
    addLoadflowNotif,
    addSANotif,
    addSensiNotif,
    addShortCircuitNotif,
    addDynamicSimulationNotif,
    addVoltageInitNotif,
    setComputingStatus,
} from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    AVAILABLE_SERVICES,
    PARAM_DEVELOPER_MODE,
} from '../utils/config-params';
import { useParameterState } from './dialogs/parameters/parameters';
import DynamicSimulationParametersSelector, {
    checkDynamicSimulationParameters,
} from './dialogs/dynamicsimulation/dynamic-simulation-parameters-selector';
import { ComputingType } from './computing-status/computing-type';
import {
    startSensitivityAnalysis,
    stopSensitivityAnalysis,
} from '../services/study/sensitivity-analysis';
import {
    startDynamicSimulation,
    stopDynamicSimulation,
} from '../services/study/dynamic-simulation';
import { startLoadFlow, stopLoadFlow } from '../services/study/loadflow';

import {
    startSecurityAnalysis,
    stopSecurityAnalysis,
} from '../services/study/security-analysis';
import {
    startShortCircuitAnalysis,
    stopShortCircuitAnalysis,
} from '../services/study/short-circuit-analysis';
import {
    startVoltageInit,
    stopVoltageInit,
} from '../services/study/voltage-init';

export function RunButtonContainer({
    studyUuid,
    currentNode,
    setIsComputationRunning,
    disabled,
}) {
    const loadFlowStatus = useSelector(
        (state) => state.computingStatus[ComputingType.LOADFLOW]
    );

    const securityAnalysisStatus = useSelector(
        (state) => state.computingStatus[ComputingType.SECURITY_ANALYSIS]
    );

    const sensitivityAnalysisStatus = useSelector(
        (state) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]
    );
    const shortCircuitAnalysisStatus = useSelector(
        (state) => state.computingStatus[ComputingType.SHORTCIRCUIT_ANALYSIS]
    );
    const dynamicSimulationStatus = useSelector(
        (state) => state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
    );
    const voltageInitStatus = useSelector(
        (state) => state.computingStatus[ComputingType.VOLTAGE_INIT]
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
    const [availableServices] = useParameterState(AVAILABLE_SERVICES);

    const isModificationsInProgress = useSelector(
        (state) => state.isModificationsInProgress
    );

    const runnable = useMemo(() => {
        return {
            [ComputingType.LOADFLOW]: intl.formatMessage({ id: 'LoadFlow' }),
            [ComputingType.SECURITY_ANALYSIS]: intl.formatMessage({
                id: 'SecurityAnalysis',
            }),
            [ComputingType.SENSITIVITY_ANALYSIS]: intl.formatMessage({
                id: 'SensitivityAnalysis',
            }),
            [ComputingType.SHORTCIRCUIT_ANALYSIS]: intl.formatMessage({
                id: 'ShortCircuitAnalysis',
            }),
            [ComputingType.DYNAMIC_SIMULATION]: intl.formatMessage({
                id: 'DynamicSimulation',
            }),
            [ComputingType.VOLTAGE_INIT]: intl.formatMessage({
                id: 'VoltageInit',
            }),
        };
    }, [intl]);

    useEffect(() => {
        if (
            ranLoadflow &&
            studyUpdatedForce?.eventData?.headers?.updateType ===
                'loadflowResult'
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

    const ACTION_ON_RUNNABLES = {
        text: intl.formatMessage({ id: 'StopComputation' }),
        action: (action) => {
            let type;
            switch (action) {
                case runnable[ComputingType.SECURITY_ANALYSIS]:
                    type = ComputingType.SECURITY_ANALYSIS;
                    stopSecurityAnalysis(studyUuid, currentNode?.id);
                    break;
                case runnable[ComputingType.SENSITIVITY_ANALYSIS]:
                    type = ComputingType.SENSITIVITY_ANALYSIS;
                    stopSensitivityAnalysis(studyUuid, currentNode?.id);
                    break;
                case runnable[ComputingType.SHORTCIRCUIT_ANALYSIS]:
                    type = ComputingType.SHORTCIRCUIT_ANALYSIS;
                    stopShortCircuitAnalysis(studyUuid, currentNode?.id);
                    break;
                case runnable[ComputingType.DYNAMIC_SIMULATION]:
                    type = ComputingType.DYNAMIC_SIMULATION;
                    stopDynamicSimulation(studyUuid, currentNode?.id);
                    break;
                case runnable[ComputingType.VOLTAGE_INIT]:
                    type = ComputingType.VOLTAGE_INIT;
                    stopVoltageInit(studyUuid, currentNode?.id);
                    break;
                case runnable[ComputingType.LOADFLOW]:
                    type = ComputingType.LOADFLOW;
                    stopLoadFlow(studyUuid, currentNode?.id);
                    break;
                default:
                    return;
            }

            dispatch(setComputingStatus(type, RunningStatus.IDLE));
            setComputationStopped(true);
        },
    };

    const handleStartSecurityAnalysis = (contingencyListNames) => {
        // close the contingency list selection window
        setShowContingencyListSelector(false);

        setComputationStopped(false);
        dispatch(
            setComputingStatus(
                ComputingType.SECURITY_ANALYSIS,
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
                setComputingStatus(
                    ComputingType.SECURITY_ANALYSIS,
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
            setComputingStatus(
                ComputingType.SENSITIVITY_ANALYSIS,
                RunningStatus.RUNNING
            )
        );
        // start server side security analysis
        startSensitivityAnalysis(
            studyUuid,
            currentNode?.id,
            sensiConfiguration
        ).catch(() => {
            dispatch(
                setComputingStatus(
                    ComputingType.SENSITIVITY_ANALYSIS,
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
            setComputingStatus(
                ComputingType.DYNAMIC_SIMULATION,
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
                setComputingStatus(
                    ComputingType.DYNAMIC_SIMULATION,
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
        if (action === runnable[ComputingType.LOADFLOW]) {
            dispatch(
                setComputingStatus(
                    ComputingType.LOADFLOW,
                    RunningStatus.RUNNING
                )
            );
            setComputationStopped(false);
            startLoadFlow(studyUuid, currentNode?.id)
                .then(setRanLoadflow(true))
                .catch((error) => {
                    dispatch(
                        setComputingStatus(
                            ComputingType.LOADFLOW,
                            RunningStatus.FAILED
                        )
                    );
                    setRanLoadflow(false);
                    snackError({
                        messageTxt: error.message,
                        headerId: 'startLoadFlowError',
                    });
                });
        } else if (action === runnable[ComputingType.SECURITY_ANALYSIS]) {
            setShowContingencyListSelector(true);
            setRanSA(true);
        } else if (action === runnable[ComputingType.SENSITIVITY_ANALYSIS]) {
            setShowSensiParametersSelector(true);
            setRanSensi(true);
        } else if (action === runnable[ComputingType.SHORTCIRCUIT_ANALYSIS]) {
            dispatch(
                setComputingStatus(
                    ComputingType.SHORTCIRCUIT_ANALYSIS,
                    RunningStatus.RUNNING
                )
            );
            startShortCircuitAnalysis(studyUuid, currentNode?.id)
                .then(setRanShortCircuit(true))
                .catch((error) => {
                    dispatch(
                        setComputingStatus(
                            ComputingType.SHORTCIRCUIT_ANALYSIS,
                            RunningStatus.FAILED
                        )
                    );
                    snackError({
                        messageTxt: error.message,
                        headerId: 'startShortCircuitError',
                    });
                });
        } else if (action === runnable[ComputingType.VOLTAGE_INIT]) {
            dispatch(
                setComputingStatus(
                    ComputingType.VOLTAGE_INIT,
                    RunningStatus.RUNNING
                )
            );
            startVoltageInit(studyUuid, currentNode?.id)
                .then(setRanVoltageInit(true))
                .catch((error) => {
                    dispatch(
                        setComputingStatus(
                            ComputingType.VOLTAGE_INIT,
                            RunningStatus.FAILED
                        )
                    );
                    snackError({
                        messageTxt: error.message,
                        headerId: 'startVoltageInitError',
                    });
                });
        } else if (action === runnable[ComputingType.DYNAMIC_SIMULATION]) {
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
            if (runnableType === runnable[ComputingType.LOADFLOW]) {
                return loadFlowStatus;
            } else if (
                runnableType === runnable[ComputingType.SECURITY_ANALYSIS]
            ) {
                return securityAnalysisStatus;
            } else if (
                runnableType === runnable[ComputingType.SENSITIVITY_ANALYSIS]
            ) {
                return sensitivityAnalysisStatus;
            } else if (
                runnableType === runnable[ComputingType.SHORTCIRCUIT_ANALYSIS]
            ) {
                return shortCircuitAnalysisStatus;
            } else if (
                runnableType === runnable[ComputingType.DYNAMIC_SIMULATION]
            ) {
                return dynamicSimulationStatus;
            } else if (runnableType === runnable[ComputingType.VOLTAGE_INIT]) {
                return voltageInitStatus;
            }
        },
        [
            runnable,
            loadFlowStatus,
            securityAnalysisStatus,
            sensitivityAnalysisStatus,
            shortCircuitAnalysisStatus,
            dynamicSimulationStatus,
            voltageInitStatus,
        ]
    );

    const getRunningText = (runnableName) => {
        return runnableName;
    };

    const runnables = useMemo(() => {
        return [
            runnable[ComputingType.LOADFLOW],
            ...(availableServices.includes('SecurityAnalysis')
                ? [runnable[ComputingType.SECURITY_ANALYSIS]]
                : []),
            ...(availableServices.includes('SensitivityAnalysis')
                ? [runnable[ComputingType.SENSITIVITY_ANALYSIS]]
                : []),
            ...(availableServices.includes('ShortCircuit') &&
            enableDeveloperMode
                ? [runnable[ComputingType.SHORTCIRCUIT_ANALYSIS]]
                : []),
            ...(availableServices.includes('DynamicSimulation') &&
            enableDeveloperMode
                ? [runnable[ComputingType.DYNAMIC_SIMULATION]]
                : []),
            ...(availableServices.includes('VoltageInit') && enableDeveloperMode
                ? [runnable[ComputingType.VOLTAGE_INIT]]
                : []),
        ];
    }, [availableServices, runnable, enableDeveloperMode]);

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
