/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import { AppState } from '../redux/reducer.type';
import { useCallback, useMemo, useState } from 'react';
import { fetchLogMatches, fetchNodeReportLogs, fetchNodeSeverities, fetchParentNodesReport } from '../services/study';
import { snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import {
    MatchPosition,
    PagedLogs,
    PagedReportLogs,
    Report,
    ReportLog,
    ReportSeverity,
    ReportType,
    SeverityLevel,
} from '../utils/report/report.type';
import { getContainerDefaultSeverityList, REPORT_SEVERITY } from '../utils/report/report-severity';
import { mapReportLogs } from '../utils/report/report-log.mapper';
import { COMPUTING_AND_NETWORK_MODIFICATION_TYPE, GLOBAL_REPORT_NODE_LABEL } from '../utils/report/report.constant';
import { ROOT_NODE_LABEL } from '../constants/node.constant';

function makeSingleReportAndMapNames(report: Report | Report[], nodesNames: Map<string, string>): Report {
    if (!Array.isArray(report)) {
        return setNodeName(report, nodesNames);
    } else {
        if (report.length === 1) {
            return setNodeName(report[0], nodesNames);
        }
        return {
            message: GLOBAL_REPORT_NODE_LABEL,
            id: GLOBAL_REPORT_NODE_LABEL,
            severity: getHighestSeverity(report),
            subReports: report.map((r) => setNodeName(r, nodesNames)),
        } as Report;
    }
}

const getHighestSeverity = (report: Report[]): SeverityLevel => {
    if (report.length === 1) {
        return report[0].severity;
    }

    const severityList = report.map((r) => r.severity);
    let reduceFct = (p: ReportSeverity, c: ReportSeverity) => (c.level > p.level ? c : p);
    let highestSeverity = REPORT_SEVERITY.UNKNOWN;

    return Object.values(REPORT_SEVERITY)
        .filter((s) => severityList.includes(s.name))
        .reduce(reduceFct, highestSeverity).name;
};

function setNodeName(report: Report, nodesNames: Map<string, string>) {
    if (report.message !== ROOT_NODE_LABEL) {
        report.message = nodesNames?.get(report.message) ?? report.message;
    }
    report.parentId = GLOBAL_REPORT_NODE_LABEL;
    return report;
}

function prettifyReportLogMessage(reports: ReportLog[], nodesNames: Map<string, string>) {
    reports.forEach((report) => {
        if (report.parentId == null) {
            if (report.message !== ROOT_NODE_LABEL) {
                report.message = nodesNames?.get(report.message) ?? report.message;
            }
        }
    });
    return reports;
}

export const useReportFetcher = (
    computingAndNetworkModificationType: keyof typeof COMPUTING_AND_NETWORK_MODIFICATION_TYPE
): [
    boolean,
    (nodeOnlyReport?: boolean) => Promise<Report | undefined>,
    (reportId: string, reportType?: ReportType) => Promise<SeverityLevel[]> | undefined,
    (
        reportId: string,
        severityList: string[],
        messageFilter: string,
        reportType: ReportType,
        page: number,
        size: number
    ) => Promise<PagedLogs> | undefined,
    (
        reportId: string,
        severityList: string[],
        messageFilter: string,
        reportType: ReportType,
        searchTerm: string,
        pageSize: number
    ) => Promise<MatchPosition[]> | undefined,
] => {
    const [isLoading, setIsLoading] = useState(false);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const treeModel = useSelector((state: AppState) => state.networkModificationTreeModel);
    const { snackError } = useSnackMessage();

    const nodesNames = useMemo(() => {
        return new Map(treeModel !== null ? treeModel.treeNodes.map((node) => [node.id, node.data.label]) : []);
    }, [treeModel]);

    const fetch = useCallback(
        (fetcher: () => Promise<Report | Report[]>) => {
            // use a timout to avoid having a loader in case of fast promise return (avoid blink)
            const timer = setTimeout(() => {
                setIsLoading(true);
            }, 700);

            return fetcher()
                .then((fetchedReport) => {
                    return makeSingleReportAndMapNames(fetchedReport, nodesNames);
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'ReportFetchError' });
                    return undefined;
                })
                .finally(() => {
                    clearTimeout(timer);
                    setIsLoading(false);
                });
        },
        [nodesNames, snackError]
    );

    const fetchRawParentReport = useCallback(
        (nodeOnlyReport?: boolean) => {
            if (currentNode !== null && studyUuid && currentRootNetworkUuid) {
                return fetch(() =>
                    fetchParentNodesReport(
                        studyUuid,
                        currentNode.id,
                        currentRootNetworkUuid,
                        nodeOnlyReport ?? true,
                        getContainerDefaultSeverityList(),
                        computingAndNetworkModificationType
                    )
                );
            }
            return Promise.resolve(undefined);
        },
        [currentNode, currentRootNetworkUuid, fetch, computingAndNetworkModificationType, studyUuid]
    );

    const fetchLogsMatches = useCallback(
        (
            reportId: string,
            severityList: string[],
            messageFilter: string,
            reportType: ReportType,
            searchTerm: string,
            pageSize: number
        ) => {
            if (!studyUuid || !currentRootNetworkUuid) {
                return;
            }
            return fetchLogMatches(
                studyUuid,
                currentNode!.id,
                currentRootNetworkUuid,
                reportId,
                severityList,
                messageFilter,
                reportType === ReportType.GLOBAL,
                searchTerm,
                pageSize
            );
        },
        [currentNode, currentRootNetworkUuid, studyUuid]
    );

    const fetchLogs = useCallback(
        (
            reportId: string,
            severityList: string[],
            messageFilter: string,
            reportType: ReportType,
            page: number = 0,
            size: number
        ) => {
            if (!studyUuid || !currentRootNetworkUuid) {
                return;
            }
            return fetchNodeReportLogs(
                studyUuid,
                currentNode!.id,
                currentRootNetworkUuid,
                reportId,
                severityList,
                messageFilter,
                reportType === ReportType.GLOBAL,
                page,
                size
            ).then((r: PagedReportLogs) => {
                return {
                    ...r,
                    content: mapReportLogs(prettifyReportLogMessage(r.content, nodesNames)),
                };
            });
        },
        [currentNode, currentRootNetworkUuid, studyUuid, nodesNames]
    );

    const fetchReportSeverities = useCallback(
        (reportId: string, reportType?: ReportType) => {
            if (!studyUuid) {
                return;
            }
            if (!currentRootNetworkUuid) {
                return;
            }
            let fetchPromise: (reportId: string) => Promise<SeverityLevel[]>;
            if (reportType === ReportType.GLOBAL) {
                fetchPromise = () =>
                    fetchNodeSeverities(studyUuid, currentNode!.id, currentRootNetworkUuid, null, true);
            } else {
                fetchPromise = (reportId: string) =>
                    fetchNodeSeverities(studyUuid, currentNode!.id, currentRootNetworkUuid, reportId, false);
            }
            return fetchPromise(reportId);
        },
        [currentNode, studyUuid, currentRootNetworkUuid]
    );

    return [isLoading, fetchRawParentReport, fetchReportSeverities, fetchLogs, fetchLogsMatches];
};
