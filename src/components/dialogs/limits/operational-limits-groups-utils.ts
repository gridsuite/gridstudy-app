/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    APPLICABILITY_FIELD,
    CURRENT_LIMITS,
    DELETION_MARK,
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
import type { MuiStyles } from '@gridsuite/commons-ui';

function generateEmptyTemporaryLimitArray(): TemporaryLimitFormSchema[] {
    return [
        {
            [TEMPORARY_LIMIT_NAME]: '',
            [TEMPORARY_LIMIT_DURATION]: null,
            [TEMPORARY_LIMIT_VALUE]: null,
            [DELETION_MARK]: false,
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

export const limitsStyles = {
    limitsBackground: {
        p: 1,
        minHeight: 60,
    },
    copyLimitsToRightBackground: {
        height: 200,
        display: 'flex',
    },
    copyLimitsToLeftBackground: {
        height: '50%',
    },
    copyLimitsButtons: {
        alignSelf: 'flex-end',
        minWidth: '0px',
        height: 'auto',
        padding: '1',
    },
} as const satisfies MuiStyles;

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
