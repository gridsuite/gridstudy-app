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
import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const TABS = [
    {
        id: 'loadFlowResults',
        CompFunc: LoadFlowResult,
    },
    {
        id: 'securityAnalysisResults',
        CompFunc: SecurityAnalysisResultTab,
    },
    {
        id: 'ShortCircuitAnalysisResults',
        CompFunc: ShortCircuitAnalysisResultTab,
        needsDeveloperMode: true,
    },
    {
        id: 'sensitivityAnalysisResults',
        CompFunc: SensitivityAnalysisResultTab,
        // needsDeveloperMode: true,
    },
    {
        id: 'DynamicSimulationResults',
        CompFunc: DynamicSimulationResultTab,
        needsDeveloperMode: true,
    },
];

const useSameNode = (studyUuid, nodeUuid) => {
    const ref = useRef();
    const [next, prev] = [{ studyUuid, nodeUuid }, ref.current];
    const same =
        next.studyUuid === prev?.studyUuid && next.nodeUuid === prev?.nodeUuid;
    ref.current = next;
    return same;
};

/**
 * control results views
 * @param studyUuid : string uuid of study
 * @param currentNode : object current node
 * @param loadFlowInfos : object result of load flow
 * @param network : object network
 * @param openVoltageLevelDiagram : function
 * @param visible : boolean
 * @returns {JSX.Element}
 * @constructor
 */
export const ResultViewTab = ({
    studyUuid,
    currentNode,
    loadFlowInfos,
    network,
    openVoltageLevelDiagram,
    visible,
    disabled,
}) => {
    const [tabIndex, setTabIndex] = useState(0);
    const sameNode = useSameNode(studyUuid, currentNode?.id);

    const classes = useStyles();

    const intl = useIntl();

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const selectionableIndices = useMemo(
        () =>
            TABS.map((entry, index) =>
                !entry.needsDeveloperMode || enableDeveloperMode ? index : null
            ).filter((visibleIndex) => visibleIndex !== null),
        [enableDeveloperMode]
    );

    const makeTabWidgetJsx = (entry) => {
        return (
            (!entry.needsDeveloperMode || enableDeveloperMode) && (
                <Tab
                    key={entry.id}
                    label={intl.formatMessage({ id: entry.id })}
                    disabled={disabled}
                />
            )
        );
    };

    const makeTabPaneJsx = (key, CompFunc, needsDeveloperMode, selected) => {
        return (
            (!needsDeveloperMode || enableDeveloperMode) && (
                <TabPanelLazy
                    key={key}
                    mounts={selected && visible}
                    canKeepMounted={sameNode}
                    className={classes.tabPanel}
                >
                    <Paper className={classes.table}>
                        {/* we are generous and give the union of needed parameters,
                           each Component uses only what it needs */}
                        <CompFunc
                            studyUuid={studyUuid}
                            nodeUuid={currentNode?.id}
                            network={network}
                            openVoltageLevelDiagram={openVoltageLevelDiagram}
                            result={loadFlowInfos?.loadFlowResult}
                        />
                    </Paper>
                </TabPanelLazy>
            )
        );
    };

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
                    {TABS.map((entry) => makeTabWidgetJsx(entry))}
                </Tabs>
                {disabled && <AlertInvalidNode />}
            </div>
            {/* tab contents */}
            {TABS.map((entry, index) =>
                makeTabPaneJsx(
                    entry.id,
                    entry.CompFunc,
                    entry.needsDeveloperMode,
                    selectionableIndices[tabIndex] === index
                )
            )}
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
