/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { getTabStyle } from '../../../../../utils/tab-utils';
import { LccCreationDialogTab } from './lcc-creation.type';

export interface LccCreationDialogTabsProps {
    tabIndex: number;
    tabIndexesWithError: number[];
    setTabIndex: (newValue: number) => void;
}

export default function LccCreationDialogTabs({
    tabIndex,
    tabIndexesWithError,
    setTabIndex,
}: Readonly<LccCreationDialogTabsProps>) {
    return (
        <Grid container item>
            <Tabs value={tabIndex} onChange={(event, newValue) => setTabIndex(newValue)}>
                <Tab
                    label={<FormattedMessage id="HVDC_LINE" />}
                    sx={getTabStyle(tabIndexesWithError, LccCreationDialogTab.HVDC_LINE_TAB)}
                />
                <Tab
                    label={<FormattedMessage id="converterStation1" />}
                    sx={getTabStyle(tabIndexesWithError, LccCreationDialogTab.CONVERTER_STATION_1)}
                />
                <Tab
                    label={<FormattedMessage id="converterStation2" />}
                    sx={getTabStyle(tabIndexesWithError, LccCreationDialogTab.CONVERTER_STATION_2)}
                />
            </Tabs>
        </Grid>
    );
}
