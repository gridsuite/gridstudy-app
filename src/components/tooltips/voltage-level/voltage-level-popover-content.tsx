/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { VoltageLevelTooltipInfos } from '../equipment-popover-type';
import { Grid } from '@mui/material';
import { VoltageLevelPopoverInfos } from './voltage-level-popover-infos';
import { VoltageLevelPopoverBusInfos } from './voltage-level-popover-bus-infos';

export interface VoltageLevelPopoverContent {
    equipmentInfos?: VoltageLevelTooltipInfos;
}

export const VoltageLevelPopoverContent = ({ equipmentInfos }: VoltageLevelPopoverContent) => {
    return (
        <Grid container direction="column" rowSpacing={2} alignItems="center">
            <VoltageLevelPopoverBusInfos buses={equipmentInfos?.busInfos} />
            <VoltageLevelPopoverInfos equipmentInfos={equipmentInfos} />
        </Grid>
    );
};
