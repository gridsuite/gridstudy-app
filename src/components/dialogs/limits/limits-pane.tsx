/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid, Tab, Tabs } from '@mui/material';
import {
    CURRENT_LIMITS,
    ID,
    LIMITS,
    LIMITS_GROUP_1,
    LIMITS_GROUP_2,
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
import { useEffect, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { OperationalLimitsGroup } from './limits-type';

const styles = {
    limitsBackground: {
        backgroundColor: '#1a1919', // TODO : those colors may be found in the theme see with Stephane ??
        alignItems: 'self-start',
        justifyContent: 'flex-start',
        '&.Mui-selected': { backgroundColor: '#383838' },
    },
    limitsBackgroundUnselected: {
        backgroundColor: '#1a1919',
        alignItems: 'self-start',
        justifyContent: 'flex-start',
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
    const [allLimitsGroupsStr, setAllLimitsGroupsStr] = useState<string[]>([]);
    // selected set in the tab interface
    const [selectedGroupStr, setSelectedGroupStr] = useState<string | null>(allLimitsGroupsStr[0] || null);
    const [selectedLimitGroupTabIndex, setSelectedLimitGroupTabIndex] = useState<number>(0);
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedLimitGroupTabIndex(newValue);
        setSelectedGroupStr(allLimitsGroupsStr[newValue] || null);
    };

    const limitsGroups1: OperationalLimitsGroup[] = useWatch({
        name: `${id}.${LIMITS_GROUP_1}.`,
    });
    const limitsGroups2: OperationalLimitsGroup[] = useWatch({
        name: `${id}.${LIMITS_GROUP_2}`,
    });
    // in the limitSets1 array
    const [indexSelectedLimitSet1, setIndexSelectedLimitSet1] = useState<number | undefined>(undefined);
    // in the limitSets2 array
    const [indexSelectedLimitSet2, setIndexSelectedLimitSet2] = useState<number | undefined>(undefined);

    const useFieldArrayLimitsGroups1 = useFieldArray({
        name: `${id}.${LIMITS_GROUP_1}`,
    });
    const useFieldArrayLimitsGroups2 = useFieldArray({
        name: `${id}.${LIMITS_GROUP_2}`,
    });

    useEffect(() => {
        // all the limit sets have to be present in both sides even if empty
        // the cleaning is done at the validation
        limitsGroups1.forEach((limitsGroup1: OperationalLimitsGroup) => {
            if (
                limitsGroup1.id &&
                !limitsGroups2.find((limitsGroup2: OperationalLimitsGroup) => limitsGroup1.id === limitsGroup2.id)
            ) {
                useFieldArrayLimitsGroups2.append({
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
                useFieldArrayLimitsGroups1.append({
                    [ID]: limitsGroup2.id,
                    [CURRENT_LIMITS]: {
                        [PERMANENT_LIMIT]: null,
                        [TEMPORARY_LIMITS]: [],
                    },
                });
            }
        });
        setIndexSelectedLimitSet1(
            selectedGroupStr
                ? limitsGroups1.findIndex((limitsGroup: OperationalLimitsGroup) => limitsGroup.id === selectedGroupStr)
                : undefined
        );
        setIndexSelectedLimitSet2(
            selectedGroupStr
                ? limitsGroups2.findIndex((limitsGroup: OperationalLimitsGroup) => limitsGroup.id === selectedGroupStr)
                : undefined
        );
    }, [
        selectedGroupStr,
        setIndexSelectedLimitSet1,
        setIndexSelectedLimitSet2,
        limitsGroups1,
        limitsGroups2,
        useFieldArrayLimitsGroups1,
        useFieldArrayLimitsGroups2,
    ]);

    useEffect(() => {
        let allLimitsGroups: string[] = [];
        allLimitsGroups.push(...limitsGroups1.map((limitGroup: { id: string }) => limitGroup.id));
        allLimitsGroups.push(
            ...limitsGroups2
                .filter(
                    (limitGroup: OperationalLimitsGroup) =>
                        !allLimitsGroups.find((limitsGroupStr) => limitsGroupStr === limitGroup.id)
                )
                .map((limitsGroup: { id: string }) => limitsGroup.id)
        );
        setAllLimitsGroupsStr(allLimitsGroups);
    }, [limitsGroups1, limitsGroups2]);

    /*
    const handleCopy = (direction: 'toRight' | 'toLeft') => {
    if (selectedSet) {
      const updatedSets = limitSets.map(set => {
        if (set.id === selectedSet.id) {
          const updatedSet = { ...set };
          if (direction === 'toRight') {
            updatedSet.side_2 = [...set.side_1];
          } else {
            updatedSet.side_1 = [...set.side_2];
          }
          return updatedSet;
        }
        return set;
      });
      setLimitSets(updatedSets);
      setSelectedSet(updatedSets[tabValue]);
    }
  };
     */

    const addNewLimitSet = () => {
        const newLimitsGroup: OperationalLimitsGroup = {
            [ID]: `DEFAULT ${allLimitsGroupsStr.length > 0 ? allLimitsGroupsStr.length - 1 : ''}`,
            [CURRENT_LIMITS]: {
                [TEMPORARY_LIMITS]: [],
                [PERMANENT_LIMIT]: undefined,
            },
        };
        useFieldArrayLimitsGroups1.append(newLimitsGroup);
        useFieldArrayLimitsGroups2.append(newLimitsGroup);
        setSelectedLimitGroupTabIndex(allLimitsGroupsStr.length - 1);
        setSelectedGroupStr(newLimitsGroup.id);
    };

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
                <Grid item xs={1} />
                <Grid item xs={5}>
                    <SelectedOperationalLimitGroup
                        selectedFormName={`${id}.${SELECTED_LIMITS_GROUP_1}`}
                        optionsFormName={`${id}.${LIMITS_GROUP_1}`}
                    />
                </Grid>
                <Grid item xs={5}>
                    <SelectedOperationalLimitGroup
                        selectedFormName={`${id}.${SELECTED_LIMITS_GROUP_2}`}
                        optionsFormName={`${id}.${LIMITS_GROUP_2}`}
                    />
                </Grid>
            </Grid>
            {/* limits */}
            <Grid container item xs={12} columns={11}>
                <Grid item xs={1}>
                    <Tab icon={<AddCircleIcon />} onClick={() => addNewLimitSet()} iconPosition="end" />
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={selectedLimitGroupTabIndex}
                        onChange={handleTabChange}
                        sx={{ flexGrow: 1 }}
                    >
                        {allLimitsGroupsStr.map((set, index) => (
                            <Tab
                                key={set}
                                label={set}
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
                            index === indexSelectedLimitSet1 && (
                                <LimitsSidePane
                                    key={item.id}
                                    limitsGroupFormName={`${id}.${LIMITS_GROUP_1}`}
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
                                    limitsGroupFormName={`${id}.${LIMITS_GROUP_2}`}
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
