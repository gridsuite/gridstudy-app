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

function displayMessageWithSnackbar(
    message,
    header,
    enqueueSnackbar,
    level,
    persistent
) {
    let fullMessage = '';
    if (header) {
        fullMessage += header;
    }
    if (message) {
        if (header) {
            fullMessage += '\n\n';
        }
        fullMessage += message;
    }
    enqueueSnackbar(fullMessage, {
        variant: level,
        persist: persistent,
        style: { whiteSpace: 'pre-line' },
    });
}

export function useSnackMessage() {
    const intlRef = useIntlRef();
    const { enqueueSnackbar } = useSnackbar();

    /*
    snackInputs: {
        messageTxt,
        messageId,
        messageValues,
        headerTxt,
        headerId,
        headerValues,
    }
     */
    const snackError = useCallback(
        (snackInputs) =>
            makeCallBack(snackInputs, intlRef, enqueueSnackbar, 'error', true),
        [enqueueSnackbar, intlRef]
    );

    const snackInfo = useCallback(
        (snackInputs) =>
            makeCallBack(snackInputs, intlRef, enqueueSnackbar, 'info', false),
        [enqueueSnackbar, intlRef]
    );

    const snackWarning = useCallback(
        (snackInputs) =>
            makeCallBack(
                snackInputs,
                intlRef,
                enqueueSnackbar,
                'warning',
                true
            ),
        [enqueueSnackbar, intlRef]
    );

    return { snackError, snackInfo, snackWarning };
}

function makeCallBack(
    snackInputs,
    intlRef,
    enqueueSnackbar,
    level,
    persistent
) {
    const message = checkAndTranslateIfNecessary(
        snackInputs.messageTxt,
        snackInputs.messageId,
        snackInputs.messageValues,
        intlRef
    );
    const header = checkAndTranslateIfNecessary(
        snackInputs.headerTxt,
        snackInputs.headerId,
        snackInputs.headerValues,
        intlRef
    );
    displayMessageWithSnackbar(
        message,
        header,
        enqueueSnackbar,
        level,
        persistent
    );
}

function checkAndTranslateIfNecessary(txt, id, values, intlRef) {
    checkInputs(txt, id, values);
    return (
        txt ??
        (id
            ? intlRef.current.formatMessage(
                  {
                      id: id,
                  },
                  values
              )
            : null)
    );
}

function checkInputs(txt, id, values) {
    if (txt && (id || values)) {
        console.warn('Snack inputs should be [*Txt] OR [*Id, *Values]');
    }
}
