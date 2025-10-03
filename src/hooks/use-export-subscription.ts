/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'crypto';
import { useIntl } from 'react-intl';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useCallback } from 'react';

export function buildExportIdentifier({
    studyUuid,
    nodeUuid,
    rootNetworkUuid,
    format,
    fileName,
}: {
    studyUuid: UUID;
    nodeUuid: UUID;
    rootNetworkUuid: UUID;
    format: string;
    fileName: string;
}) {
    return `${studyUuid}|${rootNetworkUuid}|${nodeUuid}|${fileName}|${format}`;
}

function getExportState(): Set<string> | null {
    const state = sessionStorage.getItem('export-subscriptions');
    return state ? new Set<string>(JSON.parse(state)) : null;
}

function saveExportState(state: Set<string>): void {
    sessionStorage.setItem('export-subscriptions', JSON.stringify([...state]));
}

export function setExportSubscription(identifier: string): void {
    const exportState = getExportState() ?? new Set<string>();
    exportState.add(identifier);
    saveExportState(exportState);
}

export default function useExportSubscription({
    studyUuid,
    nodeUuid,
    rootNetworkUuid,
}: {
    studyUuid: UUID;
    nodeUuid: UUID;
    rootNetworkUuid: UUID;
}) {
    const intl = useIntl();
    const { snackInfo } = useSnackMessage();

    const subscribeExport = useCallback(
        (format: string, fileName: string) => {
            const identifier = buildExportIdentifier({
                studyUuid,
                nodeUuid,
                rootNetworkUuid,
                format,
                fileName,
            });
            setExportSubscription(identifier);
            snackInfo({
                headerTxt: intl.formatMessage({ id: 'exportNetwork' }),
                messageTxt: intl.formatMessage({ id: 'export.message.subscribed' }, { fileName }),
            });
        },
        [studyUuid, nodeUuid, rootNetworkUuid, snackInfo, intl]
    );

    return { subscribeExport };
}
