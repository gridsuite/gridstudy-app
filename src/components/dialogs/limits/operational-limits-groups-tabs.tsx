/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Tab, Tabs, TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { useCallback, useEffect, useState } from 'react';
import {
    CURRENT_LIMITS,
    ID,
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
import { useFormContext, useWatch } from 'react-hook-form';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { OperationalLimitsGroup } from '../../../services/network-modification-types';
import MenuIcon from '@mui/icons-material/Menu';
import { LimitsGroupsContextualMenu } from './limits-groups-contextual-menu';
import { isBlankOrEmpty } from '../../utils/validation-functions';
import { FormattedMessage } from 'react-intl';
import { tabStyles } from 'components/utils/tab-utils';

const limitsStyles = {
    limitsBackground: {
        p: 1,
    },
    copyLimitsToRightBackground: {
        height: 200,
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
    parentFormName: string;
    limitsGroups1: OperationalLimitsGroup[];
    limitsGroups2: OperationalLimitsGroup[];
    indexSelectedLimitSet1: number | null;
    indexSelectedLimitSet2: number | null;
    setIndexSelectedLimitSet1: React.Dispatch<React.SetStateAction<number | null>>;
    setIndexSelectedLimitSet2: React.Dispatch<React.SetStateAction<number | null>>;
}

export function OperationalLimitsGroupsTabs({
    parentFormName,
    limitsGroups1,
    limitsGroups2,
    setIndexSelectedLimitSet1,
    setIndexSelectedLimitSet2,
    indexSelectedLimitSet1,
    indexSelectedLimitSet2,
}: Readonly<OperationalLimitsGroupsTabsProps>) {
    const [selectedLimitGroupTabIndex, setSelectedLimitGroupTabIndex] = useState<number | null>(0);
    const [hoveredRowIndex, setHoveredRowIndex] = useState(-1);
    const [editingTabIndex, setEditingTabIndex] = useState<number>(-1);
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [activatedByMenuTabIndex, setActivatedByMenuTabIndex] = useState<number | null>(null);
    const [editedLimitGroupName, setEditedLimitGroupName] = useState('');
    const [editionError, setEditionError] = useState<string>('');
    const { setValue, getValues } = useFormContext();
    const selectedLimitsGroups1: string = useWatch({
        name: `${parentFormName}.${SELECTED_LIMITS_GROUP_1}`,
    });
    const selectedLimitsGroups2: string = useWatch({
        name: `${parentFormName}.${SELECTED_LIMITS_GROUP_2}`,
    });

    // control of the focus on the edited tab
    const [editLimitGroupRef, setEditLimitGroupRef] = useState<HTMLInputElement>();
    const onRefSet = useCallback((ref: HTMLInputElement) => {
        setEditLimitGroupRef(ref);
    }, []);
    useEffect(() => {
        if (editingTabIndex !== -1 && editLimitGroupRef) {
            editLimitGroupRef.focus();
        }
    }, [editingTabIndex, editLimitGroupRef]);

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
        (event: React.MouseEvent<HTMLButtonElement>, index: number): void => {
            event.stopPropagation();
            setMenuAnchorEl(event.currentTarget);
            setSelectedLimitGroupTabIndex(index);
            setActivatedByMenuTabIndex(index);
        },
        [setMenuAnchorEl, setSelectedLimitGroupTabIndex, setActivatedByMenuTabIndex]
    );

    const handleCloseMenu = useCallback(() => {
        setMenuAnchorEl(null);
        setActivatedByMenuTabIndex(null);
    }, [setMenuAnchorEl, setActivatedByMenuTabIndex]);

    const startEditingLimitsGroup = useCallback(
        (index: number, name: string | null) => {
            if (name === null) {
                name = limitsGroups1[index].id;
            }
            setEditionError('');
            setEditingTabIndex(index);
            setEditedLimitGroupName(name);
            handleCloseMenu();
        },
        [setEditingTabIndex, handleCloseMenu, limitsGroups1]
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

    const appendEmptyOperationalLimitsGroup = useCallback(
        (formName: string, id: string) => {
            let appendIndex = getValues(formName).length;
            if (appendIndex === 0) {
                setValue(formName, []);
            }

            // new limit sets are created with 5 empty limits by default
            const emptyTemporaryLimit = {
                [TEMPORARY_LIMIT_NAME]: '',
                [TEMPORARY_LIMIT_DURATION]: null,
                [TEMPORARY_LIMIT_VALUE]: null,
                modificationType: null,
                [SELECTED]: false,
            };
            const newLimitsGroup: OperationalLimitsGroup = {
                [ID]: id,
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
            setValue(`${formName}[${appendIndex}]`, newLimitsGroup);
        },
        [getValues, setValue]
    );

    // synchronizeOperationalLimitsGroups : all the limit sets from both sides have to be
    // in both limitsGroups1 and limitsGroups2, even if they don't contain any data
    useEffect(() => {
        // no synchronization while editing
        if (editingTabIndex === -1) {
            limitsGroups1.forEach((limitsGroup1: OperationalLimitsGroup) => {
                if (
                    !isBlankOrEmpty(limitsGroup1.id) &&
                    !limitsGroups2.find((limitsGroup2: OperationalLimitsGroup) => limitsGroup1.id === limitsGroup2.id)
                ) {
                    appendEmptyOperationalLimitsGroup(
                        `${parentFormName}.${OPERATIONAL_LIMITS_GROUPS_2}`,
                        limitsGroup1.id
                    );
                }
            });

            limitsGroups2.forEach((limitsGroup2: OperationalLimitsGroup) => {
                if (
                    !isBlankOrEmpty(limitsGroup2.id) &&
                    !limitsGroups1.find((limitsGroup1: OperationalLimitsGroup) => limitsGroup2.id === limitsGroup1.id)
                ) {
                    appendEmptyOperationalLimitsGroup(
                        `${parentFormName}.${OPERATIONAL_LIMITS_GROUPS_1}`,
                        limitsGroup2.id
                    );
                }
            });
        }
    }, [appendEmptyOperationalLimitsGroup, editingTabIndex, limitsGroups1, limitsGroups2, parentFormName]);

    const finishEditingLimitsGroup = useCallback(() => {
        if (editingTabIndex !== -1) {
            if (isBlankOrEmpty(editedLimitGroupName)) {
                setEditionError('LimitSetCreationEmptyError');
                return;
            }

            // get the old name of the modified limit set in order to update it on both sides (and the selected sides if needed)
            const oldName: string = limitsGroups1[editingTabIndex].id;
            const indexInLs1: number | undefined = limitsGroups1.findIndex(
                (limitsGroup: OperationalLimitsGroup) => limitsGroup.id === oldName
            );
            const indexInLs2: number | undefined = limitsGroups2.findIndex(
                (limitsGroup: OperationalLimitsGroup) => limitsGroup.id === oldName
            );

            // checks if a limit set with that name already exists
            const sameNameInLs1 = limitsGroups1
                .filter((ls, index: number) => index !== indexInLs1)
                .find((limitsGroup: OperationalLimitsGroup) => limitsGroup.id.trim() === editedLimitGroupName.trim());
            const sameNameInLs2 = limitsGroups2
                .filter((ls, index: number) => index !== indexInLs1)
                .find((limitsGroup: OperationalLimitsGroup) => limitsGroup.id.trim() === editedLimitGroupName.trim());

            if (sameNameInLs1 || sameNameInLs2) {
                setEditionError('LimitSetCreationDuplicateError');
                return;
            }

            if (indexInLs1 !== undefined) {
                setValue(`${parentFormName}.${OPERATIONAL_LIMITS_GROUPS_1}[${indexInLs1}].${ID}`, editedLimitGroupName);
                if (getValues(`${parentFormName}.${SELECTED_LIMITS_GROUP_1}`) === oldName) {
                    setValue(`${parentFormName}.${SELECTED_LIMITS_GROUP_1}`, editedLimitGroupName);
                }
            }
            if (indexInLs2 !== undefined) {
                setValue(`${parentFormName}.${OPERATIONAL_LIMITS_GROUPS_2}[${indexInLs2}].${ID}`, editedLimitGroupName);
                if (getValues(`${parentFormName}.${SELECTED_LIMITS_GROUP_2}`) === oldName) {
                    setValue(`${parentFormName}.${SELECTED_LIMITS_GROUP_2}`, editedLimitGroupName);
                }
            }
            setSelectedLimitGroupTabIndex(editingTabIndex);
            setEditingTabIndex(-1);
            setEditionError('');
        }
    }, [
        parentFormName,
        setValue,
        getValues,
        editingTabIndex,
        editedLimitGroupName,
        limitsGroups1,
        limitsGroups2,
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
        if (editingTabIndex === -1) {
            const newIndex: number = limitsGroups1.length;
            appendEmptyOperationalLimitsGroup(`${parentFormName}.${OPERATIONAL_LIMITS_GROUPS_1}`, '');
            appendEmptyOperationalLimitsGroup(`${parentFormName}.${OPERATIONAL_LIMITS_GROUPS_2}`, '');
            startEditingLimitsGroup(newIndex, `DEFAULT`);
        }
    }, [
        editingTabIndex,
        limitsGroups1.length,
        appendEmptyOperationalLimitsGroup,
        parentFormName,
        startEditingLimitsGroup,
    ]);

    return (
        <>
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={selectedLimitGroupTabIndex !== null && selectedLimitGroupTabIndex}
                onChange={handleTabChange}
                sx={tabStyles.listDisplay}
            >
                {limitsGroups1.map((opLg: OperationalLimitsGroup, index: number) => (
                    <Tab
                        onMouseEnter={() => setHoveredRowIndex(index)}
                        onMouseLeave={() => setHoveredRowIndex(-1)}
                        key={opLg.id + index}
                        label={
                            editingTabIndex === index ? (
                                <TextField
                                    value={editedLimitGroupName}
                                    onChange={handleLimitsGroupNameChange}
                                    onKeyDown={handleKeyDown}
                                    inputRef={onRefSet}
                                    onBlur={() => finishEditingLimitsGroup()}
                                    error={!!editionError}
                                    helperText={!!editionError && <FormattedMessage id={editionError} />}
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
                                    {opLg.id}
                                    {(index === hoveredRowIndex || index === activatedByMenuTabIndex) && (
                                        <IconButton
                                            size="small"
                                            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                                                handleOpenMenu(e, index)
                                            }
                                            // during the naming of a limit set no other limit set manipulation is allowed :
                                            disabled={editingTabIndex !== -1}
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
                    key="addLimitSet"
                    label={
                        editingTabIndex === -1 && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                }}
                            >
                                <IconButton
                                    size="small"
                                    onClick={addNewLimitSet}
                                    sx={{
                                        align: 'right',
                                        marginLeft: 'auto',
                                    }}
                                >
                                    <AddCircleIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        )
                    }
                    sx={limitsStyles.limitsBackground}
                />
            </Tabs>
            <LimitsGroupsContextualMenu
                parentFormName={parentFormName}
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
