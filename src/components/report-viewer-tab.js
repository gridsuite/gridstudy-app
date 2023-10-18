/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Paper from '@mui/material/Paper';
import { useSnackMessage } from '@gridsuite/commons-ui';
import ReportViewer from '../components/ReportViewer';
import PropTypes from 'prop-types';
import WaitingLoader from './utils/waiting-loader';
import AlertCustomMessageNode from './utils/alert-custom-message-node';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import {
    fetchAllNodesReportElements,
    fetchNodeReportTree,
    fetchReporterElements,
    fetchSingleNodeReportElements,
} from '../services/study';
import { Box } from '@mui/system';

const styles = {
    div: {
        display: 'flex',
    },
    reportOnlyNode: {
        margin: '5px',
    },
};

/**
 * control the ReportViewer (fetch and waiting)
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

    const loadflowNotif = useSelector((state) => state.loadflowNotif);
    const saNotif = useSelector((state) => state.saNotif);
    const voltageInitNotif = useSelector((state) => state.voltageInitNotif);
    const sensiNotif = useSelector((state) => state.sensiNotif);
    const allBusesShortCircuitNotif = useSelector(
        (state) => state.allBusesShortCircuitNotif
    );
    const dynamicSimulationNotif = useSelector(
        (state) => state.dynamicSimulationNotif
    );
    const oneBusShortCircuitNotif = useSelector(
        (state) => state.oneBusShortCircuitNotif
    );

    const [report, setReport] = useState(null);
    const [waitingLoadReport, setWaitingLoadReport] = useState(false);
    const { snackError } = useSnackMessage();
    const [nodeOnlyReport, setNodeOnlyReport] = useState(true);

    const handleChangeValue = useCallback((event) => {
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
            if (report.taskKey === 'Root') {
                report.taskKey = rootNodeId;
            } else {
                report.defaultName = nodesNames.get(report.taskKey);
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
                } else {
                    return {
                        taskKey: 'Logs',
                        defaultName: 'Logs',
                        taskValues: {
                            globalReport: {
                                value: true,
                                type: 'UNTYPED',
                            },
                        },
                        reports: [],
                        subReporters: reportData.map((r) => setNodeName(r)),
                    };
                }
            }
        },
        [setNodeName]
    );

    const fetchAndProcessReport = useCallback(
        (studyId, currentNode) => {
            setWaitingLoadReport(true);
            fetchNodeReportTree(studyId, currentNode.id, nodeOnlyReport)
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
    }, [
        visible,
        studyId,
        currentNode,
        disabled,
        saNotif,
        loadflowNotif,
        voltageInitNotif,
        sensiNotif,
        allBusesShortCircuitNotif,
        dynamicSimulationNotif,
        fetchAndProcessReport,
        oneBusShortCircuitNotif,
    ]);

    const nodeElementsPromise = (nodeId, reportId, severityFilterList) => {
        return fetchSingleNodeReportElements(
            studyId,
            nodeId,
            reportId,
            severityFilterList
        );
    };

    const allLogsElementsPromise = (severityFilterList) => {
        return fetchAllNodesReportElements(
            studyId,
            currentNode.id,
            severityFilterList
        );
    };

    const reporterElementsPromise = (reporterId, severityFilterList) => {
        return fetchReporterElements(
            studyId,
            currentNode.id,
            reporterId,
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
                                onChange={(e) => handleChangeValue(e)}
                                disabled={disabled}
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
                        visible={visible && !disabled}
                        makeSingleReport={makeSingleReport}
                        reporterElementsPromise={reporterElementsPromise}
                        nodeElementsPromise={nodeElementsPromise}
                        allLogsElementsPromise={allLogsElementsPromise}
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
