/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Tab, Tabs, TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import {
    APPLICABIlITY,
    CURRENT_LIMITS,
    ID,
    OPERATIONAL_LIMITS_GROUPS,
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
import { OperationalLimitsGroup } from '../../../services/network-modification-types';
import MenuIcon from '@mui/icons-material/Menu';
import { LimitsGroupsContextualMenu } from './creation/limits-groups-contextual-menu';
import { isBlankOrEmpty } from '../../utils/validation-functions';
import { FormattedMessage } from 'react-intl';
import { tabStyles } from 'components/utils/tab-utils';
import { APPLICABILITY } from '../../network/constants';

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
    limitsGroups: OperationalLimitsGroup[];
    indexSelectedLimitSet: number | null;
    setIndexSelectedLimitSet: React.Dispatch<React.SetStateAction<number | null>>;
}

function generateUniqueId(baseName: string, names: string[]): string {
    let finalId = baseName;
    let found = false;
    let increment = 1;
    let suffix = '';
    do {
        found = names.includes(baseName + suffix, 0);
        if (found) {
            increment++;
            suffix = '(' + increment + ')';
            finalId = baseName + suffix;
        }
    } while (found);

    return finalId;
}

export const OperationalLimitsGroupsTabs = forwardRef<any, OperationalLimitsGroupsTabsProps>(
    ({ parentFormName, limitsGroups, setIndexSelectedLimitSet, indexSelectedLimitSet }, ref) => {
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

        const handleLimitsGroupNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
            setEditedLimitGroupName(event.target.value);
        }, []);

        const handleOpenMenu = useCallback(
            (event: React.MouseEvent<HTMLButtonElement>, index: number): void => {
                event.stopPropagation();
                setMenuAnchorEl(event.currentTarget);
                setSelectedLimitGroupTabIndex(index);
                setActivatedByMenuTabIndex(index);
            },
            [setMenuAnchorEl, setSelectedLimitGroupTabIndex, setActivatedByMenuTabIndex]
        );

        // synchronisation of the selected limit set : tabs combine both side 1 and side 2 limits sets which are different
        // therefore both have separated selection indexes
        useEffect(() => {
            if (selectedLimitGroupTabIndex != null && selectedLimitGroupTabIndex < limitsGroups.length) {
                const selectedGroupStr: string = limitsGroups[selectedLimitGroupTabIndex].id;
                setIndexSelectedLimitSet(
                    limitsGroups.findIndex(
                        (limitsGroup: OperationalLimitsGroup) => limitsGroup && limitsGroup.id === selectedGroupStr
                    )
                );
            } else {
                setSelectedLimitGroupTabIndex(null);
                setIndexSelectedLimitSet(null);
            }
        }, [selectedLimitGroupTabIndex, limitsGroups, setIndexSelectedLimitSet, selectedLimitsGroups1]);

        const handleCloseMenu = useCallback(() => {
            setMenuAnchorEl(null);
            setActivatedByMenuTabIndex(null);
        }, [setMenuAnchorEl, setActivatedByMenuTabIndex]);

        const startEditingLimitsGroup = useCallback(
            (index: number, name: string | null) => {
                name ??= limitsGroups[index].id;
                setEditionError('');
                setEditingTabIndex(index);
                setEditedLimitGroupName(name);
                handleCloseMenu();
            },
            [setEditingTabIndex, handleCloseMenu, limitsGroups]
        );

        // synchronisation of the selected limit set : tabs combine both side 1 and side 2 limits sets which are different
        // therefore both have separated selection indexes
        useEffect(() => {
            if (selectedLimitGroupTabIndex != null && selectedLimitGroupTabIndex < limitsGroups.length) {
                const selectedGroupStr: string = limitsGroups[selectedLimitGroupTabIndex].id;
                setIndexSelectedLimitSet(
                    limitsGroups.findIndex(
                        (limitsGroup: OperationalLimitsGroup) => limitsGroup && limitsGroup.id === selectedGroupStr
                    )
                );
            } else {
                setSelectedLimitGroupTabIndex(null);
                setIndexSelectedLimitSet(null);
            }
        }, [selectedLimitGroupTabIndex, limitsGroups, setIndexSelectedLimitSet]);
        useEffect(() => {
            // as long as there are limit sets, one should be selected
            if (selectedLimitGroupTabIndex === null && limitsGroups.length > 0) {
                setSelectedLimitGroupTabIndex(0);
            }
        }, [selectedLimitGroupTabIndex, setSelectedLimitGroupTabIndex, limitsGroups]);

        const prependEmptyOperationalLimitsGroup = useCallback(
            (formName: string, id: string) => {
                setEditingTabIndex(0);
                let operationalLimiSetGroups: OperationalLimitsGroup[] = getValues(formName);
                if (operationalLimiSetGroups?.length === 0) {
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
                        [APPLICABIlITY]: APPLICABILITY.EQUIPMENT.id,
                    },
                };
                setValue(formName, [newLimitsGroup, ...getValues(formName)]);
            },
            [getValues, setValue]
        );

        const finishEditingLimitsGroup = useCallback(() => {
            if (editingTabIndex !== -1) {
                if (isBlankOrEmpty(editedLimitGroupName)) {
                    setEditionError('LimitSetCreationEmptyError');
                    return;
                }

                // get the old name of the modified limit set in order to update it on both sides (and the selected sides if needed)
                const oldName: string = limitsGroups[editingTabIndex].id;
                const indexInLs1: number | undefined = limitsGroups.findIndex(
                    (limitsGroup: OperationalLimitsGroup) => limitsGroup.id === oldName
                );

                // checks if a limit set with that name already exists
                const sameNameInLs1 = limitsGroups
                    .filter((ls, index: number) => index !== indexInLs1)
                    .find(
                        (limitsGroup: OperationalLimitsGroup) => limitsGroup.id.trim() === editedLimitGroupName.trim()
                    );

                if (sameNameInLs1) {
                    setEditionError('LimitSetCreationDuplicateError');
                    return;
                }

                if (indexInLs1 !== undefined) {
                    setValue(
                        `${parentFormName}.${OPERATIONAL_LIMITS_GROUPS}[${indexInLs1}].${ID}`,
                        editedLimitGroupName
                    );
                    if (getValues(`${parentFormName}.${SELECTED_LIMITS_GROUP_1}`) === oldName) {
                        setValue(`${parentFormName}.${SELECTED_LIMITS_GROUP_1}`, editedLimitGroupName);
                    }
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
            limitsGroups,
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
            const formName: string = `${parentFormName}.${OPERATIONAL_LIMITS_GROUPS}`;
            const operationalLimiSetGroups: OperationalLimitsGroup[] = getValues(formName);
            let id = 'DEFAULT';
            if (operationalLimiSetGroups?.length > 0) {
                const ids: string[] = operationalLimiSetGroups.map((l) => l.id);
                id = generateUniqueId('DEFAULT', ids);
            }
            prependEmptyOperationalLimitsGroup(formName, id);
            startEditingLimitsGroup(0, id);
        }, [parentFormName, getValues, prependEmptyOperationalLimitsGroup, startEditingLimitsGroup]);

        useImperativeHandle(ref, () => ({ addNewLimitSet }));

        return (
            <>
                <Tabs
                    orientation="vertical"
                    variant="fullWidth"
                    value={selectedLimitGroupTabIndex !== null && selectedLimitGroupTabIndex}
                    onChange={handleTabChange}
                    sx={tabStyles.listDisplay}
                    visibleScrollbar
                >
                    {limitsGroups.map((opLg: OperationalLimitsGroup, index: number) => (
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
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            boxSizing: 'inherit',
                                            justifyContent: 'space-between',
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
                </Tabs>
                <LimitsGroupsContextualMenu
                    parentFormName={parentFormName}
                    indexSelectedLimitSet={indexSelectedLimitSet}
                    setIndexSelectedLimitSet={setIndexSelectedLimitSet}
                    menuAnchorEl={menuAnchorEl}
                    handleCloseMenu={handleCloseMenu}
                    activatedByMenuTabIndex={activatedByMenuTabIndex}
                    startEditingLimitsGroup={startEditingLimitsGroup}
                    selectedLimitsGroups1={selectedLimitsGroups1}
                    selectedLimitsGroups2={selectedLimitsGroups2}
                />
            </>
        );
    }
);
