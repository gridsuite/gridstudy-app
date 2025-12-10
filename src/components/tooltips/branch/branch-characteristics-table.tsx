/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { styles } from '../generic-equipment-popover-utils';
import { BranchEquipmentInfos } from '../equipment-popover-type';
import { renderCommonCharacteristicsTable } from './branch-utils';

interface BranchCharacteristicsProps {
    equipmentInfos: BranchEquipmentInfos;
}
export const BranchCharacteristicsTable: React.FC<BranchCharacteristicsProps> = ({ equipmentInfos }) => {
    return (
        <Grid item sx={styles.grid}>
            {renderCommonCharacteristicsTable(equipmentInfos)}
        </Grid>
    );
};
