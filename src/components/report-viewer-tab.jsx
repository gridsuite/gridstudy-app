/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReportViewer from './report-viewer/report-viewer';
import PropTypes from 'prop-types';
import WaitingLoader from './utils/waiting-loader';
import AlertCustomMessageNode from './utils/alert-custom-message-node';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { useReportFetcher } from '../hooks/use-report-fetcher';
import { COMPUTING_AND_NETWORK_MODIFICATION_TYPE } from '../utils/report/report.constant';
import { ROOT_NODE_LABEL } from '../constants/node.constant';
import { ReportType } from 'utils/report/report.type';
import { sortSeverityList } from 'utils/report/report-severity';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Paper, Switch } from '@mui/material';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import { isStudyNotification } from '../types/notification-types';
import { NodeType } from './graph/tree-node.type';

const styles = {
    div: {
        display: 'flex',
        flexShrink: 0,
    },
    reportOnlyNode: {
        margin: '5px',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
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
export const ReportViewerTab = ({ visible, currentNode, disabled }) => {
    const [report, setReport] = useState();
    const [severities, setSeverities] = useState();
    const [nodeOnlyReport, setNodeOnlyReport] = useState(true);
    const [resetFilters, setResetFilters] = useState(false);
    const treeModel = useSelector((state) => state.networkModificationTreeModel);
    const currentRootNetworkUuid = useSelector((state) => state.currentRootNetworkUuid);
    const intl = useIntl();
    const [isReportLoading, fetchReport, fetchReportSeverities] = useReportFetcher(
        COMPUTING_AND_NETWORK_MODIFICATION_TYPE.NETWORK_MODIFICATION
    );

    const isRootNode = currentNode?.type === NodeType.ROOT;
    useEffect(() => {
        if (isRootNode) {
            setNodeOnlyReport(true);
        }
    }, [isRootNode]);

    const handleChangeNodeOnlySwitch = useCallback((event) => {
        setNodeOnlyReport(event.target.checked);
        setResetFilters(true);
    }, []);

    useEffect(() => {
        if (resetFilters && severities) {
            setResetFilters(false);
        }
    }, [resetFilters, severities]);

    const rootNodeId = useMemo(() => {
        const rootNode = treeModel.treeNodes.find((node) => node?.data?.label === ROOT_NODE_LABEL);
        return rootNode?.id;
    }, [treeModel]);

    const fetchReportAndSeverities = useCallback(() => {
        fetchReport(nodeOnlyReport).then((r) => {
            if (r !== undefined) {
                setReport(r);
                fetchReportSeverities(r.id, r.parentId ? ReportType.NODE : ReportType.GLOBAL).then((severities) => {
                    setSeverities(sortSeverityList(severities));
                });
            }
        });
    }, [fetchReport, nodeOnlyReport, fetchReportSeverities]);

    // Listen for STUDY notifications
    const handleNotification = useCallback(
        (event) => {
            const eventData = JSON.parse(event.data);
            if (
                visible &&
                !disabled &&
                isStudyNotification(eventData) &&
                eventData.headers.rootNetworkUuid === currentRootNetworkUuid &&
                eventData.headers.node === currentNode?.id
            ) {
                fetchReportAndSeverities();
            }
        },
        [visible, disabled, currentRootNetworkUuid, currentNode?.id, fetchReportAndSeverities]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, { listenerCallbackMessage: handleNotification });

    // This useEffect is responsible for updating the reports when the user opens the LOGS panel
    useEffect(() => {
        if (isRootNode && !nodeOnlyReport) {
            return;
        }
        // Visible and !disabled ensure that the user has the LOGS tab open and the current node is built.
        if (visible && !disabled) {
            fetchReportAndSeverities();
        } else {
            // if the user unbuilds a node, the report needs to be reset.
            // otherwise, the report will be kept in the state and useless report fetches with previous id will be made when the user rebuilds the node.
            setReport();
            setSeverities();
        }
    }, [visible, currentNode.id, disabled, nodeOnlyReport, fetchReportAndSeverities, isRootNode]);

    return (
        <>
            {disabled && <AlertCustomMessageNode message={{ descriptor: { id: 'InvalidNode' } }} />}
            {!disabled && !!report && (
                <WaitingLoader loading={isReportLoading} message={'loadingReport'}>
                    <Paper sx={styles.container}>
                        <FormControlLabel
                            sx={styles.reportOnlyNode}
                            control={
                                <Switch
                                    checked={nodeOnlyReport}
                                    inputProps={{
                                        'aria-label': 'primary checkbox',
                                    }}
                                    onChange={(e) => handleChangeNodeOnlySwitch(e)}
                                    disabled={disabled || rootNodeId === currentNode?.id}
                                />
                            }
                            label={intl.formatMessage({
                                id: 'LogOnlySingleNode',
                            })}
                        />
                        <ReportViewer
                            report={report}
                            reportType={COMPUTING_AND_NETWORK_MODIFICATION_TYPE.NETWORK_MODIFICATION}
                            severities={severities}
                            resetFilters={resetFilters}
                        />
                    </Paper>
                </WaitingLoader>
            )}
        </>
    );
};

ReportViewerTab.propTypes = {
    visible: PropTypes.bool,
    currentNode: PropTypes.object,
    disabled: PropTypes.bool,
};
