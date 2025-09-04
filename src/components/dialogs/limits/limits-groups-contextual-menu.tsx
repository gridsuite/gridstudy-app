/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ID,
    OPERATIONAL_LIMITS_GROUPS,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
} from '../../utils/field-constants';
import { useFieldArray, useFormContext } from 'react-hook-form';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import { ContentCopy, Delete, Edit } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { useIntl } from 'react-intl';
import { OperationalLimitsGroup } from '../../../services/network-modification-types';
import { PopoverProps } from '@mui/material/Popover';
import { APPLICABILITY } from '../../network/constants';

export interface LimitsGroupsContextualMenuProps {
    parentFormName: string;
    indexSelectedLimitSet: number | null;
    setIndexSelectedLimitSet: React.Dispatch<React.SetStateAction<number | null>>;
    menuAnchorEl: PopoverProps['anchorEl'];
    handleCloseMenu: () => void;
    activatedByMenuTabIndex: number | null;
    startEditingLimitsGroup: (index: number, name: string | null) => void;
    selectedLimitsGroups1: string;
    selectedLimitsGroups2: string;
    isModification: boolean;
}

export function LimitsGroupsContextualMenu({
    parentFormName,
    indexSelectedLimitSet,
    setIndexSelectedLimitSet,
    menuAnchorEl,
    handleCloseMenu,
    activatedByMenuTabIndex,
    startEditingLimitsGroup,
    selectedLimitsGroups1,
    selectedLimitsGroups2,
    isModification,
}: Readonly<LimitsGroupsContextualMenuProps>) {
    const intl = useIntl();
    const operationalLimitsGroupsFormName: string = `${parentFormName}.${OPERATIONAL_LIMITS_GROUPS}`;
    const { append: appendToLimitsGroups, remove: removeLimitsGroups } = useFieldArray({
        name: operationalLimitsGroupsFormName,
    });
    const { getValues, setValue } = useFormContext();

    const handleDeleteTab = () => {
        if (indexSelectedLimitSet !== null) {
            const tabName: string = getValues(operationalLimitsGroupsFormName)?.[indexSelectedLimitSet]?.name;
            const applicability: string = getValues(operationalLimitsGroupsFormName)?.[indexSelectedLimitSet]
                ?.applicability;
            // if this operational limit was selected, deselect it
            if (
                selectedLimitsGroups1 === tabName &&
                (applicability === APPLICABILITY.SIDE1.id || applicability === APPLICABILITY.EQUIPMENT.id)
            ) {
                setValue(`${parentFormName}.${SELECTED_LIMITS_GROUP_1}`, null);
            }
            if (
                selectedLimitsGroups2 === tabName &&
                (applicability === APPLICABILITY.SIDE2.id || applicability === APPLICABILITY.EQUIPMENT.id)
            ) {
                setValue(`${parentFormName}.${SELECTED_LIMITS_GROUP_2}`, null);
            }
            removeLimitsGroups(indexSelectedLimitSet);
            setIndexSelectedLimitSet(null);
        }
        handleCloseMenu();
    };

    const handleDuplicateTab = () => {
        let newName: string = '';
        if (indexSelectedLimitSet !== null) {
            const duplicatedLimits1: OperationalLimitsGroup = getValues(
                `${operationalLimitsGroupsFormName}[${indexSelectedLimitSet}]`
            );
            newName = duplicatedLimits1.name + '_COPY';
            const newLimitsGroup1: OperationalLimitsGroup = {
                ...duplicatedLimits1,
                [ID]: newName,
            };
            appendToLimitsGroups(newLimitsGroup1);
            setIndexSelectedLimitSet(getValues(`${operationalLimitsGroupsFormName}`).length - 1);
        }
        startEditingLimitsGroup(getValues(operationalLimitsGroupsFormName).length - 1, newName);
    };

    return (
        <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleCloseMenu}>
            {!isModification /* TODO : uncomment this when the removal of operational limits groups will be possible in powsybl network store */ && (
                <>
                    <MenuItem
                        onClick={() =>
                            activatedByMenuTabIndex != null && startEditingLimitsGroup(activatedByMenuTabIndex, null)
                        }
                    >
                        <ListItemIcon>
                            <Edit fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{intl.formatMessage({ id: 'Rename' })}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleDeleteTab}>
                        <ListItemIcon>
                            <Delete fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{intl.formatMessage({ id: 'DeleteFromMenu' })}</ListItemText>
                    </MenuItem>
                </>
            )}
            <MenuItem onClick={handleDuplicateTab}>
                <ListItemIcon>
                    <ContentCopy fontSize="small" />
                </ListItemIcon>
                <ListItemText>{intl.formatMessage({ id: 'Duplicate' })}</ListItemText>
            </MenuItem>
        </Menu>
    );
}
