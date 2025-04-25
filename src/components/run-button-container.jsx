/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { setComputationStarting, setComputingStatus, setLogsFilter } from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';

import RunningStatus from './utils/running-status';
import ComputingType, { formatComputingTypeLabel } from './computing-status/computing-type';

import { PARAM_DEVELOPER_MODE } from '../utils/config-params';

import { useSnackMessage } from '@gridsuite/commons-ui';
import RunButton from './run-button';
import { DynamicSimulationParametersSelector } from './dialogs/dynamicsimulation/dynamic-simulation-parameters-selector';
import { ContingencyListSelector } from './dialogs/contingency-list-selector';

import { startSensitivityAnalysis, stopSensitivityAnalysis } from '../services/study/sensitivity-analysis';
import { startNonEvacuatedEnergy, stopNonEvacuatedEnergy } from '../services/study/non-evacuated-energy';
import {
    fetchDynamicSimulationParameters,
    startDynamicSimulation,
    stopDynamicSimulation,
} from '../services/study/dynamic-simulation';
import { startLoadFlow, stopLoadFlow } from '../services/study/loadflow';
import { startSecurityAnalysis, stopSecurityAnalysis } from '../services/study/security-analysis';
import { startShortCircuitAnalysis, stopShortCircuitAnalysis } from '../services/study/short-circuit-analysis';
import { startVoltageInit, stopVoltageInit } from '../services/study/voltage-init';
import { startStateEstimation, stopStateEstimation } from '../services/study/state-estimation';
import { OptionalServicesNames, OptionalServicesStatus } from './utils/optional-services';
import { useOptionalServiceStatus } from '../hooks/use-optional-service-status';
import { startDynamicSecurityAnalysis, stopDynamicSecurityAnalysis } from '../services/study/dynamic-security-analysis';
import { useParameterState } from './dialogs/parameters/use-parameters-state';
import { useIntl } from 'react-intl';

const checkDynamicSimulationParameters = (studyUuid) => {
    return fetchDynamicSimulationParameters(studyUuid).then((params) => {
        // check mapping configuration
        const mappings = params.mappings.map((elem) => elem.name);
        const mapping = params.mapping;
        const isMappingValid = mappings.includes(mapping);
        return isMappingValid;
    });
};
export function RunButtonContainer({ studyUuid, currentNode, currentRootNetworkUuid, disabled }) {
    const intl = useIntl();
    const loadFlowStatus = useSelector((state) => state.computingStatus[ComputingType.LOAD_FLOW]);

    const securityAnalysisStatus = useSelector((state) => state.computingStatus[ComputingType.SECURITY_ANALYSIS]);

    const sensitivityAnalysisStatus = useSelector((state) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]);
    const nonEvacuatedEnergyStatus = useSelector(
        (state) => state.computingStatus[ComputingType.NON_EVACUATED_ENERGY_ANALYSIS]
    );

    const allBusesShortCircuitAnalysisStatus = useSelector(
        (state) => state.computingStatus[ComputingType.SHORT_CIRCUIT]
    );

    const dynamicSimulationStatus = useSelector((state) => state.computingStatus[ComputingType.DYNAMIC_SIMULATION]);
    const dynamicSecurityAnalysisStatus = useSelector(
        (state) => state.computingStatus[ComputingType.DYNAMIC_SECURITY_ANALYSIS]
    );
    const voltageInitStatus = useSelector((state) => state.computingStatus[ComputingType.VOLTAGE_INITIALIZATION]);
    const stateEstimationStatus = useSelector((state) => state.computingStatus[ComputingType.STATE_ESTIMATION]);

    const [showContingencyListSelector, setShowContingencyListSelector] = useState(false);

    const [showDynamicSimulationParametersSelector, setShowDynamicSimulationParametersSelector] = useState(false);

    // a transient state which is used only for a run with popup dialog
    const [debug, setDebug] = useState(false);

    const [computationStopped, setComputationStopped] = useState(false);

    const { snackError, snackInfo } = useSnackMessage();

    const dispatch = useDispatch();

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const isModificationsInProgress = useSelector((state) => state.isModificationsInProgress);

    const securityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.SecurityAnalysis);
    const sensitivityAnalysisUnavailability = useOptionalServiceStatus(OptionalServicesNames.SensitivityAnalysis);
    const nonEvacuatedEnergyUnavailability = useOptionalServiceStatus(OptionalServicesNames.SensitivityAnalysis);

    const dynamicSimulationAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSimulation);
    const dynamicSecurityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSecurityAnalysis);
    const voltageInitAvailability = useOptionalServiceStatus(OptionalServicesNames.VoltageInit);
    const shortCircuitAvailability = useOptionalServiceStatus(OptionalServicesNames.ShortCircuit);
    const stateEstimationAvailability = useOptionalServiceStatus(OptionalServicesNames.StateEstimation);

    const startComputationAsync = useCallback(
        (computingType, fnBefore, fnStart, fnThen, fnCatch, errorHeaderId, debug) => {
            // debug mode => open a notification
            debug &&
                snackInfo({
                    headerTxt: intl.formatMessage({ id: formatComputingTypeLabel(computingType) }),
                    messageTxt: intl.formatMessage({ id: 'debugText' }),
                });

            if (fnBefore) {
                fnBefore();
            }
            setComputationStopped(false);
            dispatch(setComputationStarting(true));
            dispatch(setComputingStatus(computingType, RunningStatus.RUNNING));
            fnStart(debug)
                .then(fnThen)
                .catch((error) => {
                    dispatch(setComputingStatus(computingType, RunningStatus.FAILED));
                    if (fnCatch) {
                        fnCatch(error);
                    }
                    if (errorHeaderId) {
                        snackError({
                            messageTxt: error.message,
                            headerId: errorHeaderId,
                        });
                    }
                })
                .finally(() => {
                    dispatch(setComputationStarting(false));
                    // we clear the computation logs filter when a new computation is started
                    dispatch(setLogsFilter(computingType, []));
                });
        },
        [dispatch, snackError, snackInfo, intl]
    );

    const handleStartSecurityAnalysis = (contingencyListNames, debug) => {
        startComputationAsync(
            ComputingType.SECURITY_ANALYSIS,
            null,
            (debug) =>
                startSecurityAnalysis(studyUuid, currentNode?.id, currentRootNetworkUuid, contingencyListNames, debug),
            () => {},
            null,
            null,
            debug
        );
    };

    const handleStartDynamicSimulation = (dynamicSimulationConfiguration, debug) => {
        startComputationAsync(
            ComputingType.DYNAMIC_SIMULATION,
            null,
            (debug) =>
                startDynamicSimulation(
                    studyUuid,
                    currentNode?.id,
                    currentRootNetworkUuid,
                    dynamicSimulationConfiguration,
                    debug
                ),
            () => {},
            null,
            'DynamicSimulationRunError',
            debug
        );
    };

    const runnables = useMemo(() => {
        function actionOnRunnables(type, fnStop) {
            fnStop().finally(() => {
                dispatch(setComputingStatus(type, RunningStatus.IDLE));
                setComputationStopped(true);
            });
        }

        return {
            [ComputingType.LOAD_FLOW]: {
                messageId: 'LoadFlow',
                startComputation(debug) {
                    startComputationAsync(
                        ComputingType.LOAD_FLOW,
                        null,
                        (debug) => startLoadFlow(studyUuid, currentNode?.id, currentRootNetworkUuid, debug),
                        () => {},
                        null,
                        'startLoadFlowError',
                        debug
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.LOAD_FLOW, () => stopLoadFlow(studyUuid, currentNode?.id));
                },
            },
            [ComputingType.SECURITY_ANALYSIS]: {
                messageId: 'SecurityAnalysis',
                startComputation(debug) {
                    setShowContingencyListSelector(true);
                    setDebug(debug);
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.SECURITY_ANALYSIS, () =>
                        stopSecurityAnalysis(studyUuid, currentNode?.id, currentRootNetworkUuid)
                    );
                },
            },
            [ComputingType.SENSITIVITY_ANALYSIS]: {
                messageId: 'SensitivityAnalysis',
                startComputation(debug) {
                    startComputationAsync(
                        ComputingType.SENSITIVITY_ANALYSIS,
                        null,
                        (debug) => startSensitivityAnalysis(studyUuid, currentNode?.id, currentRootNetworkUuid, debug),
                        () => {},
                        null,
                        'startSensitivityAnalysisError',
                        debug
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.SENSITIVITY_ANALYSIS, () =>
                        stopSensitivityAnalysis(studyUuid, currentNode?.id, currentRootNetworkUuid)
                    );
                },
            },
            [ComputingType.NON_EVACUATED_ENERGY_ANALYSIS]: {
                messageId: 'NonEvacuatedEnergyAnalysis',
                startComputation(debug) {
                    startComputationAsync(
                        ComputingType.NON_EVACUATED_ENERGY_ANALYSIS,
                        null,
                        (debug) => {
                            return startNonEvacuatedEnergy(studyUuid, currentNode?.id, currentRootNetworkUuid, debug);
                        },
                        () => {},
                        null,
                        'startNonEvacuatedEnergyAnalysisError',
                        debug
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.NON_EVACUATED_ENERGY_ANALYSIS, () =>
                        stopNonEvacuatedEnergy(studyUuid, currentNode?.id, currentRootNetworkUuid)
                    );
                },
            },
            [ComputingType.SHORT_CIRCUIT]: {
                messageId: 'ShortCircuitAnalysis',
                startComputation(debug) {
                    startComputationAsync(
                        ComputingType.SHORT_CIRCUIT,
                        null,
                        (debug) => startShortCircuitAnalysis(studyUuid, currentNode?.id, currentRootNetworkUuid, debug),
                        () => {},
                        null,
                        'startShortCircuitError',
                        debug
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.SHORT_CIRCUIT, () =>
                        stopShortCircuitAnalysis(studyUuid, currentNode?.id, currentRootNetworkUuid)
                    );
                },
            },
            [ComputingType.DYNAMIC_SIMULATION]: {
                messageId: 'DynamicSimulation',
                startComputation(debug) {
                    checkDynamicSimulationParameters(studyUuid)
                        .then((isValid) => {
                            if (!isValid) {
                                // open parameters selector to configure mandatory params
                                setShowDynamicSimulationParametersSelector(true);
                                setDebug(true);
                            } else {
                                // start server side dynamic simulation directly
                                return startComputationAsync(
                                    ComputingType.DYNAMIC_SIMULATION,
                                    null,
                                    (debug) =>
                                        startDynamicSimulation({
                                            studyUuid,
                                            currentNodeUuid: currentNode?.id,
                                            currentRootNetworkUuid,
                                            debug,
                                        }),
                                    () => {},
                                    null,
                                    'DynamicSimulationRunError',
                                    debug
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
                        stopDynamicSimulation(studyUuid, currentNode?.id, currentRootNetworkUuid)
                    );
                },
            },
            [ComputingType.DYNAMIC_SECURITY_ANALYSIS]: {
                messageId: 'DynamicSecurityAnalysis',
                startComputation(debug) {
                    startComputationAsync(
                        ComputingType.DYNAMIC_SECURITY_ANALYSIS,
                        null,
                        (debug) =>
                            startDynamicSecurityAnalysis(studyUuid, currentNode?.id, currentRootNetworkUuid, debug),
                        () => {},
                        null,
                        'startDynamicSecurityAnalysisError',
                        debug
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.DYNAMIC_SECURITY_ANALYSIS, () =>
                        stopDynamicSecurityAnalysis(studyUuid, currentNode?.id, currentRootNetworkUuid)
                    );
                },
            },

            [ComputingType.VOLTAGE_INITIALIZATION]: {
                messageId: 'VoltageInit',
                startComputation(debug) {
                    startComputationAsync(
                        ComputingType.VOLTAGE_INITIALIZATION,
                        null,
                        (debug) => startVoltageInit(studyUuid, currentNode?.id, currentRootNetworkUuid, debug),
                        () => {},
                        null,
                        'startVoltageInitError',
                        debug
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.VOLTAGE_INITIALIZATION, () =>
                        stopVoltageInit(studyUuid, currentNode?.id, currentRootNetworkUuid)
                    );
                },
            },
            [ComputingType.STATE_ESTIMATION]: {
                messageId: 'StateEstimation',
                startComputation(debug) {
                    startComputationAsync(
                        ComputingType.STATE_ESTIMATION,
                        null,
                        (debug) => {
                            return startStateEstimation(studyUuid, currentNode?.id, currentRootNetworkUuid, debug);
                        },
                        () => {},
                        null,
                        'startStateEstimationError',
                        debug
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.STATE_ESTIMATION, () =>
                        stopStateEstimation(studyUuid, currentNode?.id, currentRootNetworkUuid)
                    );
                },
            },
        };
    }, [dispatch, snackError, startComputationAsync, studyUuid, currentNode?.id, currentRootNetworkUuid]);

    // running status is refreshed more often, so we memoize it apart
    const getRunningStatus = useCallback(
        (computingType) => {
            switch (computingType) {
                case ComputingType.LOAD_FLOW:
                    return loadFlowStatus;
                case ComputingType.SECURITY_ANALYSIS:
                    return securityAnalysisStatus;
                case ComputingType.SENSITIVITY_ANALYSIS:
                    return sensitivityAnalysisStatus;
                case ComputingType.NON_EVACUATED_ENERGY_ANALYSIS:
                    return nonEvacuatedEnergyStatus;
                case ComputingType.SHORT_CIRCUIT:
                    return allBusesShortCircuitAnalysisStatus;
                case ComputingType.DYNAMIC_SIMULATION:
                    return dynamicSimulationStatus;
                case ComputingType.DYNAMIC_SECURITY_ANALYSIS:
                    return dynamicSecurityAnalysisStatus;
                case ComputingType.VOLTAGE_INITIALIZATION:
                    return voltageInitStatus;
                case ComputingType.STATE_ESTIMATION:
                    return stateEstimationStatus;
                default:
                    return null;
            }
        },
        [
            loadFlowStatus,
            securityAnalysisStatus,
            sensitivityAnalysisStatus,
            nonEvacuatedEnergyStatus,
            allBusesShortCircuitAnalysisStatus,
            dynamicSimulationStatus,
            dynamicSecurityAnalysisStatus,
            voltageInitStatus,
            stateEstimationStatus,
        ]
    );

    // list of visible runnable isn't static
    const activeRunnables = useMemo(() => {
        return [
            ComputingType.LOAD_FLOW,
            ...(securityAnalysisAvailability === OptionalServicesStatus.Up ? [ComputingType.SECURITY_ANALYSIS] : []),
            ...(sensitivityAnalysisUnavailability === OptionalServicesStatus.Up
                ? [ComputingType.SENSITIVITY_ANALYSIS]
                : []),
            ...(nonEvacuatedEnergyUnavailability === OptionalServicesStatus.Up && enableDeveloperMode
                ? [ComputingType.NON_EVACUATED_ENERGY_ANALYSIS]
                : []),
            ...(shortCircuitAvailability === OptionalServicesStatus.Up ? [ComputingType.SHORT_CIRCUIT] : []),
            ...(dynamicSimulationAvailability === OptionalServicesStatus.Up && enableDeveloperMode
                ? [ComputingType.DYNAMIC_SIMULATION]
                : []),
            ...(dynamicSecurityAnalysisAvailability === OptionalServicesStatus.Up && enableDeveloperMode
                ? [ComputingType.DYNAMIC_SECURITY_ANALYSIS]
                : []),
            ...(voltageInitAvailability === OptionalServicesStatus.Up ? [ComputingType.VOLTAGE_INITIALIZATION] : []),
            ...(stateEstimationAvailability === OptionalServicesStatus.Up && enableDeveloperMode
                ? [ComputingType.STATE_ESTIMATION]
                : []),
        ];
    }, [
        dynamicSimulationAvailability,
        dynamicSecurityAnalysisAvailability,
        securityAnalysisAvailability,
        sensitivityAnalysisUnavailability,
        nonEvacuatedEnergyUnavailability,
        shortCircuitAvailability,
        voltageInitAvailability,
        stateEstimationAvailability,
        enableDeveloperMode,
    ]);

    return (
        <>
            <RunButton
                runnables={runnables}
                activeRunnables={activeRunnables}
                getStatus={getRunningStatus}
                computationStopped={computationStopped}
                disabled={isModificationsInProgress || disabled}
            />
            <ContingencyListSelector
                open={showContingencyListSelector}
                onClose={() => {
                    setShowContingencyListSelector(false);
                    setDebug(false);
                }}
                onStart={(params) => handleStartSecurityAnalysis(params, debug)}
            />
            {!disabled && showDynamicSimulationParametersSelector && (
                <DynamicSimulationParametersSelector
                    open={showDynamicSimulationParametersSelector}
                    onClose={() => {
                        setShowDynamicSimulationParametersSelector(false);
                        setDebug(false);
                    }}
                    onStart={(params) => handleStartDynamicSimulation(params, debug)}
                    studyUuid={studyUuid}
                />
            )}
        </>
    );
}

RunButtonContainer.propTypes = {
    studyUuid: PropTypes.string.isRequired,
    currentNode: PropTypes.object,
    currentRootNetworkUuid: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
};
