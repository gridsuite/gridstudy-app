/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ID,
    OPERATIONAL_LIMITS_GROUPS_1,
    OPERATIONAL_LIMITS_GROUPS_2,
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

export interface LimitsGroupsContextualMenuProps {
    parentFormName: string;
    indexSelectedLimitSet1: number | null;
    indexSelectedLimitSet2: number | null;
    setIndexSelectedLimitSet1: React.Dispatch<React.SetStateAction<number | null>>;
    setIndexSelectedLimitSet2: React.Dispatch<React.SetStateAction<number | null>>;
    menuAnchorEl: PopoverProps['anchorEl'];
    handleCloseMenu: () => void;
    activatedByMenuTabIndex: number | null;
    startEditingLimitsGroup: (index: number, name: string | null) => void;
    selectedLimitsGroups1: string;
    selectedLimitsGroups2: string;
    editedLimitGroupName: string;
}

export function LimitsGroupsContextualMenu({
    parentFormName,
    indexSelectedLimitSet1,
    indexSelectedLimitSet2,
    menuAnchorEl,
    handleCloseMenu,
    activatedByMenuTabIndex,
    startEditingLimitsGroup,
    selectedLimitsGroups1,
    selectedLimitsGroups2,
    editedLimitGroupName,
    setIndexSelectedLimitSet1,
    setIndexSelectedLimitSet2,
}: Readonly<LimitsGroupsContextualMenuProps>) {
    const intl = useIntl();
    const { append: appendToLimitsGroups1, remove: removeLimitsGroups1 } = useFieldArray({
        name: `${parentFormName}.${OPERATIONAL_LIMITS_GROUPS_1}`,
    });
    const { append: appendToLimitsGroups2, remove: removeLimitsGroups2 } = useFieldArray({
        name: `${parentFormName}.${OPERATIONAL_LIMITS_GROUPS_2}`,
    });
    const { getValues, setValue } = useFormContext();

    const handleDeleteTab = () => {
        if (indexSelectedLimitSet1 !== null) {
            // if this operational limit was selected, deselect it
            if (selectedLimitsGroups1 === editedLimitGroupName) {
                setValue(`${parentFormName}.${SELECTED_LIMITS_GROUP_1}`, '');
            }
            removeLimitsGroups1(indexSelectedLimitSet1);
            setIndexSelectedLimitSet1(null);
        }
        if (indexSelectedLimitSet2 !== null) {
            if (selectedLimitsGroups2 === editedLimitGroupName) {
                setValue(`${parentFormName}.${SELECTED_LIMITS_GROUP_2}`, '');
            }
            removeLimitsGroups2(indexSelectedLimitSet2);
            setIndexSelectedLimitSet2(null);
        }
        handleCloseMenu();
    };

    const handleDuplicateTab = () => {
        let newName: string = '';
        if (indexSelectedLimitSet1 !== null) {
            const duplicatedLimits1: OperationalLimitsGroup = getValues(
                `${parentFormName}.${OPERATIONAL_LIMITS_GROUPS_1}[${indexSelectedLimitSet1}]`
            );
            newName = duplicatedLimits1.id + '_COPY';
            const newLimitsGroup1: OperationalLimitsGroup = {
                ...duplicatedLimits1,
                [ID]: newName,
            };
            appendToLimitsGroups1(newLimitsGroup1);
        }

        if (indexSelectedLimitSet2 !== null) {
            const duplicatedLimits2: OperationalLimitsGroup = getValues(
                `${parentFormName}.${OPERATIONAL_LIMITS_GROUPS_2}[${indexSelectedLimitSet2}]`
            );
            newName = duplicatedLimits2.id + '_COPY';
            const newLimitsGroup2: OperationalLimitsGroup = {
                ...duplicatedLimits2,
                [ID]: newName,
            };
            appendToLimitsGroups2(newLimitsGroup2);
        }
        startEditingLimitsGroup(getValues(`${parentFormName}.${OPERATIONAL_LIMITS_GROUPS_1}`).length - 1, newName);
    };

    return (
        <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleCloseMenu}>
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
            <MenuItem onClick={handleDuplicateTab}>
                <ListItemIcon>
                    <ContentCopy fontSize="small" />
                </ListItemIcon>
                <ListItemText>{intl.formatMessage({ id: 'Duplicate' })}</ListItemText>
            </MenuItem>
        </Menu>
    );
}
