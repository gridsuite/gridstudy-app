/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { ProblemDetailError, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import {
    ROOT_NETWORK_TAGS_FORBIDDEN_BY_SHARED,
    ROOT_NETWORK_TAGS_FORBIDDEN_BY_SHARED_DURATION_MS,
} from 'components/graph/menus/root-network/root-network.types';

/**
 * Warns when refused by unwritable shared modifications, reports an error otherwise.
 */
export const useSnackForbiddenByShared = () => {
    const { snackError, snackWarning } = useSnackMessage();
    return useCallback(
        (error: unknown, headerId: string) => {
            if (
                error instanceof ProblemDetailError &&
                error.businessErrorCode === ROOT_NETWORK_TAGS_FORBIDDEN_BY_SHARED
            ) {
                snackWarning({
                    messageId: error.businessErrorCode,
                    messageValues: error.businessErrorValues,
                    autoHideDuration: ROOT_NETWORK_TAGS_FORBIDDEN_BY_SHARED_DURATION_MS,
                    headerId,
                });
            } else {
                snackWithFallback(snackError, error, { headerId });
            }
        },
        [snackError, snackWarning]
    );
};
