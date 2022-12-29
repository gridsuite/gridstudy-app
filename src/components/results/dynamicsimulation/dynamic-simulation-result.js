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
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { MenuItem, Select, Tab, Tabs, Typography } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';

const useStyles = makeStyles((theme) => ({
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
        glexGrow: 1,
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

const DynamicSimulationResult = ({ result }) => {
    const classes = useStyles();

    const intl = useIntl();

    const [tabIndex, setTabIndex] = useState(0);

    const [resultType, setResultType] = useState(
        DYNAMIC_SIMULATION_RESULT_TYPES[0].id
    );

    const selectedTheme = useSelector((state) => state[PARAM_THEME]);

    const dynamicSimulationNotif = useSelector(
        (state) => state.dynamicSimulationNotif
    );

    function renderResultReport() {
        return (
            result &&
            dynamicSimulationNotif && (
                <>
                    <Typography variant="h1" component="h2">
                        Report
                    </Typography>
                </>
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

    function renderResultChart(result) {
        return (
            result &&
            dynamicSimulationNotif && (
                <>
                    <Typography variant="h1" component="h2">
                        Chart
                    </Typography>
                </>
            )
        );
    }

    function handleChangeResultType(event) {
        setResultType(event.target.value);
    }

    function renderTabs() {
        return (
            <>
                <TabContext value={`${tabIndex}`}>
                    {/* tab headers */}
                    <Tabs
                        value={tabIndex}
                        onChange={(event, newTabIndex) =>
                            setTabIndex(newTabIndex)
                        }
                    >
                        <Tab
                            label={intl.formatMessage({
                                id: 'DynamicSimulationResultReport',
                            })}
                        />
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
                    {/* result type selection */}
                    {(tabIndex === 1 || tabIndex === 2) && (
                        <div classeName={classes.resultTypeSelect}>
                            <Select
                                labelId={'DynamicSimulationResultTypeLabel'}
                                value={resultType}
                                onChange={handleChangeResultType}
                                autoWidth
                                size={'small'}
                            >
                                {DYNAMIC_SIMULATION_RESULT_TYPES.map(
                                    (resultType, index) => (
                                        <MenuItem
                                            value={resultType.id}
                                            key={`${resultType.id}_${index}`}
                                        >
                                            {intl.formatMessage({
                                                id: resultType.label,
                                            })}
                                        </MenuItem>
                                    )
                                )}
                            </Select>
                        </div>
                    )}
                    {/* tab contents */}
                    <TabPanel value={'0'}>
                        {
                            /* report tab */
                            result &&
                                dynamicSimulationNotif &&
                                renderResultReport()
                        }
                    </TabPanel>
                    <TabPanel value={'1'}>
                        {
                            /* chart tab */
                            result &&
                                dynamicSimulationNotif &&
                                renderResultChart(result)
                        }
                    </TabPanel>
                    <TabPanel value={'2'}>
                        {
                            /* chart tab */
                            result &&
                                dynamicSimulationNotif &&
                                renderResultJson(result)
                        }
                    </TabPanel>
                </TabContext>
            </>
        );
    }

    return renderTabs();
};

export default DynamicSimulationResult;
