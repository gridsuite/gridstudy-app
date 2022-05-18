/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { fetchReport } from '../utils/rest-api';
import { displayErrorMessageWithSnackbar } from '../utils/messages';
import Paper from '@mui/material/Paper';
import clsx from 'clsx';
import { ReportViewer } from '@gridsuite/commons-ui';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import WaitingLoader from './util/waiting-loader';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useIntl } from 'react-intl';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
    reportOnlyNode: {
        margin: 5,
    },
}));

const NETWORK_MODIFICATION = 'NetworkModification';

/**
 * control the ReportViewer (fetch and waiting)
 * @param studyId : string study id
 * @param visible : boolean window visible
 * @param workingNode : object visualized node
 * @returns {*} node
 * @constructor
 */
export const ReportViewerTab = ({ studyId, visible, workingNode }) => {
    const intl = useIntl();
    const classes = useStyles();

    const [report, setReport] = useState(null);
    const [waitingLoadReport, setWaitingLoadReport] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const [nodeOnlyReport, setNodeOnlyReport] = useState(true);

    const handleChangeValue = useCallback((event) => {
        setNodeOnlyReport(event.target.checked);
    }, []);

    function condenseReport(report) {
        let newReport = {
            taskKey: report.taskKey,
            defaultName: report.defaultName,
            taskValues: report.taskValues,
            reports: report.reports,
            subReporters: [],
        };
        report.subReporters.forEach((subReport1) => {
            if (subReport1.taskKey === NETWORK_MODIFICATION) {
                // we group all network modifications together
                subReport1.subReporters.forEach((subReport2) =>
                    newReport.subReporters.push(subReport2)
                );
            } else {
                newReport.subReporters.push(subReport1);
            }
        });
        return newReport;
    }

    useEffect(() => {
        if (visible) {
            setWaitingLoadReport(true);
            fetchReport(studyId, workingNode.id, nodeOnlyReport)
                .then((fetchedReport) => {
                    if (fetchedReport.length === 1) {
                        setReport(condenseReport(fetchedReport[0]));
                    } else {
                        let globalReport = {
                            taskKey: 'root',
                            defaultName: 'Logs',
                            taskValues: {},
                            reports: [],
                            subReporters: fetchedReport.map((r) =>
                                condenseReport(r)
                            ),
                        };
                        setReport(globalReport);
                    }
                })
                .catch((errorMessage) =>
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                    })
                )
                .finally(() => {
                    setWaitingLoadReport(false);
                });
        }
    }, [visible, studyId, workingNode, nodeOnlyReport, enqueueSnackbar]);

    return (
        <WaitingLoader loading={waitingLoadReport} message={'loadingReport'}>
            {report && (
                <Paper className={clsx('singlestretch-child')}>
                    <FormControlLabel
                        className={classes.reportOnlyNode}
                        control={
                            <Switch
                                checked={nodeOnlyReport}
                                inputProps={{
                                    'aria-label': 'primary checkbox',
                                }}
                                onChange={(e) => handleChangeValue(e)}
                            />
                        }
                        label={intl.formatMessage({
                            id: 'LogOnlySingleNode',
                        })}
                    />
                    <ReportViewer jsonReport={report} />
                </Paper>
            )}
        </WaitingLoader>
    );
};

ReportViewerTab.propTypes = {
    studyId: PropTypes.string,
    visible: PropTypes.bool,
    workingNode: PropTypes.object,
};
