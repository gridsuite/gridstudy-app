/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum LimitsPropertyName {
    LIMITS_TYPE = 'LimitsType',
    ASSOCIATION = 'association',
    ORIGIN = 'origin',
}

export function getPropertyAvatar(type: string): string {
    const transformedType: LimitsPropertyName | undefined = type as LimitsPropertyName;

    const descriptions: Record<LimitsPropertyName, string> = {
        [LimitsPropertyName.LIMITS_TYPE]: 'Ty',
        [LimitsPropertyName.ASSOCIATION]: 'As',
        [LimitsPropertyName.ORIGIN]: 'Pr',
    };

    return descriptions[transformedType] ?? transformedType.substring(0, 2);
}
