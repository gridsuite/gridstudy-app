/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Paper from '@mui/material/Paper';
import ReportViewer from './report-viewer/report-viewer';
import PropTypes from 'prop-types';
import WaitingLoader from './utils/waiting-loader';
import AlertCustomMessageNode from './utils/alert-custom-message-node';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Box } from '@mui/system';
import { useReportFetcher } from '../hooks/use-report-fetcher';
import { COMPUTING_AND_NETWORK_MODIFICATION_TYPE } from '../constants/report.constant';
import { ROOT_NODE_LABEL } from '../constants/node.constant';

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
export const ReportViewerTab = ({ visible, currentNode, disabled }) => {
    const [report, setReport] = useState();
    const [nodeOnlyReport, setNodeOnlyReport] = useState(true);
    const treeModel = useSelector((state) => state.networkModificationTreeModel);
    const intl = useIntl();
    const [isReportLoading, fetchReport] = useReportFetcher(
        COMPUTING_AND_NETWORK_MODIFICATION_TYPE.NETWORK_MODIFICATION
    );

    const handleChangeNodeOnlySwitch = useCallback((event) => {
        setNodeOnlyReport(event.target.checked);
    }, []);

    const rootNodeId = useMemo(() => {
        const rootNode = treeModel.treeNodes.find((node) => node?.data?.label === ROOT_NODE_LABEL);
        return rootNode?.id;
    }, [treeModel]);

    // This useEffect is responsible for updating the reports when the user goes to the LOGS tab
    // and when the application receives a notification.
    useEffect(() => {
        // Visible and !disabled ensure that the user has the LOGS tab open and the current node is built.
        if (visible && !disabled) {
            fetchReport(nodeOnlyReport).then((r) => {
                if (r !== undefined) {
                    setReport(r);
                }
            });
        }
        // It is important to keep the notifications in the useEffect's dependencies (even if it is not
        // apparent that they are used) to trigger the update of reports when a notification happens.
    }, [visible, currentNode, disabled, fetchReport, nodeOnlyReport]);

    return (
        <WaitingLoader loading={isReportLoading} message={'loadingReport'}>
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
                                disabled={disabled || rootNodeId === currentNode?.id}
                            />
                        }
                        label={intl.formatMessage({
                            id: 'LogOnlySingleNode',
                        })}
                    />
                    {disabled && <AlertCustomMessageNode message={'InvalidNode'} />}
                </Box>
                {!!report && !disabled && (
                    <ReportViewer
                        report={report}
                        reportType={COMPUTING_AND_NETWORK_MODIFICATION_TYPE.NETWORK_MODIFICATION}
                    />
                )}
            </Paper>
        </WaitingLoader>
    );
};

ReportViewerTab.propTypes = {
    visible: PropTypes.bool,
    currentNode: PropTypes.object,
    disabled: PropTypes.bool,
};
