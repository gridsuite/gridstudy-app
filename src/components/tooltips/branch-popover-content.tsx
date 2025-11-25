/* eslint-disable prettier/prettier */
import { EquipmentInfos, EquipmentType } from '@gridsuite/commons-ui';
import { Grid } from '@mui/material';
import { RunningStatus } from '../utils/running-status';
import { IntlShape } from 'react-intl';
import { renderVoltageLevelCharacteristics } from './generic-equipment-popover-utils';
import { CharacteristicsTable } from './carateristics-table';
import { CurrentTable } from './current-table';
import { LimitsTable } from './limit-table';

interface BranchPopoverContentProps {
    equipmentInfos: any;
    loadFlowStatus?: RunningStatus;
    intl: IntlShape;
    equipmentType?: EquipmentType;
}

export const BranchPopoverContent: React.FC<BranchPopoverContentProps> = ({
    equipmentInfos,
    loadFlowStatus,
    intl,
    equipmentType,
}) => {
    return (
        <Grid container direction="column" rowSpacing={2} alignItems="center">
             <CharacteristicsTable
                equipmentInfos={equipmentInfos}
                intl={intl}
                renderVoltageLevelCharacteristics={(equipmentInfos, intl) =>
                    renderVoltageLevelCharacteristics(equipmentInfos, equipmentType, intl)
                }
            />
             <CurrentTable equipmentInfos={equipmentInfos} intl={intl} loadFlowStatus={loadFlowStatus} />

             <LimitsTable equipmentInfos={equipmentInfos} intl={intl} loadFlowStatus={loadFlowStatus} />
        </Grid>
    );
};

export default BranchPopoverContent;
