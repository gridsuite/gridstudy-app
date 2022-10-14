/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useSnackbar } from 'notistack';

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

function displayMessageWithSnackbar({
    errorMessage,
    enqueueSnackbar,
    headerMessage: { headerMessageId, headerMessageValues, intlRef } = {},
    level,
    persistent,
}) {
    let message = intlRef.current.formatMessage({ id: errorMessage });
    if (headerMessageId) {
        let messageHeader = intlRef.current.formatMessage(
            {
                id: headerMessageId,
            },
            headerMessageValues
        );
        message = messageHeader + (!message.empty ? '\n\n' + message : '');
    }
    enqueueSnackbar(message, {
        variant: level,
        persist: persistent,
        style: { whiteSpace: 'pre-line' },
    });
}

export function displayErrorMessageWithSnackbar({ ...args }) {
    displayMessageWithSnackbar({ ...args, level: 'error', persistent: true });
}

export function displayInfoMessageWithSnackbar({ ...args }) {
    displayMessageWithSnackbar({ ...args, level: 'info', persistent: false });
}

export function displayWarningMessageWithSnackbar({ ...args }) {
    displayMessageWithSnackbar({
        ...args,
        level: 'warning',
        persistent: true,
    });
}

export function useSnackMessage() {
    const intlRef = useIntlRef();
    const { enqueueSnackbar } = useSnackbar();

    const snackError = useCallback(
        (msg, headerMessageId, headerValues) =>
            displayErrorMessageWithSnackbar({
                errorMessage: msg,
                enqueueSnackbar: enqueueSnackbar,
                headerMessage: {
                    headerMessageId: headerMessageId,
                    intlRef: intlRef,
                    headerMessageValues: headerValues,
                },
            }),

        [enqueueSnackbar, intlRef]
    );

    const snackInfo = useCallback(
        (msg, headerMessageId, headerValues) =>
            displayInfoMessageWithSnackbar({
                errorMessage: msg,
                enqueueSnackbar: enqueueSnackbar,
                headerMessage: {
                    headerMessageId: headerMessageId,
                    intlRef: intlRef,
                    headerMessageValues: headerValues,
                },
            }),

        [enqueueSnackbar, intlRef]
    );

    const snackWarning = useCallback(
        (msg, headerMessageId, headerValues) =>
            displayWarningMessageWithSnackbar({
                errorMessage: msg,
                enqueueSnackbar: enqueueSnackbar,
                headerMessage: {
                    headerMessageId: headerMessageId,
                    intlRef: intlRef,
                    headerMessageValues: headerValues,
                },
            }),

        [enqueueSnackbar, intlRef]
    );

    return { snackError, snackInfo, snackWarning };
}
