/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EquipmentType } from '@gridsuite/commons-ui';
import { Grid } from '@mui/material';
import { RunningStatus } from '../utils/running-status';
import { CharacteristicsTable } from './carateristics-table';
import { CurrentTable } from './current-table';
import { LimitsTable } from './limit-table';
import { TwoCharacteristicsByVoltageLevel } from './twt-carateristics-by-VoltageLevel';
import { TwoCharacteristicsMode } from './twt-carateristics-mode';
import { BranchEquipmentInfos } from './equipment-popover-type';

interface BranchPopoverContentProps {
    equipmentInfos: BranchEquipmentInfos;
    loadFlowStatus?: RunningStatus;
    equipmentType?: EquipmentType;
}

export const BranchPopoverContent: React.FC<BranchPopoverContentProps> = ({
    equipmentInfos,
    loadFlowStatus,
    equipmentType,
}) => {
    return (
        <Grid container direction="column" rowSpacing={2} alignItems="center">
            <CharacteristicsTable equipmentInfos={equipmentInfos} />
            <CurrentTable equipmentInfos={equipmentInfos} loadFlowStatus={loadFlowStatus} />
            <TwoCharacteristicsByVoltageLevel equipmentInfos={equipmentInfos} />
            {equipmentType === EquipmentType.TWO_WINDINGS_TRANSFORMER && (
                <TwoCharacteristicsMode equipmentInfos={equipmentInfos} />
            )}
            <LimitsTable equipmentInfos={equipmentInfos} loadFlowStatus={loadFlowStatus} />
        </Grid>
    );
};

export default BranchPopoverContent;
