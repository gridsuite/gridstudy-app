/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ReportSeverity, SeverityLevel } from '../types/report.type';
import ComputingType from '../components/computing-status/computing-type';

export const REPORT_SEVERITY: Record<SeverityLevel, ReportSeverity> = {
    UNKNOWN: {
        name: 'UNKNOWN',
        level: 0,
        colorName: 'cornflowerblue',
        colorHexCode: '#6495ED',
        displayedByDefault: false,
    },
    TRACE: {
        name: 'TRACE',
        level: 1,
        colorName: 'SlateGray',
        colorHexCode: '#708090',
        displayedByDefault: false,
    },
    DEBUG: {
        name: 'DEBUG',
        level: 2,
        colorName: 'DarkCyan',
        colorHexCode: '#008B8B',
        displayedByDefault: false,
    },
    INFO: {
        name: 'INFO',
        level: 3,
        colorName: 'mediumseagreen',
        colorHexCode: '#3CB371',
        displayedByDefault: true,
    },
    WARN: {
        name: 'WARN',
        level: 4,
        colorName: 'orange',
        colorHexCode: '#FFA500',
        displayedByDefault: true,
    },
    ERROR: {
        name: 'ERROR',
        level: 5,
        colorName: 'crimson',
        colorHexCode: '#DC143C',
        displayedByDefault: true,
    },
    FATAL: {
        name: 'FATAL',
        level: 6,
        colorName: 'mediumorchid',
        colorHexCode: '#BA55D3',
        displayedByDefault: true,
    },
};

export const REPORT_TYPE = {
    GLOBAL: 'GlobalReport',
    NODE: 'NodeReport',
};

export const GLOBAL_NODE_TASK_KEY = 'Logs';

// must be in-sync with ReportType in study-server
export const COMPUTING_AND_NETWORK_MODIFICATION_TYPE = {
    ...ComputingType,
    NETWORK_MODIFICATION: 'NETWORK_MODIFICATION',
};
