/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export function displayErrorMessageWithSnackbar(
    errorMessage,
    headerMessageId,
    enqueueSnackbar,
    intl
) {
    let messageHeader = intl.formatMessage({
        id: headerMessageId,
    });
    enqueueSnackbar(messageHeader + '\n\n' + errorMessage, {
        variant: 'error',
        persist: true,
        style: { whiteSpace: 'pre-line' },
    });
}
