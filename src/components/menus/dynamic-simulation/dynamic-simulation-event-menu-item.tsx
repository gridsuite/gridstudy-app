/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getEventType } from '../../dialogs/dynamicsimulation/event/model/event.model';
import { EQUIPMENT_TYPE_LABEL_KEYS } from '../../graph/util/model-constants';
import ListItemIcon from '@mui/material/ListItemIcon';
import OfflineBoltOutlinedIcon from '@mui/icons-material/OfflineBoltOutlined';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useIntl } from 'react-intl';
import { CustomMenuItem } from '../../utils/custom-nested-menu';
import { EquipmentType } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';

const styles = {
    menuItem: {
        // NestedMenu item manages only label prop of string type
        // It fix paddings itself then we must force this padding
        // to justify menu items texts
        paddingLeft: '12px',
    },
};

interface DynamicSimulationEventMenuItemProps {
    equipmentId: string;
    equipmentType: EquipmentType;
    onOpenDynamicSimulationEventDialog: (
        equipmentId: string,
        equipmentType: EquipmentType,
        dialogTitle: string
    ) => void;
    disabled: boolean;
}

const DynamicSimulationEventMenuItem = (props: DynamicSimulationEventMenuItemProps) => {
    const intl = useIntl();
    const { equipmentId, equipmentType, onOpenDynamicSimulationEventDialog, disabled } = props;
    return (
        <CustomMenuItem
            sx={styles.menuItem}
            onClick={() =>
                onOpenDynamicSimulationEventDialog(
                    equipmentId,
                    equipmentType,
                    `${getEventType(equipmentType)}${EQUIPMENT_TYPE_LABEL_KEYS[equipmentType]}`
                )
            }
            disabled={disabled}
        >
            <ListItemIcon>
                <OfflineBoltOutlinedIcon />
            </ListItemIcon>
            <ListItemText
                primary={
                    <Typography noWrap>
                        {intl.formatMessage({
                            id: `${getEventType(equipmentType)}${
                                EQUIPMENT_TYPE_LABEL_KEYS[
                                    EQUIPMENT_TYPES[equipmentType as keyof typeof EQUIPMENT_TYPES]
                                ]
                            }`,
                        })}
                        {' ('}
                        {intl.formatMessage({
                            id: 'DynamicSimulation',
                        })}
                        {')'}
                    </Typography>
                }
            />
        </CustomMenuItem>
    );
};

export default DynamicSimulationEventMenuItem;
