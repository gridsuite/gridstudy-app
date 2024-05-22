/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Paper from '@mui/material/Paper';
import { useSnackMessage } from '@gridsuite/commons-ui';
import ReportViewer from './report-viewer/report-viewer';
import PropTypes from 'prop-types';
import WaitingLoader from './utils/waiting-loader';
import AlertCustomMessageNode from './utils/alert-custom-message-node';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import {
    fetchNodeReport,
    fetchParentNodesReport,
    fetchSubReport,
} from '../services/study';
import { Box } from '@mui/system';
import { GLOBAL_NODE_TASK_KEY } from './report-viewer/report-viewer';
import LogReportItem from './report-viewer/log-report-item';
import { REPORT_TYPES } from './utils/report-type';

const styles = {
    div: {
        display: 'flex',
    },
    reportOnlyNode: {
        margin: '5px',
    },
};

/**
 * control the report-viewer (fetch and waiting)
 * @param studyId : string study id
 * @param visible : boolean window visible
 * @param currentNode : object visualized node
 * @param disabled : boolean disabled
 * @returns {*} node
 * @constructor
 */
export const ReportViewerTab = ({
    studyId,
    visible,
    currentNode,
    disabled,
}) => {
    const intl = useIntl();

    const treeModel = useSelector(
        (state) => state.networkModificationTreeModel
    );

    const [report, setReport] = useState(null);
    const [waitingLoadReport, setWaitingLoadReport] = useState(false);
    const { snackError } = useSnackMessage();
    const [nodeOnlyReport, setNodeOnlyReport] = useState(true);

    const handleChangeNodeOnlySwitch = useCallback((event) => {
        setNodeOnlyReport(event.target.checked);
    }, []);

    const nodesNames = useMemo(() => {
        return new Map(
            treeModel.treeNodes.map((node) => [node.id, node.data.label])
        );
    }, [treeModel]);

    const rootNodeId = useMemo(() => {
        const rootNode = treeModel.treeNodes.find(
            (node) => node?.data?.label === 'Root'
        );
        return rootNode?.id;
    }, [treeModel]);

    const setNodeName = useCallback(
        (report) => {
            if (report.messageKey === 'Root') {
                report.messageKey = rootNodeId;
            } else {
                report.messageTemplate = nodesNames.get(report.messageKey);
            }
            return report;
        },
        [nodesNames, rootNodeId]
    );

    const makeSingleReport = useCallback(
        (reportData) => {
            if (!Array.isArray(reportData)) {
                return setNodeName(reportData);
            } else {
                if (reportData.length === 1) {
                    return setNodeName(reportData[0]);
                }
                return {
                    messageKey: GLOBAL_NODE_TASK_KEY,
                    messageTemplate: GLOBAL_NODE_TASK_KEY,
                    children: reportData.map((r) => setNodeName(r)),
                };
            }
        },
        [setNodeName]
    );

    const fetchAndProcessReport = useCallback(
        (studyId, currentNode) => {
            // use a timout to avoid having a loader in case of fast promise return (avoid blink)
            const timer = setTimeout(() => {
                setWaitingLoadReport(true);
            }, 700);

            fetchParentNodesReport(
                studyId,
                currentNode.id,
                nodeOnlyReport,
                LogReportItem.getDefaultSeverityList(),
                REPORT_TYPES.NETWORK_MODIFICATION
            )
                .then((fetchedReport) => {
                    setReport(makeSingleReport(fetchedReport));
                })
                .catch((error) => {
                    setReport();
                    snackError({
                        messageTxt: error.message,
                        headerId: 'ReportFetchError',
                    });
                })
                .finally(() => {
                    clearTimeout(timer);
                    setWaitingLoadReport(false);
                });
        },
        [nodeOnlyReport, snackError, makeSingleReport]
    );

    // This useEffect is responsible for updating the reports when the user goes to the LOGS tab
    // and when the application receives a notification.
    useEffect(() => {
        // Visible and !disabled ensure that the user has the LOGS tab open and the current node is built.
        if (visible && !disabled) {
            fetchAndProcessReport(studyId, currentNode);
        }
        // It is important to keep the notifications in the useEffect's dependencies (even if it is not
        // apparent that they are used) to trigger the update of reports when a notification happens.
    }, [visible, studyId, currentNode, disabled, fetchAndProcessReport]);

    const nodeReportPromise = (nodeId, reportId, severityFilterList) => {
        return fetchNodeReport(
            studyId,
            nodeId,
            reportId,
            severityFilterList,
            REPORT_TYPES.NETWORK_MODIFICATION
        );
    };

    const globalReportPromise = (severityFilterList) => {
        return fetchParentNodesReport(
            studyId,
            currentNode.id,
            false,
            severityFilterList,
            REPORT_TYPES.NETWORK_MODIFICATION
        );
    };

    const subReportPromise = (reportId, severityFilterList) => {
        return fetchSubReport(
            studyId,
            currentNode.id,
            reportId,
            severityFilterList
        );
    };

    return (
        <WaitingLoader loading={waitingLoadReport} message={'loadingReport'}>
            <Paper className={'singlestretch-child'}>
                <Box sx={styles.div}>
                    <FormControlLabel
                        sx={styles.reportOnlyNode}
                        control={
                            <Switch
                                checked={nodeOnlyReport}
                                inputProps={{
                                    'aria-label': 'primary checkbox',
                                }}
                                onChange={(e) => handleChangeNodeOnlySwitch(e)}
                                disabled={
                                    disabled || rootNodeId === currentNode?.id
                                }
                            />
                        }
                        label={intl.formatMessage({
                            id: 'LogOnlySingleNode',
                        })}
                    />
                    {disabled && (
                        <AlertCustomMessageNode message={'InvalidNode'} />
                    )}
                </Box>
                {!!report && !disabled && (
                    <ReportViewer
                        jsonReportTree={report}
                        subReportPromise={subReportPromise}
                        nodeReportPromise={nodeReportPromise}
                        globalReportPromise={globalReportPromise}
                    />
                )}
            </Paper>
        </WaitingLoader>
    );
};

ReportViewerTab.propTypes = {
    studyId: PropTypes.string,
    visible: PropTypes.bool,
    currentNode: PropTypes.object,
    disabled: PropTypes.bool,
};
