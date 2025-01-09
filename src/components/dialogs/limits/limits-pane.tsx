/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid } from '@mui/material';
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
import React, { useCallback, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { OperationalLimitsGroup } from './limits-type';
import IconButton from '@mui/material/IconButton';
import { TemporaryLimit } from '../../../services/network-modification-types';
import { OperationalLimitsGroupsTabs } from './operational-limits-groups-tabs';

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
    const [indexSelectedLimitSet1, setIndexSelectedLimitSet1] = useState<number>(0);
    const [indexSelectedLimitSet2, setIndexSelectedLimitSet2] = useState<number>(0);

    const limitsGroups1: OperationalLimitsGroup[] = useWatch({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS_1}.`,
    });
    const limitsGroups2: OperationalLimitsGroup[] = useWatch({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS_2}`,
    });
    const { append: appendToLimitsGroups1 } = useFieldArray({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS_1}`,
    });
    const { append: appendToLimitsGroups2 } = useFieldArray({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS_2}`,
    });

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
    }, [appendToLimitsGroups1, appendToLimitsGroups2, limitsGroups1.length]);

    const renderTitle = (id: string) => (
        <Grid item xs={5}>
            <Box component="h3">
                <FormattedMessage id={id} />
            </Box>
        </Grid>
    );

    const renderSidePane = (
        limitsGroups: OperationalLimitsGroup[],
        selectedTabIndex: number,
        formName: string,
        previousValues: TemporaryLimit[],
        permanentCurrentLimitPreviousValue: number
    ) =>
        limitsGroups.map(
            (item: OperationalLimitsGroup, index: number) =>
                index === selectedTabIndex && (
                    <LimitsSidePane
                        key={item.id}
                        limitsGroupFormName={formName}
                        clearableFields={clearableFields}
                        indexLimitGroup={index}
                        permanentCurrentLimitPreviousValue={permanentCurrentLimitPreviousValue}
                        previousValues={previousValues}
                        currentNode={currentNode}
                    />
                )
        );

    return (
        <Grid container spacing={2}>
            <Grid container item xs={12} columns={11} spacing={2}>
                <Grid item xs={1} />
                {renderTitle('Side1')}
                {renderTitle('Side2')}
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
                    <OperationalLimitsGroupsTabs
                        limitsGroups1={limitsGroups1}
                        limitsGroups2={limitsGroups2}
                        setIndexSelectedLimitSet1={setIndexSelectedLimitSet1}
                        setIndexSelectedLimitSet2={setIndexSelectedLimitSet2}
                    />
                </Grid>
                <Grid item xs={5}>
                    {renderSidePane(
                        limitsGroups1,
                        indexSelectedLimitSet1,
                        `${id}.${OPERATIONAL_LIMITS_GROUPS_1}`,
                        equipmentToModify?.currentLimits1?.temporaryLimits,
                        equipmentToModify?.currentLimits1?.permanentLimit
                    )}
                </Grid>
                <Grid item xs={5}>
                    {renderSidePane(
                        limitsGroups2,
                        indexSelectedLimitSet2,
                        `${id}.${OPERATIONAL_LIMITS_GROUPS_2}`,
                        equipmentToModify?.currentLimits2?.temporaryLimits,
                        equipmentToModify?.currentLimits2?.permanentLimit
                    )}
                </Grid>
            </Grid>
        </Grid>
    );
}
