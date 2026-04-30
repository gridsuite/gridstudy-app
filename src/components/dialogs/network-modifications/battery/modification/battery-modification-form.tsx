/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { useTabsWithError } from '@gridsuite/commons-ui';
import { BatteryDialogHeader, BatteryDialogHeaderProps } from './BatteryDialogHeader';
import { BatteryDialogTabs } from './BatteryDialogTabs';
import { BatteryDialogTabsContent, BatteryDialogTabsContentProps } from './BatteryDialogTabsContent';
import { BATTERY_TAB_FIELDS, BatteryDialogTab } from './batteryTabs.utils';

interface BatteryModificationFormProps
    extends BatteryDialogHeaderProps,
        Omit<BatteryDialogTabsContentProps, 'tabIndex'> {}

export default function BatteryModificationForm({
    batteryToModify,
    updatePreviousReactiveCapabilityCurveTable,
    voltageLevelOptions,
    fetchBusesOrBusbarSections,
    PositionDiagramPane,
    equipmentId,
}: Readonly<BatteryModificationFormProps>) {
    const { tabIndex, setTabIndex, tabIndexesWithError } = useTabsWithError<BatteryDialogTab>(
        BATTERY_TAB_FIELDS,
        BatteryDialogTab.CONNECTIVITY_TAB
    );

    return (
        <Grid container direction="column" spacing={2}>
            <Grid item>
                <BatteryDialogHeader batteryToModify={batteryToModify} equipmentId={equipmentId} />
            </Grid>
            <Grid item>
                <BatteryDialogTabs
                    tabIndex={tabIndex}
                    tabIndexesWithError={tabIndexesWithError}
                    setTabIndex={setTabIndex}
                />
            </Grid>
            <Grid item>
                <BatteryDialogTabsContent
                    tabIndex={tabIndex}
                    batteryToModify={batteryToModify}
                    voltageLevelOptions={voltageLevelOptions}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                    PositionDiagramPane={PositionDiagramPane}
                    updatePreviousReactiveCapabilityCurveTable={updatePreviousReactiveCapabilityCurveTable}
                />
            </Grid>
        </Grid>
    );
}
