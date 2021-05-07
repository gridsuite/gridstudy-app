import { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';

/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

//This useEffect must be at the beginning to be executed before other useEffects which use intlRef.
//This ref is used to avoid redoing other useEffects when the language (intl) is changed for things that produce temporary messages using the snackbar.
//The drawback to this custom hook is that a ref and a useEffect are created in each component that needs this hook.
//Can we avoid this overhead ?
export function useIntlRef() {
    const intl = useIntl();
    const intlRef = useRef();

    useEffect(() => {
        intlRef.current = intl;
    }, [intl]);

    return intlRef;
}

export function displayErrorMessageWithSnackbar(
    errorMessage,
    headerMessageId,
    enqueueSnackbar,
    intl
) {
    let messageHeader = intl.current.formatMessage({
        id: headerMessageId,
    });
    enqueueSnackbar(messageHeader + '\n\n' + errorMessage, {
        variant: 'error',
        persist: true,
        style: { whiteSpace: 'pre-line' },
    });
}
