/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComputingType } from '@gridsuite/commons-ui';

export const GLOBAL_REPORT_NODE_LABEL = 'Logs';
export const NETWORK_MODIFICATION = 'NETWORK_MODIFICATION';
// must be in-sync with ReportType in study-server
export const COMPUTING_AND_NETWORK_MODIFICATION_TYPE = {
    ...ComputingType,
    NETWORK_MODIFICATION: NETWORK_MODIFICATION,
};

/**
 * Build a unique node key for the report tree from the report UUID and the node's order.
 * All nodes within a single report share the same UUID; order makes them unique.
 */
export function makeNodeKey(reportId: string, order: number): string {
    return `${reportId}_${order}`;
}
