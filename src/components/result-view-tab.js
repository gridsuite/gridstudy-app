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
import AlertInvalidNode from './utils/alert-invalid-node';
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

/**
 * control results views
 * @param studyUuid : string uuid of study
 * @param currentNode : object current node
 * @param loadFlowInfos : object result of load flow
 * @param openVoltageLevelDiagram : function
 * @returns {JSX.Element}
 * @constructor
 */
export const ResultViewTab = ({
    studyUuid,
    currentNode,
    loadFlowInfos,
    openVoltageLevelDiagram,
    disabled,
}) => {
    const [tabIndex, setTabIndex] = useState(0);

    const classes = useStyles();

    const intl = useIntl();

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    function renderLoadFlowResult() {
        return (
            <Paper className={classes.table}>
                <LoadFlowResult
                    result={loadFlowInfos?.loadFlowResult}
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
                />
            </Paper>
        );
    }

    function renderSecurityAnalysisResult() {
        return (
            <Paper className={classes.table}>
                <SecurityAnalysisResultTab
                    studyUuid={studyUuid}
                    nodeUuid={currentNode?.id}
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
            setTabIndex(0);
        }
    }, [enableDeveloperMode]);

    return (
        <Paper className={clsx('singlestretch-child', classes.table)}>
            <div className={classes.div}>
                <Tabs
                    value={tabIndex}
                    onChange={(event, newTabIndex) => setTabIndex(newTabIndex)}
                >
                    <Tab
                        label={intl.formatMessage({
                            id: 'loadFlowResults',
                        })}
                        disabled={disabled}
                    />
                    <Tab
                        label={intl.formatMessage({
                            id: 'securityAnalysisResults',
                        })}
                        disabled={disabled}
                    />
                    {enableDeveloperMode && (
                        <Tab
                            label={intl.formatMessage({
                                id: 'ShortCircuitAnalysisResults',
                            })}
                            disabled={disabled}
                        />
                    )}
                    {enableDeveloperMode && (
                        <Tab
                            label={intl.formatMessage({
                                id: 'sensitivityAnalysisResults',
                            })}
                            disabled={disabled}
                        />
                    )}
                    {enableDeveloperMode && (
                        <Tab
                            label={intl.formatMessage({
                                id: 'DynamicSimulationResults',
                            })}
                            disabled={disabled}
                        />
                    )}
                </Tabs>
                {disabled && <AlertInvalidNode />}
            </div>
            {/* tab contents */}
            <TabPanelLazy
                className={classes.tabPanel}
                selected={tabIndex === 0 && !disabled}
            >
                {renderLoadFlowResult()}
            </TabPanelLazy>
            <TabPanelLazy
                className={classes.tabPanel}
                selected={tabIndex === 1 && !disabled}
            >
                {renderSecurityAnalysisResult()}
            </TabPanelLazy>
            <TabPanelLazy
                className={classes.tabPanel}
                selected={tabIndex === 2 && !disabled}
            >
                {renderShortCircuitAnalysisResult()}
            </TabPanelLazy>
            <TabPanelLazy
                className={classes.tabPanel}
                selected={tabIndex === 3 && !disabled}
            >
                {renderSensitivityAnalysisResult()}
            </TabPanelLazy>
            <TabPanelLazy
                className={classes.tabPanel}
                selected={tabIndex === 4 && !disabled}
            >
                {renderDynamicSimulationResult()}
            </TabPanelLazy>
        </Paper>
    );
};

ResultViewTab.propTypes = {
    loadFlowInfos: PropTypes.object,
    openVoltageLevelDiagram: PropTypes.func.isRequired,
    currentNode: PropTypes.object,
    studyUuid: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
};
