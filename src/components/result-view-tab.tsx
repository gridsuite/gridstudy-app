/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import { useIntl } from 'react-intl';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { ShortCircuitAnalysisResultTab } from './results/shortcircuit/shortcircuit-analysis-result-tab';
import AlertCustomMessageNode from './utils/alert-custom-message-node';
import { PARAM_DEVELOPER_MODE } from '../utils/config-params';
import { useParameterState } from './dialogs/parameters/parameters';
import DynamicSimulationResultTab from './results/dynamicsimulation/dynamic-simulation-result-tab';
import TabPanelLazy from './results/common/tab-panel-lazy';
import { VoltageInitResultTab } from './voltage-init-result-tab';
import {
    ResultsTabsLevel,
    ResultTabIndexRedirection,
    useResultsTab,
} from './results/use-results-tab';
import SensitivityAnalysisResultTab from './results/sensitivity-analysis/sensitivity-analysis-result-tab';
import {
    OptionalServicesNames,
    OptionalServicesStatus,
} from './utils/optional-services';
import { CurrentTreeNode } from '../redux/reducer.type';
import { UUID } from 'crypto';
import { useOptionalServiceStatus } from '../hooks/use-optional-service-status';
import { SecurityAnalysisResultTab } from './results/securityanalysis/security-analysis-result-tab';
import { LoadFlowResultTab } from './results/loadflow/load-flow-result-tab';
import { Box } from '@mui/system';

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
    openVoltageLevelDiagram: (voltageLevelId: string) => void;
    resultTabIndexRedirection: ResultTabIndexRedirection;
    disabled: boolean;
}

interface IService {
    id: string;
    displayed: boolean;
    renderResult: React.ReactNode;
}

/**
 * control results views
 * @param studyUuid : string uuid of study
 * @param currentNode : object current node
 * @param openVoltageLevelDiagram : function
 * @param resultTabIndexRedirection : ResultTabIndexRedirection to specific tab [RootTab, LevelOneTab, ...]
 * @param disabled
 * @returns {JSX.Element}
 * @constructor
 */
export const ResultViewTab: FunctionComponent<IResultViewTabProps> = ({
    studyUuid,
    currentNode,
    openVoltageLevelDiagram,
    resultTabIndexRedirection,
    disabled,
}) => {
    const [tabIndex, setTabIndex] = useState(
        resultTabIndexRedirection?.[ResultsTabsLevel.ROOT] ?? 0
    );

    useResultsTab(
        resultTabIndexRedirection,
        setTabIndex,
        ResultsTabsLevel.ROOT
    );

    const intl = useIntl();

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

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

    const renderLoadFlowResult = useMemo(() => {
        return (
            <Paper sx={styles.analysisResult}>
                <LoadFlowResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                />
            </Paper>
        );
    }, [studyUuid, currentNode]);

    const renderSecurityAnalysisResult = useMemo(() => {
        return (
            <Paper sx={styles.analysisResult}>
                <SecurityAnalysisResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                    openVoltageLevelDiagram={openVoltageLevelDiagram}
                />
            </Paper>
        );
    }, [studyUuid, currentNode, openVoltageLevelDiagram]);

    const renderVoltageInitResult = useMemo(() => {
        return (
            <Paper sx={styles.analysisResult}>
                <VoltageInitResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                />
            </Paper>
        );
    }, [studyUuid, currentNode]);

    const renderSensitivityAnalysisResult = useMemo(() => {
        return (
            <Paper sx={styles.analysisResult}>
                <SensitivityAnalysisResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id!}
                />
            </Paper>
        );
    }, [studyUuid, currentNode]);

    const renderShortCircuitAnalysisResult = useMemo(() => {
        return (
            <Paper sx={styles.analysisResult}>
                <ShortCircuitAnalysisResultTab
                    resultTabIndexRedirection={resultTabIndexRedirection}
                />
            </Paper>
        );
    }, [resultTabIndexRedirection]);

    const renderDynamicSimulationResult = useMemo(() => {
        return (
            <Paper sx={styles.analysisResult}>
                <DynamicSimulationResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                />
            </Paper>
        );
    }, [studyUuid, currentNode]);

    const services: IService[] = useMemo(() => {
        return [
            {
                id: 'LoadFlow',
                displayed: true,
                renderResult: renderLoadFlowResult,
            },
            {
                id: 'SecurityAnalysis',
                displayed:
                    securityAnalysisAvailability === OptionalServicesStatus.Up,
                renderResult: renderSecurityAnalysisResult,
            },
            {
                id: 'SensitivityAnalysis',
                displayed:
                    sensitivityAnalysisUnavailability ===
                    OptionalServicesStatus.Up,
                renderResult: renderSensitivityAnalysisResult,
            },
            {
                id: 'ShortCircuitAnalysis',
                displayed:
                    shortCircuitAvailability === OptionalServicesStatus.Up,
                renderResult: renderShortCircuitAnalysisResult,
            },
            {
                id: 'DynamicSimulation',
                displayed:
                    enableDeveloperMode &&
                    dynamicSimulationAvailability === OptionalServicesStatus.Up,
                renderResult: renderDynamicSimulationResult,
            },
            {
                id: 'VoltageInit',
                displayed:
                    voltageInitAvailability === OptionalServicesStatus.Up,
                renderResult: renderVoltageInitResult,
            },
        ].filter(({ displayed }: IService) => displayed);
    }, [
        sensitivityAnalysisUnavailability,
        securityAnalysisAvailability,
        dynamicSimulationAvailability,
        voltageInitAvailability,
        shortCircuitAvailability,
        enableDeveloperMode,
        renderDynamicSimulationResult,
        renderSecurityAnalysisResult,
        renderSensitivityAnalysisResult,
        renderShortCircuitAnalysisResult,
        renderVoltageInitResult,
        renderLoadFlowResult,
    ]);

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
    const renderTabPanelLazy = (
        service: IService,
        index: number
    ): React.ReactNode => {
        return (
            <TabPanelLazy
                key={service.id + 'tabPanel'}
                selected={tabIndex === index && !disabled}
            >
                {service.renderResult}
            </TabPanelLazy>
        );
    };

    useEffect(() => {
        if (!enableDeveloperMode) {
            // a displayed tab may be obsolete when developer mode is disabled, then switch on first one
            setTabIndex(0);
        }
    }, [enableDeveloperMode]);

    return (
        <Paper sx={styles.table}>
            <Box>
                <Tabs
                    value={tabIndex}
                    variant="scrollable"
                    onChange={(event, newTabIndex) => setTabIndex(newTabIndex)}
                >
                    {services.map((service) => renderTab(service))}
                </Tabs>
                {disabled && <AlertCustomMessageNode message={'InvalidNode'} />}
            </Box>
            {services.map((service, index) =>
                renderTabPanelLazy(service, index)
            )}
        </Paper>
    );
};
