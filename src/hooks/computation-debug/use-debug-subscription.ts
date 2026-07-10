/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import type { UUID } from 'node:crypto';
import { useCallback } from 'react';
import { ComputingType, formatComputingTypeLabel, useSnackMessage } from '@gridsuite/commons-ui';
import { buildDebugIdentifier, setDebug } from './computation-debug-utils';
import { useIntl } from 'react-intl';

export default function useDebugSubscription({
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
    const subscribeDebug = useCallback(
        (computingType: ComputingType) => {
            // set debug true in the session storage
            setDebug(
                buildDebugIdentifier({
                    studyUuid: studyUuid,
                    nodeUuid: nodeUuid,
                    rootNetworkUuid: rootNetworkUuid,
                    computingType: computingType,
                })
            );
            snackInfo({
                headerTxt: intl.formatMessage({
                    id: formatComputingTypeLabel(computingType),
                }),
                messageTxt: intl.formatMessage({ id: 'debug.message.downloadFile' }),
            });
        },
        [studyUuid, nodeUuid, rootNetworkUuid, snackInfo, intl]
    );

    return subscribeDebug;
}
