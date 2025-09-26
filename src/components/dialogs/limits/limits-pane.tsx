/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import {
    CURRENT_LIMITS,
    EDITED_OPERATIONAL_LIMITS_GROUPS,
    LIMITS,
    OPERATIONAL_LIMITS_GROUPS,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
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
import { styles } from '../dialog-utils';
import AddIcon from '@mui/icons-material/ControlPoint';
import { APPLICABILITY } from '../../network/constants';
import { OperationalLimitsGroupFormInfos } from '../network-modifications/line/modification/line-modification-type';
import { InputWithPopupConfirmation, SwitchInput } from '@gridsuite/commons-ui';

export interface LimitsPaneProps {
    id?: string;
    currentNode?: CurrentTreeNode;
    equipmentToModify?: any;
    clearableFields?: boolean;
}

export function LimitsPane({
    id = LIMITS,
    currentNode,
    equipmentToModify,
    clearableFields,
}: Readonly<LimitsPaneProps>) {
    const [indexSelectedLimitSet, setIndexSelectedLimitSet] = useState<number | null>(null);
    const { setValue } = useFormContext();

    const myRef: any = useRef<any>(null);

    const limitsGroups: OperationalLimitsGroupFormInfos[] = useWatch({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS}`,
    });
    const olgEditable: boolean = useWatch({
        name: `${id}.${EDITED_OPERATIONAL_LIMITS_GROUPS}`,
    });

    const isAModification: boolean = useMemo(() => !!equipmentToModify, [equipmentToModify]);

    const onAddClick = useCallback(() => myRef.current?.addNewLimitSet(), []);

    const getCurrentLimits = (equipmentToModify: any, operationalLimitsGroupId: string): CurrentLimits | null => {
        if (equipmentToModify?.currentLimits) {
            return equipmentToModify.currentLimits.find(
                (currentLimit: CurrentLimits) =>
                    currentLimit.id + currentLimit.applicability === operationalLimitsGroupId
            );
        }
        return null;
    };

    /**
     * returns an error message id if :
     * - there are more than 2 limit sets with the same name
     * - there are exactly 2 limit set with this name but they have the same applicability side
     */
    const checkLimitSetUnicity = useCallback(
        (editedLimitGroupName: string, newSelectedApplicability: string): string => {
            if (indexSelectedLimitSet == null) {
                return '';
            }

            // checks if limit sets with that name already exist
            const sameNameInLs: OperationalLimitsGroupFormInfos[] = limitsGroups
                .filter((_ls, index: number) => index !== indexSelectedLimitSet)
                .filter(
                    (limitsGroup: OperationalLimitsGroupFormInfos) =>
                        limitsGroup.name.trim() === editedLimitGroupName.trim()
                );

            // only 2 limit sets with the same name are allowed and only if there have SIDE1 and SIDE2 applicability
            if (sameNameInLs.length > 0) {
                if (sameNameInLs.length > 1) {
                    return 'LimitSetNamingError';
                }

                if (
                    sameNameInLs[0].applicability === newSelectedApplicability ||
                    sameNameInLs[0].applicability === APPLICABILITY.EQUIPMENT.id ||
                    newSelectedApplicability === APPLICABILITY.EQUIPMENT.id
                ) {
                    // only one limit set with this name exist => their applicability has to be different
                    return 'LimitSetApplicabilityError';
                }
            }
            return '';
        },
        [indexSelectedLimitSet, limitsGroups]
    );

    const handlePopupConfirmation = () => {
        setValue(`${id}.${EDITED_OPERATIONAL_LIMITS_GROUPS}`, false);
        // TODO : reset des données de limites (cf combineFormAndMapServerLimitsGroups)
        // setValue(`${id}.${OPERATIONAL_LIMITS_GROUPS}`, equipmentToModify.currentLimits);
    };

    return (
        <>
            {/* active limit sets */}
            <GridSection title="SelectedOperationalLimitGroups" />
            <Grid container item xs={8} columns={10.25} spacing={0}>
                <Grid item xs={3}>
                    <SelectedOperationalLimitGroup
                        selectedFormName={`${id}.${SELECTED_LIMITS_GROUP_1}`}
                        optionsFormName={`${id}.${OPERATIONAL_LIMITS_GROUPS}`}
                        label="Side1"
                        filteredApplicability={APPLICABILITY.SIDE1.id}
                        previousValue={equipmentToModify?.selectedOperationalLimitsGroup1}
                        isABranchModif={!!equipmentToModify}
                    />
                </Grid>
                <Grid item xs={3}>
                    <SelectedOperationalLimitGroup
                        selectedFormName={`${id}.${SELECTED_LIMITS_GROUP_2}`}
                        optionsFormName={`${id}.${OPERATIONAL_LIMITS_GROUPS}`}
                        label="Side2"
                        filteredApplicability={APPLICABILITY.SIDE2.id}
                        previousValue={equipmentToModify?.selectedOperationalLimitsGroup2}
                        isABranchModif={!!equipmentToModify}
                    />
                </Grid>
                <Grid item xs={3}>
                    {/* if the user wants to switch of the modification a modal asks him to confirm */}
                    {isAModification && (
                        <InputWithPopupConfirmation
                            Input={SwitchInput}
                            name={`${id}.${EDITED_OPERATIONAL_LIMITS_GROUPS}`}
                            label={olgEditable ? 'Edit' : 'View'}
                            shouldOpenPopup={() => olgEditable}
                            resetOnConfirmation={handlePopupConfirmation}
                            message="disableOLGedition"
                            validateButtonLabel="button.changeType"
                        />
                    )}
                </Grid>
            </Grid>

            {/* limits */}
            <Grid container item xs={4.9} display="flex" flexDirection="row">
                <Grid container item xs={3}>
                    <GridSection title="LimitSets" />
                </Grid>
                <Grid container item xs={0.5}>
                    <IconButton color="primary" sx={styles.button} onClick={onAddClick} disabled={!olgEditable}>
                        <AddIcon />
                    </IconButton>
                </Grid>
            </Grid>
            <Grid container item xs={12} columns={10.25}>
                <Grid item xs={4}>
                    <OperationalLimitsGroupsTabs
                        ref={myRef}
                        parentFormName={id}
                        limitsGroups={limitsGroups}
                        indexSelectedLimitSet={indexSelectedLimitSet}
                        setIndexSelectedLimitSet={setIndexSelectedLimitSet}
                        checkLimitSetUnicity={checkLimitSetUnicity}
                        isAModification={!!equipmentToModify}
                        editable={olgEditable}
                    />
                </Grid>
                <Grid item xs={6} sx={tabStyles.parametersBox} marginLeft={2}>
                    {indexSelectedLimitSet !== null &&
                        limitsGroups.map(
                            (operationalLimitsGroup: OperationalLimitsGroupFormInfos, index: number) =>
                                index === indexSelectedLimitSet && (
                                    <LimitsSidePane
                                        key={operationalLimitsGroup.id}
                                        limitsGroupFormName={`${id}.${OPERATIONAL_LIMITS_GROUPS}[${index}].${CURRENT_LIMITS}`}
                                        limitsGroupApplicabilityName={`${id}.${OPERATIONAL_LIMITS_GROUPS}[${index}]`}
                                        clearableFields={clearableFields}
                                        permanentCurrentLimitPreviousValue={
                                            getCurrentLimits(equipmentToModify, operationalLimitsGroup.id)
                                                ?.permanentLimit
                                        }
                                        temporaryLimitsPreviousValues={
                                            getCurrentLimits(equipmentToModify, operationalLimitsGroup.id)
                                                ?.temporaryLimits ?? []
                                        }
                                        currentNode={currentNode}
                                        selectedLimitSetName={operationalLimitsGroup.name}
                                        checkLimitSetUnicity={checkLimitSetUnicity}
                                        disabled={!olgEditable}
                                    />
                                )
                        )}
                </Grid>
            </Grid>
        </>
    );
}
