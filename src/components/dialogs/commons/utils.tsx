/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { KeyCode, SuppressKeyboardEventParams } from 'ag-grid-community';

export function getIdOrValue(value: any) {
    return typeof value !== 'string' ? value?.id ?? null : value;
}

export function getLabelOrValue(value: any) {
    return typeof value !== 'string' ? value?.label ?? null : value;
}

const ALLOWED_KEYS: readonly string[] = [KeyCode.ESCAPE, KeyCode.DOWN, KeyCode.UP, KeyCode.LEFT, KeyCode.RIGHT];

/** we filter enter key event to prevent closing or opening edit mode */
export function suppressEventsToPreventEditMode<TData = any, TValue = any>(
    params: SuppressKeyboardEventParams<TData, TValue>
) {
    return !ALLOWED_KEYS.includes(params.event.key);
}
