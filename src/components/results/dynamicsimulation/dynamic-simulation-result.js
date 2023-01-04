/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useSelector } from 'react-redux';
import { PARAM_THEME } from '../../../utils/config-params';
import { LIGHT_THEME } from '@gridsuite/commons-ui';
import ReactJson from 'react-json-view';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Grid, Tab, Tabs } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import DynamicSimulationResultTable from './dynamic-simulation-result-table';
import DynamicSimulationResultChart from './dynamic-simulation-result-chart';

const DynamicSimulationResult = ({ result = [] }) => {
    /* fake result status */
    const componentResults = [
        {
            status: 'CONVERGED',
        },
    ];

    const series = useMemo(() => {
        console.log('transformToRechartSeries is called');
        const pointFormat = false; // configure true for Rechart and UPlot
        if (!result) return [];
        return result.map((series, index) => {
            const metadata = series.metadata;
            const values = series.chunks[0].values;
            return {
                index: index,
                name: metadata.name,
                data: pointFormat
                    ? metadata.irregularIndex.map((time, index) => {
                          return {
                              x: time,
                              y: values[index],
                          };
                      })
                    : { x: metadata.irregularIndex, y: values },
            };
        });
    }, [result]);

    const intl = useIntl();

    const [tabIndex, setTabIndex] = useState(0);

    const selectedTheme = useSelector((state) => state[PARAM_THEME]);

    const dynamicSimulationNotif = useSelector(
        (state) => state.dynamicSimulationNotif
    );

    function renderResultTable() {
        return (
            result &&
            dynamicSimulationNotif && (
                <DynamicSimulationResultTable result={componentResults} />
            )
        );
    }

    function renderResultJson(result) {
        return (
            result &&
            dynamicSimulationNotif && (
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
            )
        );
    }

    function renderResultChart(series) {
        return (
            result &&
            dynamicSimulationNotif && (
                <DynamicSimulationResultChart series={series} />
            )
        );
    }

    function renderResultTabs() {
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
                        result &&
                            dynamicSimulationNotif &&
                            renderResultChart(series)
                    }
                </TabPanel>
                <TabPanel value={'1'}>
                    {
                        /* json tab */
                        result &&
                            dynamicSimulationNotif &&
                            renderResultJson(result)
                    }
                </TabPanel>
            </TabContext>
        );
    }

    function renderResult() {
        return (
            <Grid container justifyContent={'column'} alignItems={'flex-end'}>
                <Grid item xs={12}>
                    {renderResultTable()}
                </Grid>
                <Grid item xs={12}>
                    {renderResultTabs()}
                </Grid>
            </Grid>
        );
    }

    return renderResult();
};

export default DynamicSimulationResult;
