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
import { buildExportIdentifier, setExportSubscription } from '../utils/export-network-utils';

export default function useExportSubscription() {
    const intl = useIntl();
    const { snackInfo } = useSnackMessage();

    const subscribeExport = useCallback(
        (exportUuid: UUID) => {
            const identifier = buildExportIdentifier(exportUuid);
            setExportSubscription(identifier);
            snackInfo({
                messageTxt: intl.formatMessage({ id: 'export.message.started' }),
            });
        },
        [snackInfo, intl]
    );

    return { subscribeExport };
}
