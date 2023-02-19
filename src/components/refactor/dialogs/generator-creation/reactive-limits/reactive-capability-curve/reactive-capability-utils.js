/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    toNumber,
    validateValueIsANumber,
} from '../../../../../util/validation-functions';

export function checkPUnique(values) {
    const everyValidP = values
        .map((element) =>
            // Note : convertion toNumber is necessary here to prevent corner cases like if
            // two values are "-0" and "0", which would be considered different by the Set below.
            validateValueIsANumber(element.p) ? toNumber(element.p) : null
        )
        .filter((p) => p !== null);
    const setOfPs = [...new Set(everyValidP)];
    return setOfPs.length === everyValidP.length;
}
