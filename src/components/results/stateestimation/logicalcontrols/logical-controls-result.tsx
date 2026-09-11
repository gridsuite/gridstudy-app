/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, SyntheticEvent, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { FormattedMessage } from 'react-intl';

const BALANCES_TAB_INDEX = 0;
const NON_ZERO_MEASUREMENTS_ON_DISCONNECTED_TAB_INDEX = 1;
const ZERO_MEASUREMENTS_ON_CONNECTED_TAB_INDEX = 2;
const ORIGIN_EXTREMITY_DEVIATIONS_TAB_INDEX = 3;
const OUT_OF_BOUNDS_MEASUREMENTS_TAB_INDEX = 4;
const VOLTAGE_DEVIATIONS_TAB_INDEX = 5;

export const LogicalControlsResult: FunctionComponent = () => {
    const [subTabIndex, setSubTabIndex] = useState(BALANCES_TAB_INDEX);

    const handleSubTabChange = (_event: SyntheticEvent, newSubTabIndex: number) => {
        setSubTabIndex(newSubTabIndex);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Tabs value={subTabIndex} onChange={handleSubTabChange}>
                <Tab label={<FormattedMessage id="LogicalControlsBalances" />} />
                <Tab label={<FormattedMessage id="LogicalControlsNonZeroMeasurementsOnDisconnected" />} />
                <Tab label={<FormattedMessage id="LogicalControlsZeroMeasurementsOnConnected" />} />
                <Tab label={<FormattedMessage id="LogicalControlsOriginExtremityDeviations" />} />
                <Tab label={<FormattedMessage id="LogicalControlsOutOfBoundsMeasurements" />} />
                <Tab label={<FormattedMessage id="LogicalControlsVoltageDeviations" />} />
            </Tabs>

            {subTabIndex === BALANCES_TAB_INDEX && null}
            {subTabIndex === NON_ZERO_MEASUREMENTS_ON_DISCONNECTED_TAB_INDEX && null}
            {subTabIndex === ZERO_MEASUREMENTS_ON_CONNECTED_TAB_INDEX && null}
            {subTabIndex === ORIGIN_EXTREMITY_DEVIATIONS_TAB_INDEX && null}
            {subTabIndex === OUT_OF_BOUNDS_MEASUREMENTS_TAB_INDEX && null}
            {subTabIndex === VOLTAGE_DEVIATIONS_TAB_INDEX && null}
        </Box>
    );
};
