/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid, TextField, Typography } from '@mui/material';
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
import { useIntl } from 'react-intl';
import { LimitsSidePane } from './limits-side-pane';
import { SelectedOperationalLimitGroup } from './selected-operational-limit-group.jsx';
import { useCallback, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { CurrentLimits, OperationalLimitsGroup } from '../../../services/network-modification-types';
import { OperationalLimitsGroupsTabs } from './operational-limits-groups-tabs';
import { tabStyles } from 'components/utils/tab-utils';
import { CurrentTreeNode } from '../../graph/tree-node.type';
import GridSection from '../commons/grid-section';
import GridItem from '../commons/grid-item';
import { AutocompleteInput, FieldLabel } from '@gridsuite/commons-ui';
import { APPLIED_ON_SIDE } from '../parameters/non-evacuated-energy/columns-definitions';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';

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
    const intl = useIntl();

    const limitsGroups1: OperationalLimitsGroup[] = useWatch({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS_1}`,
    });
    const limitsGroups2: OperationalLimitsGroup[] = useWatch({
        name: `${id}.${OPERATIONAL_LIMITS_GROUPS_2}`,
    });

    const [appliedOnLabel, setAppliedOnLabel] = useState<string>('');

    const renderTitle = (selectedFormName: string, optionsFormName: string, label: string) => (
        <>
            {!onlySelectedLimitsGroup && (
                <Grid item xs={2}>
                    <SelectedOperationalLimitGroup
                        selectedFormName={selectedFormName}
                        optionsFormName={optionsFormName}
                        label={label}
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

    const addNewLimitSet = useCallback(() => {
        console.log('toto');
    }, []);

    const addButton = (
        <Box
            sx={{
                alignItems: 'center',
            }}
        >
            <IconButton
                size="small"
                onClick={addNewLimitSet}
                sx={{
                    align: 'center',
                }}
            >
                <AddCircleIcon fontSize="small" />
            </IconButton>
        </Box>
    );

    const selectedSide = (
        <Grid container spacing={2} alignItems="center" paddingLeft={2}>
            <GridItem size={3} style={{ textAlign: 'center' }}>
                <FieldLabel label={'LimitGroupAppliedOnLabel'} />
            </GridItem>
            <GridItem size={4}>
                <AutocompleteInput
                    name={`${id}.${APPLIED_ON_SIDE}`}
                    options={APPLIED_ON_SIDE}
                    size={'small'}
                    getOptionLabel={(option: any) => intl.formatMessage({ id: option?.label })}
                />
            </GridItem>
        </Grid>
    );

    return (
        <Grid container spacing={1}>
            {/*title*/}
            <Grid container item xs={12} columns={8}>
                <GridSection title={'ActiveLimitSets'} />
                <Grid container spacing={2}>
                    {renderTitle(
                        `${id}.${SELECTED_LIMITS_GROUP_1}`,
                        `${id}.${OPERATIONAL_LIMITS_GROUPS_1}`,
                        'SelectedOperationalLimitGroupSide1'
                    )}
                    {renderTitle(
                        `${id}.${SELECTED_LIMITS_GROUP_2}`,
                        `${id}.${OPERATIONAL_LIMITS_GROUPS_2}`,
                        'SelectedOperationalLimitGroupSide2'
                    )}
                </Grid>
            </Grid>
            {/* limits */}
            <Grid container item xs={12} columns={8}>
                <GridSection title={'limitSets'}></GridSection>
                <Grid container alignItems="center" padding={2}>
                    <GridItem size={1}>
                        <FieldLabel label={'liste des sets'} />
                    </GridItem>
                    <GridItem>{addButton}</GridItem>
                </Grid>
                {!onlySelectedLimitsGroup && (
                    <Grid item xs={3} sx={{ paddingRight: 4 }}>
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
                    <Grid container alignItems="center" padding={2}>
                        <GridItem>
                            <TextField label={limitsGroups1[indexSelectedLimitSet1]?.id} disabled />
                        </GridItem>
                    </Grid>
                    {selectedSide}
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
            </Grid>
        </Grid>
    );
}
