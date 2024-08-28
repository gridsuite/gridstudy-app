import { useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { useCallback, useMemo, useState } from 'react';
import { fetchNodeReport, fetchParentNodesReport } from '../services/study';
import { getDefaultSeverityList } from '../components/report-viewer/severity.utils';
import { REPORT_TYPES } from '../components/utils/report-type';
import { makeSingleReport, ReportTree } from '../components/report-viewer/reportTreeMapper';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { mapReportToReportItems } from '../components/report-viewer/reportItemMapper';
import { REPORT_TYPE } from '../components/report-viewer/reportType.constant';
import { Log, Report } from '../components/report-viewer/Report.type';

export const useReportFetcher = (
    reportType: keyof typeof REPORT_TYPES
): [
    boolean,
    (nodeOnlyReport?: boolean) => Promise<ReportTree | undefined>,
    (reportId: string, severityList: string[], reportType: keyof typeof REPORT_TYPE) => Promise<Log[] | undefined>
] => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const treeModel = useSelector((state: AppState) => state.networkModificationTreeModel);
    const { snackError } = useSnackMessage();

    const [isLoading, setIsLoading] = useState(false);

    const nodesNames = useMemo(() => {
        return new Map(treeModel !== null ? treeModel.treeNodes.map((node) => [node.id, node.data.label]) : []);
    }, [treeModel]);

    const fetchReportsTree = useCallback(
        (nodeOnlyReport?: boolean) => {
            if (currentNode !== null) {
                // use a timout to avoid having a loader in case of fast promise return (avoid blink)
                const timer = setTimeout(() => {
                    setIsLoading(true);
                }, 700);

                return fetchParentNodesReport(
                    studyUuid,
                    currentNode.id,
                    nodeOnlyReport ?? true,
                    getDefaultSeverityList(),
                    reportType
                )
                    .then((fetchedReport) => {
                        return makeSingleReport(fetchedReport, nodesNames);
                    })
                    .catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'ReportFetchError',
                        });
                        return undefined;
                    })
                    .finally(() => {
                        clearTimeout(timer);
                        setIsLoading(false);
                    });
            }
            return Promise.resolve(undefined);
        },
        [currentNode, nodesNames, reportType, snackError, studyUuid]
    );

    const fetchLogs = useCallback(
        (reportId: string, severityList: string[], reportTType: keyof typeof REPORT_TYPE) => {
            let fetchPromise: (severityList: string[], reportId: string) => Promise<Report | Report[]>;
            if (reportTType === REPORT_TYPE.NODE) {
                fetchPromise = (severityList: string[], reportId: string) =>
                    fetchNodeReport(studyUuid, currentNode!.id, reportId, severityList);
            } else {
                fetchPromise = (severityList: string[], _: string) =>
                    fetchParentNodesReport(studyUuid, currentNode!.id, false, severityList, reportType);
            }

            // use a timout to avoid having a loader in case of fast promise return (avoid blink)
            const timer = setTimeout(() => {
                setIsLoading(true);
            }, 700);

            return fetchPromise(severityList, reportId)
                .then((fetchedData) => {
                    return mapReportToReportItems(fetchedData);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'ReportFetchError',
                    });
                    return undefined;
                })
                .finally(() => {
                    clearTimeout(timer);
                    setIsLoading(false);
                });
        },
        [currentNode, reportType, snackError, studyUuid]
    );

    return [isLoading, fetchReportsTree, fetchLogs];
};
