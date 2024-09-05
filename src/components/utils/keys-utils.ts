/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SuppressKeyboardEventParams } from 'ag-grid-community';

export const ALLOWED_KEYS = ['Escape', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'] as const;

// we filter enter key event to prevent closing or opening edit mode
export function suppressKeyEvent(params: SuppressKeyboardEventParams<unknown, unknown>) {
    // @ts-expect-error TS2345: Argument of type string is not assignable to parameter of type union
    return !ALLOWED_KEYS.includes(params.event.key);
}
