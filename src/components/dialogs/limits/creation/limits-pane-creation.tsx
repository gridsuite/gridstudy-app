/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button, Grid } from '@mui/material';
import {
    CURRENT_LIMITS,
    LIMITS,
    OPERATIONAL_LIMITS_GROUPS,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
} from 'components/utils/field-constants';
import { LimitsSidePane } from '../limits-side-pane';
import { SelectedOperationalLimitGroup } from '../selected-operational-limit-group.js';
import { useCallback, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { CurrentLimits, OperationalLimitsGroup } from '../../../../services/network-modification-types';
import { OperationalLimitsGroupsTabs } from '../operational-limits-groups-tabs';
import { tabStyles } from 'components/utils/tab-utils';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import GridSection from '../../commons/grid-section';
import { styles } from '../../dialog-utils';
import AddIcon from '@mui/icons-material/ControlPoint';

const OperationalLimitGroupSelect = ({
    selectedFormName,
    optionsFormName,
    label,
}: {
    selectedFormName: string;
    optionsFormName: string;
    label: string;
}) => (
    <Grid item xs={3}>
        <SelectedOperationalLimitGroup
            selectedFormName={selectedFormName}
            optionsFormName={optionsFormName}
            label={label}
        />
    </Grid>
);

export interface LimitsPaneCreationProps {
    id?: string;
    currentNode?: CurrentTreeNode;
    equipmentToModify?: any;
    clearableFields?: boolean;
}

export function LimitsPaneCreation({
    id = LIMITS,
    currentNode,
    equipmentToModify,
    clearableFields,
}: Readonly<LimitsPaneCreationProps>) {
    const [indexSelectedLimitSet, setIndexSelectedLimitSet] = useState<number | null>(null);

    const myRef: any = useRef<any>(null);

    const limitsGroups: OperationalLimitsGroup[] = useWatch({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS}`,
    });

    const onAddClick = useCallback(() => myRef.current?.addNewLimitSet(), []);

    const getCurrentLimits1 = (equipmentToModify: any): CurrentLimits | null => {
        if (equipmentToModify?.currentLimits1) {
            return equipmentToModify.currentLimits1.find(
                (currentLimit: CurrentLimits) => currentLimit.id === equipmentToModify.selectedOperationalLimitsGroup1
            );
        }
        return null;
    };

    return (
        <>
            {/* active limit sets */}
            <GridSection title="SelectedOperationalLimitGroups" />
            <Grid container item xs={8} columns={10.25} spacing={0}>
                <OperationalLimitGroupSelect
                    selectedFormName={`${id}.${SELECTED_LIMITS_GROUP_1}`}
                    optionsFormName={`${id}.${OPERATIONAL_LIMITS_GROUPS}`}
                    label="Side1"
                />
                <OperationalLimitGroupSelect
                    selectedFormName={`${id}.${SELECTED_LIMITS_GROUP_2}`}
                    optionsFormName={`${id}.${OPERATIONAL_LIMITS_GROUPS}`}
                    label="Side2"
                />
            </Grid>

            {/* limits */}
            <Grid container item xs={4.9}>
                <GridSection
                    title="LimitSets"
                    children={<Button sx={styles.button} startIcon={<AddIcon onClick={onAddClick} />} />}
                />
            </Grid>
            <Grid container item xs={12} columns={10.25}>
                <Grid item xs={4}>
                    <OperationalLimitsGroupsTabs
                        ref={myRef}
                        parentFormName={id}
                        limitsGroups={limitsGroups}
                        indexSelectedLimitSet={indexSelectedLimitSet}
                        setIndexSelectedLimitSet={setIndexSelectedLimitSet}
                    />
                </Grid>
                <Grid item xs={6} sx={tabStyles.parametersBox} marginLeft={2}>
                    {indexSelectedLimitSet !== null &&
                        limitsGroups.map(
                            (operationalLimitsGroup: OperationalLimitsGroup, index: number) =>
                                indexSelectedLimitSet != null &&
                                index === indexSelectedLimitSet && (
                                    <LimitsSidePane
                                        key={operationalLimitsGroup.id + 'leftPanel'}
                                        limitsGroupFormName={`${id}.${OPERATIONAL_LIMITS_GROUPS}[${index}].${CURRENT_LIMITS}`}
                                        limitsGroupApplicabilityName={`${id}.${OPERATIONAL_LIMITS_GROUPS}[${index}]`}
                                        clearableFields={clearableFields}
                                        permanentCurrentLimitPreviousValue={
                                            getCurrentLimits1(equipmentToModify)?.permanentLimit
                                        }
                                        temporaryLimitsPreviousValues={
                                            getCurrentLimits1(equipmentToModify)?.temporaryLimits ?? []
                                        }
                                        currentNode={currentNode}
                                        onlySelectedLimitsGroup={false}
                                        selectedLimitSetId={operationalLimitsGroup.id}
                                    />
                                )
                        )}
                </Grid>
            </Grid>
        </>
    );
}
