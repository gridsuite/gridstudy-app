/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Typography } from '@mui/material';
import {
    LIMITS,
    OPERATIONAL_LIMITS_GROUPS_1,
    OPERATIONAL_LIMITS_GROUPS_2,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
} from 'components/utils/field-constants';
import { FormattedMessage } from 'react-intl';
import { LimitsSidePane } from './limits-side-pane';
import { SelectedOperationalLimitGroup } from './selected-operational-limit-group.jsx';
import { CurrentTreeNode } from '../../../redux/reducer';
import React, { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { OperationalLimitsGroup } from './limits-type';
import { TemporaryLimit } from '../../../services/network-modification-types';
import { OperationalLimitsGroupsTabs } from './operational-limits-groups-tabs';
import { tabStyles } from '../../parameters-tabs';

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

    const renderTitle = (id: string, selectedFormName: string, optionsFormName: string) => (
        <>
            <Grid item xs={1}>
                <Typography variant="h5">
                    <FormattedMessage id={id} />
                </Typography>
            </Grid>
            <Grid item xs={3}>
                <SelectedOperationalLimitGroup selectedFormName={selectedFormName} optionsFormName={optionsFormName} />
            </Grid>
        </>
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
            <Grid container item xs={12} columns={10} spacing={2}>
                <Grid item xs={1.9} />
                {renderTitle('Side1', `${id}.${SELECTED_LIMITS_GROUP_1}`, `${id}.${OPERATIONAL_LIMITS_GROUPS_1}`)}
                {renderTitle('Side2', `${id}.${SELECTED_LIMITS_GROUP_2}`, `${id}.${OPERATIONAL_LIMITS_GROUPS_2}`)}
            </Grid>
            {/* limits */}
            <Grid container item xs={12} columns={10}>
                <Grid item xs={1.8}>
                    <OperationalLimitsGroupsTabs
                        limitsGroups1={limitsGroups1}
                        limitsGroups2={limitsGroups2}
                        setIndexSelectedLimitSet1={setIndexSelectedLimitSet1}
                        setIndexSelectedLimitSet2={setIndexSelectedLimitSet2}
                    />
                </Grid>
                <Grid item xs={4} sx={tabStyles.parametersBox}>
                    {renderSidePane(
                        limitsGroups1,
                        indexSelectedLimitSet1,
                        `${id}.${OPERATIONAL_LIMITS_GROUPS_1}`,
                        equipmentToModify?.currentLimits1?.temporaryLimits,
                        equipmentToModify?.currentLimits1?.permanentLimit
                    )}
                </Grid>
                <Grid item xs={4} sx={tabStyles.parametersBox}>
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
