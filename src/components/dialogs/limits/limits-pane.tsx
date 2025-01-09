/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid, Tab, Tabs, TextField } from '@mui/material';
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
} from 'components/utils/field-constants';
import { FormattedMessage } from 'react-intl';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { LimitsSidePane } from './limits-side-pane';
import { SelectedOperationalLimitGroup } from './selected-operational-limit-group.jsx';
import { CurrentTreeNode } from '../../../redux/reducer';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { OperationalLimitsGroup } from './limits-type';
import IconButton from '@mui/material/IconButton';
import { Edit } from '@mui/icons-material';

const styles = {
    limitsBackground: {
        backgroundColor: '#1a1919', // TODO : those colors may be found in the theme see with Stephane ??
        p: 1,
        '&.Mui-selected': { backgroundColor: '#383838' },
    },
    limitsBackgroundUnselected: {
        backgroundColor: '#1a1919',
        p: 1,
    },
};
export interface LimitsPaneProps {
    id?: string;
    currentNode?: CurrentTreeNode;
    equipmentToModify?: any;
    clearableFields?: any;
}

export function LimitsPane({
    id = LIMITS,
    currentNode,
    equipmentToModify,
    clearableFields,
}: Readonly<LimitsPaneProps>) {
    // selected set in the tab interface
    const [selectedLimitGroupTabIndex, setSelectedLimitGroupTabIndex] = useState<number>(0);
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedLimitGroupTabIndex(newValue);
    };
    const [editingTabIndex, setEditingTabIndex] = useState<number | null>(null);
    const [editedLimitGroupName, setEditedLimitGroupName] = useState('');
    const editLimitGroupRef = useRef<HTMLInputElement>(null);

    const limitsGroups1: OperationalLimitsGroup[] = useWatch({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS_1}.`,
    });
    const limitsGroups2: OperationalLimitsGroup[] = useWatch({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS_2}`,
    });
    const [indexSelectedLimitSet2, setIndexSelectedLimitSet2] = useState<number | undefined>(undefined);

    const { append: appendToLimitsGroups1, update: updateLimitsGroups1 } = useFieldArray({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS_1}`,
    });
    const { append: appendToLimitsGroups2, update: updateLimitsGroups2 } = useFieldArray({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS_2}`,
    });
    const handleLimitsGroupNameChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setEditedLimitGroupName(event.target.value);
        },
        [setEditedLimitGroupName]
    );
    useEffect(() => {
        if (editingTabIndex && editLimitGroupRef.current) {
            editLimitGroupRef.current.focus();
        }
    }, [editingTabIndex]);

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

    useEffect(() => {
        if (limitsGroups1[selectedLimitGroupTabIndex]) {
            const selectedGroupStr = limitsGroups1[selectedLimitGroupTabIndex].id;
            setIndexSelectedLimitSet2(
                selectedGroupStr
                    ? limitsGroups2.findIndex(
                          (limitsGroup: OperationalLimitsGroup) => limitsGroup.id === selectedGroupStr
                      )
                    : undefined
            );
        }
    }, [selectedLimitGroupTabIndex, limitsGroups1, limitsGroups2, setIndexSelectedLimitSet2]);

    const startEditingLimitsGroup = useCallback(
        (index: number, name: string) => {
            setEditingTabIndex(index);
            setEditedLimitGroupName(name);
        },
        [setEditingTabIndex, setEditedLimitGroupName]
    );

    const finishEditingLimitsGroup = useCallback(() => {
        if (editingTabIndex !== null) {
            // get the old name of the modified limit set in order to update it on both sides
            const oldName: string = limitsGroups1[editingTabIndex].id;
            const indexInLs1: number | undefined = limitsGroups1.findIndex(
                (limitsGroup: OperationalLimitsGroup) => limitsGroup.id === oldName
            );
            if (indexInLs1) {
                updateLimitsGroups1(indexInLs1, {
                    ...limitsGroups1[indexInLs1],
                    [ID]: editedLimitGroupName,
                });
            }

            const indexInLs2: number | undefined = limitsGroups2.findIndex(
                (limitsGroup: OperationalLimitsGroup) => limitsGroup.id === oldName
            );
            if (indexInLs2) {
                updateLimitsGroups2(indexInLs2, {
                    ...limitsGroups2[indexInLs2],
                    [ID]: editedLimitGroupName,
                });
            }
            setSelectedLimitGroupTabIndex(editingTabIndex);
            setEditingTabIndex(null);
        }
    }, [
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
                [PERMANENT_LIMIT]: undefined,
            },
        };
        appendToLimitsGroups1(newLimitsGroup);
        appendToLimitsGroups2(newLimitsGroup);
        startEditingLimitsGroup(newIndex, newName);
    }, [startEditingLimitsGroup, appendToLimitsGroups1, appendToLimitsGroups2, limitsGroups1.length]);

    return (
        <Grid container spacing={2}>
            {/* titles */}
            <Grid container item xs={12} columns={11} spacing={2}>
                <Grid item xs={1} />
                <Grid item xs={5}>
                    <Box component={`h3`}>
                        <FormattedMessage id="Side1" />
                    </Box>
                </Grid>
                <Grid item xs={5}>
                    <Box component={`h3`}>
                        <FormattedMessage id="Side2" />
                    </Box>
                </Grid>
            </Grid>
            {/* active limit set */}
            <Grid container item xs={12} columns={11} spacing={2}>
                <Grid item xs={1}>
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
                </Grid>
                <Grid item xs={5}>
                    <SelectedOperationalLimitGroup
                        selectedFormName={`${id}.${SELECTED_LIMITS_GROUP_1}`}
                        optionsFormName={`${id}.${OPERATIONAL_LIMITS_GROUPS_1}`}
                    />
                </Grid>
                <Grid item xs={5}>
                    <SelectedOperationalLimitGroup
                        selectedFormName={`${id}.${SELECTED_LIMITS_GROUP_2}`}
                        optionsFormName={`${id}.${OPERATIONAL_LIMITS_GROUPS_2}`}
                    />
                </Grid>
            </Grid>
            {/* limits */}
            <Grid container item xs={12} columns={11}>
                <Grid item xs={1}>
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={selectedLimitGroupTabIndex}
                        onChange={handleTabChange}
                        sx={{ flexGrow: 1 }}
                    >
                        {limitsGroups1.map((set: OperationalLimitsGroup, index: number) => (
                            <Tab
                                key={set.id + index}
                                label={
                                    editingTabIndex === index ? (
                                        <TextField
                                            value={editedLimitGroupName}
                                            onChange={handleLimitsGroupNameChange}
                                            onBlur={finishEditingLimitsGroup}
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
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditingLimitsGroup(index, set.id);
                                                }}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )
                                }
                                sx={
                                    index === selectedLimitGroupTabIndex
                                        ? styles.limitsBackground
                                        : styles.limitsBackgroundUnselected
                                }
                            />
                        ))}
                    </Tabs>
                </Grid>
                <Grid item xs={5}>
                    {limitsGroups1.map(
                        (item: OperationalLimitsGroup, index: number) =>
                            index === selectedLimitGroupTabIndex && (
                                <LimitsSidePane
                                    key={item.id}
                                    limitsGroupFormName={`${id}.${OPERATIONAL_LIMITS_GROUPS_1}`}
                                    clearableFields={clearableFields}
                                    indexLimitGroup={index}
                                    permanentCurrentLimitPreviousValue={
                                        equipmentToModify?.currentLimits1?.permanentLimit
                                    }
                                    previousValues={equipmentToModify?.currentLimits1?.temporaryLimits}
                                    currentNode={currentNode}
                                />
                            )
                    )}
                </Grid>
                <Grid item xs={5}>
                    {limitsGroups2.map(
                        (item: OperationalLimitsGroup, index: number) =>
                            index === indexSelectedLimitSet2 && (
                                <LimitsSidePane
                                    key={item.id}
                                    limitsGroupFormName={`${id}.${OPERATIONAL_LIMITS_GROUPS_2}`}
                                    clearableFields={clearableFields}
                                    indexLimitGroup={index}
                                    permanentCurrentLimitPreviousValue={
                                        equipmentToModify?.currentLimits2?.permanentLimit
                                    }
                                    previousValues={equipmentToModify?.currentLimits2?.temporaryLimits}
                                    currentNode={currentNode}
                                />
                            )
                    )}
                </Grid>
            </Grid>
        </Grid>
    );
}
