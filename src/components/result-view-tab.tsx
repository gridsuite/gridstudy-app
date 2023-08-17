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
import { OptionalServicesNames } from './utils/optional-services';
import { isUnavailableService } from './utils/utils';
import { useSelector } from 'react-redux';
import { ReduxState } from '../redux/reducer.type';

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
    studyUuid: string;
    currentNode: Partial<{ id: string }>;
    openVoltageLevelDiagram: any;
    resultTabIndexRedirection: ResultTabIndexRedirection;
    disabled: boolean;
}

interface IService {
    id: string;
    label: string;
    isUnavailable: boolean;
    enableDeveloperMode: boolean;
    renderResult: React.ReactElement;
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
    const unavailableOptionalServices = useSelector(
        (state: ReduxState) => state.unavailableOptionalServices
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
                isUnavailable: false,
                enableDeveloperMode: true,
                renderResult: renderLoadFlowResult,
            },
            {
                id: 'SecurityAnalysis',
                label: 'SecurityAnalysis',
                isUnavailable: isUnavailableService(
                    unavailableOptionalServices,
                    OptionalServicesNames.SecurityAnalysis
                ),
                enableDeveloperMode: true,
                renderResult: renderSecurityAnalysisResult,
            },
            {
                id: 'SensitivityAnalysis',
                label: 'SensitivityAnalysis',
                isUnavailable: isUnavailableService(
                    unavailableOptionalServices,
                    OptionalServicesNames.SensitivityAnalysis
                ),
                enableDeveloperMode: true,
                renderResult: renderSensitivityAnalysisResult,
            },
            {
                id: 'ShortCircuit',
                label: 'ShortCircuitAnalysis',
                isUnavailable: isUnavailableService(
                    unavailableOptionalServices,
                    OptionalServicesNames.ShortCircuit
                ),
                enableDeveloperMode: enableDeveloperMode,
                renderResult: renderShortCircuitAnalysisResult,
            },
            {
                id: 'DynamicSimulation',
                label: 'DynamicSimulation',
                isUnavailable: isUnavailableService(
                    unavailableOptionalServices,
                    OptionalServicesNames.DynamicSimulation
                ),
                enableDeveloperMode: enableDeveloperMode,
                renderResult: renderDynamicSimulationResult,
            },
            {
                id: 'VoltageInit',
                label: 'VoltageInit',
                isUnavailable: isUnavailableService(
                    unavailableOptionalServices,
                    OptionalServicesNames.VoltageInit
                ),
                enableDeveloperMode: enableDeveloperMode,
                renderResult: renderVoltageInitResult,
            },
        ];
    }, [
        unavailableOptionalServices,
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
            !service.isUnavailable &&
            service.enableDeveloperMode && (
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
    const renderTabPanelLazy: (service: IService) => React.ReactElement = (
        service: IService
    ) => {
        return (
            <>
                {!service.isUnavailable && (
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
        const displayedServices: IService[] = services.filter(
            (service) => !service.isUnavailable
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
