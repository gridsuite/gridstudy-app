/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EquipmentType } from '@gridsuite/commons-ui';
import BranchPopoverContent from './branch/branch-popover-content';
import LoadPopoverContent from './load/load-popover-content';
import { VoltageLevelPopoverContent } from './voltage-level/voltage-level-popover-content';
import GeneratorPopoverContent from './generator/generator-popover-content';

export const EquipmentPopoverMap: Record<string, React.FC<any>> = {
    [EquipmentType.LINE]: BranchPopoverContent,
    [EquipmentType.TWO_WINDINGS_TRANSFORMER]: BranchPopoverContent,
    [EquipmentType.LOAD]: LoadPopoverContent,
    [EquipmentType.VOLTAGE_LEVEL]: VoltageLevelPopoverContent,
    [EquipmentType.GENERATOR]: GeneratorPopoverContent,
};
