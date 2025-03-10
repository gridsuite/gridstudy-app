/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { getTabIndicatorStyle, getTabStyle } from '../../../utils/tab-utils';
import { LineCreationDialogTab } from './creation/line-creation-dialog-utils';
import { LineModificationDialogTab } from './line-utils';

const LineDialogTabs = ({ tabIndex, tabIndexesWithError, setTabIndex, isModification = false }) => {
    const LineDialogTab = isModification ? LineModificationDialogTab : LineCreationDialogTab;
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
                {isModification && (
                    <Tab
                        label={<FormattedMessage id="ConnectivityTab" />}
                        sx={getTabStyle(tabIndexesWithError, LineDialogTab.CONNECTIVITY_TAB)}
                    />
                )}
                <Tab
                    label={<FormattedMessage id="LineCharacteristicsTab" />}
                    sx={getTabStyle(tabIndexesWithError, LineDialogTab.CHARACTERISTICS_TAB)}
                />
                <Tab
                    label={<FormattedMessage id="LimitsTab" />}
                    sx={getTabStyle(tabIndexesWithError, LineDialogTab.LIMITS_TAB)}
                />
                {isModification && (
                    <Tab
                        label={<FormattedMessage id="StateEstimationTab" />}
                        sx={getTabStyle(tabIndexesWithError, LineDialogTab.STATE_ESTIMATION_TAB)}
                    />
                )}
            </Tabs>
        </Grid>
    );
};

export default LineDialogTabs;
