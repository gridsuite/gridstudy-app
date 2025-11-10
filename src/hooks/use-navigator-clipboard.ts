/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';

type CopyState = 'READY' | 'SUCCESS' | Error;

export const useClipboard = ({ delay = 2500 } = {}) => {
    const [state, setState] = React.useState<CopyState>('READY');
    const [copyTimeout, setCopyTimeout] = React.useState<ReturnType<typeof setTimeout>>();

    function handleCopyResult(result: CopyState) {
        setState(result);
        clearTimeout(copyTimeout);
        setCopyTimeout(setTimeout(() => setState('READY'), delay));
    }

    function copy(valueToCopy: string) {
        if ('clipboard' in navigator) {
            navigator.clipboard
                .writeText(valueToCopy)
                .then(() => handleCopyResult('SUCCESS'))
                .catch((error) => error instanceof Error && handleCopyResult(error));
        } else {
            handleCopyResult(new Error('`useClipboard`: Navigation Clipboard is not supported'));
        }
    }

    return { copy, state };
};
