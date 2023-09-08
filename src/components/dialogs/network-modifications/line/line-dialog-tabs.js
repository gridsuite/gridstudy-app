/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs } from '@mui/material';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { LineCreationDialogTab } from './creation/line-creation-dialog';

const styles = {
    tabWithError: (theme) => ({
        '&.Mui-selected': { color: theme.palette.error.main },
        color: theme.palette.error.main,
    }),
    tabWithErrorIndicator: (theme) => ({
        backgroundColor: theme.palette.error.main,
    }),
};

const LineDialogTabs = ({ tabIndex, tabIndexesWithError, setTabIndex }) => {
    const getTabIndicatorStyle = useCallback(
        (index) =>
            tabIndexesWithError.includes(index)
                ? styles.tabWithErrorIndicator
                : undefined,
        [tabIndexesWithError]
    );

    const getTabStyle = useCallback(
        (index) =>
            tabIndexesWithError.includes(index)
                ? styles.tabWithError
                : undefined,
        [tabIndexesWithError]
    );

    return (
        <Grid container>
            <Tabs
                value={tabIndex}
                variant="scrollable"
                onChange={(event, newValue) => setTabIndex(newValue)}
                TabIndicatorProps={{ sx: getTabIndicatorStyle(tabIndex) }}
            >
                <Tab
                    label={<FormattedMessage id="LineCharacteristicsTab" />}
                    sx={getTabStyle(LineCreationDialogTab.CHARACTERISTICS_TAB)}
                />
                <Tab
                    label={<FormattedMessage id="LimitsTab" />}
                    sx={getTabStyle(LineCreationDialogTab.LIMITS_TAB)}
                />
            </Tabs>
        </Grid>
    );
};

export default LineDialogTabs;
