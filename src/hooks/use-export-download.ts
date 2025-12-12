/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'node:crypto';
import { snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { useCallback } from 'react';
import { downloadZipFile } from '../services/utils';
import { fetchExportNetworkFile } from '../services/study/network';
import { useIntl } from 'react-intl';

export function useExportDownload(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    const { snackError, snackSuccess } = useSnackMessage();
    const intl = useIntl();

    const downloadExportNetworkFile = useCallback(
        (exportUuid: UUID) => {
            let filename = 'export.zip';
            fetchExportNetworkFile(studyUuid, currentNodeUuid, currentRootNetworkUuid, exportUuid)
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
                    snackSuccess({
                        messageTxt: intl.formatMessage({ id: 'export.message.succeeded' }, { fileName: filename }),
                        persist: true,
                    });
                })
                .catch((error: Error) => {
                    snackWithFallback(snackError, error, { headerId: 'export.message.failed' });
                });
        },
        [currentNodeUuid, currentRootNetworkUuid, intl, snackError, snackSuccess, studyUuid]
    );
    return { downloadExportNetworkFile };
}
