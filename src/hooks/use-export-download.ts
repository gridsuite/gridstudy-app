/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'node:crypto';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useCallback } from 'react';
import { downloadZipFile } from '../services/utils';
import { fetchExportNetworkFile } from '../services/network-conversion';
import { useIntl } from 'react-intl';

export function useExportDownload() {
    const { snackError, snackInfo } = useSnackMessage();
    const intl = useIntl();

    const downloadExportNetworkFile = useCallback(
        (exportUuid: UUID) => {
            let filename = 'export.zip';
            fetchExportNetworkFile(exportUuid)
                .then(async (response) => {
                    const contentDisposition = response.headers.get('Content-Disposition');
                    if (contentDisposition?.includes('filename=')) {
                        const regex = /filename="?([^"]+)"?/;
                        const match = regex.exec(contentDisposition);
                        if (match?.[1]) {
                            filename = match[1];
                        }
                    }

                    const blob = await response.blob();
                    downloadZipFile(blob, filename);
                })
                .catch((error: Error) => {
                    snackError({
                        headerId: intl.formatMessage({ id: 'export.message.failed' }),
                        messageTxt: error.message,
                    });
                })
                .finally(() => {
                    snackInfo({
                        messageTxt: intl.formatMessage({ id: 'export.message.succeeded' }, { fileName: filename }),
                    });
                });
        },
        [intl, snackError, snackInfo]
    );
    return { downloadExportNetworkFile };
}
