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
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { useEffect, useState } from 'react';
import { useFormState } from 'react-hook-form';
import {
    DROOP,
    FORCED_OUTAGE_RATE,
    FREQUENCY_REGULATION,
    MARGINAL_COST,
    MAXIMUM_ACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q_PERCENT,
    RATED_NOMINAL_POWER,
    REACTIVE_LIMITS,
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE,
    VOLTAGE_REGULATION,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from '../../../../utils/field-constants';

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
            errors?.[VOLTAGE_SET_POINT] !== undefined ||
            errors?.[VOLTAGE_REGULATION_TYPE] !== undefined ||
            errors?.[Q_PERCENT] !== undefined ||
            errors?.[FREQUENCY_REGULATION] !== undefined ||
            errors?.[DROOP] !== undefined ||
            // limits
            errors?.[MINIMUM_ACTIVE_POWER] !== undefined ||
            errors?.[MAXIMUM_ACTIVE_POWER] !== undefined ||
            errors?.[RATED_NOMINAL_POWER] !== undefined ||
            errors?.[REACTIVE_LIMITS] !== undefined
        ) {
            tabsInError.push(GeneratorDialogTab.SETPOINTS_AND_LIMITS_TAB);
        }
        if (
            errors?.[TRANSIENT_REACTANCE] !== undefined ||
            errors?.[TRANSFORMER_REACTANCE] !== undefined ||
            errors?.[PLANNED_ACTIVE_POWER_SET_POINT] !== undefined ||
            errors?.[MARGINAL_COST] !== undefined ||
            errors?.[PLANNED_OUTAGE_RATE] !== undefined ||
            errors?.[FORCED_OUTAGE_RATE] !== undefined
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
