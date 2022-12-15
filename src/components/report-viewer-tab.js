/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchReport } from '../utils/rest-api';
import Paper from '@mui/material/Paper';
import clsx from 'clsx';
import { ReportViewer, useSnackMessage } from '@gridsuite/commons-ui';
import PropTypes from 'prop-types';
import WaitingLoader from './util/waiting-loader';
import AlertInvalidNode from './util/alert-invalid-node';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useIntl } from 'react-intl';
import makeStyles from '@mui/styles/makeStyles';
import { useSelector } from 'react-redux';

const useStyles = makeStyles(() => ({
    div: {
        display: 'flex',
    },
    reportOnlyNode: {
        margin: 5,
    },
}));

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
    const classes = useStyles();

    const treeModel = useSelector(
        (state) => state.networkModificationTreeModel
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

    useEffect(() => {
        if (visible && !disabled) {
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
                .catch((error) =>
                    snackError({
                        messageTxt: error.message,
                    })
                )
                .finally(() => {
                    setWaitingLoadReport(false);
                });
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
    ]);

    return (
        <WaitingLoader loading={waitingLoadReport} message={'loadingReport'}>
            <Paper className={clsx('singlestretch-child')}>
                <div className={classes.div}>
                    <FormControlLabel
                        className={classes.reportOnlyNode}
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
                    {disabled && <AlertInvalidNode />}
                </div>
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
