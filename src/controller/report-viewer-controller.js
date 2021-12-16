import React, { useEffect, useRef, useState } from 'react';
import { fetchReport } from '../utils/rest-api';
import { displayErrorMessageWithSnackbar } from '../utils/messages';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import { ReportViewer } from '@gridsuite/commons-ui';
import LoaderWithOverlay from '../components/loader-with-overlay';
import { useSnackbar } from 'notistack';

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
    }

    return renderLogsView();
};
