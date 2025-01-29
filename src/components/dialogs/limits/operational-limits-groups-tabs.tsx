/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Tab, Tabs, TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    CURRENT_LIMITS,
    ID,
    LIMITS,
    OPERATIONAL_LIMITS_GROUPS_1,
    OPERATIONAL_LIMITS_GROUPS_2,
    PERMANENT_LIMIT,
    SELECTED,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS,
} from '../../utils/field-constants';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { tabStyles } from '../../parameters-tabs';
import { OperationalLimitsGroup } from '../../../services/network-modification-types';
import MenuIcon from '@mui/icons-material/Menu';
import { LimitsGroupsContextualMenu } from './limits-groups-contextual-menu';
import { isBlankOrEmpty } from '../../utils/validation-functions';

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
    indexSelectedLimitSet1: number | null;
    indexSelectedLimitSet2: number | null;
    setIndexSelectedLimitSet1: React.Dispatch<React.SetStateAction<number | null>>;
    setIndexSelectedLimitSet2: React.Dispatch<React.SetStateAction<number | null>>;
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
    const [selectedLimitGroupTabIndex, setSelectedLimitGroupTabIndex] = useState<number | null>(0);
    const [hoveredRowIndex, setHoveredRowIndex] = useState(-1);
    const [editingTabIndex, setEditingTabIndex] = useState<number | null>(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [activatedByMenuTabIndex, setActivatedByMenuTabIndex] = useState<number | null>(null);
    const [editedLimitGroupName, setEditedLimitGroupName] = useState('');
    const editLimitGroupRef = useRef<HTMLInputElement>(null);
    const { setValue } = useFormContext();
    const { append: appendToLimitsGroups1, update: updateLimitsGroups1 } = useFieldArray({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS_1}`,
    });
    const { append: appendToLimitsGroups2, update: updateLimitsGroups2 } = useFieldArray({
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

    // synchronisation of the selected limit set : tabs combine both side 1 and side 2 limits sets which are different
    // therefore both have separated selection indexes
    useEffect(() => {
        if (selectedLimitGroupTabIndex != null && selectedLimitGroupTabIndex < limitsGroups1.length) {
            const selectedGroupStr: string = limitsGroups1[selectedLimitGroupTabIndex].id;
            setIndexSelectedLimitSet1(
                limitsGroups1.findIndex(
                    (limitsGroup: OperationalLimitsGroup) => limitsGroup && limitsGroup.id === selectedGroupStr
                )
            );
            setIndexSelectedLimitSet2(
                limitsGroups2.findIndex(
                    (limitsGroup: OperationalLimitsGroup) => limitsGroup && limitsGroup.id === selectedGroupStr
                )
            );
        } else {
            setSelectedLimitGroupTabIndex(null);
            setIndexSelectedLimitSet1(null);
            setIndexSelectedLimitSet2(null);
        }
    }, [
        selectedLimitGroupTabIndex,
        limitsGroups1,
        limitsGroups2,
        setIndexSelectedLimitSet1,
        setIndexSelectedLimitSet2,
    ]);
    useEffect(() => {
        // as long as there are limit sets, one should be selected
        if (selectedLimitGroupTabIndex === null && limitsGroups1.length > 0) {
            setSelectedLimitGroupTabIndex(0);
        }
    }, [selectedLimitGroupTabIndex, setSelectedLimitGroupTabIndex, limitsGroups1]);

    // synchronizeOperationalLimitsGroups : all the limit sets from both sides have to be
    // in both limitsGroups1 and limitsGroups2, even if they don't contain any data
    useEffect(() => {
        // no synchronization while editing
        if (editingTabIndex === null) {
            limitsGroups1.forEach((limitsGroup1: OperationalLimitsGroup) => {
                if (
                    !isBlankOrEmpty(limitsGroup1.id) &&
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
                    !isBlankOrEmpty(limitsGroup2.id) &&
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
            setSelectedLimitGroupTabIndex(editingTabIndex);
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
        setSelectedLimitGroupTabIndex,
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
        // new limit sets are created with 5 empty limits by default
        const emptyTemporaryLimit = {
            [TEMPORARY_LIMIT_NAME]: '',
            [TEMPORARY_LIMIT_DURATION]: null,
            [TEMPORARY_LIMIT_VALUE]: null,
            modificationType: null,
            [SELECTED]: false,
        };
        const newLimitsGroup: OperationalLimitsGroup = {
            [ID]: newName,
            [CURRENT_LIMITS]: {
                [TEMPORARY_LIMITS]: [
                    emptyTemporaryLimit,
                    emptyTemporaryLimit,
                    emptyTemporaryLimit,
                    emptyTemporaryLimit,
                    emptyTemporaryLimit,
                ],
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
                value={selectedLimitGroupTabIndex !== null && selectedLimitGroupTabIndex}
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
            <LimitsGroupsContextualMenu
                indexSelectedLimitSet1={indexSelectedLimitSet1}
                indexSelectedLimitSet2={indexSelectedLimitSet2}
                setIndexSelectedLimitSet1={setIndexSelectedLimitSet1}
                setIndexSelectedLimitSet2={setIndexSelectedLimitSet2}
                menuAnchorEl={menuAnchorEl}
                handleCloseMenu={handleCloseMenu}
                activatedByMenuTabIndex={activatedByMenuTabIndex}
                startEditingLimitsGroup={startEditingLimitsGroup}
                selectedLimitsGroups1={selectedLimitsGroups1}
                selectedLimitsGroups2={selectedLimitsGroups2}
                editedLimitGroupName={editedLimitGroupName}
            />
        </>
    );
}
