/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Typography } from '@mui/material';
import {
    CURRENT_LIMITS,
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
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
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { CurrentLimits, OperationalLimitsGroup } from '../../../services/network-modification-types';
import { OperationalLimitsGroupsTabs } from './operational-limits-groups-tabs';
import { tabStyles } from 'components/utils/tab-utils';

export interface LimitsPaneProps {
    id?: string;
    currentNode?: CurrentTreeNode;
    equipmentToModify?: any;
    clearableFields?: boolean;
    // temporary value because creation interfaces uses complete limits groups while modification still uses the old system with only the selected current limits
    // will become obsolete once the modification interfaces use complete limits groups
    onlySelectedLimitsGroup?: boolean;
}

export function LimitsPane({
    id = LIMITS,
    currentNode,
    equipmentToModify,
    clearableFields,
    onlySelectedLimitsGroup = false,
}: Readonly<LimitsPaneProps>) {
    const [indexSelectedLimitSet1, setIndexSelectedLimitSet1] = useState<number | null>(null);
    const [indexSelectedLimitSet2, setIndexSelectedLimitSet2] = useState<number | null>(null);

    const limitsGroups1: OperationalLimitsGroup[] = useWatch({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS_1}`,
    });
    const limitsGroups2: OperationalLimitsGroup[] = useWatch({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS_2}`,
    });

    const renderTitle = (id: string, selectedFormName: string, optionsFormName: string) => (
        <>
            <Grid item xs={onlySelectedLimitsGroup ? 4 : 1}>
                <Typography variant="h5">
                    <FormattedMessage id={id} />
                </Typography>
            </Grid>
            {!onlySelectedLimitsGroup && (
                <Grid item xs={3}>
                    <SelectedOperationalLimitGroup
                        selectedFormName={selectedFormName}
                        optionsFormName={optionsFormName}
                    />
                </Grid>
            )}
        </>
    );

    const renderSidePaneAccordingToTabs = (
        id: string,
        limitsGroups: OperationalLimitsGroup[],
        selectedTabIndex: number | null,
        formName: string,
        previousCurrentLimits: CurrentLimits | null
    ) =>
        indexSelectedLimitSet1 !== null &&
        limitsGroups.map(
            (operationalLimitsGroup: OperationalLimitsGroup, index: number) =>
                selectedTabIndex != null &&
                index === selectedTabIndex &&
                renderSidePane(
                    operationalLimitsGroup.id + id,
                    `${formName}[${index}].${CURRENT_LIMITS}`,
                    previousCurrentLimits
                )
        );

    const renderSidePane = (id: string, formName: string, previousCurrentLimits: CurrentLimits | null) => {
        return (
            <LimitsSidePane
                key={id}
                limitsGroupFormName={formName}
                clearableFields={clearableFields}
                permanentCurrentLimitPreviousValue={previousCurrentLimits?.permanentLimit}
                temporaryLimitsPreviousValues={previousCurrentLimits?.temporaryLimits ?? []}
                currentNode={currentNode}
                onlySelectedLimitsGroup={onlySelectedLimitsGroup}
            />
        );
    };

    const getCurrentLimits1 = (equipmentToModify: any): CurrentLimits | null => {
        if (equipmentToModify?.currentLimits1) {
            return equipmentToModify.currentLimits1.find(
                (currentLimit: CurrentLimits) => currentLimit.id === equipmentToModify.selectedOperationalLimitsGroup1
            );
        }
        return null;
    };
    const getCurrentLimits2 = (equipmentToModify: any): CurrentLimits | null => {
        if (equipmentToModify?.currentLimits2) {
            return equipmentToModify.currentLimits2.find(
                (currentLimit: CurrentLimits) => currentLimit.id === equipmentToModify.selectedOperationalLimitsGroup2
            );
        }
        return null;
    };

    return (
        <Grid container spacing={2}>
            <Grid container item xs={12} columns={onlySelectedLimitsGroup ? 8 : 10.25} spacing={2}>
                {!onlySelectedLimitsGroup && <Grid item xs={1.9} />}
                {renderTitle('Side1', `${id}.${SELECTED_LIMITS_GROUP_1}`, `${id}.${OPERATIONAL_LIMITS_GROUPS_1}`)}
                {!onlySelectedLimitsGroup && <Grid item xs={0.25} />}
                {renderTitle('Side2', `${id}.${SELECTED_LIMITS_GROUP_2}`, `${id}.${OPERATIONAL_LIMITS_GROUPS_2}`)}
            </Grid>
            {/* limits */}
            <Grid container item xs={12} columns={onlySelectedLimitsGroup ? 8 : 10.25}>
                {!onlySelectedLimitsGroup && (
                    <Grid item xs={1.8}>
                        <OperationalLimitsGroupsTabs
                            parentFormName={id}
                            limitsGroups1={limitsGroups1}
                            limitsGroups2={limitsGroups2}
                            indexSelectedLimitSet1={indexSelectedLimitSet1}
                            indexSelectedLimitSet2={indexSelectedLimitSet2}
                            setIndexSelectedLimitSet1={setIndexSelectedLimitSet1}
                            setIndexSelectedLimitSet2={setIndexSelectedLimitSet2}
                        />
                    </Grid>
                )}
                <Grid item xs={4} sx={tabStyles.parametersBox}>
                    {onlySelectedLimitsGroup
                        ? renderSidePane('leftPanel', `${id}.${CURRENT_LIMITS_1}`, getCurrentLimits1(equipmentToModify))
                        : renderSidePaneAccordingToTabs(
                              'leftPanel',
                              limitsGroups1,
                              indexSelectedLimitSet1,
                              `${id}.${OPERATIONAL_LIMITS_GROUPS_1}`,
                              getCurrentLimits1(equipmentToModify)
                          )}
                </Grid>
                {!onlySelectedLimitsGroup && <Grid item xs={0.25} />}
                <Grid item xs={4} sx={tabStyles.parametersBox}>
                    {onlySelectedLimitsGroup
                        ? renderSidePane(
                              'rightPanel',
                              `${id}.${CURRENT_LIMITS_2}`,
                              getCurrentLimits2(equipmentToModify)
                          )
                        : renderSidePaneAccordingToTabs(
                              'rightPanel',
                              limitsGroups2,
                              indexSelectedLimitSet2,
                              `${id}.${OPERATIONAL_LIMITS_GROUPS_2}`,
                              getCurrentLimits2(equipmentToModify)
                          )}
                </Grid>
            </Grid>
        </Grid>
    );
}
