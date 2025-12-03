/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import BranchPopoverContent from './branch-popover-content';
import LoadPopoverContent from './load-popover-content';

export const EquipmentPopoverMap: Record<string, React.FC<any>> = {
    [(EQUIPMENT_TYPES.LINE, EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER)]: BranchPopoverContent,
    [EQUIPMENT_TYPES.LOAD]: LoadPopoverContent,
};
