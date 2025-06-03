/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid, Tab, Tabs } from '@mui/material';
import { getTabIndicatorStyle, getTabStyle } from '../../../utils/tab-utils';
import { FormattedMessage } from 'react-intl';
import { BalancesAdjustmentTab } from './balances-adjustment.constants';

interface BalancesAdjustmentDialogTabsProps {
    tabIndex: number;
    tabIndexesWithError: number[];
    setTabIndex: (newTabIndex: number) => void;
}

export default function BalancesAdjustmentDialogTabs({
    tabIndex,
    tabIndexesWithError,
    setTabIndex,
}: BalancesAdjustmentDialogTabsProps) {
    return (
        <Grid container>
            <Tabs
                value={tabIndex}
                variant="scrollable"
                onChange={(_: React.SyntheticEvent, newValue: number) => setTabIndex(newValue)}
                TabIndicatorProps={{
                    sx: getTabIndicatorStyle(tabIndexesWithError, tabIndex),
                }}
            >
                <Tab
                    label={<FormattedMessage id="Areas" />}
                    sx={getTabStyle(tabIndexesWithError, BalancesAdjustmentTab.AREAS_TAB)}
                />

                <Tab
                    label={<FormattedMessage id="Advanced" />}
                    sx={getTabStyle(tabIndexesWithError, BalancesAdjustmentTab.ADVANCED_TAB)}
                />
            </Tabs>
        </Grid>
    );
}
