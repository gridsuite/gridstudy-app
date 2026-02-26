/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid } from '@mui/material';
import {
    ENABLE_OLG_MODIFICATION,
    LIMITS,
    OPERATIONAL_LIMITS_GROUPS,
    SELECTED_OPERATIONAL_LIMITS_GROUP_ID1,
    SELECTED_OPERATIONAL_LIMITS_GROUP_ID2,
} from 'components/utils/field-constants';
import { LimitsSidePane } from './limits-side-pane';
import { SelectedOperationalLimitGroup } from './selected-operational-limit-group.js';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { CurrentLimits } from '../../../services/network-modification-types';
import { OperationalLimitsGroupsTabs } from './operational-limits-groups-tabs';
import { tabStyles } from 'components/utils/tab-utils';
import IconButton from '@mui/material/IconButton';
import { CurrentTreeNode } from '../../graph/tree-node.type';
import GridSection from '../commons/grid-section';
import AddIcon from '@mui/icons-material/ControlPoint';
import { APPLICABILITY } from '../../network/constants';
import { InputWithPopupConfirmation, SwitchInput } from '@gridsuite/commons-ui';
import { mapServerLimitsGroupsToFormInfos } from './limits-pane-utils';
import { BranchInfos, CurrentLimitsData } from '../../../services/study/network-map.type';
import { OperationalLimitsGroupFormSchema } from './operational-limits-groups-types';

export interface LimitsPaneProps {
    id?: string;
    currentNode?: CurrentTreeNode;
    equipmentToModify?: BranchInfos | null;
    clearableFields?: boolean;
}

export function LimitsPane({
    id = LIMITS,
    currentNode,
    equipmentToModify,
    clearableFields,
}: Readonly<LimitsPaneProps>) {
    const [indexSelectedLimitSet, setIndexSelectedLimitSet] = useState<number | null>(null);
    const { getValues, reset } = useFormContext();

    const myRef: any = useRef<any>(null);

    const limitsGroups = useWatch({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS}`,
    });
    const olgEditable: boolean = useWatch({
        name: `${id}.${ENABLE_OLG_MODIFICATION}`,
    });

    const isAModification: boolean = useMemo(() => !!equipmentToModify, [equipmentToModify]);

    const onAddClick = useCallback(() => myRef.current?.addNewLimitSet(), []);

    const getCurrentLimits = (equipmentToModify: any, operationalLimitsGroupId: string): CurrentLimitsData | null => {
        if (equipmentToModify?.currentLimits) {
            return equipmentToModify.currentLimits.find(
                (currentLimit: CurrentLimitsData) =>
                    currentLimit.id + currentLimit.applicability === operationalLimitsGroupId
            );
        }
        return null;
    };

    const getCurrentLimitsIgnoreApplicability = (
        equipmentToModify: any,
        operationalLimitsGroupName: string
    ): CurrentLimits | null => {
        if (equipmentToModify?.currentLimits) {
            return equipmentToModify.currentLimits.find(
                (currentLimit: CurrentLimitsData) => currentLimit.id === operationalLimitsGroupName
            );
        }
        return null;
    };

    const handlePopupConfirmation = () => {
        const resetOLGs: OperationalLimitsGroupFormSchema[] = mapServerLimitsGroupsToFormInfos(
            equipmentToModify?.currentLimits ?? []
        );
        const currentValues = getValues();
        reset(
            {
                ...currentValues,
                [LIMITS]: {
                    [OPERATIONAL_LIMITS_GROUPS]: resetOLGs,
                    [ENABLE_OLG_MODIFICATION]: false,
                },
            },
            { keepDefaultValues: true }
        );
    };

    return (
        <>
            {/* active limit sets */}
            <Grid container columns={6} item spacing={1} sx={{ maxWidth: '600px' }}>
                <Grid item xs={3}>
                    <GridSection title="SelectedOperationalLimitGroups" />
                </Grid>
                <Grid
                    item
                    xs={3}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    {/* if the user wants to switch off the modification a modal asks him to confirm */}
                    {isAModification && (
                        <InputWithPopupConfirmation
                            Input={SwitchInput}
                            name={`${id}.${ENABLE_OLG_MODIFICATION}`}
                            label={olgEditable ? 'Edit' : 'View'}
                            shouldOpenPopup={() => olgEditable}
                            resetOnConfirmation={handlePopupConfirmation}
                            message="disableOLGedition"
                            validateButtonLabel="validate"
                        />
                    )}
                </Grid>
                <Grid item xs={3}>
                    <SelectedOperationalLimitGroup
                        selectedFormName={`${id}.${SELECTED_OPERATIONAL_LIMITS_GROUP_ID1}`}
                        optionsFormName={`${id}.${OPERATIONAL_LIMITS_GROUPS}`}
                        label="Side1"
                        filteredApplicability={APPLICABILITY.SIDE1.id}
                        previousValue={equipmentToModify?.selectedOperationalLimitsGroupId1}
                        isABranchModif={!!equipmentToModify}
                    />
                </Grid>
                <Grid item xs={3}>
                    <SelectedOperationalLimitGroup
                        selectedFormName={`${id}.${SELECTED_OPERATIONAL_LIMITS_GROUP_ID2}`}
                        optionsFormName={`${id}.${OPERATIONAL_LIMITS_GROUPS}`}
                        label="Side2"
                        filteredApplicability={APPLICABILITY.SIDE2.id}
                        previousValue={equipmentToModify?.selectedOperationalLimitsGroupId2}
                        isABranchModif={!!equipmentToModify}
                    />
                </Grid>
            </Grid>

            {/* limits */}
            <Grid container item xs={12} columns={10.25}>
                <Grid item xs={4}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <GridSection title="LimitSets" />
                        <IconButton color="primary" onClick={onAddClick} disabled={!olgEditable}>
                            <AddIcon />
                        </IconButton>
                    </Box>
                    <OperationalLimitsGroupsTabs
                        ref={myRef}
                        parentFormName={id}
                        limitsGroups={limitsGroups}
                        indexSelectedLimitSet={indexSelectedLimitSet}
                        setIndexSelectedLimitSet={setIndexSelectedLimitSet}
                        editable={olgEditable}
                        currentLimitsToModify={equipmentToModify?.currentLimits ?? []}
                    />
                </Grid>
                <Grid item xs={6} sx={tabStyles.parametersBox} marginLeft={2}>
                    {indexSelectedLimitSet !== null &&
                        limitsGroups.map(
                            (operationalLimitsGroup: OperationalLimitsGroupFormSchema, index: number) =>
                                index === indexSelectedLimitSet && (
                                    <LimitsSidePane
                                        key={operationalLimitsGroup.id}
                                        name={`${id}.${OPERATIONAL_LIMITS_GROUPS}[${index}]`}
                                        clearableFields={clearableFields}
                                        permanentCurrentLimitPreviousValue={
                                            getCurrentLimits(equipmentToModify, operationalLimitsGroup.id)
                                                ?.permanentLimit ??
                                            getCurrentLimitsIgnoreApplicability(
                                                equipmentToModify,
                                                operationalLimitsGroup.name
                                            )?.permanentLimit
                                        }
                                        temporaryLimitsPreviousValues={
                                            getCurrentLimits(equipmentToModify, operationalLimitsGroup.id)
                                                ?.temporaryLimits ?? []
                                        }
                                        currentNode={currentNode}
                                        disabled={!olgEditable}
                                    />
                                )
                        )}
                </Grid>
            </Grid>
        </>
    );
}
