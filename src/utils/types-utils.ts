/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const isNonEmptyStringOrArray = (value: unknown): value is string | unknown[] => {
    if (typeof value === 'string' && value.length > 0) {
        return true;
    }
    return Array.isArray(value) && value.length > 0;
};
