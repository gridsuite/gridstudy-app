/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    APPLICABIlITY,
    CURRENT_LIMITS,
    ID,
    NAME,
    OPERATIONAL_LIMITS_GROUPS,
    PERMANENT_LIMIT,
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
import { PopoverProps } from '@mui/material/Popover';
import { APPLICABILITY } from '../../network/constants';
import { OperationalLimitsGroupFormInfos } from '../network-modifications/line/modification/line-modification-type';
import { CurrentLimits } from '../../../services/network-modification-types';

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
    currentLimitsToModify: CurrentLimits[];
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
    currentLimitsToModify,
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
            const duplicatedLimits1: OperationalLimitsGroupFormInfos = getValues(
                `${operationalLimitsGroupsFormName}[${indexSelectedLimitSet}]`
            );
            newName = duplicatedLimits1.name + '_COPY';
            const newLimitsGroup1: OperationalLimitsGroupFormInfos = {
                ...duplicatedLimits1,
                [ID]: newName,
            };
            // if the permanent limit is undefined in the form we try to get the previous value of the corresponding current limit
            if (!newLimitsGroup1[CURRENT_LIMITS][PERMANENT_LIMIT]) {
                newLimitsGroup1[CURRENT_LIMITS][PERMANENT_LIMIT] =
                    currentLimitsToModify.find(
                        (cl: CurrentLimits) =>
                            cl.id === duplicatedLimits1[NAME] && cl.applicability === duplicatedLimits1[APPLICABIlITY]
                    )?.permanentLimit ?? null;
            }

            appendToLimitsGroups(newLimitsGroup1);
            setIndexSelectedLimitSet(getValues(`${operationalLimitsGroupsFormName}`).length - 1);
        }
        startEditingLimitsGroup(getValues(operationalLimitsGroupsFormName).length - 1, newName);
    };

    return (
        <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleCloseMenu}>
            {!isModification /* TODO : Remove this when the removal of operational limits groups will be possible in powsybl network store */ && (
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
