/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Tab, Tabs, TextField } from '@mui/material';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import {
    APPLICABIlITY,
    CURRENT_LIMITS,
    DELETION_MARK,
    ID,
    LIMITS_PROPERTIES,
    OPERATIONAL_LIMITS_GROUPS,
    PERMANENT_LIMIT,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS,
} from '../../utils/field-constants';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { OperationalLimitsGroup } from '../../../services/network-modification-types';
import { LimitsGroupsContextualMenu } from './limits-groups-contextual-menu';
import { isBlankOrEmpty } from '../../utils/validation-functions';
import { FormattedMessage } from 'react-intl';
import { tabStyles } from 'components/utils/tab-utils';
import { APPLICABILITY } from '../../network/constants';
import { type MuiStyles, NAME } from '@gridsuite/commons-ui';
import { OperationalLimitsGroupTabLabel } from './operational-limits-group-tab-label';
import { OperationalLimitsGroupFormSchema, TemporaryLimitsFormSchema } from './operational-limits-groups-types';
import { CurrentLimitsData } from 'services/study/network-map.type';

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
} as const satisfies MuiStyles;

export interface OperationalLimitsGroupsTabsProps {
    parentFormName: string;
    limitsGroups: OperationalLimitsGroupFormSchema[];
    indexSelectedLimitSet: number | null;
    setIndexSelectedLimitSet: React.Dispatch<React.SetStateAction<number | null>>;
    checkLimitSetUnicity: (editedLimitGroupName: string, newSelectedApplicability: string) => string;
    currentLimitsToModify: CurrentLimitsData[];
    editable: boolean;
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
    (
        {
            parentFormName,
            limitsGroups,
            setIndexSelectedLimitSet,
            indexSelectedLimitSet,
            checkLimitSetUnicity,
            editable,
            currentLimitsToModify,
        },
        ref
    ) => {
        const [hoveredRowIndex, setHoveredRowIndex] = useState(-1);
        const [editingTabIndex, setEditingTabIndex] = useState<number>(-1);
        const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
        const [activatedByMenuTabIndex, setActivatedByMenuTabIndex] = useState<number | null>(null);
        const [editedLimitGroupName, setEditedLimitGroupName] = useState('');
        const [editionError, setEditionError] = useState<string>('');
        const { setValue, getValues } = useFormContext();
        const operationalLimitsGroupsFormName: string = `${parentFormName}.${OPERATIONAL_LIMITS_GROUPS}`;
        const {
            fields: operationalLimitsGroups,
            update: updateLimitsGroups,
            append: appendToLimitsGroups,
            remove: removeLimitsGroups,
        } = useFieldArray<{
            [key: string]: OperationalLimitsGroupFormSchema[];
        }>({
            name: operationalLimitsGroupsFormName,
        });
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
                // if editing do not change index
                if (editingTabIndex !== -1) {
                    return;
                }
                setIndexSelectedLimitSet(newValue);
            },
            [editingTabIndex, setIndexSelectedLimitSet]
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
                const emptyTemporaryLimit: TemporaryLimitsFormSchema = {
                    [TEMPORARY_LIMIT_NAME]: '',
                    [TEMPORARY_LIMIT_DURATION]: null,
                    [TEMPORARY_LIMIT_VALUE]: null,
                    [DELETION_MARK]: false,
                };
                const newLimitsGroup: OperationalLimitsGroupFormSchema = {
                    [ID]: name + APPLICABILITY.EQUIPMENT.id,
                    [NAME]: name,
                    [APPLICABIlITY]: APPLICABILITY.EQUIPMENT.id,
                    [LIMITS_PROPERTIES]: [],
                    [CURRENT_LIMITS]: {
                        [TEMPORARY_LIMITS]: [emptyTemporaryLimit],
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
                    let operationalLimitsGroupToUpdate = operationalLimitsGroups[editingTabIndex];
                    operationalLimitsGroupToUpdate.name = editedLimitGroupName;
                    operationalLimitsGroupToUpdate.applicability = applicability;
                    operationalLimitsGroupToUpdate.id =
                        editedLimitGroupName + limitsGroups[editingTabIndex].applicability;
                    updateLimitsGroups(editingTabIndex, operationalLimitsGroupToUpdate);
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
            editingTabIndex,
            editedLimitGroupName,
            limitsGroups,
            checkLimitSetUnicity,
            setIndexSelectedLimitSet,
            operationalLimitsGroups,
            updateLimitsGroups,
            getValues,
            parentFormName,
            setValue,
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
            setIndexSelectedLimitSet(0);
        }, [
            parentFormName,
            getValues,
            prependEmptyOperationalLimitsGroup,
            startEditingLimitsGroup,
            setIndexSelectedLimitSet,
        ]);

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
                    {limitsGroups.map((opLg: OperationalLimitsGroupFormSchema, index: number) => (
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
                                    <OperationalLimitsGroupTabLabel
                                        operationalLimitsGroup={opLg}
                                        showIconButton={index === hoveredRowIndex || index === activatedByMenuTabIndex}
                                        editable={!editable || editingTabIndex !== -1}
                                        limitsPropertiesName={`${parentFormName}.${OPERATIONAL_LIMITS_GROUPS}[${index}].${LIMITS_PROPERTIES}`}
                                        handleOpenMenu={handleOpenMenu}
                                        index={index}
                                    />
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
                    currentLimitsToModify={currentLimitsToModify}
                    operationalLimitsGroups={operationalLimitsGroups}
                    appendToLimitsGroups={appendToLimitsGroups}
                    removeLimitsGroups={removeLimitsGroups}
                />
            </>
        );
    }
);
