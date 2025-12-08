/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EquipmentType } from '@gridsuite/commons-ui';
import { Grid } from '@mui/material';
import { RunningStatus } from '../../utils/running-status';
import { BranchCharacteristicsTable } from './branch-characteristics-table';
import { BranchCurrentTable } from './branch-current-table';
import { TwtTapChangerCharacteristics } from './twt-tap-changer-characteristics';
import { BranchEquipmentInfos, TwtEquipmentInfos } from '../equipment-popover-type';
import { BranchCharacteristicsByVoltageLevel } from './branch-characteristics-by-voltageLevel';
import { BranchLimitsTable } from './branch-limit-table';

interface BranchPopoverContentProps {
    equipmentInfos: BranchEquipmentInfos;
    loadFlowStatus?: RunningStatus;
    equipmentType: EquipmentType;
}

export const BranchPopoverContent: React.FC<BranchPopoverContentProps> = ({
    equipmentInfos,
    loadFlowStatus,
    equipmentType,
}) => {
    return (
        <Grid container direction="column" rowSpacing={2} alignItems="center">
            <BranchCharacteristicsTable equipmentInfos={equipmentInfos} />
            <BranchCurrentTable equipmentInfos={equipmentInfos} loadFlowStatus={loadFlowStatus} />
            <BranchCharacteristicsByVoltageLevel equipmentInfos={equipmentInfos} />
            {equipmentType === EquipmentType.TWO_WINDINGS_TRANSFORMER && (
                <TwtTapChangerCharacteristics equipmentInfos={equipmentInfos as TwtEquipmentInfos} />
            )}
            <BranchLimitsTable equipmentInfos={equipmentInfos} loadFlowStatus={loadFlowStatus} />
        </Grid>
    );
};

export default BranchPopoverContent;
