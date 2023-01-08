/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import CloseIcon from '@mui/icons-material/Close';
import DataObjectIcon from '@mui/icons-material/DataObject';
import AddIcon from '@mui/icons-material/Add';
import { IconButton, Stack, Tab, Tabs, Tooltip } from '@mui/material';
import DynamicSimulationResultChart from './dynamic-simulation-result-chart';
import ReactJson from 'react-json-view';
import { LIGHT_THEME } from '@gridsuite/commons-ui';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { PARAM_THEME } from '../../../utils/config-params';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import DroppableTabs from './common/draggable-tab/droppable-tabs';
import DraggableTab from './common/draggable-tab/draggable-tab';

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
        marginRight: theme.spacing(10),
        color: theme.palette.primary.main,
    },
}));

const DynamicSimulationResultChartTabs = ({ result }) => {
    const classes = useStyles();

    const selectedTheme = useSelector((state) => state[PARAM_THEME]);

    // tab id is auto increase and reset to zero when there is any tab
    const [tabId, setTabId] = useState(1);

    const [selectedIndex, setSelectedIndex] = useState(0);

    const [tabs, setTabs] = useState([{ id: tabId }]);

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
                id: tabId + 1,
            },
        ]);

        setSelectedIndex(tabs.length);

        setTabId((prev) => prev + 1);
    };

    const handleClose = (index) => {
        return () => {
            const newTabs = Array.from(tabs);
            newTabs.splice(index, 1);
            setSelectedIndex(
                newTabs.length === 0
                    ? -1
                    : index === tabs.length - 1
                    ? newTabs.length - 1
                    : index
            ); // get the next item in new tabs
            setTabs(newTabs);
            if (newTabs.length === 0) {
                // reset tabId to zero
                setTabId(0);
            }
        };
    };

    const handleDragEnd = (result) => {
        console.log('dragEnd result = ', result);
        const newTabs = Array.from(tabs);
        const draggedTab = newTabs.splice(result.source.index, 1)[0];
        const destIndex = result.destination?.index;
        newTabs.splice(destIndex, 0, draggedTab);
        setSelectedIndex(destIndex);
        setTabs(newTabs);
    };

    const handleTabsChange = (event, newTabIndex) => {
        setSelectedIndex(newTabIndex);
    };

    return (
        <div className={classes.root}>
            <Stack direction="row" maxWidth={'100vw'}>
                <Tabs value={selectedIndex} onChange={handleTabsChange}>
                    <Tab value={-1} icon={<DataObjectIcon />} />
                </Tabs>
                {/* tab headers */}
                <DroppableTabs
                    id={'1'}
                    value={selectedIndex}
                    onChange={handleTabsChange}
                    tabsRender={() =>
                        tabs.map((tab, index) => {
                            return (
                                <DraggableTab
                                    key={index}
                                    index={index}
                                    value={index}
                                >
                                    <Tab
                                        key={index}
                                        value={index}
                                        label={
                                            <span
                                                style={{
                                                    'white-space': 'nowrap',
                                                }}
                                            >
                                                {`${intl.formatMessage({
                                                    id: 'DynamicSimulationResultChart',
                                                })} ${tab.id}`}
                                                <IconButton
                                                    size="small"
                                                    component="span"
                                                    onClick={handleClose(index)}
                                                >
                                                    <CloseIcon />
                                                </IconButton>
                                            </span>
                                        }
                                    />
                                </DraggableTab>
                            );
                        })
                    }
                    onDragEnd={handleDragEnd}
                />
                <ButtonInTabs
                    toolTip={'Add a tab'}
                    className={classes.addButton}
                    onClick={handleAddNewTab}
                >
                    <AddIcon />
                </ButtonInTabs>
            </Stack>
            {/* tab contents */}
            <TabPanel value={selectedIndex} index={-1}>
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
            {tabs.map((tab, index) => (
                <TabPanel key={tab.id} value={selectedIndex} index={index}>
                    <DynamicSimulationResultChart series={series} />
                </TabPanel>
            ))}
        </div>
    );
};

export default DynamicSimulationResultChartTabs;
