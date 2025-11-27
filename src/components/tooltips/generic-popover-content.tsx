/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EquipmentType } from '@gridsuite/commons-ui';
import { EquipmentPopoverMap } from './equipment-popover-map';
import RunningStatus from 'components/utils/running-status';

interface GenericPopoverContentProps {
    equipmentType?: EquipmentType | string;
    equipmentInfos: any;
    loadFlowStatus?: RunningStatus;
}

export const GenericPopoverContent: React.FC<GenericPopoverContentProps> = ({
    equipmentType,
    equipmentInfos,
    loadFlowStatus,
}) => {
    if (!equipmentType) return null;

    const PopoverComponent = EquipmentPopoverMap[equipmentType];
    if (!PopoverComponent) return null;

    return (
        <PopoverComponent
            equipmentType={equipmentType}
            equipmentInfos={equipmentInfos}
            loadFlowStatus={loadFlowStatus}
        />
    );
};
