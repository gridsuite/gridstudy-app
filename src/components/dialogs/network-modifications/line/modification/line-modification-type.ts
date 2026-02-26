/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { OperationalLimitsGroupsFormSchema } from '../../../limits/operational-limits-groups-types';
import {
    CHARACTERISTICS,
    CONNECTIVITY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    LIMITS,
    STATE_ESTIMATION,
} from '../../../../utils/field-constants';
import { FieldConstants, Property } from '@gridsuite/commons-ui';

export interface LineCharacteristics {
    r: number | null;
    x: number | null;
    g1: number | null;
    b1: number | null;
    g2: number | null;
    b2: number | null;
}

export interface LineModificationFormSchema {
    [EQUIPMENT_ID]?: string;
    [EQUIPMENT_NAME]?: string;
    [CONNECTIVITY]: any;
    [CHARACTERISTICS]: any;
    [LIMITS]: OperationalLimitsGroupsFormSchema;
    [FieldConstants.ADDITIONAL_PROPERTIES]?: Property[];
    [STATE_ESTIMATION]: any;
}
