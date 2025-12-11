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
