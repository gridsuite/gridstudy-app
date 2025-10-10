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
import { buildExportIdentifier, setExportSubscription } from '../utils/export-utils';

export default function useExportSubscription({
    studyUuid,
    rootNetworkUuid,
}: {
    studyUuid: UUID;
    rootNetworkUuid: UUID;
}) {
    const intl = useIntl();
    const { snackInfo } = useSnackMessage();

    const subscribeExport = useCallback(
        (nodeUuid: UUID, format: string, fileName: string) => {
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
        [studyUuid, rootNetworkUuid, snackInfo, intl]
    );

    return { subscribeExport };
}
