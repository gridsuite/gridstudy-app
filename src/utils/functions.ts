/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// this method checks if an object is empty or has at least one property
export function isObjectEmpty(obj: any) {
    return obj == null || Object.keys(obj).length === 0;
}
