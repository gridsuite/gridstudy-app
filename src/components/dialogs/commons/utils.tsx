/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export function getIdOrValue(value: { id: string; label: string } | string) {
    return typeof value !== 'string' ? value?.id ?? null : value;
}

export function getLabelOrValue(value: { id: string; label: string } | string) {
    return typeof value !== 'string' ? value?.label ?? null : value;
}
