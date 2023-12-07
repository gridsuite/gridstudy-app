/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import RunButton from './run-button';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { RunningStatus } from './utils/running-status';

import ContingencyListSelector from './dialogs/contingency-list-selector';
import {
    addLoadflowNotif,
    addSANotif,
    addSensiNotif,
    addAllBusesShortCircuitNotif,
    addDynamicSimulationNotif,
    addVoltageInitNotif,
    setComputingStatus,
    setComputationRunning,
} from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    PARAM_DEVELOPER_MODE,
    PARAM_LIMIT_REDUCTION,
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
import {
    OptionalServicesNames,
    OptionalServicesStatus,
} from './utils/optional-services';
import { useOptionalServiceStatus } from '../hooks/use-optional-service-status';

export function RunButtonContainer({ studyUuid, currentNode, disabled }) {
    const loadFlowStatus = useSelector(
        (state) => state.computingStatus[ComputingType.LOADFLOW]
    );

    const securityAnalysisStatus = useSelector(
        (state) => state.computingStatus[ComputingType.SECURITY_ANALYSIS]
    );

    const sensitivityAnalysisStatus = useSelector(
        (state) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]
    );
    const allBusesShortCircuitAnalysisStatus = useSelector(
        (state) =>
            state.computingStatus[ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS]
    );
    const oneBusShortCircuitAnalysisStatus = useSelector(
        (state) =>
            state.computingStatus[ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS]
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

    const limitReductionParam = useSelector((state) =>
        Number(state[PARAM_LIMIT_REDUCTION])
    );

    const securityAnalysisAvailability = useOptionalServiceStatus(
        OptionalServicesNames.SecurityAnalysis
    );
    const sensitivityAnalysisUnavailability = useOptionalServiceStatus(
        OptionalServicesNames.SensitivityAnalysis
    );
    const dynamicSimulationAvailability = useOptionalServiceStatus(
        OptionalServicesNames.DynamicSimulation
    );
    const voltageInitAvailability = useOptionalServiceStatus(
        OptionalServicesNames.VoltageInit
    );
    const shortCircuitAvailability = useOptionalServiceStatus(
        OptionalServicesNames.ShortCircuit
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
            [ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS]: intl.formatMessage(
                {
                    id: 'ShortCircuitAnalysis',
                }
            ),
            [ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS]: intl.formatMessage({
                id: 'OneBusShortCircuitAnalysis',
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
            dispatch(addAllBusesShortCircuitNotif());
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
                case runnable[ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS]:
                    type = ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS;
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
            startLoadFlow(
                studyUuid,
                currentNode?.id,
                limitReductionParam / 100.0
            )
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
            dispatch(
                setComputingStatus(
                    ComputingType.SENSITIVITY_ANALYSIS,
                    RunningStatus.RUNNING
                )
            );
            setComputationStopped(false);
            startSensitivityAnalysis(studyUuid, currentNode?.id)
                .then(setRanSensi(true))
                .catch((error) => {
                    dispatch(
                        setComputingStatus(
                            ComputingType.SENSITIVITY_ANALYSIS,
                            RunningStatus.FAILED
                        )
                    );
                    snackError({
                        messageTxt: error.message,
                        headerId: 'startSensitivityAnalysisError',
                    });
                });
        } else if (
            action === runnable[ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS]
        ) {
            dispatch(
                setComputingStatus(
                    ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS,
                    RunningStatus.RUNNING
                )
            );
            setComputationStopped(false);
            startShortCircuitAnalysis(studyUuid, currentNode?.id)
                .then(() => setRanShortCircuit(true))
                .catch((error) => {
                    dispatch(
                        setComputingStatus(
                            ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS,
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
            setComputationStopped(false);
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
                runnableType ===
                runnable[ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS]
            ) {
                return allBusesShortCircuitAnalysisStatus;
            } else if (
                runnableType ===
                runnable[ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS]
            ) {
                return oneBusShortCircuitAnalysisStatus;
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
            allBusesShortCircuitAnalysisStatus,
            oneBusShortCircuitAnalysisStatus,
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
            ...(securityAnalysisAvailability === OptionalServicesStatus.Up
                ? [runnable[ComputingType.SECURITY_ANALYSIS]]
                : []),
            ...(sensitivityAnalysisUnavailability === OptionalServicesStatus.Up
                ? [runnable[ComputingType.SENSITIVITY_ANALYSIS]]
                : []),
            ...(shortCircuitAvailability === OptionalServicesStatus.Up
                ? [runnable[ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS]]
                : []),
            ...(dynamicSimulationAvailability === OptionalServicesStatus.Up &&
            enableDeveloperMode
                ? [runnable[ComputingType.DYNAMIC_SIMULATION]]
                : []),
            ...(voltageInitAvailability === OptionalServicesStatus.Up
                ? [runnable[ComputingType.VOLTAGE_INIT]]
                : []),
        ];
    }, [
        dynamicSimulationAvailability,
        securityAnalysisAvailability,
        sensitivityAnalysisUnavailability,
        shortCircuitAvailability,
        voltageInitAvailability,
        runnable,
        enableDeveloperMode,
    ]);

    useEffect(() => {
        const computationRunning = runnables.some(function (runnable) {
            return getRunningStatus(runnable) === RunningStatus.RUNNING;
        });
        dispatch(setComputationRunning(computationRunning));
    }, [dispatch, getRunningStatus, runnables]);

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
                        studyUuid={studyUuid}
                        currentNodeUuid={currentNode?.id}
                    />
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
