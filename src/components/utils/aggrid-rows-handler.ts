/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RunningStatus } from './running-status';
import { IntlShape } from 'react-intl';
import { useCallback, useMemo } from 'react';

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
            if (!isDataReady) {
                return messages.fetching;
            } else if (!rows || rows?.length === 0) {
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
export const useIntlResultStatusMessages = (intl: IntlShape, hasNoData: boolean = false) => {
    const specificMessage = useCallback(():
        | { noData: string }
        | { noLimitViolation: string }
        | { fetching: string } => {
        if (hasNoData) {
            return { noData: intl.formatMessage({ id: 'grid.noRowsToShow' }) };
        }
        return {
            noLimitViolation: intl.formatMessage({
                id: 'grid.noLimitViolation',
            }),
        };
    }, [intl, hasNoData]);

    return useMemo(() => {
        return {
            noCalculation: intl.formatMessage({ id: 'grid.noCalculation' }),
            ...specificMessage(),
            running: intl.formatMessage({ id: 'grid.running' }),
            failed: intl.formatMessage({ id: 'grid.failed' }),
            fetching: intl.formatMessage({ id: 'LoadingRemoteData' }),
        };
    }, [intl, specificMessage]);
};
