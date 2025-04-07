/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { LoadDialogTab } from './load-utils';
import { getTabIndicatorStyle, getTabStyle } from 'components/utils/tab-utils';

interface LoadDialogTabsProps {
    tabIndex: number;
    tabIndexesWithError: number[];
    setTabIndex: (newTabIndex: number) => void;
    isModification?: boolean;
}

const LoadDialogTabs: React.FC<LoadDialogTabsProps> = ({
    tabIndex,
    tabIndexesWithError,
    setTabIndex,
    isModification = false,
}) => {
    return (
        <Grid container>
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
                    sx={getTabStyle(tabIndexesWithError, LoadDialogTab.CONNECTIVITY_TAB)}
                />

                <Tab
                    label={<FormattedMessage id="LineCharacteristicsTab" />}
                    sx={getTabStyle(tabIndexesWithError, LoadDialogTab.CHARACTERISTICS_TAB)}
                />
                {isModification && (
                    <Tab
                        label={<FormattedMessage id="StateEstimationTab" />}
                        sx={getTabStyle(tabIndexesWithError, LoadDialogTab.STATE_ESTIMATION_TAB)}
                    />
                )}
            </Tabs>
        </Grid>
    );
};

export default LoadDialogTabs;
