/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { setComputingStatus, setComputationStarting } from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';

import RunningStatus from './utils/running-status';
import ComputationType from './computing-status/computation-type';

import { PARAM_DEVELOPER_MODE, PARAM_LIMIT_REDUCTION } from '../utils/config-params';
import { useParameterState } from './dialogs/parameters/parameters';

import { useSnackMessage } from '@gridsuite/commons-ui';
import RunButton from './run-button';
import ContingencyListSelector from './dialogs/contingency-list-selector';
import DynamicSimulationParametersSelector, {
    checkDynamicSimulationParameters,
} from './dialogs/dynamicsimulation/dynamic-simulation-parameters-selector';

import { startSensitivityAnalysis, stopSensitivityAnalysis } from '../services/study/sensitivity-analysis';
import { startNonEvacuatedEnergy, stopNonEvacuatedEnergy } from '../services/study/non-evacuated-energy';
import { startDynamicSimulation, stopDynamicSimulation } from '../services/study/dynamic-simulation';
import { startLoadFlow, stopLoadFlow } from '../services/study/loadflow';
import { startSecurityAnalysis, stopSecurityAnalysis } from '../services/study/security-analysis';
import { startShortCircuitAnalysis, stopShortCircuitAnalysis } from '../services/study/short-circuit-analysis';
import { startVoltageInit, stopVoltageInit } from '../services/study/voltage-init';
import { startStateEstimation, stopStateEstimation } from '../services/study/state-estimation';
import { OptionalServicesNames, OptionalServicesStatus } from './utils/optional-services';
import { useOptionalServiceStatus } from '../hooks/use-optional-service-status';

export function RunButtonContainer({ studyUuid, currentNode, disabled }) {
    const loadFlowStatus = useSelector((state) => state.computingStatus[ComputationType.LOAD_FLOW]);

    const securityAnalysisStatus = useSelector((state) => state.computingStatus[ComputationType.SECURITY_ANALYSIS]);

    const sensitivityAnalysisStatus = useSelector(
        (state) => state.computingStatus[ComputationType.SENSITIVITY_ANALYSIS]
    );
    const nonEvacuatedEnergyStatus = useSelector(
        (state) => state.computingStatus[ComputationType.NON_EVACUATED_ENERGY_ANALYSIS]
    );

    const allBusesShortCircuitAnalysisStatus = useSelector(
        (state) => state.computingStatus[ComputationType.SHORT_CIRCUIT]
    );

    const dynamicSimulationStatus = useSelector((state) => state.computingStatus[ComputationType.DYNAMIC_SIMULATION]);
    const voltageInitStatus = useSelector((state) => state.computingStatus[ComputationType.VOLTAGE_INITIALIZATION]);
    const stateEstimationStatus = useSelector((state) => state.computingStatus[ComputationType.STATE_ESTIMATION]);

    const [showContingencyListSelector, setShowContingencyListSelector] = useState(false);

    const [showDynamicSimulationParametersSelector, setShowDynamicSimulationParametersSelector] = useState(false);

    const [computationStopped, setComputationStopped] = useState(false);

    const { snackError } = useSnackMessage();

    const dispatch = useDispatch();

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const isModificationsInProgress = useSelector((state) => state.isModificationsInProgress);

    const limitReductionParam = useSelector((state) => Number(state[PARAM_LIMIT_REDUCTION]));

    const securityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.SecurityAnalysis);
    const sensitivityAnalysisUnavailability = useOptionalServiceStatus(OptionalServicesNames.SensitivityAnalysis);
    const nonEvacuatedEnergyUnavailability = useOptionalServiceStatus(OptionalServicesNames.SensitivityAnalysis);

    const dynamicSimulationAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSimulation);
    const voltageInitAvailability = useOptionalServiceStatus(OptionalServicesNames.VoltageInit);
    const shortCircuitAvailability = useOptionalServiceStatus(OptionalServicesNames.ShortCircuit);
    const stateEstimationAvailability = useOptionalServiceStatus(OptionalServicesNames.StateEstimation);

    const startComputationAsync = useCallback(
        (computingType, fnBefore, fnStart, fnThen, fnCatch, errorHeaderId) => {
            if (fnBefore) {
                fnBefore();
            }
            setComputationStopped(false);
            dispatch(setComputationStarting(true));
            dispatch(setComputingStatus(computingType, RunningStatus.RUNNING));
            fnStart()
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
                .finally(() => dispatch(setComputationStarting(false)));
        },
        [dispatch, snackError]
    );

    const handleStartSecurityAnalysis = (contingencyListNames) => {
        startComputationAsync(
            ComputationType.SECURITY_ANALYSIS,
            () => {
                // close the contingency list selection window
                setShowContingencyListSelector(false);
            },
            () => startSecurityAnalysis(studyUuid, currentNode?.id, contingencyListNames),
            () => {},
            null,
            null
        );
    };

    const handleStartDynamicSimulation = (dynamicSimulationConfiguration) => {
        startComputationAsync(
            ComputationType.DYNAMIC_SIMULATION,
            () => {
                // close the dialog
                setShowDynamicSimulationParametersSelector(false);
            },
            () => startDynamicSimulation(studyUuid, currentNode?.id, dynamicSimulationConfiguration),
            () => {},
            null,
            'DynamicSimulationRunError'
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
            [ComputationType.LOAD_FLOW]: {
                messageId: 'LoadFlow',
                startComputation() {
                    startComputationAsync(
                        ComputationType.LOAD_FLOW,
                        null,
                        () => startLoadFlow(studyUuid, currentNode?.id, limitReductionParam / 100.0),
                        () => {},
                        null,
                        'startLoadFlowError'
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputationType.LOAD_FLOW, () => stopLoadFlow(studyUuid, currentNode?.id));
                },
            },
            [ComputationType.SECURITY_ANALYSIS]: {
                messageId: 'SecurityAnalysis',
                startComputation() {
                    setShowContingencyListSelector(true);
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputationType.SECURITY_ANALYSIS, () =>
                        stopSecurityAnalysis(studyUuid, currentNode?.id)
                    );
                },
            },
            [ComputationType.SENSITIVITY_ANALYSIS]: {
                messageId: 'SensitivityAnalysis',
                startComputation() {
                    startComputationAsync(
                        ComputationType.SENSITIVITY_ANALYSIS,
                        null,
                        () => startSensitivityAnalysis(studyUuid, currentNode?.id),
                        () => {},
                        null,
                        'startSensitivityAnalysisError'
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputationType.SENSITIVITY_ANALYSIS, () =>
                        stopSensitivityAnalysis(studyUuid, currentNode?.id)
                    );
                },
            },
            [ComputationType.NON_EVACUATED_ENERGY_ANALYSIS]: {
                messageId: 'NonEvacuatedEnergyAnalysis',
                startComputation() {
                    startComputationAsync(
                        ComputationType.NON_EVACUATED_ENERGY_ANALYSIS,
                        null,
                        () => {
                            return startNonEvacuatedEnergy(studyUuid, currentNode?.id);
                        },
                        () => {},
                        null,
                        'startNonEvacuatedEnergyAnalysisError'
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputationType.NON_EVACUATED_ENERGY_ANALYSIS, () =>
                        stopNonEvacuatedEnergy(studyUuid, currentNode?.id)
                    );
                },
            },
            [ComputationType.SHORT_CIRCUIT]: {
                messageId: 'ShortCircuitAnalysis',
                startComputation() {
                    startComputationAsync(
                        ComputationType.SHORT_CIRCUIT,
                        null,
                        () => startShortCircuitAnalysis(studyUuid, currentNode?.id),
                        () => {},
                        null,
                        'startShortCircuitError'
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputationType.SHORT_CIRCUIT, () =>
                        stopShortCircuitAnalysis(studyUuid, currentNode?.id)
                    );
                },
            },
            [ComputationType.DYNAMIC_SIMULATION]: {
                messageId: 'DynamicSimulation',
                startComputation() {
                    checkDynamicSimulationParameters(studyUuid)
                        .then((isValid) => {
                            if (!isValid) {
                                // open parameters selector to configure mandatory params
                                setShowDynamicSimulationParametersSelector(true);
                            } else {
                                // start server side dynamic simulation directly
                                return startDynamicSimulation(studyUuid, currentNode?.id);
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
                    actionOnRunnables(ComputationType.DYNAMIC_SIMULATION, () =>
                        stopDynamicSimulation(studyUuid, currentNode?.id)
                    );
                },
            },
            [ComputationType.VOLTAGE_INITIALIZATION]: {
                messageId: 'VoltageInit',
                startComputation() {
                    startComputationAsync(
                        ComputationType.VOLTAGE_INITIALIZATION,
                        null,
                        () => startVoltageInit(studyUuid, currentNode?.id),
                        () => {},
                        null,
                        'startVoltageInitError'
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputationType.VOLTAGE_INITIALIZATION, () =>
                        stopVoltageInit(studyUuid, currentNode?.id)
                    );
                },
            },
            [ComputationType.STATE_ESTIMATION]: {
                messageId: 'StateEstimation',
                startComputation() {
                    startComputationAsync(
                        ComputationType.STATE_ESTIMATION,
                        null,
                        () => {
                            return startStateEstimation(studyUuid, currentNode?.id);
                        },
                        () => {},
                        null,
                        'startStateEstimationError'
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputationType.STATE_ESTIMATION, () =>
                        stopStateEstimation(studyUuid, currentNode?.id)
                    );
                },
            },
        };
    }, [dispatch, snackError, startComputationAsync, studyUuid, limitReductionParam, currentNode?.id]);

    // running status is refreshed more often, so we memoize it apart
    const getRunningStatus = useCallback(
        (computingType) => {
            switch (computingType) {
                case ComputationType.LOAD_FLOW:
                    return loadFlowStatus;
                case ComputationType.SECURITY_ANALYSIS:
                    return securityAnalysisStatus;
                case ComputationType.SENSITIVITY_ANALYSIS:
                    return sensitivityAnalysisStatus;
                case ComputationType.NON_EVACUATED_ENERGY_ANALYSIS:
                    return nonEvacuatedEnergyStatus;
                case ComputationType.SHORT_CIRCUIT:
                    return allBusesShortCircuitAnalysisStatus;
                case ComputationType.DYNAMIC_SIMULATION:
                    return dynamicSimulationStatus;
                case ComputationType.VOLTAGE_INITIALIZATION:
                    return voltageInitStatus;
                case ComputationType.STATE_ESTIMATION:
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
            voltageInitStatus,
            stateEstimationStatus,
        ]
    );

    // list of visible runnable isn't static
    const activeRunnables = useMemo(() => {
        return [
            ComputationType.LOAD_FLOW,
            ...(securityAnalysisAvailability === OptionalServicesStatus.Up ? [ComputationType.SECURITY_ANALYSIS] : []),
            ...(sensitivityAnalysisUnavailability === OptionalServicesStatus.Up
                ? [ComputationType.SENSITIVITY_ANALYSIS]
                : []),
            ...(nonEvacuatedEnergyUnavailability === OptionalServicesStatus.Up && enableDeveloperMode
                ? [ComputationType.NON_EVACUATED_ENERGY_ANALYSIS]
                : []),
            ...(shortCircuitAvailability === OptionalServicesStatus.Up ? [ComputationType.SHORT_CIRCUIT] : []),
            ...(dynamicSimulationAvailability === OptionalServicesStatus.Up && enableDeveloperMode
                ? [ComputationType.DYNAMIC_SIMULATION]
                : []),
            ...(voltageInitAvailability === OptionalServicesStatus.Up ? [ComputationType.VOLTAGE_INITIALIZATION] : []),
            ...(stateEstimationAvailability === OptionalServicesStatus.Up && enableDeveloperMode
                ? [ComputationType.STATE_ESTIMATION]
                : []),
        ];
    }, [
        dynamicSimulationAvailability,
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
                onClose={() => setShowContingencyListSelector(false)}
                onStart={handleStartSecurityAnalysis}
                studyUuid={studyUuid}
            />
            {!disabled && showDynamicSimulationParametersSelector && (
                <DynamicSimulationParametersSelector
                    open={showDynamicSimulationParametersSelector}
                    onClose={() => setShowDynamicSimulationParametersSelector(false)}
                    onStart={handleStartDynamicSimulation}
                    studyUuid={studyUuid}
                    currentNodeUuid={currentNode?.id}
                />
            )}
        </>
    );
}

RunButtonContainer.propTypes = {
    studyUuid: PropTypes.string.isRequired,
    currentNode: PropTypes.object,
    disabled: PropTypes.bool,
};
