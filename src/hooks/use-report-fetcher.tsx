/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { useCallback, useMemo, useState } from 'react';
import { fetchNodeReport, fetchParentNodesReport } from '../services/study';
import { REPORT_TYPES } from '../components/utils/report-type';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { Log, Report } from '../types/report.type';
import { getDefaultSeverityList } from '../utils/report-severity.utils';
import { mapReportLog } from '../utils/report-log.mapper';
import { GLOBAL_NODE_TASK_KEY, REPORT_TYPE } from '../constants/report.constant';

function makeSingleReportAndMapNames(report: Report | Report[], nodesNames?: Map<string, string>): Report {
    if (!Array.isArray(report)) {
        return setNodeName(report, nodesNames);
    } else {
        if (report.length === 1) {
            return setNodeName(report[0], nodesNames);
        }
        return {
            message: GLOBAL_NODE_TASK_KEY,
            id: GLOBAL_NODE_TASK_KEY,
            subReports: report.map((r) => setNodeName(r, nodesNames)),
        } as Report;
    }
}

function setNodeName(report: Report, nodesNames?: Map<string, string>) {
    if (report.message !== 'Root') {
        report.message = nodesNames?.get(report.message) ?? report.message;
    }
    return report;
}

export const useReportFetcher = (
    reportType: keyof typeof REPORT_TYPES
): [
    boolean,
    (nodeOnlyReport?: boolean) => Promise<Report | undefined>,
    (reportId: string, severityList: string[], reportType: keyof typeof REPORT_TYPE) => Promise<Log[] | undefined>
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
                        getDefaultSeverityList(),
                        reportType
                    )
                );
            }
            return Promise.resolve(undefined);
        },
        [currentNode, fetch, reportType, studyUuid]
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
            return fetch(() => fetchPromise(severityList, reportId)).then((r) =>
                r === undefined ? undefined : mapReportLog(r)
            );
        },
        [currentNode, fetch, reportType, studyUuid]
    );

    return [isLoading, fetchRawParentReport, fetchLogs];
};
