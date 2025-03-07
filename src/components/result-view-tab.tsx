/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { ShortCircuitAnalysisResultTab } from './results/shortcircuit/shortcircuit-analysis-result-tab';
import AlertCustomMessageNode from './utils/alert-custom-message-node';
import { PARAM_DEVELOPER_MODE } from '../utils/config-params';
import DynamicSimulationResultTab from './results/dynamicsimulation/dynamic-simulation-result-tab';
import TabPanelLazy from './results/common/tab-panel-lazy';
import { VoltageInitResultTab } from './voltage-init-result-tab';
import { computingTypeToRootTabRedirection, ResultTabIndexRedirection, useResultsTab } from './results/use-results-tab';
import SensitivityAnalysisResultTab from './results/sensitivity-analysis/sensitivity-analysis-result-tab';
import { NonEvacuatedEnergyResultTab } from './results/sensitivity-analysis/non-evacuated-energy/non-evacuated-energy-result-tab';
import { OptionalServicesNames, OptionalServicesStatus } from './utils/optional-services';
import { AppState, CurrentTreeNode } from '../redux/reducer';
import { UUID } from 'crypto';
import { useOptionalServiceStatus } from '../hooks/use-optional-service-status';
import { SecurityAnalysisResultTab } from './results/securityanalysis/security-analysis-result-tab';
import { LoadFlowResultTab } from './results/loadflow/load-flow-result-tab';
import ComputingType from './computing-status/computing-type';
import { useSelector } from 'react-redux';
import { Box, Paper, Tab, Tabs } from '@mui/material';
import { StateEstimationResultTab } from './results/stateestimation/state-estimation-result-tab';
import DynamicSecurityAnalysisResultTab from './results/dynamic-security-analysis/dynamic-security-analysis-result-tab';
import { usePrevious } from '@gridsuite/commons-ui';
import { useParameterState } from './dialogs/parameters/use-parameters-state';
import { IService } from './result-view-tab.type';

const styles = {
    table: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        height: '100%',
    },
    analysisResult: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
};

interface IResultViewTabProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    openVoltageLevelDiagram: (voltageLevelId: string) => void;
    disabled: boolean;
    view: string;
}

/**
 * control results views
 * @param studyUuid : string uuid of study
 * @param currentNode : object current node
 * @param currentRootNetworkUuid : uuid of current root network
 * @param openVoltageLevelDiagram : function
 * @param resultTabIndexRedirection : ResultTabIndexRedirection to specific tab [RootTab, LevelOneTab, ...]
 * @param disabled
 * @returns {JSX.Element}
 * @constructor
 */
export const ResultViewTab: FunctionComponent<IResultViewTabProps> = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    openVoltageLevelDiagram,
    disabled,
    view,
}) => {
    const intl = useIntl();

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const lastCompletedComputation = useSelector((state: AppState) => state.lastCompletedComputation);

    const securityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.SecurityAnalysis);
    const sensitivityAnalysisUnavailability = useOptionalServiceStatus(OptionalServicesNames.SensitivityAnalysis);
    const nonEvacuatedEnergyUnavailability = useOptionalServiceStatus(OptionalServicesNames.SensitivityAnalysis);
    const dynamicSimulationAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSimulation);
    const dynamicSecurityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSecurityAnalysis);
    const voltageInitAvailability = useOptionalServiceStatus(OptionalServicesNames.VoltageInit);
    const shortCircuitAvailability = useOptionalServiceStatus(OptionalServicesNames.ShortCircuit);
    const stateEstimationAvailability = useOptionalServiceStatus(OptionalServicesNames.StateEstimation);

    const renderLoadFlowResult = useMemo(() => {
        return (
            <Paper sx={styles.analysisResult}>
                <LoadFlowResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </Paper>
        );
    }, [studyUuid, currentNode, currentRootNetworkUuid]);

    const renderSecurityAnalysisResult = useMemo(() => {
        return (
            <Paper sx={styles.analysisResult}>
                <SecurityAnalysisResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    openVoltageLevelDiagram={openVoltageLevelDiagram}
                />
            </Paper>
        );
    }, [studyUuid, currentNode, currentRootNetworkUuid, openVoltageLevelDiagram]);

    const renderVoltageInitResult = useMemo(() => {
        return (
            <Paper sx={styles.analysisResult}>
                <VoltageInitResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </Paper>
        );
    }, [studyUuid, currentNode, currentRootNetworkUuid]);

    const renderSensitivityAnalysisResult = useMemo(() => {
        return (
            <Paper sx={styles.analysisResult}>
                <SensitivityAnalysisResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id!}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </Paper>
        );
    }, [studyUuid, currentNode, currentRootNetworkUuid]);

    const renderNonEvacuatedEnergyResult = useMemo(() => {
        return (
            <Paper sx={styles.analysisResult}>
                <NonEvacuatedEnergyResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id!}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </Paper>
        );
    }, [studyUuid, currentNode, currentRootNetworkUuid]);

    const renderShortCircuitAnalysisResult = useMemo(() => {
        return (
            <Paper sx={styles.analysisResult}>
                <ShortCircuitAnalysisResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    view={view}
                />
            </Paper>
        );
    }, [view, currentNode?.id, studyUuid, currentRootNetworkUuid]);

    const renderDynamicSimulationResult = useMemo(() => {
        return (
            <Paper sx={styles.analysisResult}>
                <DynamicSimulationResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </Paper>
        );
    }, [studyUuid, currentNode, currentRootNetworkUuid]);

    const renderDynamicSecurityAnalysisResult = useMemo(() => {
        return (
            <Paper sx={styles.analysisResult}>
                <DynamicSecurityAnalysisResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </Paper>
        );
    }, [studyUuid, currentNode, currentRootNetworkUuid]);

    const renderStateEstimationResult = useMemo(() => {
        return (
            <Paper sx={styles.analysisResult}>
                <StateEstimationResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </Paper>
        );
    }, [studyUuid, currentNode, currentRootNetworkUuid]);

    const services: IService[] = useMemo(() => {
        return [
            {
                id: 'LoadFlow',
                computingType: [ComputingType.LOAD_FLOW],
                displayed: true,
                renderResult: renderLoadFlowResult,
            },
            {
                id: 'SecurityAnalysis',
                computingType: [ComputingType.SECURITY_ANALYSIS],
                displayed: securityAnalysisAvailability === OptionalServicesStatus.Up,
                renderResult: renderSecurityAnalysisResult,
            },
            {
                id: 'SensitivityAnalysis',
                computingType: [ComputingType.SENSITIVITY_ANALYSIS],
                displayed: sensitivityAnalysisUnavailability === OptionalServicesStatus.Up,
                renderResult: renderSensitivityAnalysisResult,
            },
            {
                id: 'NonEvacuatedEnergyAnalysis',
                computingType: [ComputingType.NON_EVACUATED_ENERGY_ANALYSIS],
                displayed: enableDeveloperMode && nonEvacuatedEnergyUnavailability === OptionalServicesStatus.Up,
                renderResult: renderNonEvacuatedEnergyResult,
            },
            {
                id: 'ShortCircuitAnalysis',
                computingType: [ComputingType.SHORT_CIRCUIT, ComputingType.SHORT_CIRCUIT_ONE_BUS],
                displayed: shortCircuitAvailability === OptionalServicesStatus.Up,
                renderResult: renderShortCircuitAnalysisResult,
            },
            {
                id: 'DynamicSimulation',
                computingType: [ComputingType.DYNAMIC_SIMULATION],
                displayed: enableDeveloperMode && dynamicSimulationAvailability === OptionalServicesStatus.Up,
                renderResult: renderDynamicSimulationResult,
            },
            {
                id: 'DynamicSecurityAnalysis',
                computingType: [ComputingType.DYNAMIC_SECURITY_ANALYSIS],
                displayed: enableDeveloperMode && dynamicSecurityAnalysisAvailability === OptionalServicesStatus.Up,
                renderResult: renderDynamicSecurityAnalysisResult,
            },
            {
                id: 'VoltageInit',
                computingType: [ComputingType.VOLTAGE_INITIALIZATION],
                displayed: voltageInitAvailability === OptionalServicesStatus.Up,
                renderResult: renderVoltageInitResult,
            },
            {
                id: 'StateEstimation',
                computingType: [ComputingType.STATE_ESTIMATION],
                displayed: enableDeveloperMode && stateEstimationAvailability === OptionalServicesStatus.Up,
                renderResult: renderStateEstimationResult,
            },
        ].filter(({ displayed }: IService) => displayed);
    }, [
        sensitivityAnalysisUnavailability,
        nonEvacuatedEnergyUnavailability,
        securityAnalysisAvailability,
        dynamicSimulationAvailability,
        dynamicSecurityAnalysisAvailability,
        voltageInitAvailability,
        shortCircuitAvailability,
        stateEstimationAvailability,
        enableDeveloperMode,
        renderDynamicSimulationResult,
        renderDynamicSecurityAnalysisResult,
        renderSecurityAnalysisResult,
        renderSensitivityAnalysisResult,
        renderNonEvacuatedEnergyResult,
        renderShortCircuitAnalysisResult,
        renderVoltageInitResult,
        renderLoadFlowResult,
        renderStateEstimationResult,
    ]);

    const resultTabIndexRedirection = useMemo<ResultTabIndexRedirection>(
        () => computingTypeToRootTabRedirection(lastCompletedComputation ?? ComputingType.LOAD_FLOW, services),
        [lastCompletedComputation, services]
    );

    const [tabIndex, setTabIndex] = useState<number>(resultTabIndexRedirection);

    const setRedirectionLock = useResultsTab(resultTabIndexRedirection, setTabIndex, view);

    const renderTab = (service: IService) => {
        return (
            <Tab
                key={service.id + 'tab'}
                label={intl.formatMessage({
                    id: service.id,
                })}
                disabled={disabled}
            />
        );
    };
    const renderTabPanelLazy = (service: IService, index: number): React.ReactNode => {
        return (
            <TabPanelLazy key={service.id + 'tabPanel'} selected={tabIndex === index && !disabled}>
                {service.renderResult}
            </TabPanelLazy>
        );
    };

    const previousEnableDeveloperMode = usePrevious(enableDeveloperMode);
    useEffect(() => {
        if (!enableDeveloperMode && previousEnableDeveloperMode !== enableDeveloperMode) {
            setTabIndex(0);
        }
    }, [enableDeveloperMode, previousEnableDeveloperMode, lastCompletedComputation]);

    const handleChangeTab = useCallback(
        (event: React.SyntheticEvent, newTabIndex: number) => {
            setTabIndex(newTabIndex);
            //when we manually browse results we ought to block further redirections until the next completed computation
            setRedirectionLock(true);
        },
        [setRedirectionLock]
    );

    return (
        <Paper sx={styles.table}>
            <Box>
                <Tabs value={tabIndex} variant="scrollable" onChange={handleChangeTab} TabIndicatorProps={{}}>
                    {services.map((service) => renderTab(service))}
                </Tabs>
                {disabled && <AlertCustomMessageNode message={'InvalidNode'} />}
            </Box>
            {services.map((service, index) => renderTabPanelLazy(service, index))}
        </Paper>
    );
};
