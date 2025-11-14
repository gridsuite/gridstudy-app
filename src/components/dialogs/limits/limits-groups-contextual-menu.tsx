/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ID, SELECTED_LIMITS_GROUP_1, SELECTED_LIMITS_GROUP_2 } from '../../utils/field-constants';
import { FieldValues, UseFieldArrayAppend, UseFieldArrayRemove, useFormContext } from 'react-hook-form';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import { ContentCopy, Delete, Edit } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { useIntl } from 'react-intl';
import { APPLICABILITY } from '../../network/constants';
import { useCallback } from 'react';
import { CurrentLimitsData } from '../../../services/study/network-map.type';
import { OperationalLimitsGroupFormSchema } from './operational-limits-groups-types';

export interface ContextMenuCoordinates {
    x: null | number;
    y: null | number;
    tabIndex: null | number;
}

export interface LimitsGroupsContextualMenuProps {
    parentFormName: string;
    indexSelectedLimitSet: number | null;
    setIndexSelectedLimitSet: React.Dispatch<React.SetStateAction<number | null>>;
    handleCloseMenu: () => void;
    contextMenuCoordinates: ContextMenuCoordinates;
    startEditingLimitsGroup: (index: number, name: string | null) => void;
    selectedLimitsGroups1: string;
    selectedLimitsGroups2: string;
    currentLimitsToModify: CurrentLimitsData[];
    operationalLimitsGroups: FieldValues;
    appendToLimitsGroups: UseFieldArrayAppend<
        {
            [p: string]: OperationalLimitsGroupFormSchema[];
        },
        string
    >;
    removeLimitsGroups: UseFieldArrayRemove;
}

export function LimitsGroupsContextualMenu({
    parentFormName,
    indexSelectedLimitSet,
    setIndexSelectedLimitSet,
    handleCloseMenu,
    contextMenuCoordinates,
    startEditingLimitsGroup,
    selectedLimitsGroups1,
    selectedLimitsGroups2,
    operationalLimitsGroups,
    appendToLimitsGroups,
    removeLimitsGroups,
}: Readonly<LimitsGroupsContextualMenuProps>) {
    const intl = useIntl();
    const { setValue } = useFormContext();

    const handleDeleteTab = useCallback(() => {
        if (indexSelectedLimitSet !== null) {
            const tabName: string = operationalLimitsGroups[indexSelectedLimitSet]?.name;
            const applicability: string = operationalLimitsGroups[indexSelectedLimitSet]?.applicability ?? '';
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
    }, [
        handleCloseMenu,
        indexSelectedLimitSet,
        operationalLimitsGroups,
        parentFormName,
        removeLimitsGroups,
        selectedLimitsGroups1,
        selectedLimitsGroups2,
        setIndexSelectedLimitSet,
        setValue,
    ]);

    const handleDuplicateTab = useCallback(() => {
        let newName: string = '';
        if (indexSelectedLimitSet !== null) {
            const duplicatedLimits1: OperationalLimitsGroupFormSchema = operationalLimitsGroups[indexSelectedLimitSet];
            newName = duplicatedLimits1.name + '_COPY';
            const newLimitsGroup1: OperationalLimitsGroupFormSchema = {
                ...duplicatedLimits1,
                [ID]: newName,
            };
            appendToLimitsGroups(newLimitsGroup1);
            setIndexSelectedLimitSet(operationalLimitsGroups.length - 1);
        }
        startEditingLimitsGroup(operationalLimitsGroups.length, newName);
    }, [
        appendToLimitsGroups,
        indexSelectedLimitSet,
        setIndexSelectedLimitSet,
        startEditingLimitsGroup,
        operationalLimitsGroups,
    ]);

    const handleRenameTab = useCallback(() => {
        contextMenuCoordinates.tabIndex != null && startEditingLimitsGroup(contextMenuCoordinates.tabIndex, null);
    }, [contextMenuCoordinates.tabIndex, startEditingLimitsGroup]);

    return (
        <Menu
            open={contextMenuCoordinates.tabIndex != null}
            onClose={handleCloseMenu}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenuCoordinates.y !== null && contextMenuCoordinates.x !== null
                    ? { top: contextMenuCoordinates.y, left: contextMenuCoordinates.x }
                    : undefined
            }
        >
            <MenuItem onClick={handleRenameTab}>
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
