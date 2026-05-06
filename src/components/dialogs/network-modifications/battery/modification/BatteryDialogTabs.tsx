/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { getTabIndicatorStyle, getTabStyle } from 'components/utils/tab-utils';
import { BatteryDialogTab } from './batteryTabs.utils';

interface BatteryDialogTabsProps {
    tabIndex: number;
    tabIndexesWithError: number[];
    setTabIndex: (newTabIndex: number) => void;
}

export function BatteryDialogTabs({ tabIndex, tabIndexesWithError, setTabIndex }: Readonly<BatteryDialogTabsProps>) {
    return (
        <Tabs
            value={tabIndex}
            variant="scrollable"
            onChange={(_event: React.SyntheticEvent, newValue: number) => setTabIndex(newValue)}
            TabIndicatorProps={{
                sx: getTabIndicatorStyle(tabIndexesWithError, tabIndex),
            }}
        >
            <Tab
                label={<FormattedMessage id="ConnectivityTab" />}
                sx={getTabStyle(tabIndexesWithError, BatteryDialogTab.CONNECTIVITY_TAB)}
            />
            <Tab
                label={<FormattedMessage id="SetpointsAndLimitsTab" />}
                sx={getTabStyle(tabIndexesWithError, BatteryDialogTab.LIMITS_AND_SETPOINTS_TAB)}
            />
            <Tab
                label={<FormattedMessage id="SpecificTab" />}
                sx={getTabStyle(tabIndexesWithError, BatteryDialogTab.SPECIFIC_TAB)}
            />
            <Tab
                label={<FormattedMessage id="AdditionalInformationTab" />}
                sx={getTabStyle(tabIndexesWithError, BatteryDialogTab.ADDITIONAL_INFORMATION_TAB)}
            />
        </Tabs>
    );
}
