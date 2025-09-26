/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';

export const useTreeNodeFocus = (onFocus?: () => void) => {
    // Set up listener if onFocus is provided
    useEffect(() => {
        if (!onFocus) {
            return;
        }

        window.addEventListener('focusTreeNode', onFocus);
        return () => window.removeEventListener('focusTreeNode', onFocus);
    }, [onFocus]);

    // Always provide the trigger function
    const triggerFocus = useCallback(() => {
        requestAnimationFrame(() => {
            window.dispatchEvent(new CustomEvent('focusTreeNode'));
        });
    }, []);

    return triggerFocus;
};
