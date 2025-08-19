/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { APPLICABILITY } from '../../network/constants';
import { areArrayElementsUnique } from '../../utils/utils';

export interface OperationalLimitsId {
    name: string;
    applicability: string;
}

export const areOperationalLimitsGroupUnique = (array: OperationalLimitsId[]) => {
    const equipmentApplicabilityElements: string[] = array
        .filter((item: OperationalLimitsId) => item.applicability === APPLICABILITY.EQUIPMENT.id)
        .map((item) => item.name);

    if (
        equipmentApplicabilityElements.map((item) => array.filter((arrayItem) => arrayItem.name === item).length > 1)
            .length > 0
    ) {
        return false;
    }

    const otherApplicabilityElements: string[] = array
        .filter((item: OperationalLimitsId) => item.applicability !== APPLICABILITY.EQUIPMENT.id)
        .map((item) => item.name + item.applicability);
    return areArrayElementsUnique(otherApplicabilityElements);
};
