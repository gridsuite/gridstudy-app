import WaitingLoader from '../utils/waiting-loader';
import LogTable from './log-table';
import Grid from '@mui/material/Grid';
import React, { MutableRefObject, useCallback, useEffect, useState } from 'react';
import { getDefaultSeverityFilter, getDefaultSeverityList } from './severity.utils';
import { Log, Report } from './Report.type';
import { mapReportToReportItems } from './reportItemMapper';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { ReportTree as ReportTreeData } from './reportTreeMapper';
import { REPORT_TYPE } from './reportType.constant';
import { FilterButton } from './filter-button';
import { SeverityFilterConfig } from './severity.type';

interface LogViewProps {
    selectedReportId: string;
    onLogRowClick: (log: Log) => void;
    reportTreeMapRef: MutableRefObject<Record<string, ReportTreeData>>;
    nodeReportPromise: (reportId: string, severityList: string[]) => Report;
    globalReportPromise: (severityList: string[]) => Report | Report[];
}

export const LogView = ({
    selectedReportId,
    onLogRowClick,
    nodeReportPromise,
    globalReportPromise,
    reportTreeMapRef,
}: LogViewProps) => {
    const [waitingLoadReport, setWaitingLoadReport] = useState(false);
    const [selectedSeverity, setSelectedSeverity] = useState(getDefaultSeverityFilter(getDefaultSeverityList()));
    const [logs, setLogs] = useState<Log[]>();
    const { snackError } = useSnackMessage();

    const getFetchPromise = useCallback(
        (reportId: string, severityList: string[]) => {
            if (reportTreeMapRef.current[reportId] !== undefined) {
                if (reportTreeMapRef.current[reportId].type === REPORT_TYPE.NODE) {
                    return nodeReportPromise(reportId, severityList);
                } else {
                    return globalReportPromise(severityList);
                }
            }
            return [];
        },
        [reportTreeMapRef, nodeReportPromise, globalReportPromise]
    );

    const refreshLogs = useCallback(
        (reportId: string, severityFilter: SeverityFilterConfig) => {
            console.log(
                `have to fetch. severity: ${JSON.stringify(severityFilter)}, selectedreportid: ${JSON.stringify(
                    reportId
                )}`
            );
            let severityList = [];
            for (const [severity, selected] of Object.entries(severityFilter)) {
                if (selected) {
                    severityList.push(severity);
                }
            }

            if (severityList.length === 0) {
                // no severity => there is no log to fetch, no need to request the back-end
                setLogs([]);
                return;
            }

            // use a timout to avoid having a loader in case of fast promise return (avoid blink)
            const timer = setTimeout(() => {
                setWaitingLoadReport(true);
            }, 700);

            Promise.resolve(getFetchPromise(reportId, severityList))
                .then((fetchedData) => {
                    const fetchedLogs = mapReportToReportItems(fetchedData);
                    setLogs(fetchedLogs);
                })
                .catch((error) => {
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
        [getFetchPromise, snackError]
    );

    useEffect(() => {
        const severityFilter = getDefaultSeverityFilter(reportTreeMapRef.current[selectedReportId]?.severityList);
        refreshLogs(selectedReportId, severityFilter);
        setSelectedSeverity(severityFilter);
    }, [refreshLogs, reportTreeMapRef, selectedReportId]);

    console.log(`re-rendering bro`);

    return (
        <Grid item xs={12} sm={9} sx={{ height: '100%' }}>
            <WaitingLoader loading={waitingLoadReport} message={'loadingReport'}>
                <LogTable
                    logs={logs}
                    onRowClick={onLogRowClick}
                    filterButton={
                        <FilterButton selectedItems={selectedSeverity} setSelectedItems={setSelectedSeverity} />
                    }
                />
            </WaitingLoader>
        </Grid>
    );
};
