/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RunningStatus } from './running-status';

export interface RunningStatusMessage {
    noCalculation: string;
    noLimitViolation?: string;
    running: string;
    failed: string;
    noData?: string;
    fetching?: string;
}

export function getNoRowsMessage(
    messages: RunningStatusMessage,
    rows: any[] | undefined,
    status: string,
    isDataReady?: boolean
): string | undefined {
    switch (status) {
        case RunningStatus.IDLE:
            return messages.noCalculation;
        case RunningStatus.RUNNING:
            return messages.running;
        case RunningStatus.FAILED:
            return messages.failed;
        case RunningStatus.SUCCEED:
            if (!isDataReady || !rows) {
                return messages.fetching;
            } else if (rows?.length === 0) {
                return messages.noData ? messages.noData : messages.noLimitViolation;
            }
            return undefined;
        default:
            return messages.noCalculation;
    }
}

export function getRows(rows: any[] | undefined, status: string): any[] {
    return status === RunningStatus.SUCCEED && rows ? rows : [];
}
