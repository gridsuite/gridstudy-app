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
import LoadFlowResult from './loadflow-result';
import makeStyles from '@mui/styles/makeStyles';
import { useIntl } from 'react-intl';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { SecurityAnalysisResultTab } from './security-analysis-result-tab';
import { SensitivityAnalysisResultTab } from './sensitivity-analysis-result-tab';
import { ShortCircuitAnalysisResultTab } from './shortcircuit-analysis-result-tab';
import AlertInvalidNode from './util/alert-invalid-node';
import { PARAM_DEVELOPER_MODE } from '../utils/config-params';
import { useParameterState } from './dialogs/parameters/parameters';
import DynamicSimulationResultTab from './results/dynamicsimulation/dynamic-simulation-result-tab';
import TabPanelLazy from './results/common/tab-panel-lazy';

const useStyles = makeStyles((theme) => ({
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

const ResultTabIds = {
    LOAD_FLOW: 'loadFlowResults',
    SECURITY_ANALYSIS: 'securityAnalysisResults',
    SHORT_CIRCUIT_ANALYSIS: 'ShortCircuitAnalysisResults',
    SENSITIVITY_ANALYSIS: 'sensitivityAnalysisResults',
    DYNAMIC_SIMULATION: 'DynamicSimulationResults',
};

/**
 * control results views
 * @param studyUuid : string uuid of study
 * @param currentNode : object current node
 * @param loadFlowInfos : object result of load flow
 * @param network : object network
 * @param openVoltageLevelDiagram : function
 * @returns {JSX.Element}
 * @constructor
 */
export const ResultViewTab = ({
    studyUuid,
    currentNode,
    loadFlowInfos,
    network,
    openVoltageLevelDiagram,
    disabled,
}) => {
    const [tabId, setTabId] = useState(ResultTabIds.LOAD_FLOW);

    const classes = useStyles();

    const intl = useIntl();

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    function renderLoadFlowResult() {
        return (
            <Paper className={classes.table}>
                <LoadFlowResult result={loadFlowInfos?.loadFlowResult} />
            </Paper>
        );
    }

    function renderSecurityAnalysisResult() {
        return (
            <Paper className={classes.table}>
                <SecurityAnalysisResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                    network={network}
                    openVoltageLevelDiagram={openVoltageLevelDiagram}
                />
            </Paper>
        );
    }

    function renderSensitivityAnalysisResult() {
        return (
            <Paper className={classes.analysisResult}>
                <SensitivityAnalysisResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                />
            </Paper>
        );
    }

    function renderShortCircuitAnalysisResult() {
        return (
            <Paper className={classes.analysisResult}>
                <ShortCircuitAnalysisResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                />
            </Paper>
        );
    }

    function renderDynamicSimulationResult() {
        return (
            <Paper className={classes.analysisResult}>
                <DynamicSimulationResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                />
            </Paper>
        );
    }

    useEffect(() => {
        if (!enableDeveloperMode) {
            // a displayed tab may be obsolete when developer mode is disabled, then switch on first one
            setTabId(ResultTabIds.LOAD_FLOW);
        }
    }, [enableDeveloperMode]);

    return (
        <Paper className={clsx('singlestretch-child', classes.table)}>
            <div className={classes.div}>
                <Tabs
                    value={tabId}
                    onChange={(event, newTabId) => setTabId(newTabId)}
                >
                    <Tab
                        label={intl.formatMessage({
                            id: ResultTabIds.LOAD_FLOW,
                        })}
                        value={ResultTabIds.LOAD_FLOW}
                        disabled={disabled}
                    />
                    <Tab
                        label={intl.formatMessage({
                            id: ResultTabIds.SECURITY_ANALYSIS,
                        })}
                        value={ResultTabIds.SECURITY_ANALYSIS}
                        disabled={disabled}
                    />
                    {enableDeveloperMode && (
                        <Tab
                            label={intl.formatMessage({
                                id: ResultTabIds.SHORT_CIRCUIT_ANALYSIS,
                            })}
                            value={ResultTabIds.SHORT_CIRCUIT_ANALYSIS}
                            disabled={disabled}
                        />
                    )}
                    {enableDeveloperMode && (
                        <Tab
                            label={intl.formatMessage({
                                id: ResultTabIds.SENSITIVITY_ANALYSIS,
                            })}
                            value={ResultTabIds.SENSITIVITY_ANALYSIS}
                            disabled={disabled}
                        />
                    )}
                    {enableDeveloperMode && (
                        <Tab
                            label={intl.formatMessage({
                                id: ResultTabIds.DYNAMIC_SIMULATION,
                            })}
                            value={ResultTabIds.DYNAMIC_SIMULATION}
                            disabled={disabled}
                        />
                    )}
                </Tabs>
                {disabled && <AlertInvalidNode />}
            </div>
            {/* tab contents */}
            <TabPanelLazy
                key={`${ResultTabIds.LOAD_FLOW}-${currentNode?.id}`}
                className={classes.tabPanel}
                selected={tabId === ResultTabIds.LOAD_FLOW && !disabled}
            >
                {renderLoadFlowResult()}
            </TabPanelLazy>
            <TabPanelLazy
                key={`${ResultTabIds.SECURITY_ANALYSIS}-${currentNode?.id}`}
                className={classes.tabPanel}
                selected={tabId === ResultTabIds.SECURITY_ANALYSIS && !disabled}
            >
                {renderSecurityAnalysisResult()}
            </TabPanelLazy>
            <TabPanelLazy
                key={`${ResultTabIds.SHORT_CIRCUIT_ANALYSIS}-${currentNode?.id}`}
                className={classes.tabPanel}
                selected={
                    tabId === ResultTabIds.SHORT_CIRCUIT_ANALYSIS && !disabled
                }
            >
                {renderShortCircuitAnalysisResult()}
            </TabPanelLazy>
            <TabPanelLazy
                key={`${ResultTabIds.SENSITIVITY_ANALYSIS}-${currentNode?.id}`}
                className={classes.tabPanel}
                selected={
                    tabId === ResultTabIds.SENSITIVITY_ANALYSIS && !disabled
                }
            >
                {renderSensitivityAnalysisResult()}
            </TabPanelLazy>
            <TabPanelLazy
                key={`${ResultTabIds.DYNAMIC_SIMULATION}-${currentNode?.id}`}
                className={classes.tabPanel}
                selected={
                    tabId === ResultTabIds.DYNAMIC_SIMULATION && !disabled
                }
            >
                {renderDynamicSimulationResult()}
            </TabPanelLazy>
        </Paper>
    );
};

ResultViewTab.propTypes = {
    loadFlowInfos: PropTypes.object,
    network: PropTypes.object,
    openVoltageLevelDiagram: PropTypes.func.isRequired,
    currentNode: PropTypes.object,
    studyUuid: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
};
