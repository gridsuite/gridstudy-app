/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SuppressKeyboardEventParams } from 'ag-grid-community';
import type { Key } from 'ts-key-enum';

// @ts-expect-error TS2748: Cannot access ambient const enums when `isolatedModules` is enabled.
export const ALLOWED_KEYS = [Key.Escape, Key.ArrowDown, Key.ArrowUp, Key.ArrowLeft, Key.ArrowRight];

// we filter enter key event to prevent closing or opening edit mode
export function suppressKeyEvent(params: SuppressKeyboardEventParams<unknown, unknown>) {
    return !ALLOWED_KEYS.includes(params.event.key as Key);
}
