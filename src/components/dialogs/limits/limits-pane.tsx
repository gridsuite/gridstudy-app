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
import { useCallback, useMemo, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
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
import { generateEmptyOperationalLimitsGroup, generateUniqueId } from './operational-limits-groups-utils';

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

    const olgEditable: boolean = useWatch({
        name: `${id}.${ENABLE_OLG_MODIFICATION}`,
    });

    const operationalLimitsGroupsFormName: string = `${id}.${OPERATIONAL_LIMITS_GROUPS}`;
    const {
        fields: operationalLimitsGroups,
        append: appendToLimitsGroups,
        prepend: prependToLimitsGroups,
        remove: removeLimitsGroups,
    } = useFieldArray<{
        [key: string]: OperationalLimitsGroupFormSchema[];
    }>({
        name: operationalLimitsGroupsFormName,
    });

    const watchedOperationalLimitsGroups: OperationalLimitsGroupFormSchema[] = useWatch({
        name: operationalLimitsGroupsFormName,
    });

    const isAModification: boolean = useMemo(() => !!equipmentToModify, [equipmentToModify]);

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

    const prependEmptyOperationalLimitsGroup = useCallback(
        (name: string) => {
            prependToLimitsGroups(generateEmptyOperationalLimitsGroup(name));
        },
        [prependToLimitsGroups]
    );

    const addNewLimitSet = useCallback(() => {
        let name = 'DEFAULT';

        // Try to generate unique name (we relie on watched table because name can be changed without using useFieldArray functions)
        if (watchedOperationalLimitsGroups?.length > 0) {
            const ids: string[] = watchedOperationalLimitsGroups.map((l) => l.name);
            name = generateUniqueId('DEFAULT', ids);
        }
        prependEmptyOperationalLimitsGroup(name);
        setIndexSelectedLimitSet(0);
    }, [watchedOperationalLimitsGroups, prependEmptyOperationalLimitsGroup]);

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
                        <IconButton color="primary" onClick={addNewLimitSet} disabled={!olgEditable}>
                            <AddIcon />
                        </IconButton>
                    </Box>
                    <OperationalLimitsGroupsTabs
                        parentFormName={id}
                        appendToLimitsGroups={appendToLimitsGroups}
                        removeLimitsGroups={removeLimitsGroups}
                        indexSelectedLimitSet={indexSelectedLimitSet}
                        setIndexSelectedLimitSet={setIndexSelectedLimitSet}
                        editable={olgEditable}
                        currentLimitsToModify={equipmentToModify?.currentLimits ?? []}
                    />
                </Grid>
                <Grid item xs={6} sx={tabStyles.parametersBox} marginLeft={2}>
                    {indexSelectedLimitSet !== null &&
                        operationalLimitsGroups.map(
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
