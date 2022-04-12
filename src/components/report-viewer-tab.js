/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useRef, useState } from 'react';
import { fetchReport } from '../utils/rest-api';
import { displayErrorMessageWithSnackbar } from '../utils/messages';
import Paper from '@mui/material/Paper';
import clsx from 'clsx';
import { ReportViewer } from '@gridsuite/commons-ui';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import WaitingLoader from './util/waiting-loader';

/**
 * control the ReportViewer (fetch and waiting)
 * @param reportId : string  uuid of report
 * @param visible : boolean window visible
 * @returns {*} node
 * @constructor
 */
export const ReportViewerTab = ({ reportId, visible }) => {
    const [report, setReport] = useState(null);
    const [waitingLoadReport, setWaitingLoadReport] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const reportIdRef = useRef();

    useEffect(() => {
        if (visible && reportIdRef.current !== reportId) {
            setWaitingLoadReport(true);
            reportIdRef.current = reportId;
            fetchReport(reportId)
                .then((fetchedReport) => {
                    if (reportIdRef.current === reportId)
                        // set the report only if it's the last expected/fetched report
                        setReport(fetchedReport);
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
    }, [visible, reportId, enqueueSnackbar]);

    return (
        <WaitingLoader loading={waitingLoadReport} message={'loadingReport'}>
            {report && (
                <Paper className={clsx('singlestretch-child')}>
                    <ReportViewer jsonReport={report} />
                </Paper>
            )}
        </WaitingLoader>
    );
};

ReportViewerTab.propTypes = {
    reportId: PropTypes.string,
    visible: PropTypes.bool,
};
