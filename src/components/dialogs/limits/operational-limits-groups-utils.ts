/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    APPLICABILITY_FIELD,
    CURRENT_LIMITS,
    ID,
    LIMITS_PROPERTIES,
    NAME,
    PERMANENT_LIMIT,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS,
} from 'components/utils/field-constants';
import { APPLICABILITY } from 'components/network/constants';
import { OperationalLimitsGroupFormSchema, TemporaryLimitFormSchema } from './operational-limits-groups-types';

function generateEmptyTemporaryLimitArray(): TemporaryLimitFormSchema[] {
    return [
        {
            [TEMPORARY_LIMIT_NAME]: '',
            [TEMPORARY_LIMIT_DURATION]: null,
            [TEMPORARY_LIMIT_VALUE]: null,
        },
    ];
}

export function generateEmptyOperationalLimitsGroup(name: string): OperationalLimitsGroupFormSchema {
    return {
        [ID]: name + APPLICABILITY.EQUIPMENT.id,
        [NAME]: name,
        [APPLICABILITY_FIELD]: APPLICABILITY.EQUIPMENT.id,
        [LIMITS_PROPERTIES]: [],
        [CURRENT_LIMITS]: {
            [TEMPORARY_LIMITS]: generateEmptyTemporaryLimitArray(),
            [PERMANENT_LIMIT]: null,
        },
    };
}

export function generateUniqueId(baseName: string, names: string[]): string {
    let finalId = baseName;
    let found = false;
    let increment = 1;
    let suffix = '';
    do {
        found = names.includes(baseName + suffix, 0);
        if (found) {
            increment++;
            suffix = '(' + increment + ')';
            finalId = baseName + suffix;
        }
    } while (found);

    return finalId;
}
