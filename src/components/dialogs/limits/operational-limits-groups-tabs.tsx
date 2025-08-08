/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Tab, Tabs, TextField, Typography } from '@mui/material';
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
import { LimitsGroupsContextualMenu } from './limits-groups-contextual-menu';
import { isBlankOrEmpty } from '../../utils/validation-functions';
import { FormattedMessage } from 'react-intl';
import { tabStyles } from 'components/utils/tab-utils';
import { APPLICABILITY } from '../../network/constants';
import { NAME } from '@gridsuite/commons-ui';
import { grey } from '@mui/material/colors';

const limitsStyles = {
    limitsBackground: {
        p: 1,
        minHeight: 60,
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
    checkLimitSetUnicity: (editedLimitGroupName: string, newSelectedApplicability: string) => string;
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
    ({ parentFormName, limitsGroups, setIndexSelectedLimitSet, indexSelectedLimitSet, checkLimitSetUnicity }, ref) => {
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
                setIndexSelectedLimitSet(newValue);
            },
            [setIndexSelectedLimitSet]
        );

        const handleOpenMenu = useCallback(
            (event: React.MouseEvent<HTMLButtonElement>, index: number): void => {
                event.stopPropagation();
                setMenuAnchorEl(event.currentTarget);
                setIndexSelectedLimitSet(index);
                setActivatedByMenuTabIndex(index);
            },
            [setMenuAnchorEl, setIndexSelectedLimitSet, setActivatedByMenuTabIndex]
        );

        const handleCloseMenu = useCallback(() => {
            setMenuAnchorEl(null);
            setActivatedByMenuTabIndex(null);
        }, [setMenuAnchorEl, setActivatedByMenuTabIndex]);

        const startEditingLimitsGroup = useCallback(
            (index: number, name: string | null) => {
                name ??= limitsGroups[index].name;
                setEditionError('');
                setEditingTabIndex(index);
                setEditedLimitGroupName(name);
                handleCloseMenu();
            },
            [setEditingTabIndex, handleCloseMenu, limitsGroups]
        );

        useEffect(() => {
            // as long as there are limit sets, one should be selected
            if (indexSelectedLimitSet === null && limitsGroups.length > 0) {
                setIndexSelectedLimitSet(0);
            }
        }, [indexSelectedLimitSet, setIndexSelectedLimitSet, limitsGroups]);

        const prependEmptyOperationalLimitsGroup = useCallback(
            (formName: string, name: string) => {
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
                    [ID]: name + APPLICABILITY.EQUIPMENT.id,
                    [NAME]: name,
                    [APPLICABIlITY]: APPLICABILITY.EQUIPMENT.id,
                    [CURRENT_LIMITS]: {
                        [ID]: name,
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

                const oldName: string = limitsGroups[editingTabIndex].name;
                const applicability = limitsGroups[editingTabIndex].applicability;
                const errorMessage: string = checkLimitSetUnicity(
                    editedLimitGroupName,
                    limitsGroups[editingTabIndex].applicability ?? ''
                );
                if (errorMessage.length > 0) {
                    setEditionError(errorMessage);
                    return;
                }

                if (editingTabIndex !== undefined) {
                    setValue(
                        `${parentFormName}.${OPERATIONAL_LIMITS_GROUPS}[${editingTabIndex}].${NAME}`,
                        editedLimitGroupName
                    );
                    const finalId: string = editedLimitGroupName + limitsGroups[editingTabIndex].applicability;
                    setValue(`${parentFormName}.${OPERATIONAL_LIMITS_GROUPS}[${editingTabIndex}].${ID}`, finalId);
                    if (
                        getValues(`${parentFormName}.${SELECTED_LIMITS_GROUP_1}`) === oldName &&
                        (applicability === APPLICABILITY.SIDE1.id || applicability === APPLICABILITY.EQUIPMENT.id)
                    ) {
                        setValue(`${parentFormName}.${SELECTED_LIMITS_GROUP_1}`, editedLimitGroupName);
                    }
                    if (
                        getValues(`${parentFormName}.${SELECTED_LIMITS_GROUP_2}`) === oldName &&
                        (applicability === APPLICABILITY.SIDE2.id || applicability === APPLICABILITY.EQUIPMENT.id)
                    ) {
                        setValue(`${parentFormName}.${SELECTED_LIMITS_GROUP_2}`, editedLimitGroupName);
                    }
                }
                setIndexSelectedLimitSet(editingTabIndex);
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
            setIndexSelectedLimitSet,
            checkLimitSetUnicity,
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
            let name = 'DEFAULT';
            if (operationalLimiSetGroups?.length > 0) {
                const ids: string[] = operationalLimiSetGroups.map((l) => l.name);
                name = generateUniqueId('DEFAULT', ids);
            }
            prependEmptyOperationalLimitsGroup(formName, name);
            startEditingLimitsGroup(0, name);
        }, [parentFormName, getValues, prependEmptyOperationalLimitsGroup, startEditingLimitsGroup]);

        useImperativeHandle(ref, () => ({ addNewLimitSet }));

        return (
            <>
                <Tabs
                    orientation="vertical"
                    variant="fullWidth"
                    value={indexSelectedLimitSet !== null && indexSelectedLimitSet}
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
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                            setEditedLimitGroupName(event.target.value);
                                        }}
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
                                        {opLg.name}
                                        {opLg?.applicability ? (
                                            <Typography
                                                noWrap
                                                align="right"
                                                color={grey[500] /*TODO : ask designer for exact color for 2 themes*/}
                                            >
                                                <FormattedMessage
                                                    id={
                                                        Object.values(APPLICABILITY).find(
                                                            (item) => item.id === opLg.applicability
                                                        )?.label
                                                    }
                                                />
                                            </Typography>
                                        ) : (
                                            ''
                                        )}

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
