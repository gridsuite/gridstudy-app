/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TabContext, TabPanel } from '@mui/lab';
import { Tab, Tabs } from '@mui/material';
import DynamicSimulationResultChart from './dynamic-simulation-result-chart';
import ReactJson from 'react-json-view';
import { LIGHT_THEME } from '@gridsuite/commons-ui';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { PARAM_THEME } from '../../../utils/config-params';

const DynamicSimulationResultChartTabs = ({ result }) => {
    const selectedTheme = useSelector((state) => state[PARAM_THEME]);

    const [tabIndex, setTabIndex] = useState(0);

    const series = useMemo(() => {
        console.log('transformToRechartSeries is called');
        if (!result) return [];
        return result.map((elem, index) => {
            const metadata = elem.metadata;
            const values = elem.chunks[0].values;
            return {
                index: index,
                name: metadata.name,
                data: {
                    x: metadata.irregularIndex,
                    y: values,
                },
            };
        });
    }, [result]);

    const intl = useIntl();
    return (
        <TabContext value={`${tabIndex}`}>
            {/* tab headers */}
            <Tabs
                value={tabIndex}
                onChange={(event, newTabIndex) => setTabIndex(newTabIndex)}
            >
                <Tab
                    label={intl.formatMessage({
                        id: 'DynamicSimulationResultChart',
                    })}
                />
                <Tab
                    label={intl.formatMessage({
                        id: 'DynamicSimulationResultJson',
                    })}
                />
            </Tabs>
            {/* tab contents */}
            <TabPanel value={'0'}>
                {
                    /* chart tab */
                    <DynamicSimulationResultChart series={series} />
                }
            </TabPanel>
            <TabPanel value={'1'}>
                {
                    /* json tab */
                    <ReactJson
                        src={result}
                        onEdit={false}
                        onAdd={false}
                        onDelete={false}
                        theme={
                            selectedTheme === LIGHT_THEME
                                ? 'rjv-default'
                                : 'monokai'
                        }
                    />
                }
            </TabPanel>
        </TabContext>
    );
};

export default DynamicSimulationResultChartTabs;
