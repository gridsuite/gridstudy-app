/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { Box, LinearProgress } from '@mui/material';
import DynamicSimulationResultChart from './timeseries/dynamic-simulation-result-chart';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import DroppableTabs from './common/draggable-tab/droppable-tabs';
import DraggableTab from './common/draggable-tab/draggable-tab';
import Visibility from './common/visibility';
import TooltipIconButton from './common/tooltip-icon-button';
import useResultTimeSeries from './hooks/useResultTimeSeries';

const styles = {
    root: {
        height: '100%',
    },
    addButton: (theme) => ({
        borderRadius: '50%',
        marginRight: theme.spacing(10),
        color: theme.palette.primary.main,
    }),
    loader: {
        height: '4px',
    },
};

const DynamicSimulationResultTimeSeries = ({ nodeUuid, studyUuid }) => {
    const [result, loadTimeSeries, isLoading] = useResultTimeSeries(
        nodeUuid,
        studyUuid
    );

    // tab id is automatically increased and reset to zero when there is no tab.
    const [tabIncId, setTabIncId] = useState(1);

    const [selectedIndex, setSelectedIndex] = useState(0);

    const [tabs, setTabs] = useState([{ id: tabIncId }]);

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
        <>
            <Box sx={styles.loader}>{isLoading && <LinearProgress />}</Box>
            {result && (
                <Box sx={styles.root}>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
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
                                            id={`tab-${index}`}
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
                                                    <TooltipIconButton
                                                        toolTip={intl.formatMessage(
                                                            {
                                                                id: 'DynamicSimulationCloseTab',
                                                            }
                                                        )}
                                                        size="small"
                                                        component="span"
                                                        onClick={handleClose(
                                                            index
                                                        )}
                                                    >
                                                        <CloseIcon />
                                                    </TooltipIconButton>
                                                </span>
                                            }
                                        />
                                    );
                                })
                            }
                            onDragEnd={handleDragEnd}
                        />
                        <TooltipIconButton
                            toolTip={intl.formatMessage({
                                id: 'DynamicSimulationAddTab',
                            })}
                            sx={styles.addButton}
                            onClick={handleAddNewTab}
                        >
                            <AddIcon />
                        </TooltipIconButton>
                    </Box>
                    {/* tab contents */}
                    <Box
                        sx={{
                            height: 'calc(100vh - 220px)', // TODO fix layout to use flexGrow : 1
                        }}
                    >
                        {tabs.map((tab, index) => (
                            <Visibility
                                key={`tab-${tab.id}`}
                                value={selectedIndex}
                                index={index}
                            >
                                <DynamicSimulationResultChart
                                    groupId={`${tab.id}`}
                                    timeseriesMetadatas={
                                        result.timeseriesMetadatas
                                    }
                                    selected={selectedIndex === index}
                                    loadTimeSeries={loadTimeSeries}
                                />
                            </Visibility>
                        ))}
                    </Box>
                </Box>
            )}
        </>
    );
};

DynamicSimulationResultTimeSeries.propTypes = {
    nodeUuid: PropTypes.string,
    studyUuid: PropTypes.string,
};

export default DynamicSimulationResultTimeSeries;
