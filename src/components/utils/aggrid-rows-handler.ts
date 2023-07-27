import { RunningStatus } from './running-status';

export interface RunningStatusMessage {
    noData: string;
    noLimitViolation: string;
    running: string;
    failed: string;
}

export function getNoRowsMessage(
    messages: RunningStatusMessage,
    rows: any[],
    status: string
): string | undefined {
    switch (status) {
        case RunningStatus.IDLE:
            return messages.noData;
        case RunningStatus.RUNNING:
            return messages.running;
        case RunningStatus.FAILED:
            return messages.failed;
        case RunningStatus.SUCCEED:
            if (!rows || rows?.length === 0) {
                return messages.noLimitViolation;
            }
            return undefined;
        default:
            return messages.noData;
    }
}

export function getRows(rows: any[], status: string): any[] {
    return status === RunningStatus.SUCCEED && rows ? rows : [];
}
