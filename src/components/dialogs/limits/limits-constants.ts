/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum LimitsPropertyName {
    LIMITS_TYPE = 'Limit type',
}

export function getPropertyAvatar(type: string): string {
    const transformedType: LimitsPropertyName = type as LimitsPropertyName;

    const descriptions: Record<LimitsPropertyName, string> = {
        [LimitsPropertyName.LIMITS_TYPE]: 'Ty',
    };

    return descriptions[transformedType] ?? transformedType.substring(0, 2);
}
