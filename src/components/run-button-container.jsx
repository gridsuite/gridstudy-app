/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    setComputationStarting,
    setComputingStatus,
    setComputingStatusParameters,
    setLogsFilter,
} from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';

import RunningStatus from './utils/running-status';

import { PARAM_PROVIDER_DYNAFLOW, PARAM_PROVIDER_DYNAWO } from '../utils/config-params';
import {
    ComputingType,
    formatComputingTypeLabel,
    PARAM_DEVELOPER_MODE,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import RunButton from './run-button';
import { DynamicSimulationParametersSelector } from './dialogs/dynamicsimulation/dynamic-simulation-parameters-selector';
import { startSensitivityAnalysis, stopSensitivityAnalysis } from '../services/study/sensitivity-analysis';
import {
    fetchDynamicSimulationParameters,
    fetchDynamicSimulationProvider,
    startDynamicSimulation,
    stopDynamicSimulation,
} from '../services/study/dynamic-simulation';
import { getLoadFlowProvider, startLoadFlow, stopLoadFlow } from '../services/study/loadflow';
import { startSecurityAnalysis, stopSecurityAnalysis } from '../services/study/security-analysis';
import { startShortCircuitAnalysis, stopShortCircuitAnalysis } from '../services/study/short-circuit-analysis';
import { startVoltageInit, stopVoltageInit } from '../services/study/voltage-init';
import { startStateEstimation, stopStateEstimation } from '../services/study/state-estimation';
import { OptionalServicesNames, OptionalServicesStatus } from './utils/optional-services';
import { useOptionalServiceStatus } from '../hooks/use-optional-service-status';
import {
    fetchDynamicSecurityAnalysisProvider,
    startDynamicSecurityAnalysis,
    stopDynamicSecurityAnalysis,
} from '../services/study/dynamic-security-analysis';
import { useParameterState } from './dialogs/parameters/use-parameters-state';
import { isSecurityModificationNode } from './graph/tree-node.type';
import { PaginationType } from 'types/custom-aggrid-types';
import { usePaginationReset } from 'hooks/use-pagination-selector';
import { useLogsPaginationResetByType } from './report-viewer/use-logs-pagination';
import { startPccMin, stopPccMin } from 'services/study/pcc-min';
import {
    fetchDynamicMarginCalculationProvider,
    startDynamicMarginCalculation,
    stopDynamicMarginCalculation,
} from '../services/study/dynamic-margin-calculation.ts';
import useDebugSubscription from '../hooks/computation-debug/use-debug-subscription.ts';
import useDebugNotification from '../hooks/computation-debug/use-debug-notification.ts';

const checkDynamicSimulationParameters = (studyUuid) => {
    return fetchDynamicSimulationParameters(studyUuid).then((params) => {
        // check mapping configuration
        const mappings = params.mappings.map((elem) => elem.name);
        const mapping = params.mapping;
        const isMappingValid = mappings.includes(mapping);
        return isMappingValid;
    });
};

const COMPUTATIONS_WITH_PAGINATION = [
    ComputingType.SECURITY_ANALYSIS,
    ComputingType.SENSITIVITY_ANALYSIS,
    ComputingType.SHORT_CIRCUIT,
];

export function RunButtonContainer({ studyUuid, currentNode, currentRootNetworkUuid, disabled }) {
    const loadFlowStatus = useSelector((state) => state.computingStatus[ComputingType.LOAD_FLOW]);
    const loadFlowStatusInfos = useSelector((state) => state.computingStatusParameters[ComputingType.LOAD_FLOW]);

    // only one of those type can be different from idle, depending on loadFlowStatusInfos.withRatioTapChangers
    const loadFlowWithoutRatioTapChangersStatus = useMemo(
        () => (loadFlowStatusInfos?.withRatioTapChangers ? RunningStatus.IDLE : loadFlowStatus),
        [loadFlowStatus, loadFlowStatusInfos]
    );
    const loadFlowWithRatioTapChangersStatus = useMemo(
        () => (loadFlowStatusInfos?.withRatioTapChangers ? loadFlowStatus : RunningStatus.IDLE),
        [loadFlowStatus, loadFlowStatusInfos]
    );

    const securityAnalysisStatus = useSelector((state) => state.computingStatus[ComputingType.SECURITY_ANALYSIS]);

    const sensitivityAnalysisStatus = useSelector((state) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]);

    const allBusesShortCircuitAnalysisStatus = useSelector(
        (state) => state.computingStatus[ComputingType.SHORT_CIRCUIT]
    );

    const dynamicSimulationStatus = useSelector((state) => state.computingStatus[ComputingType.DYNAMIC_SIMULATION]);
    const dynamicSecurityAnalysisStatus = useSelector(
        (state) => state.computingStatus[ComputingType.DYNAMIC_SECURITY_ANALYSIS]
    );
    const dynamicMarginCalculationStatus = useSelector(
        (state) => state.computingStatus[ComputingType.DYNAMIC_MARGIN_CALCULATION]
    );
    const voltageInitStatus = useSelector((state) => state.computingStatus[ComputingType.VOLTAGE_INITIALIZATION]);
    const stateEstimationStatus = useSelector((state) => state.computingStatus[ComputingType.STATE_ESTIMATION]);
    const pccMinStatus = useSelector((state) => state.computingStatus[ComputingType.PCC_MIN]);

    const [showDynamicSimulationParametersSelector, setShowDynamicSimulationParametersSelector] = useState(false);

    // a transient state which is used only for a run with popup dialog
    const [runWithDebug, setRunWithDebug] = useState(false);

    const [computationStopped, setComputationStopped] = useState(false);

    const { snackError } = useSnackMessage();

    const dispatch = useDispatch();

    const [isDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const isModificationsInProgress = useSelector((state) => state.isModificationsInProgress);

    const securityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.SecurityAnalysis);
    const sensitivityAnalysisUnavailability = useOptionalServiceStatus(OptionalServicesNames.SensitivityAnalysis);

    const dynamicSimulationAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSimulation);
    const dynamicSecurityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSecurityAnalysis);
    const dynamicMarginCalculationAvailability = useOptionalServiceStatus(
        OptionalServicesNames.DynamicMarginCalculation
    );
    const voltageInitAvailability = useOptionalServiceStatus(OptionalServicesNames.VoltageInit);
    const shortCircuitAvailability = useOptionalServiceStatus(OptionalServicesNames.ShortCircuit);
    const stateEstimationAvailability = useOptionalServiceStatus(OptionalServicesNames.StateEstimation);
    const pccMinAvailability = useOptionalServiceStatus(OptionalServicesNames.PccMin);

    const resetSecurityAnalysisPagination = usePaginationReset(PaginationType.SecurityAnalysis);
    const resetSensitivityAnalysisPagination = usePaginationReset(PaginationType.SensitivityAnalysis);
    const resetShortCircuitAnalysisPagination = usePaginationReset(PaginationType.ShortcircuitAnalysis);

    const resetLogsPaginationByType = useLogsPaginationResetByType();

    const resetPaginationForComputingType = useCallback(
        (computingType) => {
            if (COMPUTATIONS_WITH_PAGINATION.includes(computingType)) {
                switch (computingType) {
                    case ComputingType.SECURITY_ANALYSIS:
                        resetSecurityAnalysisPagination();
                        break;
                    case ComputingType.SENSITIVITY_ANALYSIS:
                        resetSensitivityAnalysisPagination();
                        break;
                    case ComputingType.SHORT_CIRCUIT:
                        resetShortCircuitAnalysisPagination();
                        break;
                    default:
                        break;
                }
            }

            resetLogsPaginationByType(computingType);
        },
        [
            resetLogsPaginationByType,
            resetSecurityAnalysisPagination,
            resetSensitivityAnalysisPagination,
            resetShortCircuitAnalysisPagination,
        ]
    );

    // --- for listening to debug notifications then perform download debug file --- //
    useDebugNotification();

    // --- for running in debug mode --- //
    const subscribeDebug = useDebugSubscription({
        studyUuid: studyUuid,
        nodeUuid: currentNode?.id,
        rootNetworkUuid: currentRootNetworkUuid,
    });

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
                        snackWithFallback(snackError, error, { headerId: errorHeaderId });
                    }
                })
                .finally(() => {
                    dispatch(setComputationStarting(false));
                    resetPaginationForComputingType(computingType);
                    // we clear the computation logs filter when a new computation is started
                    dispatch(setLogsFilter(computingType, []));
                });
        },
        [dispatch, snackError, resetPaginationForComputingType]
    );

    const checkForbiddenProvider = useCallback(
        (studyUuid, computingType, providerFetcher, forbiddenProvidersOnConstructionNode) => {
            if (isSecurityModificationNode(currentNode)) {
                return Promise.resolve(true);
            }
            return providerFetcher(studyUuid).then((provider) => {
                if (forbiddenProvidersOnConstructionNode.includes(provider)) {
                    snackError({
                        headerId: formatComputingTypeLabel(computingType),
                        messageId: 'ForbiddenProviderError',
                        messageValues: { provider },
                    });
                    return false;
                } else {
                    return true;
                }
            });
        },
        [currentNode, snackError]
    );

    const handleStartSecurityAnalysis = useCallback(() => {
        startComputationAsync(
            ComputingType.SECURITY_ANALYSIS,
            null,
            () => startSecurityAnalysis(studyUuid, currentNode?.id, currentRootNetworkUuid),
            () => {},
            null,
            null
        );
    }, [studyUuid, currentNode?.id, currentRootNetworkUuid, startComputationAsync]);

    const handleStartDynamicSimulation = (dynamicSimulationConfiguration, debug) => {
        startComputationAsync(
            ComputingType.DYNAMIC_SIMULATION,
            null,
            () =>
                startDynamicSimulation({
                    studyUuid,
                    currentNodeUuid: currentNode?.id,
                    currentRootNetworkUuid,
                    dynamicSimulationConfiguration,
                    debug,
                }),
            () => debug && subscribeDebug(ComputingType.DYNAMIC_SIMULATION),
            null,
            'DynamicSimulationRunError'
        );
    };
    const handleStartLoadFlow = useCallback(
        (withRatioTapChangers) => {
            startComputationAsync(
                ComputingType.LOAD_FLOW,
                () => {
                    dispatch(
                        setComputingStatusParameters(ComputingType.LOAD_FLOW, {
                            withRatioTapChangers: withRatioTapChangers,
                        })
                    );
                },
                () => startLoadFlow(studyUuid, currentNode?.id, currentRootNetworkUuid, withRatioTapChangers),
                () => {},
                null,
                'startLoadFlowError'
            );
        },
        [currentNode?.id, currentRootNetworkUuid, dispatch, startComputationAsync, studyUuid]
    );

    const runnables = useMemo(() => {
        function actionOnRunnables(type, fnStop) {
            fnStop().finally(() => {
                dispatch(setComputingStatus(type, RunningStatus.IDLE));
                setComputationStopped(true);
            });
        }

        return {
            LOAD_FLOW_WITHOUT_RATIO_TAP_CHANGERS: {
                messageId: 'LoadFlow',
                startComputation() {
                    // with DynaFlow provider, we need to verify that the current node is a security node before starting the computation.
                    checkForbiddenProvider(studyUuid, ComputingType.LOAD_FLOW, getLoadFlowProvider, [
                        PARAM_PROVIDER_DYNAFLOW,
                    ]).then((isValid) => {
                        if (isValid) {
                            handleStartLoadFlow(false);
                        }
                    });
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.LOAD_FLOW, () => stopLoadFlow(studyUuid, currentNode?.id, false));
                },
            },
            LOAD_FLOW_WITH_RATIO_TAP_CHANGERS: {
                messageId: 'LoadFlowWithRatioTapChangers',
                startComputation() {
                    checkForbiddenProvider(studyUuid, ComputingType.LOAD_FLOW, getLoadFlowProvider, [
                        PARAM_PROVIDER_DYNAFLOW,
                    ]).then((isValid) => {
                        if (isValid) {
                            handleStartLoadFlow(true);
                        }
                    });
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.LOAD_FLOW, () => stopLoadFlow(studyUuid, currentNode?.id, true));
                },
            },
            [ComputingType.SECURITY_ANALYSIS]: {
                messageId: 'SecurityAnalysis',
                startComputation() {
                    handleStartSecurityAnalysis();
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.SECURITY_ANALYSIS, () =>
                        stopSecurityAnalysis(studyUuid, currentNode?.id, currentRootNetworkUuid)
                    );
                },
            },
            [ComputingType.SENSITIVITY_ANALYSIS]: {
                messageId: 'SensitivityAnalysis',
                startComputation() {
                    startComputationAsync(
                        ComputingType.SENSITIVITY_ANALYSIS,
                        null,
                        () => startSensitivityAnalysis(studyUuid, currentNode?.id, currentRootNetworkUuid),
                        () => {},
                        null,
                        'startSensitivityAnalysisError'
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.SENSITIVITY_ANALYSIS, () =>
                        stopSensitivityAnalysis(studyUuid, currentNode?.id, currentRootNetworkUuid)
                    );
                },
            },
            [ComputingType.SHORT_CIRCUIT]: {
                messageId: 'ShortCircuitAnalysis',
                startComputation(debug) {
                    startComputationAsync(
                        ComputingType.SHORT_CIRCUIT,
                        null,
                        () =>
                            startShortCircuitAnalysis(
                                studyUuid,
                                currentNode?.id,
                                currentRootNetworkUuid,
                                undefined,
                                debug
                            ),
                        () => debug && subscribeDebug(ComputingType.SHORT_CIRCUIT),
                        null,
                        'startShortCircuitError'
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
                async startComputation(debug) {
                    try {
                        const isProviderValid = await checkForbiddenProvider(
                            studyUuid,
                            ComputingType.DYNAMIC_SIMULATION,
                            fetchDynamicSimulationProvider,
                            [PARAM_PROVIDER_DYNAWO]
                        );
                        if (!isProviderValid) {
                            return;
                        }

                        const isParametersValid = await checkDynamicSimulationParameters(studyUuid);
                        if (!isParametersValid) {
                            // open parameters selector to configure mandatory params
                            setShowDynamicSimulationParametersSelector(true);
                            setRunWithDebug(debug);
                            return;
                        }

                        // start server side dynamic simulation directly
                        startComputationAsync(
                            ComputingType.DYNAMIC_SIMULATION,
                            null,
                            () =>
                                startDynamicSimulation({
                                    studyUuid,
                                    currentNodeUuid: currentNode?.id,
                                    currentRootNetworkUuid,
                                    debug,
                                }),
                            () => debug && subscribeDebug(ComputingType.DYNAMIC_SIMULATION),
                            null,
                            'DynamicSimulationRunError'
                        );
                    } catch (error) {
                        snackWithFallback(snackError, error, { headerId: 'DynamicSimulationRunError' });
                    }
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.DYNAMIC_SIMULATION, () =>
                        stopDynamicSimulation(studyUuid, currentNode?.id, currentRootNetworkUuid)
                    );
                },
            },
            [ComputingType.DYNAMIC_SECURITY_ANALYSIS]: {
                messageId: 'DynamicSecurityAnalysis',
                async startComputation(debug) {
                    try {
                        const isProviderValid = await checkForbiddenProvider(
                            studyUuid,
                            ComputingType.DYNAMIC_SECURITY_ANALYSIS,
                            fetchDynamicSecurityAnalysisProvider,
                            [PARAM_PROVIDER_DYNAWO]
                        );

                        if (!isProviderValid) {
                            return;
                        }

                        startComputationAsync(
                            ComputingType.DYNAMIC_SECURITY_ANALYSIS,
                            null,
                            () =>
                                startDynamicSecurityAnalysis(studyUuid, currentNode?.id, currentRootNetworkUuid, debug),
                            () => debug && subscribeDebug(ComputingType.DYNAMIC_SECURITY_ANALYSIS),
                            null,
                            'startDynamicSecurityAnalysisError'
                        );
                    } catch (error) {
                        snackWithFallback(snackError, error, { headerId: 'startDynamicSecurityAnalysisError' });
                    }
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.DYNAMIC_SECURITY_ANALYSIS, () =>
                        stopDynamicSecurityAnalysis(studyUuid, currentNode?.id, currentRootNetworkUuid)
                    );
                },
            },
            [ComputingType.DYNAMIC_MARGIN_CALCULATION]: {
                messageId: 'DynamicMarginCalculation',
                async startComputation(debug) {
                    try {
                        const isProviderValid = await checkForbiddenProvider(
                            studyUuid,
                            ComputingType.DYNAMIC_MARGIN_CALCULATION,
                            fetchDynamicMarginCalculationProvider,
                            [PARAM_PROVIDER_DYNAWO]
                        );

                        if (!isProviderValid) {
                            return;
                        }

                        startComputationAsync(
                            ComputingType.DYNAMIC_MARGIN_CALCULATION,
                            null,
                            () =>
                                startDynamicMarginCalculation(
                                    studyUuid,
                                    currentNode?.id,
                                    currentRootNetworkUuid,
                                    debug
                                ),
                            () => debug && subscribeDebug(ComputingType.DYNAMIC_MARGIN_CALCULATION),
                            null,
                            'startDynamicMarginCalculationError'
                        );
                    } catch (error) {
                        snackWithFallback(snackError, error, { headerId: 'startDynamicMarginCalculationError' });
                    }
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.DYNAMIC_MARGIN_CALCULATION, () =>
                        stopDynamicMarginCalculation(studyUuid, currentNode?.id, currentRootNetworkUuid)
                    );
                },
            },

            [ComputingType.VOLTAGE_INITIALIZATION]: {
                messageId: 'VoltageInit',
                startComputation(debug) {
                    startComputationAsync(
                        ComputingType.VOLTAGE_INITIALIZATION,
                        null,
                        () => startVoltageInit(studyUuid, currentNode?.id, currentRootNetworkUuid, debug),
                        () => debug && subscribeDebug(ComputingType.VOLTAGE_INITIALIZATION),
                        null,
                        'startVoltageInitError'
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
                startComputation() {
                    startComputationAsync(
                        ComputingType.STATE_ESTIMATION,
                        null,
                        () => {
                            return startStateEstimation(studyUuid, currentNode?.id, currentRootNetworkUuid);
                        },
                        () => {},
                        null,
                        'startStateEstimationError'
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.STATE_ESTIMATION, () =>
                        stopStateEstimation(studyUuid, currentNode?.id, currentRootNetworkUuid)
                    );
                },
            },

            [ComputingType.PCC_MIN]: {
                messageId: 'PccMin',
                startComputation() {
                    startComputationAsync(
                        ComputingType.PCC_MIN,
                        null,
                        () => {
                            return startPccMin(studyUuid, currentNode?.id, currentRootNetworkUuid);
                        },
                        () => {},
                        null,
                        'startPccMinError'
                    );
                },
                actionOnRunnable() {
                    actionOnRunnables(ComputingType.PCC_MIN, () =>
                        stopPccMin(studyUuid, currentNode?.id, currentRootNetworkUuid)
                    );
                },
            },
        };
    }, [
        dispatch,
        checkForbiddenProvider,
        studyUuid,
        handleStartLoadFlow,
        handleStartSecurityAnalysis,
        currentNode?.id,
        currentRootNetworkUuid,
        startComputationAsync,
        snackError,
        subscribeDebug,
    ]);

    // running status is refreshed more often, so we memoize it apart
    const getRunningStatus = useCallback(
        (runnableType) => {
            switch (runnableType) {
                case 'LOAD_FLOW_WITHOUT_RATIO_TAP_CHANGERS':
                    return loadFlowWithoutRatioTapChangersStatus;
                case 'LOAD_FLOW_WITH_RATIO_TAP_CHANGERS':
                    return loadFlowWithRatioTapChangersStatus;
                case ComputingType.SECURITY_ANALYSIS:
                    return securityAnalysisStatus;
                case ComputingType.SENSITIVITY_ANALYSIS:
                    return sensitivityAnalysisStatus;
                case ComputingType.SHORT_CIRCUIT:
                    return allBusesShortCircuitAnalysisStatus;
                case ComputingType.DYNAMIC_SIMULATION:
                    return dynamicSimulationStatus;
                case ComputingType.DYNAMIC_SECURITY_ANALYSIS:
                    return dynamicSecurityAnalysisStatus;
                case ComputingType.DYNAMIC_MARGIN_CALCULATION:
                    return dynamicMarginCalculationStatus;
                case ComputingType.VOLTAGE_INITIALIZATION:
                    return voltageInitStatus;
                case ComputingType.STATE_ESTIMATION:
                    return stateEstimationStatus;
                case ComputingType.PCC_MIN:
                    return pccMinStatus;
                default:
                    return null;
            }
        },
        [
            loadFlowWithoutRatioTapChangersStatus,
            loadFlowWithRatioTapChangersStatus,
            securityAnalysisStatus,
            sensitivityAnalysisStatus,
            allBusesShortCircuitAnalysisStatus,
            dynamicSimulationStatus,
            dynamicSecurityAnalysisStatus,
            dynamicMarginCalculationStatus,
            voltageInitStatus,
            stateEstimationStatus,
            pccMinStatus,
        ]
    );

    // list of visible runnable isn't static
    const activeRunnables = useMemo(() => {
        return [
            'LOAD_FLOW_WITHOUT_RATIO_TAP_CHANGERS',
            'LOAD_FLOW_WITH_RATIO_TAP_CHANGERS',
            ...(securityAnalysisAvailability === OptionalServicesStatus.Up ? [ComputingType.SECURITY_ANALYSIS] : []),
            ...(sensitivityAnalysisUnavailability === OptionalServicesStatus.Up
                ? [ComputingType.SENSITIVITY_ANALYSIS]
                : []),
            ...(shortCircuitAvailability === OptionalServicesStatus.Up ? [ComputingType.SHORT_CIRCUIT] : []),
            ...(dynamicSimulationAvailability === OptionalServicesStatus.Up && isDeveloperMode
                ? [ComputingType.DYNAMIC_SIMULATION]
                : []),
            ...(dynamicSecurityAnalysisAvailability === OptionalServicesStatus.Up && isDeveloperMode
                ? [ComputingType.DYNAMIC_SECURITY_ANALYSIS]
                : []),
            ...(dynamicMarginCalculationAvailability === OptionalServicesStatus.Up && isDeveloperMode
                ? [ComputingType.DYNAMIC_MARGIN_CALCULATION]
                : []),
            ...(voltageInitAvailability === OptionalServicesStatus.Up ? [ComputingType.VOLTAGE_INITIALIZATION] : []),
            ...(stateEstimationAvailability === OptionalServicesStatus.Up && isDeveloperMode
                ? [ComputingType.STATE_ESTIMATION]
                : []),
            ...(pccMinAvailability === OptionalServicesStatus.Up ? [ComputingType.PCC_MIN] : []),
        ];
    }, [
        securityAnalysisAvailability,
        sensitivityAnalysisUnavailability,
        shortCircuitAvailability,
        dynamicSimulationAvailability,
        isDeveloperMode,
        dynamicSecurityAnalysisAvailability,
        dynamicMarginCalculationAvailability,
        voltageInitAvailability,
        stateEstimationAvailability,
        pccMinAvailability,
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
            {!disabled && showDynamicSimulationParametersSelector && (
                <DynamicSimulationParametersSelector
                    open={showDynamicSimulationParametersSelector}
                    onClose={() => setShowDynamicSimulationParametersSelector(false)}
                    onStart={(params) => {
                        handleStartDynamicSimulation(params, runWithDebug);
                        setShowDynamicSimulationParametersSelector(false);
                        setRunWithDebug(false);
                    }}
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
