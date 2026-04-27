/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FieldConstants } from '@gridsuite/commons-ui';
import {
    ACTIVE_POWER_SET_POINT,
    CONNECTIVITY,
    DROOP,
    FREQUENCY_REGULATION,
    MAXIMUM_ACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    REACTIVE_LIMITS,
    REACTIVE_POWER_SET_POINT,
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE,
} from 'components/utils/field-constants';

export enum BatteryDialogTab {
    CONNECTIVITY_TAB = 0,
    LIMITS_AND_SETPOINTS_TAB = 1,
    SPECIFIC_TAB = 2,
    ADDITIONAL_INFORMATION_TAB = 3,
}

// The hook types field names as FieldConstants (from commons-ui), but react-hook-form's errors
// object is keyed by the raw field name strings — so app-local constants are compatible at runtime
// even when they aren't part of the commons-ui enum. The double cast keeps TypeScript happy.
export const BATTERY_TAB_FIELDS: Readonly<Partial<Record<BatteryDialogTab, FieldConstants[]>>> = {
    [BatteryDialogTab.CONNECTIVITY_TAB]: [CONNECTIVITY] as unknown as FieldConstants[],
    [BatteryDialogTab.LIMITS_AND_SETPOINTS_TAB]: [
        MINIMUM_ACTIVE_POWER,
        MAXIMUM_ACTIVE_POWER,
        REACTIVE_LIMITS,
        ACTIVE_POWER_SET_POINT,
        REACTIVE_POWER_SET_POINT,
        FREQUENCY_REGULATION,
        DROOP,
    ] as unknown as FieldConstants[],
    [BatteryDialogTab.SPECIFIC_TAB]: [TRANSIENT_REACTANCE, TRANSFORMER_REACTANCE] as unknown as FieldConstants[],
    [BatteryDialogTab.ADDITIONAL_INFORMATION_TAB]: [FieldConstants.ADDITIONAL_PROPERTIES],
};
