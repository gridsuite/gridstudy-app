/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button, Grid } from '@mui/material';
import {
    CURRENT_LIMITS,
    CURRENT_LIMITS_1,
    LIMITS,
    OPERATIONAL_LIMITS_GROUPS,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
} from 'components/utils/field-constants';
import { LimitsSidePane } from './limits-side-pane';
import { SelectedOperationalLimitGroup } from './selected-operational-limit-group.jsx';
import { useCallback, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { CurrentLimits, OperationalLimitsGroup } from '../../../services/network-modification-types';
import { OperationalLimitsGroupsTabs } from './operational-limits-groups-tabs';
import { tabStyles } from 'components/utils/tab-utils';
import { CurrentTreeNode } from '../../graph/tree-node.type';
import GridSection from '../commons/grid-section';
import { styles } from '../dialog-utils';
import AddIcon from '@mui/icons-material/ControlPoint';

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
    const myRef: any = useRef<any>(null);

    const limitsGroups1: OperationalLimitsGroup[] = useWatch({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS}`,
    });

    const OperationalLimitGroupSelect = useCallback(
        ({
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
        ),
        []
    );

    const onAddClick = useCallback(() => myRef.current?.addNewLimitSet(), []);

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
                index === selectedTabIndex && (
                    <LimitSetPane
                        id={operationalLimitsGroup.id + id}
                        formName={`${formName}[${index}].${CURRENT_LIMITS}`}
                        previousCurrentLimits={previousCurrentLimits}
                        selectedLimitSetId={operationalLimitsGroup.id}
                    />
                )
        );

    const LimitSetPane = useCallback(
        ({
            id,
            formName,
            previousCurrentLimits,
            selectedLimitSetId,
        }: {
            id: string;
            formName: string;
            previousCurrentLimits: CurrentLimits | null;
            selectedLimitSetId: string;
        }) => {
            return (
                <>
                    <LimitsSidePane
                        key={id}
                        limitsGroupFormName={formName}
                        clearableFields={clearableFields}
                        permanentCurrentLimitPreviousValue={previousCurrentLimits?.permanentLimit}
                        temporaryLimitsPreviousValues={previousCurrentLimits?.temporaryLimits ?? []}
                        currentNode={currentNode}
                        onlySelectedLimitsGroup={onlySelectedLimitsGroup}
                        selectedLimitSetId={selectedLimitSetId}
                    />
                </>
            );
        },
        [clearableFields, currentNode, onlySelectedLimitsGroup]
    );

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
            <Grid container item xs={8} columns={onlySelectedLimitsGroup ? 8 : 10.25} spacing={0}>
                {!onlySelectedLimitsGroup && (
                    <OperationalLimitGroupSelect
                        selectedFormName={`${id}.${SELECTED_LIMITS_GROUP_1}`}
                        optionsFormName={`${id}.${OPERATIONAL_LIMITS_GROUPS}`}
                        label="Side1"
                    />
                )}
                {!onlySelectedLimitsGroup && (
                    <OperationalLimitGroupSelect
                        selectedFormName={`${id}.${SELECTED_LIMITS_GROUP_2}`}
                        optionsFormName={`${id}.${OPERATIONAL_LIMITS_GROUPS}`}
                        label="Side2"
                    />
                )}
            </Grid>

            {/* limits */}
            <Grid container xs={4.9}>
                <GridSection
                    title="LimitSets"
                    children={<Button sx={styles.button} startIcon={<AddIcon onClick={onAddClick} />} />}
                />
            </Grid>
            <Grid container item xs={12} columns={onlySelectedLimitsGroup ? 8 : 10.25}>
                {!onlySelectedLimitsGroup && (
                    <Grid item xs={4}>
                        <OperationalLimitsGroupsTabs
                            ref={myRef}
                            parentFormName={id}
                            limitsGroups1={limitsGroups1}
                            indexSelectedLimitSet1={indexSelectedLimitSet1}
                            indexSelectedLimitSet2={indexSelectedLimitSet2}
                            setIndexSelectedLimitSet1={setIndexSelectedLimitSet1}
                            setIndexSelectedLimitSet2={setIndexSelectedLimitSet2}
                        />
                    </Grid>
                )}
                <Grid item xs={onlySelectedLimitsGroup ? 8 : 6} sx={tabStyles.parametersBox} marginLeft={2}>
                    {onlySelectedLimitsGroup ? (
                        <LimitSetPane
                            id={'leftPanel'}
                            formName={`${id}.${CURRENT_LIMITS_1}`}
                            previousCurrentLimits={getCurrentLimits1(equipmentToModify)}
                            selectedLimitSetId=""
                        />
                    ) : (
                        renderSidePaneAccordingToTabs(
                            'leftPanel',
                            limitsGroups1,
                            indexSelectedLimitSet1,
                            `${id}.${OPERATIONAL_LIMITS_GROUPS}`,
                            getCurrentLimits1(equipmentToModify)
                        )
                    )}
                </Grid>
            </Grid>
        </>
    );
}
