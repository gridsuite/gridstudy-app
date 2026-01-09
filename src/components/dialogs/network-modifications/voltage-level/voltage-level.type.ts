/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    ADD_SUBSTATION_CREATION,
    ADDITIONAL_PROPERTIES,
    BUS_BAR_COUNT,
    COUNTRY,
    COUPLING_OMNIBUS,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
    HIGH_VOLTAGE_LIMIT,
    IS_ATTACHMENT_POINT_CREATION,
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
    LOW_VOLTAGE_LIMIT,
    NOMINAL_V,
    SECTION_COUNT,
    SUBSTATION_CREATION,
    SUBSTATION_CREATION_ID,
    SUBSTATION_ID,
    SUBSTATION_NAME,
    SWITCH_KIND,
    SWITCH_KINDS,
    SWITCHES_BETWEEN_SECTIONS,
    TOPOLOGY_KIND,
} from '../../../utils/field-constants';
import { UUID } from 'node:crypto';
import { Properties, Property } from '../common/properties/property-utils';
import { CreateCouplingDeviceDialogSchemaForm } from '../coupling-device/coupling-device-dialog.type';

export interface VoltageLevelFormInfos {
    equipmentId: string;
    equipmentName?: string | null;
    substationId?: string | null;
    topologyKind?: string | null;
}

export type SwitchKindFormData = { [SWITCH_KIND]: string };

export interface VoltageLevelCreationFormData {
    [EQUIPMENT_ID]: string;
    [EQUIPMENT_NAME]: string;
    [SUBSTATION_ID]: string | null;
    [NOMINAL_V]: number | null;
    [LOW_VOLTAGE_LIMIT]: number | null;
    [HIGH_VOLTAGE_LIMIT]: number | null;
    [LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: number | null;
    [HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]: number | null;
    [BUS_BAR_COUNT]: number;
    [SECTION_COUNT]: number;
    [SWITCHES_BETWEEN_SECTIONS]: string;
    [COUPLING_OMNIBUS]: CreateCouplingDeviceDialogSchemaForm[];
    [SWITCH_KINDS]: SwitchKindFormData[];
    [ADD_SUBSTATION_CREATION]: boolean;
    [SUBSTATION_CREATION_ID]: string | null;
    [SUBSTATION_NAME]: string | null;
    [COUNTRY]: string | null;
    [IS_ATTACHMENT_POINT_CREATION]: boolean;
    [SUBSTATION_CREATION]: Properties;
    [TOPOLOGY_KIND]: string | null;
    [ADDITIONAL_PROPERTIES]?: Property[];
    uuid?: UUID;
}
