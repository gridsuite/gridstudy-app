/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { snackWarningOrFallback, useSnackMessage } from '@gridsuite/commons-ui';
import {
    ROOT_NETWORK_TAGS_FORBIDDEN_BY_SHARED,
    ROOT_NETWORK_TAGS_FORBIDDEN_BY_SHARED_DURATION_MS,
} from 'components/graph/menus/root-network/root-network.types';

/**
 * @return a function showing the error as a warning when refused because of the shared modifications the user cannot
 * write on, as an error with the given header otherwise
 */
export const useSnackForbiddenByShared = () => {
    const { snackError, snackWarning } = useSnackMessage();
    return useCallback(
        (error: unknown, headerId: string) =>
            snackWarningOrFallback(
                snackError,
                snackWarning,
                error,
                [ROOT_NETWORK_TAGS_FORBIDDEN_BY_SHARED],
                { headerId },
                ROOT_NETWORK_TAGS_FORBIDDEN_BY_SHARED_DURATION_MS
            ),
        [snackError, snackWarning]
    );
};
