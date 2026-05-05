/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FieldConstants } from '@gridsuite/commons-ui';

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
    [BatteryDialogTab.CONNECTIVITY_TAB]: [FieldConstants.CONNECTIVITY],
    [BatteryDialogTab.LIMITS_AND_SETPOINTS_TAB]: [
        FieldConstants.MINIMUM_ACTIVE_POWER,
        FieldConstants.MAXIMUM_ACTIVE_POWER,
        FieldConstants.REACTIVE_LIMITS,
        FieldConstants.ACTIVE_POWER_SET_POINT,
        FieldConstants.REACTIVE_POWER_SET_POINT,
        FieldConstants.FREQUENCY_REGULATION,
        FieldConstants.DROOP,
    ],
    [BatteryDialogTab.SPECIFIC_TAB]: [FieldConstants.TRANSIENT_REACTANCE, FieldConstants.TRANSFORMER_REACTANCE],
    [BatteryDialogTab.ADDITIONAL_INFORMATION_TAB]: [FieldConstants.ADDITIONAL_PROPERTIES],
};
