/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Paper from '@mui/material/Paper';
import { ReportViewer, useSnackMessage } from '@gridsuite/commons-ui';
import PropTypes from 'prop-types';
import WaitingLoader from './utils/waiting-loader';
import AlertCustomMessageNode from './utils/alert-custom-message-node';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { fetchReport } from '../services/study';
import { Box } from '@mui/system';
import { useComputationNotificationCount } from '../hooks/use-computation-notification-count';

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

    const notificationsCount = useComputationNotificationCount();

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

    const setNodeName = useCallback(
        (report) => {
            report.defaultName =
                report.taskKey === 'Root'
                    ? report.taskKey
                    : nodesNames.get(report.taskKey);
            return report;
        },
        [nodesNames]
    );

    const fetchAndProcessReport = useCallback(
        (studyId, currentNode) => {
            setWaitingLoadReport(true);
            fetchReport(studyId, currentNode.id, nodeOnlyReport)
                .then((fetchedReport) => {
                    if (fetchedReport.length === 1) {
                        setReport(setNodeName(fetchedReport[0]));
                    } else {
                        let globalReport = {
                            taskKey: 'root',
                            defaultName: 'Logs',
                            taskValues: {},
                            reports: [],
                            subReporters: fetchedReport.map((r) =>
                                setNodeName(r)
                            ),
                        };
                        setReport(globalReport);
                    }
                })
                .catch((error) => snackError({ messageTxt: error.message }))
                .finally(() => {
                    setWaitingLoadReport(false);
                });
        },
        [nodeOnlyReport, setNodeName, snackError]
    );

    // This useEffect is responsible for updating the reports when the user goes to the LOGS tab
    // and when the application receives a notification.
    useEffect(() => {
        // Visible and !disabled ensure that the user has the LOGS tab open and the current node is built.
        if (visible && !disabled) {
            fetchAndProcessReport(studyId, currentNode);
        }
    }, [
        visible,
        studyId,
        currentNode,
        nodesNames,
        setNodeName,
        nodeOnlyReport,
        disabled,
        snackError,
        fetchAndProcessReport,
    ]);

    useEffect(() => {
        if (visible && !disabled && notificationsCount > 0) {
            fetchAndProcessReport(studyId, currentNode);
        }
    }, [
        visible,
        studyId,
        currentNode,
        nodesNames,
        setNodeName,
        nodeOnlyReport,
        disabled,
        snackError,
        notificationsCount,
        fetchAndProcessReport,
    ]);

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
                {!!report && !disabled && <ReportViewer jsonReport={report} />}
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
