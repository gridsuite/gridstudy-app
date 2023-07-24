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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { SecurityAnalysisResultTab } from './security-analysis-result-tab';
import { ShortCircuitAnalysisResultTab } from './results/shortcircuit/shortcircuit-analysis-result-tab';
import AlertInvalidNode from './utils/alert-invalid-node';
import {
    AVAILABLE_SERVICES,
    PARAM_DEVELOPER_MODE,
} from '../utils/config-params';
import { useParameterState } from './dialogs/parameters/parameters';
import DynamicSimulationResultTab from './results/dynamicsimulation/dynamic-simulation-result-tab';
import TabPanelLazy from './results/common/tab-panel-lazy';
import { VoltageInitResultTab } from './voltage-init-result-tab';
import { ResultsTabsLevel, useResultsTab } from './results/use-results-tab';
import { LoadFlowResultTab } from './loadflow-result-tab';
import SensitivityAnalysisResultTab from './results/sensitivity-analysis/sensitivity-analysis-result-tab';

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

/**
 * control results views
 * @param studyUuid : string uuid of study
 * @param currentNode : object current node
 * @param openVoltageLevelDiagram : function
 * @param resultTabIndexRedirection : redirection to specific tab [RootTab, LevelOneTab, ...]
 * @param disabled
 * @returns {JSX.Element}
 * @constructor
 */
export const ResultViewTab = ({
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
    const [availableServices] = useParameterState(AVAILABLE_SERVICES);

    const isAvailable = useCallback(
        (tab) => {
            return !!availableServices.includes(tab);
        },
        [availableServices]
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
                    nodeUuid={currentNode?.id}
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
    }, [studyUuid, currentNode, classes]);

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

    const services = useMemo(() => {
        return [
            {
                id: 'LoadFlow',
                label: 'LoadFlow',
                isAvailable: true,
                enableDeveloperMode: true,
                renderResult: renderLoadFlowResult,
            },
            {
                id: 'SecurityAnalysis',
                label: 'SecurityAnalysis',
                isAvailable: isAvailable('SecurityAnalysis'),
                enableDeveloperMode: true,
                renderResult: renderSecurityAnalysisResult,
            },
            {
                id: 'SensitivityAnalysis',
                label: 'SensitivityAnalysis',
                isAvailable: isAvailable('SensitivityAnalysis'),
                enableDeveloperMode: true,
                renderResult: renderSensitivityAnalysisResult,
            },
            {
                id: 'ShortCircuit',
                label: 'ShortCircuitAnalysis',
                isAvailable: isAvailable('ShortCircuit'),
                enableDeveloperMode: enableDeveloperMode,
                renderResult: renderShortCircuitAnalysisResult,
            },
            {
                id: 'DynamicSimulation',
                label: 'DynamicSimulation',
                isAvailable: isAvailable('DynamicSimulation'),
                enableDeveloperMode: enableDeveloperMode,
                renderResult: renderDynamicSimulationResult,
            },
            {
                id: 'VoltageInit',
                label: 'VoltageInit',
                isAvailable: isAvailable('VoltageInit'),
                enableDeveloperMode: enableDeveloperMode,
                renderResult: renderVoltageInitResult,
            },
        ];
    }, [
        isAvailable,
        enableDeveloperMode,
        renderDynamicSimulationResult,
        renderSecurityAnalysisResult,
        renderSensitivityAnalysisResult,
        renderShortCircuitAnalysisResult,
        renderVoltageInitResult,
        renderLoadFlowResult,
    ]);

    const renderTab = (service) => {
        return (
            service.isAvailable &&
            service.enableDeveloperMode && (
                <Tab
                    key={service.id}
                    label={intl.formatMessage({
                        id: service.label,
                    })}
                    disabled={disabled}
                />
            )
        );
    };
    const renderTabPanelLazy = (service) => {
        return (
            service.isAvailable && (
                <TabPanelLazy
                    key={service.id}
                    className={classes.tabPanel}
                    selected={!disabled}
                >
                    {service.renderResult}
                </TabPanelLazy>
            )
        );
    };

    const selectedService = useMemo(() => {
        const displayedServices = services.filter(
            (service) => service.isAvailable
        );
        return displayedServices.find((service, key) => tabIndex === key);
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

ResultViewTab.propTypes = {
    openVoltageLevelDiagram: PropTypes.func.isRequired,
    currentNode: PropTypes.object,
    studyUuid: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
};
