/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Tab, Tabs, TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { ContentCopy, Delete, Edit } from '@mui/icons-material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    CURRENT_LIMITS,
    ID,
    LIMITS,
    OPERATIONAL_LIMITS_GROUPS_1,
    OPERATIONAL_LIMITS_GROUPS_2,
    PERMANENT_LIMIT,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
    TEMPORARY_LIMITS,
} from '../../utils/field-constants';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { tabStyles } from '../../parameters-tabs';
import { OperationalLimitsGroup } from '../../../services/network-modification-types';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useIntl } from 'react-intl';

export const limitsStyles = {
    limitsBackground: {
        p: 1,
    },
    copyLimitsToRightBackground: {
        height: '50%',
        display: 'flex',
    },
    copyLimitsToLeftBackground: {
        height: '50%',
    },
    copyLimitsButtons: {
        alignSelf: 'flex-end',
        minWidth: '0px',
        height: 'auto',
        padding: '1',
    },
};

export interface OperationalLimitsGroupsTabsProps {
    id?: string;
    limitsGroups1: OperationalLimitsGroup[];
    limitsGroups2: OperationalLimitsGroup[];
    indexSelectedLimitSet1: number;
    indexSelectedLimitSet2: number;
    setIndexSelectedLimitSet1: React.Dispatch<React.SetStateAction<number>>;
    setIndexSelectedLimitSet2: React.Dispatch<React.SetStateAction<number>>;
}

export function OperationalLimitsGroupsTabs({
    id = LIMITS,
    limitsGroups1,
    limitsGroups2,
    setIndexSelectedLimitSet1,
    setIndexSelectedLimitSet2,
    indexSelectedLimitSet1,
    indexSelectedLimitSet2,
}: Readonly<OperationalLimitsGroupsTabsProps>) {
    const intl = useIntl();
    const [selectedLimitGroupTabIndex, setSelectedLimitGroupTabIndex] = useState<number>(0);
    const [hoveredRowIndex, setHoveredRowIndex] = useState(-1);
    const [editingTabIndex, setEditingTabIndex] = useState<number | null>(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [activatedByMenuTabIndex, setActivatedByMenuTabIndex] = useState<number | null>(null);
    const [editedLimitGroupName, setEditedLimitGroupName] = useState('');
    const editLimitGroupRef = useRef<HTMLInputElement>(null);
    const { getValues, setValue } = useFormContext();
    const {
        append: appendToLimitsGroups1,
        update: updateLimitsGroups1,
        remove: removeLimitsGroups1,
    } = useFieldArray({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS_1}`,
    });
    const {
        append: appendToLimitsGroups2,
        update: updateLimitsGroups2,
        remove: removeLimitsGroups2,
    } = useFieldArray({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS_2}`,
    });
    const selectedLimitsGroups1: string = useWatch({
        name: `${id}.${SELECTED_LIMITS_GROUP_1}`,
    });
    const selectedLimitsGroups2: string = useWatch({
        name: `${id}.${SELECTED_LIMITS_GROUP_2}`,
    });

    // focus on the edited tab
    useEffect(() => {
        if (editingTabIndex && editLimitGroupRef.current) {
            editLimitGroupRef.current.focus();
        }
    }, [editingTabIndex]);

    const handleTabChange = useCallback(
        (event: React.SyntheticEvent, newValue: number): void => {
            setSelectedLimitGroupTabIndex(newValue);
        },
        [setSelectedLimitGroupTabIndex]
    );

    const handleLimitsGroupNameChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setEditedLimitGroupName(event.target.value);
        },
        [setEditedLimitGroupName]
    );

    const handleOpenMenu = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>, index: number, name: string): void => {
            event.stopPropagation();
            setMenuAnchorEl(event.currentTarget);
            setSelectedLimitGroupTabIndex(index);
            setActivatedByMenuTabIndex(index);
            setEditedLimitGroupName(name);
        },
        [setMenuAnchorEl, setSelectedLimitGroupTabIndex, setActivatedByMenuTabIndex, setEditedLimitGroupName]
    );

    const handleCloseMenu = useCallback(() => {
        setMenuAnchorEl(null);
        setActivatedByMenuTabIndex(null);
    }, [setMenuAnchorEl, setActivatedByMenuTabIndex]);

    const startEditingLimitsGroup = useCallback(
        (index: number) => {
            setEditingTabIndex(index);
            handleCloseMenu();
        },
        [setEditingTabIndex, handleCloseMenu]
    );

    const handleDeleteTab = useCallback(() => {
        if (activatedByMenuTabIndex != null) {
            // if this operational limit was selected, deselect it
            if (selectedLimitsGroups1 === editedLimitGroupName) {
                setValue(`${id}.${SELECTED_LIMITS_GROUP_1}`, '');
            }
            if (selectedLimitsGroups2 === editedLimitGroupName) {
                setValue(`${id}.${SELECTED_LIMITS_GROUP_2}`, '');
            }
            removeLimitsGroups1(indexSelectedLimitSet1);
            removeLimitsGroups2(indexSelectedLimitSet2);
            handleCloseMenu();
        }
    }, [
        handleCloseMenu,
        removeLimitsGroups1,
        removeLimitsGroups2,
        activatedByMenuTabIndex,
        editedLimitGroupName,
        id,
        indexSelectedLimitSet1,
        indexSelectedLimitSet2,
        selectedLimitsGroups1,
        selectedLimitsGroups2,
        setValue,
    ]);

    const handleDuplicateTab = useCallback(() => {
        if (activatedByMenuTabIndex != null) {
            const newName: string = editedLimitGroupName + ' (1)';
            const duplicatedLimits1 = getValues(`${id}.${OPERATIONAL_LIMITS_GROUPS_1}[${indexSelectedLimitSet1}]`);
            const newLimitsGroup1: OperationalLimitsGroup = {
                ...duplicatedLimits1,
                [ID]: newName,
            };
            appendToLimitsGroups1(newLimitsGroup1);

            const duplicatedLimits2 = getValues(`${id}.${OPERATIONAL_LIMITS_GROUPS_2}[${indexSelectedLimitSet2}]`);
            const newLimitsGroup2: OperationalLimitsGroup = {
                ...duplicatedLimits2,
                [ID]: newName,
            };
            appendToLimitsGroups2(newLimitsGroup2);
            setEditedLimitGroupName(newName);
            startEditingLimitsGroup(limitsGroups1.length);

            handleCloseMenu();
        }
    }, [
        handleCloseMenu,
        activatedByMenuTabIndex,
        appendToLimitsGroups1,
        appendToLimitsGroups2,
        editedLimitGroupName,
        getValues,
        id,
        indexSelectedLimitSet1,
        indexSelectedLimitSet2,
        limitsGroups1.length,
        startEditingLimitsGroup,
    ]);

    useEffect(() => {
        if (limitsGroups1[selectedLimitGroupTabIndex]) {
            const selectedGroupStr = limitsGroups1[selectedLimitGroupTabIndex].id;
            setIndexSelectedLimitSet1(
                limitsGroups1.findIndex((limitsGroup: OperationalLimitsGroup) => limitsGroup.id === selectedGroupStr)
            );
            setIndexSelectedLimitSet2(
                limitsGroups2.findIndex((limitsGroup: OperationalLimitsGroup) => limitsGroup.id === selectedGroupStr)
            );
        }
    }, [
        selectedLimitGroupTabIndex,
        limitsGroups1,
        limitsGroups2,
        setIndexSelectedLimitSet1,
        setIndexSelectedLimitSet2,
    ]);

    // synchronizeOperationalLimitsGroups : all the limit sets from both sides have to be
    // in both limitsGroups1 and limitsGroups2, even if they are empty
    useEffect(() => {
        // no synchronization while editing
        if (editingTabIndex === null) {
            limitsGroups1.forEach((limitsGroup1: OperationalLimitsGroup) => {
                if (
                    limitsGroup1.id &&
                    !limitsGroups2.find((limitsGroup2: OperationalLimitsGroup) => limitsGroup1.id === limitsGroup2.id)
                ) {
                    appendToLimitsGroups2({
                        [ID]: limitsGroup1.id,
                        [CURRENT_LIMITS]: {
                            [PERMANENT_LIMIT]: null,
                            [TEMPORARY_LIMITS]: [],
                        },
                    });
                }
            });
            limitsGroups2.forEach((limitsGroup2: OperationalLimitsGroup) => {
                if (
                    limitsGroup2.id &&
                    !limitsGroups1.find((limitsGroup1: OperationalLimitsGroup) => limitsGroup2.id === limitsGroup1.id)
                ) {
                    appendToLimitsGroups1({
                        [ID]: limitsGroup2.id,
                        [CURRENT_LIMITS]: {
                            [PERMANENT_LIMIT]: null,
                            [TEMPORARY_LIMITS]: [],
                        },
                    });
                }
            });
        }
    }, [limitsGroups1, limitsGroups2, appendToLimitsGroups1, appendToLimitsGroups2, editingTabIndex]);

    const finishEditingLimitsGroup = useCallback(() => {
        if (editingTabIndex !== null) {
            // get the old name of the modified limit set in order to update it on both sides (and the selected sides if needed)
            const oldName: string = limitsGroups1[editingTabIndex].id;
            const indexInLs1: number | undefined = limitsGroups1.findIndex(
                (limitsGroup: OperationalLimitsGroup) => limitsGroup.id === oldName
            );
            if (indexInLs1 !== undefined) {
                updateLimitsGroups1(indexInLs1, {
                    ...limitsGroups1[indexInLs1],
                    [ID]: editedLimitGroupName,
                });
                if (selectedLimitsGroups1 === oldName) {
                    setValue(`${id}.${SELECTED_LIMITS_GROUP_1}`, editedLimitGroupName);
                }
            }

            const indexInLs2: number | undefined = limitsGroups2.findIndex(
                (limitsGroup: OperationalLimitsGroup) => limitsGroup.id === oldName
            );
            if (indexInLs2 !== undefined) {
                updateLimitsGroups2(indexInLs2, {
                    ...limitsGroups2[indexInLs2],
                    [ID]: editedLimitGroupName,
                });
                if (selectedLimitsGroups2 === oldName) {
                    setValue(`${id}.${SELECTED_LIMITS_GROUP_2}`, editedLimitGroupName);
                }
            }
            setEditingTabIndex(null);
        }
    }, [
        id,
        setValue,
        selectedLimitsGroups1,
        selectedLimitsGroups2,
        editingTabIndex,
        editedLimitGroupName,
        limitsGroups1,
        limitsGroups2,
        updateLimitsGroups1,
        updateLimitsGroups2,
        setEditingTabIndex,
    ]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Enter') {
                finishEditingLimitsGroup();
            }
        },
        [finishEditingLimitsGroup]
    );

    const addNewLimitSet = useCallback(() => {
        const newIndex: number = limitsGroups1.length;
        let newName: string = `LIMIT_SET`;
        if (newIndex > 0) {
            newName += `(${limitsGroups1.length > 0 ? newIndex : ''})`;
        }
        const newLimitsGroup: OperationalLimitsGroup = {
            [ID]: newName,
            [CURRENT_LIMITS]: {
                [TEMPORARY_LIMITS]: [],
                [PERMANENT_LIMIT]: null,
            },
        };
        appendToLimitsGroups1(newLimitsGroup);
        appendToLimitsGroups2(newLimitsGroup);
        setEditedLimitGroupName(newName);
        startEditingLimitsGroup(newIndex);
    }, [appendToLimitsGroups1, appendToLimitsGroups2, limitsGroups1, startEditingLimitsGroup]);

    return (
        <>
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={selectedLimitGroupTabIndex}
                onChange={handleTabChange}
                sx={tabStyles.listDisplay}
            >
                {limitsGroups1.map((set: OperationalLimitsGroup, index: number) => (
                    <Tab
                        onMouseEnter={() => setHoveredRowIndex(index)}
                        onMouseLeave={() => setHoveredRowIndex(-1)}
                        key={set.id + index}
                        label={
                            editingTabIndex === index ? (
                                <TextField
                                    value={editedLimitGroupName}
                                    onChange={handleLimitsGroupNameChange}
                                    onKeyDown={handleKeyDown}
                                    inputRef={editLimitGroupRef}
                                    autoFocus
                                    size="small"
                                    fullWidth
                                />
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                    }}
                                >
                                    {set.id}
                                    {(index === hoveredRowIndex || index === activatedByMenuTabIndex) && (
                                        <IconButton
                                            size="small"
                                            hidden
                                            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                                                handleOpenMenu(e, index, set.id)
                                            }
                                        >
                                            <MenuIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                            )
                        }
                        sx={limitsStyles.limitsBackground}
                    />
                ))}
                <Tab
                    label={
                        <Box
                            sx={{
                                display: 'flex',
                                width: '100%',
                                flexGrow: 1,
                            }}
                        >
                            <IconButton
                                onClick={() => addNewLimitSet()}
                                sx={{
                                    align: 'right',
                                    marginLeft: 'auto',
                                }}
                            >
                                <AddCircleIcon />
                            </IconButton>
                        </Box>
                    }
                />
            </Tabs>
            <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleCloseMenu}>
                <MenuItem
                    onClick={() => activatedByMenuTabIndex != null && startEditingLimitsGroup(activatedByMenuTabIndex)}
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
        </>
    );
}
