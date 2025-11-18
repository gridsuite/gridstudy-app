/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    APPLICABIlITY,
    CURRENT_LIMITS,
    DELETION_MARK,
    ENABLE_OLG_MODIFICATION,
    ID,
    LIMITS,
    LIMITS_PROPERTIES,
    NAME,
    OPERATIONAL_LIMITS_GROUPS,
    PERMANENT_LIMIT,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS,
    VALUE,
} from '../../utils/field-constants';

export interface LimitsFormSchema {
    [LIMITS]: OperationalLimitsGroupsFormSchema;
}

export interface OperationalLimitsGroupsFormSchema {
    [OPERATIONAL_LIMITS_GROUPS]: OperationalLimitsGroupFormSchema[];
    [SELECTED_LIMITS_GROUP_1]?: string;
    [SELECTED_LIMITS_GROUP_2]?: string;
    [ENABLE_OLG_MODIFICATION]: boolean;
}

export interface OperationalLimitsGroupFormSchema {
    [ID]: string;
    [NAME]: string;
    [APPLICABIlITY]?: string;
    [CURRENT_LIMITS]: CurrentLimitsFormSchema;
    [LIMITS_PROPERTIES]?: LimitsPropertyFormSchema[];
}

export interface CurrentLimitsFormSchema {
    [PERMANENT_LIMIT]: number | null;
    [TEMPORARY_LIMITS]: TemporaryLimitFormSchema[];
}

interface LimitsPropertyFormSchema {
    [NAME]: string;
    [VALUE]: string;
}

export interface TemporaryLimitFormSchema {
    [TEMPORARY_LIMIT_DURATION]: number | null;
    [TEMPORARY_LIMIT_VALUE]: number | null;
    [TEMPORARY_LIMIT_NAME]: string;
}
