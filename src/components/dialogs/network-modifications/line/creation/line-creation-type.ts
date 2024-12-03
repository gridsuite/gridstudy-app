/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPES } from '../../../../utils/equipment-types';

export interface CurrentLimitsData {
    id: string;
    temporaryLimits: TemporaryLimitData[];
    permanentLimit?: number;
}

export interface TemporaryLimitData {
    name: string;
    acceptableDuration?: number;
    value?: number;
}
