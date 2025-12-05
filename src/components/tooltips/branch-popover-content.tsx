/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EquipmentType } from '@gridsuite/commons-ui';
import { Grid } from '@mui/material';
import { RunningStatus } from '../utils/running-status';
import { BranchCharacteristicsTable } from './branch-characteristics-table';
import { CurrentTable } from './current-table';
import { LimitsTable } from './limit-table';
import { TwtCharacteristicsMode } from './twt-characteristics-mode';
import { BranchEquipmentInfos, TwtEquipmentInfos } from './equipment-popover-type';
import { CharacteristicsByVoltageLevel } from './characteristics-by-VoltageLevel';

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
            <CurrentTable equipmentInfos={equipmentInfos} loadFlowStatus={loadFlowStatus} />
            <CharacteristicsByVoltageLevel equipmentInfos={equipmentInfos} />
            {equipmentType === EquipmentType.TWO_WINDINGS_TRANSFORMER && (
                <TwtCharacteristicsMode equipmentInfos={equipmentInfos as TwtEquipmentInfos} />
            )}
            <LimitsTable equipmentInfos={equipmentInfos} loadFlowStatus={loadFlowStatus} />
        </Grid>
    );
};

export default BranchPopoverContent;
