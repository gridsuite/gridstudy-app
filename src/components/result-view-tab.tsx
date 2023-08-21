/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import clsx from 'clsx';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import makeStyles from '@mui/styles/makeStyles';
import { useIntl } from 'react-intl';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { SecurityAnalysisResultTab } from './security-analysis-result-tab';
import { ShortCircuitAnalysisResultTab } from './results/shortcircuit/shortcircuit-analysis-result-tab';
import AlertInvalidNode from './utils/alert-invalid-node';
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
import { LoadFlowResultTab } from './loadflow-result-tab';
import SensitivityAnalysisResultTab from './results/sensitivity-analysis/sensitivity-analysis-result-tab';
import {
    OptionalServicesNames,
    OptionalServicesStatus,
    useServiceAvailabilityStatus,
} from './utils/optional-services';
import { CurrentTreeNode } from '../redux/reducer.type';
import { UUID } from 'crypto';

const useStyles = makeStyles(() => ({
    div: {
        display: 'flex',
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    analysisResult: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    tabPanel: {
        display: 'flex',
        flexGrow: 1,
    },
}));

interface IResultViewTabProps {
    studyUuid: UUID;
    currentNode?: CurrentTreeNode;
    openVoltageLevelDiagram: (voltageLevelId: string) => void;
    resultTabIndexRedirection: ResultTabIndexRedirection;
    disabled: boolean;
}

interface IService {
    id: string;
    label: string;
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

    const classes = useStyles();

    const intl = useIntl();

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const securityAnalysisAvailability = useServiceAvailabilityStatus(
        OptionalServicesNames.SecurityAnalysis
    );
    const sensitivityAnalysisUnavailability = useServiceAvailabilityStatus(
        OptionalServicesNames.SensitivityAnalysis
    );
    const dynamicSimulationAvailability = useServiceAvailabilityStatus(
        OptionalServicesNames.DynamicSimulation
    );
    const voltageInitAvailability = useServiceAvailabilityStatus(
        OptionalServicesNames.VoltageInit
    );
    const shortCircuitAvailability = useServiceAvailabilityStatus(
        OptionalServicesNames.ShortCircuit
    );

    const renderLoadFlowResult = useMemo(() => {
        return (
            <Paper className={classes.table}>
                <LoadFlowResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                />
            </Paper>
        );
    }, [studyUuid, currentNode, classes]);

    const renderSecurityAnalysisResult = useMemo(() => {
        return (
            <Paper className={classes.table}>
                <SecurityAnalysisResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                    openVoltageLevelDiagram={openVoltageLevelDiagram}
                />
            </Paper>
        );
    }, [studyUuid, currentNode, classes, openVoltageLevelDiagram]);

    const renderVoltageInitResult = useMemo(() => {
        return (
            <Paper className={classes.table}>
                <VoltageInitResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                />
            </Paper>
        );
    }, [studyUuid, currentNode, classes]);

    const renderSensitivityAnalysisResult = useMemo(() => {
        return (
            <Paper className={classes.analysisResult}>
                <SensitivityAnalysisResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id!}
                />
            </Paper>
        );
    }, [studyUuid, currentNode, classes]);

    const renderShortCircuitAnalysisResult = useMemo(() => {
        return (
            <Paper className={classes.analysisResult}>
                <ShortCircuitAnalysisResultTab
                    resultTabIndexRedirection={resultTabIndexRedirection}
                />
            </Paper>
        );
    }, [classes, resultTabIndexRedirection]);

    const renderDynamicSimulationResult = useMemo(() => {
        return (
            <Paper className={classes.analysisResult}>
                <DynamicSimulationResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                />
            </Paper>
        );
    }, [studyUuid, currentNode, classes]);

    const services: IService[] = useMemo(() => {
        return [
            {
                id: 'LoadFlow',
                label: 'LoadFlow',
                displayed: true,
                renderResult: renderLoadFlowResult,
            },
            {
                id: 'SecurityAnalysis',
                label: 'SecurityAnalysis',
                displayed:
                    securityAnalysisAvailability === OptionalServicesStatus.Up,
                renderResult: renderSecurityAnalysisResult,
            },
            {
                id: 'SensitivityAnalysis',
                label: 'SensitivityAnalysis',
                displayed: !sensitivityAnalysisUnavailability,
                renderResult: renderSensitivityAnalysisResult,
            },
            {
                id: 'ShortCircuit',
                label: 'ShortCircuitAnalysis',
                displayed:
                    enableDeveloperMode &&
                    shortCircuitAvailability === OptionalServicesStatus.Up,
                renderResult: renderShortCircuitAnalysisResult,
            },
            {
                id: 'DynamicSimulation',
                label: 'DynamicSimulation',
                displayed:
                    enableDeveloperMode &&
                    dynamicSimulationAvailability === OptionalServicesStatus.Up,
                renderResult: renderDynamicSimulationResult,
            },
            {
                id: 'VoltageInit',
                label: 'VoltageInit',
                displayed:
                    enableDeveloperMode &&
                    voltageInitAvailability === OptionalServicesStatus.Up,
                renderResult: renderVoltageInitResult,
            },
        ];
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
            service.displayed && (
                <Tab
                    key={service.id + 'tab'}
                    label={intl.formatMessage({
                        id: service.label,
                    })}
                    disabled={disabled}
                />
            )
        );
    };
    const renderTabPanelLazy = (service: IService): React.ReactNode => {
        return (
            <>
                {service.displayed && (
                    <TabPanelLazy
                        key={service.id + 'tabPanel'}
                        className={classes.tabPanel}
                        selected={!disabled}
                    >
                        {service.renderResult}
                    </TabPanelLazy>
                )}
            </>
        );
    };

    const selectedService = useMemo(() => {
        const displayedServices = services.filter(
            (service) => service.displayed
        );
        const result = displayedServices.find(
            (service, key) => tabIndex === key
        );

        return result!;
    }, [services, tabIndex]);

    useEffect(() => {
        if (!enableDeveloperMode) {
            // a displayed tab may be obsolete when developer mode is disabled, then switch on first one
            setTabIndex(0);
        }
    }, [enableDeveloperMode]);

    return (
        <Paper className={clsx('singlestretch-child', classes.table)}>
            <div className={classes.div}>
                <Tabs
                    value={tabIndex}
                    variant="scrollable"
                    onChange={(event, newTabIndex) => setTabIndex(newTabIndex)}
                >
                    {services.map((service) => renderTab(service))}
                </Tabs>
                {disabled && <AlertInvalidNode />}
            </div>
            {renderTabPanelLazy(selectedService)}
        </Paper>
    );
};
