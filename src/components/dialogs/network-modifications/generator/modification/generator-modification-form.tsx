/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FieldConstants } from '@gridsuite/commons-ui';
import { Grid } from '@mui/material';
import { GeneratorDialogTab } from './generatorTabs.utils';
import { GeneratorDialogHeader, GeneratorDialogHeaderProps } from './GeneratorDialogHeader';
import { GeneratorDialogTabs } from './GeneratorDialogTabs';
import { GeneratorDialogTabsContent, GeneratorDialogTabsContentProps } from './GeneratorDialogTabsContent';
import type { UUID } from 'node:crypto';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { useEffect, useState } from 'react';
import { useFormState } from 'react-hook-form';
import { VOLTAGE_REGULATION } from '../../../../utils/field-constants';

interface GeneratorModificationFormProps
    extends GeneratorDialogHeaderProps,
        Omit<GeneratorDialogTabsContentProps, 'tabIndex'> {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
}

export default function GeneratorModificationForm({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    generatorToModify,
    updatePreviousReactiveCapabilityCurveTable,
    voltageLevelOptions,
    fetchBusesOrBusbarSections,
    PositionDiagramPane,
    equipmentId,
}: Readonly<GeneratorModificationFormProps>) {
    // TODO when this Form is moved to commons-ui, we have to use the hook useTabsWithError for tab errors management
    const [tabIndexesWithError, setTabIndexesWithError] = useState<number[]>([]);
    const [tabIndex, setTabIndex] = useState<number>(GeneratorDialogTab.CONNECTIVITY_TAB);

    const { errors } = useFormState();

    useEffect(() => {
        let tabsInError: number[] = [];
        if (errors?.[FieldConstants.CONNECTIVITY] !== undefined) {
            tabsInError.push(GeneratorDialogTab.CONNECTIVITY_TAB);
        }
        if (
            // setpoints
            errors?.[FieldConstants.ACTIVE_POWER_SET_POINT] !== undefined ||
            errors?.[FieldConstants.REACTIVE_POWER_SET_POINT] !== undefined ||
            errors?.[VOLTAGE_REGULATION] !== undefined ||
            errors?.[FieldConstants.VOLTAGE_SET_POINT] !== undefined ||
            errors?.[FieldConstants.VOLTAGE_REGULATION_TYPE] !== undefined ||
            errors?.[FieldConstants.Q_PERCENT] !== undefined ||
            errors?.[FieldConstants.FREQUENCY_REGULATION] !== undefined ||
            errors?.[FieldConstants.DROOP] !== undefined ||
            // limits
            errors?.[FieldConstants.MINIMUM_ACTIVE_POWER] !== undefined ||
            errors?.[FieldConstants.MAXIMUM_ACTIVE_POWER] !== undefined ||
            errors?.[FieldConstants.RATED_NOMINAL_POWER] !== undefined ||
            errors?.[FieldConstants.REACTIVE_LIMITS] !== undefined
        ) {
            tabsInError.push(GeneratorDialogTab.SETPOINTS_AND_LIMITS_TAB);
        }
        if (
            errors?.[FieldConstants.TRANSIENT_REACTANCE] !== undefined ||
            errors?.[FieldConstants.TRANSFORMER_REACTANCE] !== undefined ||
            errors?.[FieldConstants.PLANNED_ACTIVE_POWER_SET_POINT] !== undefined ||
            errors?.[FieldConstants.MARGINAL_COST] !== undefined ||
            errors?.[FieldConstants.PLANNED_OUTAGE_RATE] !== undefined ||
            errors?.[FieldConstants.FORCED_OUTAGE_RATE] !== undefined
        ) {
            tabsInError.push(GeneratorDialogTab.SPECIFIC_TAB);
        }
        if (errors?.[FieldConstants.ADDITIONAL_PROPERTIES] !== undefined) {
            tabsInError.push(GeneratorDialogTab.ADDITIONAL_INFORMATION_TAB);
        }
        if (tabsInError.length > 0) {
            setTabIndex((currentTabIndex) => {
                return tabsInError.includes(currentTabIndex) ? currentTabIndex : tabsInError[0];
            });
        }
        setTabIndexesWithError(tabsInError);
    }, [errors]);

    return (
        <Grid container direction="column" spacing={2}>
            <Grid item>
                <GeneratorDialogHeader generatorToModify={generatorToModify} equipmentId={equipmentId} />
            </Grid>
            <Grid item>
                <GeneratorDialogTabs
                    tabIndex={tabIndex}
                    tabIndexesWithError={tabIndexesWithError}
                    setTabIndex={setTabIndex}
                />
            </Grid>
            <Grid item>
                <GeneratorDialogTabsContent
                    tabIndex={tabIndex}
                    generatorToModify={generatorToModify}
                    voltageLevelOptions={voltageLevelOptions}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                    PositionDiagramPane={PositionDiagramPane}
                    updatePreviousReactiveCapabilityCurveTable={updatePreviousReactiveCapabilityCurveTable}
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </Grid>
        </Grid>
    );
}
