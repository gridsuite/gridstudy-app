/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent } from 'react';
import { Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { getTabIndicatorStyle, getTabStyle } from '../../../../utils/tab-utils';
import { VSC_CREATION_TABS } from './vsc-utils';

interface VscTabsProps {
    tabIndex: number;
    tabIndexesWithError: number[];
    setTabIndex: React.Dispatch<React.SetStateAction<number>>;
}

const VscTabs: FunctionComponent<VscTabsProps> = ({ tabIndex, tabIndexesWithError, setTabIndex }) => {
    return (
        <>
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
                        label={<FormattedMessage id="HVDC_LINE" />}
                        sx={getTabStyle(tabIndexesWithError, VSC_CREATION_TABS.HVDC_LINE_TAB)}
                    />
                    <Tab
                        label={<FormattedMessage id="converterStation1" />}
                        sx={getTabStyle(tabIndexesWithError, VSC_CREATION_TABS.CONVERTER_STATION_1)}
                    />
                    <Tab
                        label={<FormattedMessage id="converterStation2" />}
                        sx={getTabStyle(tabIndexesWithError, VSC_CREATION_TABS.CONVERTER_STATION_2)}
                    />
                </Tabs>
            </Grid>
        </>
    );
};

export default VscTabs;
