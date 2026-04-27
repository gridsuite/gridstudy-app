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
import { GeneratorDialogTab } from './generatorTabs.utils';

interface GeneratorDialogTabsProps {
    tabIndex: number;
    tabIndexesWithError: number[];
    setTabIndex: (newTabIndex: number) => void;
}

export function GeneratorDialogTabs({
    tabIndex,
    tabIndexesWithError,
    setTabIndex,
}: Readonly<GeneratorDialogTabsProps>) {
    return (
        <Tabs
            value={tabIndex}
            variant="scrollable"
            onChange={(event: React.SyntheticEvent, newValue: number) => setTabIndex(newValue)}
            TabIndicatorProps={{
                sx: getTabIndicatorStyle(tabIndexesWithError, tabIndex),
            }}
        >
            <Tab
                label={<FormattedMessage id="ConnectivityTab" />}
                sx={getTabStyle(tabIndexesWithError, GeneratorDialogTab.CONNECTIVITY_TAB)}
            />
            <Tab
                label={<FormattedMessage id="SetpointsAndLimitsTab" />}
                sx={getTabStyle(tabIndexesWithError, GeneratorDialogTab.SETPOINTS_AND_LIMITS_TAB)}
            />
            <Tab
                label={<FormattedMessage id="SpecificTab" />}
                sx={getTabStyle(tabIndexesWithError, GeneratorDialogTab.SPECIFIC_TAB)}
            />
            <Tab
                label={<FormattedMessage id="AdditionalInformation" />}
                sx={getTabStyle(tabIndexesWithError, GeneratorDialogTab.ADDITIONAL_INFORMATION_TAB)}
            />
        </Tabs>
    );
}
