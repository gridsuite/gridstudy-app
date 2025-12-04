import { EquipmentType } from '@gridsuite/commons-ui';
import { VoltageLevelTooltipInfos } from '../equipment-popover-type';
import { VoltageLevelPopoverBusInfos } from './voltage-level-popover-bus-infos';
import { Grid, TableRow } from '@mui/material';
import { CellRender } from '../cell-render';
import { styles } from '../generic-equipment-popover-utils';
import { VoltageLevelPopoverInfos } from './voltage-level-popover-infos';

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
