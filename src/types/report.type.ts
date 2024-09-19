/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { REPORT_TYPE } from '../constants/report.constant';

export type SeverityLevel = 'UNKNOWN' | 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export type SeverityFilter = Record<SeverityLevel, boolean>;

export type ReportSeverity = {
    name: SeverityLevel;
    level: number;
    colorName: string;
    colorHexCode: string;
    displayedByDefault: boolean;
};

type ReportTypeKeys = keyof typeof REPORT_TYPE;

export type ReportType = (typeof REPORT_TYPE)[ReportTypeKeys];

export type ReportTree = Report & {
    type: ReportType;
    highestSeverity: ReportSeverity;
    subReports: ReportTree[];
};

export type Report = {
    message: string;
    severities: string[];
    parentId: string | null;
    id: string;
    subReports: Report[];
};

export type Log = {
    message: string;
    severity: ReportSeverity;
    parentId: string;
};
