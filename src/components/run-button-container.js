/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

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

import RunningStatus from './utils/running-status';
import ComputingType from './computing-status/computing-type';

import {
    PARAM_DEVELOPER_MODE,
    PARAM_LIMIT_REDUCTION,
} from '../utils/config-params';
import { useParameterState } from './dialogs/parameters/parameters';

import { useSnackMessage } from '@gridsuite/commons-ui';
import RunButton from './run-button';
import ContingencyListSelector from './dialogs/contingency-list-selector';
import DynamicSimulationParametersSelector, {
    checkDynamicSimulationParameters,
} from './dialogs/dynamicsimulation/dynamic-simulation-parameters-selector';

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

    const startComputationAsync = useCallback(
        (computingType, fnBefore, fnStart, fnThen, fnCatch, errorHeaderId) => {
            if (fnBefore) {
                fnBefore();
            }
            dispatch(setComputingStatus(computingType, RunningStatus.RUNNING));
            fnStart()
                .then(fnThen)
                .catch((error) => {
                    dispatch(
                        setComputingStatus(computingType, RunningStatus.FAILED)
                    );
                    if (fnCatch) {
                        fnCatch(error);
                    }
                    if (errorHeaderId) {
                        snackError({
                            messageTxt: error.message,
                            headerId: errorHeaderId,
                        });
                    }
                });
        },
        [dispatch, snackError]
    );

    const handleStartSecurityAnalysis = (contingencyListNames) => {
        startComputationAsync(
            ComputingType.SECURITY_ANALYSIS,
            () => {
                // close the contingency list selection window
                setShowContingencyListSelector(false);
                setComputationStopped(false);
            },
            () =>
                startSecurityAnalysis(
                    studyUuid,
                    currentNode?.id,
                    contingencyListNames
                ),
            () => {},
            null,
            null
        );
    };

    const handleStartDynamicSimulation = (dynamicSimulationConfiguration) => {
        startComputationAsync(
            ComputingType.DYNAMIC_SIMULATION,
            () => {
                // close the dialog
                setShowDynamicSimulationParametersSelector(false);
                setComputationStopped(false);
            },
            () =>
                startDynamicSimulation(
                    studyUuid,
                    currentNode?.id,
                    dynamicSimulationConfiguration
                ),
            () => {},
            null,
            'DynamicSimulationRunError'
        );
    };

    const runnables = useMemo(() => {
        function actionOnRunnables(type, fnStop) {
            fnStop.finally(() => {
                dispatch(setComputingStatus(type, RunningStatus.IDLE));
                setComputationStopped(true);
            });
        }

        return {
            [ComputingType.LOADFLOW]: {
                messageId: 'LoadFlow',
                startComputation() {
                    startComputationAsync(
                        ComputingType.LOADFLOW,
                        null,
                        () => {
                            setComputationStopped(false);
                            return startLoadFlow(
                                studyUuid,
                                currentNode?.id,
                                limitReductionParam / 100.0
                            );
                        },
                        () => setRanLoadflow(true),
                        () => setRanLoadflow(false),
                        'startLoadFlowError'
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.LOADFLOW, () =>
                        stopLoadFlow(studyUuid, currentNode?.id)
                    );
                },
            },
            [ComputingType.SECURITY_ANALYSIS]: {
                messageId: 'SecurityAnalysis',
                startComputation() {
                    setShowContingencyListSelector(true);
                    setRanSA(true);
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.SECURITY_ANALYSIS, () =>
                        stopSecurityAnalysis(studyUuid, currentNode?.id)
                    );
                },
            },
            [ComputingType.SENSITIVITY_ANALYSIS]: {
                messageId: 'SensitivityAnalysis',
                startComputation() {
                    startComputationAsync(
                        ComputingType.SENSITIVITY_ANALYSIS,
                        null,
                        () => {
                            setComputationStopped(false);
                            return startSensitivityAnalysis(
                                studyUuid,
                                currentNode?.id
                            );
                        },
                        () => setRanSensi(true),
                        null,
                        'startSensitivityAnalysisError'
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.SENSITIVITY_ANALYSIS, () =>
                        stopSensitivityAnalysis(studyUuid, currentNode?.id)
                    );
                },
            },
            [ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS]: {
                messageId: 'ShortCircuitAnalysis',
                startComputation() {
                    startComputationAsync(
                        ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS,
                        null,
                        () => {
                            setComputationStopped(false);
                            return startShortCircuitAnalysis(
                                studyUuid,
                                currentNode?.id
                            );
                        },
                        () => setRanShortCircuit(true),
                        null,
                        'startShortCircuitError'
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(
                        ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS,
                        () =>
                            stopShortCircuitAnalysis(studyUuid, currentNode?.id)
                    );
                },
            },
            [ComputingType.DYNAMIC_SIMULATION]: {
                messageId: 'DynamicSimulation',
                startComputation() {
                    checkDynamicSimulationParameters(studyUuid)
                        .then((isValid) => {
                            if (!isValid) {
                                // open parameters selector to configure mandatory params
                                setShowDynamicSimulationParametersSelector(
                                    true
                                );
                                setRanDynamicSimulation(true);
                            } else {
                                // start server side dynamic simulation directly
                                return startDynamicSimulation(
                                    studyUuid,
                                    currentNode?.id
                                );
                            }
                        })
                        .catch((error) => {
                            snackError({
                                messageTxt: error.message,
                                headerId: 'DynamicSimulationRunError',
                            });
                        });
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.DYNAMIC_SIMULATION, () =>
                        stopDynamicSimulation(studyUuid, currentNode?.id)
                    );
                },
            },
            [ComputingType.VOLTAGE_INIT]: {
                messageId: 'VoltageInit',
                startComputation() {
                    startComputationAsync(
                        ComputingType.VOLTAGE_INIT,
                        null,
                        () => {
                            setComputationStopped(false);
                            return startVoltageInit(studyUuid, currentNode?.id);
                        },
                        () => setRanVoltageInit(true),
                        null,
                        'startVoltageInitError'
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.VOLTAGE_INIT, () =>
                        stopVoltageInit(studyUuid, currentNode?.id)
                    );
                },
            },
        };
    }, [
        dispatch,
        snackError,
        startComputationAsync,
        studyUuid,
        limitReductionParam,
        currentNode?.id,
        setRanLoadflow,
        setShowContingencyListSelector,
        setRanSA,
        setRanSensi,
        setRanShortCircuit,
        setShowDynamicSimulationParametersSelector,
        setRanDynamicSimulation,
    ]);

    // running status is refreshed more often, so we memoize it apart
    const getRunningStatus = useCallback(
        (computingType) => {
            switch (computingType) {
                case ComputingType.LOADFLOW:
                    return loadFlowStatus;
                case ComputingType.SECURITY_ANALYSIS:
                    return securityAnalysisStatus;
                case ComputingType.SENSITIVITY_ANALYSIS:
                    return sensitivityAnalysisStatus;
                case ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS:
                    return allBusesShortCircuitAnalysisStatus;
                case ComputingType.DYNAMIC_SIMULATION:
                    return dynamicSimulationStatus;
                case ComputingType.VOLTAGE_INIT:
                    return voltageInitStatus;
                default:
                    return null;
            }
        },
        [
            loadFlowStatus,
            securityAnalysisStatus,
            sensitivityAnalysisStatus,
            allBusesShortCircuitAnalysisStatus,
            dynamicSimulationStatus,
            voltageInitStatus,
        ]
    );

    // list of visible runnable isn't static
    const activeRunnables = useMemo(() => {
        return [
            ComputingType.LOADFLOW,
            ...(securityAnalysisAvailability === OptionalServicesStatus.Up
                ? [ComputingType.SECURITY_ANALYSIS]
                : []),
            ...(sensitivityAnalysisUnavailability === OptionalServicesStatus.Up
                ? [ComputingType.SENSITIVITY_ANALYSIS]
                : []),
            ...(shortCircuitAvailability === OptionalServicesStatus.Up
                ? [ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS]
                : []),
            ...(dynamicSimulationAvailability === OptionalServicesStatus.Up &&
            enableDeveloperMode
                ? [ComputingType.DYNAMIC_SIMULATION]
                : []),
            ...(voltageInitAvailability === OptionalServicesStatus.Up
                ? [ComputingType.VOLTAGE_INIT]
                : []),
        ];
    }, [
        dynamicSimulationAvailability,
        securityAnalysisAvailability,
        sensitivityAnalysisUnavailability,
        shortCircuitAvailability,
        voltageInitAvailability,
        enableDeveloperMode,
    ]);

    useEffect(() => {
        dispatch(
            setComputationRunning(
                activeRunnables.some(function (runnable) {
                    return getRunningStatus(runnable) === RunningStatus.RUNNING;
                })
            )
        );
    }, [dispatch, getRunningStatus, activeRunnables]);

    return (
        <>
            <RunButton
                runnables={runnables}
                activeRunnables={activeRunnables}
                getStatus={getRunningStatus}
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
    studyUuid: PropTypes.string.isRequired,
    currentNode: PropTypes.object,
    disabled: PropTypes.bool,
};
