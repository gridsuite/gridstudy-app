/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch, SetStateAction, useRef, KeyboardEvent } from 'react';
import { JSONSchema4 } from 'json-schema';

const DELAY_KEY_DOUBLE_TAP = 300;

export const usePopoverToggle = (
    properties: JSONSchema4 | null,
    setAnchorEl: Dispatch<SetStateAction<Element | null>>,
    handleConfirm?: () => void
) => {
    const lastShiftTime = useRef(0);

    const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
        if (properties !== null) {
            if (e.key === 'Shift') {
                const now = Date.now();
                if (now - lastShiftTime.current < DELAY_KEY_DOUBLE_TAP) {
                    setAnchorEl((prevState) => (prevState ? null : e.currentTarget.closest('[data-popover-anchor]')));
                }
                lastShiftTime.current = now;
            }

            if (e.code === 'Escape') {
                setAnchorEl(null);
            }
        }
    };

    const handleTreeviewKeyDown = (e: KeyboardEvent<HTMLElement>) => {
        e.preventDefault();
        if (handleConfirm && e.key === 'Enter') {
            handleConfirm();
        }
    };

    return { handleKeyDown, handleTreeviewKeyDown };
};
