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
import makeStyles from '@mui/styles/makeStyles';
import { useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Tab, Tabs } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import DynamicSimulationResultTable from './dynamic-simulation-result-table';
import DynamicSimulationResultChart from './dynamic-simulation-result-chart';

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
    },
    tabContainer: {
        display: 'flex',
        position: 'relative',
    },
    tabHeader: {
        position: 'relative',
        top: 0,
        left: 0,
    },
    tabContent: {
        flexGrow: 1,
    },
    resultTypeSelect: {
        position: 'absolute',
        right: theme.spacing(2),
        top: theme.spacing(1),
    },
}));

const DYNAMIC_SIMULATION_RESULT_TYPES = [
    { id: 'timeseries', label: 'DynamicSimulationTimeSeriesLabel' },
    { id: 'timeline', label: 'DynamicSimulationTimeLineLabel' },
];

const DynamicSimulationResult = ({ result = [] }) => {
    /* fake result status */
    const componentResults = [
        {
            status: 'CONVERGED',
        },
    ];

    const transformToRechartSeries = useCallback(
        (result) => {
            if (!result) return [];
            return result
                .slice(Math.max(result.length - 3, 0)) // select only first 3 elements for demo
                .map((series) => {
                    const metadata = series.metadata;
                    const values = series.chunks[0].values;
                    return {
                        name: metadata.name,
                        data: metadata.irregularIndex.map((time, index) => {
                            return {
                                category: `${time}`,
                                value: values[index],
                            };
                        }),
                    };
                });
        },
        [result]
    );

    const series = useMemo(() => transformToRechartSeries(result), [result]);

    const classes = useStyles();

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
        /*const series = [
            {
                name: 'Series 1',
                data: [
                    { category: 'A', value: Math.random() },
                    { category: 'B', value: Math.random() },
                    { category: 'C', value: Math.random() },
                ],
            },
            {
                name: 'Series 2',
                data: [
                    { category: 'B', value: Math.random() },
                    { category: 'C', value: Math.random() },
                    { category: 'D', value: Math.random() },
                ],
            },
            {
                name: 'Series 3',
                data: [
                    { category: 'C', value: Math.random() },
                    { category: 'D', value: Math.random() },
                    { category: 'E', value: Math.random() },
                ],
            },
        ];*/
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
            <>
                {renderResultTable()}
                {renderResultTabs()}
            </>
        );
    }

    return renderResult();
};

export default DynamicSimulationResult;
