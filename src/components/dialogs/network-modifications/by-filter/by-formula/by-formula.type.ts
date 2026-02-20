/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Filter } from '../commons/by-filter.type';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { EquipmentType } from '@gridsuite/commons-ui';
import { ByFormulaModificationInfos } from '../../../../../services/network-modification-types';

// TODO DBR rm ?
interface ByFormulaFormData {
    type: EquipmentType | null;
    filters: Filter[];
}

export type ByFormulaDialogProps = NetworkModificationDialogProps & {
    editData: ByFormulaModificationInfos;
};
