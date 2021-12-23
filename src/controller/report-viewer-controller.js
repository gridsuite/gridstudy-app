/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useRef, useState } from 'react';
import { fetchReport } from '../utils/rest-api';
import { displayErrorMessageWithSnackbar } from '../utils/messages';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import { ReportViewer } from '@gridsuite/commons-ui';
import LoaderWithOverlay from '../components/loader-with-overlay';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';

/**
 * control the ReportViewer (fetch and waiting)
 * @param reportId : string  uuid of report
 * @param visible : boolean window visible
 * @returns {*} node
 * @constructor
 */
export const ReportViewerController = ({ reportId, visible }) => {
    const [report, setReport] = useState(null);
    const [waitingLoadReport, setWaitingLoadReport] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const reportIdRef = useRef();

    useEffect(() => {
        if (visible && reportIdRef.current !== reportId) {
            setWaitingLoadReport(true);
            reportIdRef.current = reportId;
            fetchReport(reportId)
                .then((report) => {
                    if (reportIdRef.current === reportId) setReport(report);
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
    }, [visible, reportIdRef, reportId, enqueueSnackbar, setWaitingLoadReport]);

    function renderLogsView() {
        if (report)
            return (
                <Paper className={clsx('singlestretch-child')}>
                    <ReportViewer jsonReport={report} />
                </Paper>
            );
        else if (waitingLoadReport) {
            return (
                <LoaderWithOverlay
                    color="inherit"
                    loaderSize={70}
                    isFixed={true}
                    loadingMessageText={'loadingReport'}
                />
            );
        }
        return <></>;
    }

    return renderLogsView();
};

ReportViewerController.propTypes = {
    reportId: PropTypes.string,
    visible: PropTypes.bool,
};
