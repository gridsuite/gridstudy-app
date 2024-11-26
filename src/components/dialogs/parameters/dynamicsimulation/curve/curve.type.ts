/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ItemData } from './common/checkbox-treeview';
import { EquipmentType } from '@gridsuite/commons-ui';

// --- Types for frontend --- //

export interface DynamicSimulationModel {
    name: string;
    equipmentType: EquipmentType;
}

export type ModelVariable = ItemData & {
    variableId?: string;
};

export interface Curve {
    equipmentType: EquipmentType;
    equipmentId: string;
    variableId?: string;
}
