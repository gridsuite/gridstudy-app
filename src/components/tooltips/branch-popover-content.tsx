/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EquipmentType } from '@gridsuite/commons-ui';
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
