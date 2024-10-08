/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { useCallback, useMemo, useState } from 'react';
import { fetchNodeReportLogs, fetchParentNodesReport } from '../services/study';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { Log, Report, ReportLog, ReportType } from '../types/report.type';
import { getContainerDefaultSeverityList } from '../utils/report-severity.utils';
import {
    COMPUTING_AND_NETWORK_MODIFICATION_TYPE,
    GLOBAL_REPORT_NODE_LABEL,
    REPORT_TYPE,
} from '../constants/report.constant';
import { ROOT_NODE_LABEL } from '../constants/node.constant';
import { mapReportLogs } from '../utils/report-log.mapper';

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
            subReports: report.map((r) => setNodeName(r, nodesNames)),
        } as Report;
    }
}

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
    (reportId: string, severityList: string[], reportType: ReportType, filterMessage: string) => Promise<Log[]>
] => {
    const [isLoading, setIsLoading] = useState(false);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
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
        [nodesNames, snackError]
    );

    const fetchRawParentReport = useCallback(
        (nodeOnlyReport?: boolean) => {
            if (currentNode !== null) {
                return fetch(() =>
                    fetchParentNodesReport(
                        studyUuid,
                        currentNode.id,
                        nodeOnlyReport ?? true,
                        getContainerDefaultSeverityList(),
                        computingAndNetworkModificationType
                    )
                );
            }
            return Promise.resolve(undefined);
        },
        [currentNode, fetch, computingAndNetworkModificationType, studyUuid]
    );

    const fetchReportLogs = useCallback(
        (reportId: string, severityList: string[], reportType: ReportType, messageFilter: string) => {
            let fetchPromise: (severityList: string[], reportId: string) => Promise<ReportLog[]>;
            if (reportType === REPORT_TYPE.GLOBAL) {
                fetchPromise = (severityList: string[]) =>
                    fetchNodeReportLogs(studyUuid, currentNode!.id, null, severityList, messageFilter, true);
            } else {
                fetchPromise = (severityList: string[], reportId: string) =>
                    fetchNodeReportLogs(studyUuid, currentNode!.id, reportId, severityList, messageFilter, false);
            }
            return fetchPromise(severityList, reportId).then((r) => {
                return mapReportLogs(prettifyReportLogMessage(r, nodesNames));
            });
        },
        [currentNode, studyUuid, nodesNames]
    );

    return [isLoading, fetchRawParentReport, fetchReportLogs];
};
