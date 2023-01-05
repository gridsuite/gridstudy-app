/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import CloseIcon from '@mui/icons-material/Close';
import DataObjectIcon from '@mui/icons-material/DataObject';
import AddIcon from '@mui/icons-material/Add';
import { IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import DynamicSimulationResultChart from './dynamic-simulation-result-chart';
import ReactJson from 'react-json-view';
import { LIGHT_THEME } from '@gridsuite/commons-ui';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { PARAM_THEME } from '../../../utils/config-params';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';

const getVisibilityStyle = (hidden) => {
    if (hidden) {
        return {
            visibility: 'hidden',
            height: 0,
        };
    }
    return {
        visibility: 'visible',
        height: 'inherit',
    };
};

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div style={getVisibilityStyle(value !== index)} {...other}>
            {children}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

const ButtonInTabs = ({ className, toolTip, onClick, children }) => {
    return (
        <Tooltip title={toolTip}>
            <IconButton
                size={'medium'}
                className={className}
                onClick={onClick}
                children={children}
            />
        </Tooltip>
    );
};

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    addButton: {
        borderRadius: '50%',
    },
}));

const DynamicSimulationResultChartTabs = ({ result }) => {
    const classes = useStyles();

    const selectedTheme = useSelector((state) => state[PARAM_THEME]);

    const [tabId, setTabId] = useState(1);

    const [tabIndex, setTabIndex] = useState(tabId);

    const [tabs, setTabs] = useState([{ value: tabId }]);

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

    const handleAddNewTab = () => {
        setTabs((prev) => [
            ...prev,
            {
                value: tabId + 1,
            },
        ]);

        setTabIndex(tabId + 1);

        setTabId((prev) => prev + 1);
    };

    const handleClose = (value) => {
        return () => {
            const newTabs = tabs.filter((tab) => tab.value !== value);
            setTabs(newTabs);
            setTabIndex(0); // get the first item in new tabs

            if (newTabs.length === 0) {
                // reset tabId to zero
                setTabId(0);
            }
        };
    };

    return (
        <div className={classes.root}>
            {/* tab headers */}
            <Tabs
                value={tabIndex}
                onChange={(event, newTabIndex) => setTabIndex(newTabIndex)}
            >
                <Tab value={0} icon={<DataObjectIcon />} />
                {tabs.map((tab) => (
                    <Tab
                        value={tab.value}
                        key={tab.value}
                        label={
                            <span>
                                {`${intl.formatMessage({
                                    id: 'DynamicSimulationResultChart',
                                })} ${tab.value}`}
                                <IconButton
                                    size="small"
                                    component="span"
                                    onClick={handleClose(tab.value)}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </span>
                        }
                    />
                ))}
                <ButtonInTabs
                    toolTip={'Add a tab'}
                    className={classes.addButton}
                    onClick={handleAddNewTab}
                >
                    <AddIcon />
                </ButtonInTabs>
            </Tabs>
            {/* tab contents */}
            <TabPanel value={tabIndex} index={0}>
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
            </TabPanel>
            {tabs.map((tab) => (
                <TabPanel key={tab.value} value={tabIndex} index={tab.value}>
                    <DynamicSimulationResultChart series={series} />
                </TabPanel>
            ))}
        </div>
    );
};

export default DynamicSimulationResultChartTabs;
