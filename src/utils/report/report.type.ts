/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type SeverityLevel = 'UNKNOWN' | 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export type ReportSeverity = {
    name: SeverityLevel;
    level: number;
    colorName: string;
    colorHexCode: string;
    displayedByDefault: boolean;
    displayedByDefaultForReportContainer: boolean;
};

export enum ReportType {
    GLOBAL = 'GlobalReport',
    NODE = 'NodeReport',
}

interface BaseReport<T> {
    message: string;
    severity: SeverityLevel;
    parentId: string | null;
    id: string;
    subReports: T[];
}

export interface ReportTree extends Omit<BaseReport<ReportTree>, 'severity'> {
    type: ReportType;
    severity: ReportSeverity;
}

export interface Report extends BaseReport<Report> {}

export type Log = {
    message: string;
    severity: ReportSeverity;
    parentId: string;
};

export type ReportLog = {
    message: string;
    severity: SeverityLevel;
    parentId: string;
    backgroundColor?: string;
};

export type SelectedReportLog = {
    id: string;
    type: ReportType;
};
