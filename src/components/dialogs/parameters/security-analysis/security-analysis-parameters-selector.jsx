/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from 'react';

import { FormattedMessage } from 'react-intl';

import Grid from '@mui/material/Grid';
import { Tab, Tabs } from '@mui/material';
import { TabPanel } from '../parameters';
import { TAB_VALUES } from './columns-definitions';
import ViolationsHidingParameters from './security-analysis-violations-hiding.jsx';

const TAB_INFO = [{ label: TAB_VALUES[TAB_VALUES.General] }];

const SecurityAnalysisParametersSelector = ({ params, updateParameters }) => {
    const [tabValue, setTabValue] = useState(TAB_VALUES.General);
    const handleTabChange = useCallback((event, newValue) => {
        setTabValue(newValue);
    }, []);

    return (
        <>
            <Grid sx={{ width: '100%' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    {TAB_INFO.map((tab, index) => (
                        <Tab
                            key={tab.label}
                            label={<FormattedMessage id={tab.label} />}
                            value={index}
                            sx={{
                                fontSize: 17,
                                fontWeight: 'bold',
                                textTransform: 'capitalize',
                            }}
                        />
                    ))}
                </Tabs>

                {TAB_INFO.map((tab, index) => (
                    <TabPanel key={tab.label} value={tabValue} index={index}>
                        {tabValue === TAB_VALUES.General && (
                            <ViolationsHidingParameters params={params} updateParameters={updateParameters} />
                        )}
                    </TabPanel>
                ))}
            </Grid>
        </>
    );
};

export default SecurityAnalysisParametersSelector;
