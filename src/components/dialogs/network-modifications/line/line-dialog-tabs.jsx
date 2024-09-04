/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { getTabIndicatorStyle, getTabStyle } from '../../../utils/tab-utils';
import { LineModificationDialogTab } from './modification/line-modification-dialog.jsx';

const LineDialogTabs = ({ tabIndex, tabIndexesWithError, setTabIndex }) => {
    return (
        <Grid container>
            <Tabs
                value={tabIndex}
                variant="scrollable"
                onChange={(event, newValue) => setTabIndex(newValue)}
                TabIndicatorProps={{
                    sx: getTabIndicatorStyle(tabIndexesWithError, tabIndex),
                }}
            >
                <Tab
                    label={<FormattedMessage id="ConnectivityTab" />}
                    sx={getTabStyle(tabIndexesWithError, LineModificationDialogTab.CONNECTIVITY_TAB)}
                />
                <Tab
                    label={<FormattedMessage id="LineCharacteristicsTab" />}
                    sx={getTabStyle(tabIndexesWithError, LineModificationDialogTab.CHARACTERISTICS_TAB)}
                />
                <Tab
                    label={<FormattedMessage id="LimitsTab" />}
                    sx={getTabStyle(tabIndexesWithError, LineModificationDialogTab.LIMITS_TAB)}
                />
            </Tabs>
        </Grid>
    );
};

export default LineDialogTabs;
