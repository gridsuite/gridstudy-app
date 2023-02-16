/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { IconButton, Stack } from '@mui/material';
import DynamicSimulationResultChart from './dynamic-simulation-result-chart';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import makeStyles from '@mui/styles/makeStyles';
import DroppableTabs from './common/draggable-tab/droppable-tabs';
import DraggableTab from './common/draggable-tab/draggable-tab';
import Visibility from './common/visibility';
import TooltipIconButton from './common/tooltip-icon-button';

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
    const { timeseries } = result;
    const classes = useStyles();

    // tab id is auto increase and reset to zero when there is any tab
    const [tabIncId, setTabIncId] = useState(1);

    const [selectedIndex, setSelectedIndex] = useState(0);

    const [tabs, setTabs] = useState([{ id: tabIncId }]);

    const series = useMemo(() => {
        if (!timeseries) return [];
        return timeseries.map((elem, index) => {
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
    }, [timeseries]);

    const intl = useIntl();

    const handleAddNewTab = () => {
        setTabs((prev) => [
            ...prev,
            {
                id: tabIncId + 1,
            },
        ]);

        setSelectedIndex(tabs.length);

        setTabIncId((prev) => prev + 1);
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
                setTabIncId(0);
            }
        };
    };

    const handleDragEnd = (result) => {
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
                                    id={`tab-${tab.id}`}
                                    index={index}
                                    value={index}
                                    label={
                                        <span
                                            style={{
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {`${intl.formatMessage({
                                                id: 'DynamicSimulationResultTab',
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
                            );
                        })
                    }
                    onDragEnd={handleDragEnd}
                />
                <TooltipIconButton
                    toolTip={'Add a tab'}
                    className={classes.addButton}
                    onClick={handleAddNewTab}
                >
                    <AddIcon />
                </TooltipIconButton>
            </Stack>
            {/* tab contents */}
            {tabs.map((tab, index) => (
                <Visibility
                    key={`tab-${tab.id}`}
                    value={selectedIndex}
                    index={index}
                >
                    <DynamicSimulationResultChart
                        groupId={`${tab.id}`}
                        series={series}
                        selected={selectedIndex === index}
                    />
                </Visibility>
            ))}
        </div>
    );
};

DynamicSimulationResultChartTabs.propTypes = {
    result: PropTypes.shape({
        timeseries: PropTypes.arrayOf(
            PropTypes.shape({
                metadata: PropTypes.object,
                chunks: PropTypes.arrayOf(
                    PropTypes.shape({
                        values: PropTypes.array,
                    })
                ),
            })
        ),
    }),
};

export default DynamicSimulationResultChartTabs;
