/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { getTabStyle } from '../../../../utils/tab-utils';

export const StaticVarCompensatorCreationDialogTab = {
    CONNECTIVITY_TAB: 0,
    SET_POINTS_LIMITS_TAB: 1,
    AUTOMATON_TAB: 2,
    ADDITIONAL_INFO_TAB: 3,
};

const StaticVarCompensatorCreationDialogTabs = ({ tabIndex, tabIndexesWithError, setTabIndex }) => {
    return (
        <Grid container item>
            <Tabs value={tabIndex} onChange={(event, newValue) => setTabIndex(newValue)}>
                <Tab
                    label={<FormattedMessage id="StaticVarCompensatorConnectivityTab" />}
                    sx={getTabStyle(tabIndexesWithError, StaticVarCompensatorCreationDialogTab.CONNECTIVITY_TAB)}
                />
                <Tab
                    label={<FormattedMessage id="StaticVarCompensatorSetPointsAndLimitsTab" />}
                    sx={getTabStyle(tabIndexesWithError, StaticVarCompensatorCreationDialogTab.SET_POINTS_LIMITS_TAB)}
                />
                <Tab
                    label={<FormattedMessage id="StaticVarCompensatorAutomatonTab" />}
                    sx={getTabStyle(tabIndexesWithError, StaticVarCompensatorCreationDialogTab.AUTOMATON_TAB)}
                />
                <Tab
                    label={<FormattedMessage id="StaticVarCompensatorAdditionalInfosTab" />}
                    sx={getTabStyle(tabIndexesWithError, StaticVarCompensatorCreationDialogTab.ADDITIONAL_INFO_TAB)}
                />
            </Tabs>
        </Grid>
    );
};

export default StaticVarCompensatorCreationDialogTabs;
