/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { Box, LinearProgress, Theme } from '@mui/material';
import DynamicSimulationResultChart from './timeseries/dynamic-simulation-result-chart';
import { memo, SyntheticEvent, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import DroppableTabs from '../../utils/draggable-tab/droppable-tabs';
import DraggableTab from '../../utils/draggable-tab/draggable-tab';
import Visibility from './common/visibility';
import TooltipIconButton from './common/tooltip-icon-button';
import useResultTimeSeries from './hooks/useResultTimeSeries';
import { useSelector } from 'react-redux';
import ComputingType from '../../computing-status/computing-type';
import { getNoRowsMessage, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import Overlay from '../common/Overlay';
import { UUID } from 'crypto';
import { AppState } from '../../../redux/reducer';
import { DropResult } from 'react-beautiful-dnd';

const styles = {
    root: {
        height: '100%',
    },
    addButton: (theme: Theme) => ({
        borderRadius: '50%',
        marginRight: theme.spacing(10),
        color: theme.palette.primary.main,
    }),
    loader: {
        height: '4px',
    },
};

export type DynamicSimulationResultTimeSeriesProps = {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
};

const DynamicSimulationResultTimeSeries = memo(function ({
    nodeUuid,
    studyUuid,
    currentRootNetworkUuid,
}: Readonly<DynamicSimulationResultTimeSeriesProps>) {
    const {
        result,
        lazyLoadTimeSeriesCb: loadTimeSeries,
        isLoading,
    } = useResultTimeSeries({ nodeUuid, studyUuid, rootNetworkUuid: currentRootNetworkUuid });

    // tab id is automatically increased and reset to zero when there is no tab.
    const [tabIncId, setTabIncId] = useState<number>(1);

    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    const [tabs, setTabs] = useState<{ id: number }[]>(() => [{ id: tabIncId }]);

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

    const handleClose = (index: number) => {
        return () => {
            const newTabs = Array.from(tabs);
            newTabs.splice(index, 1);
            setSelectedIndex(newTabs.length === 0 ? -1 : index === tabs.length - 1 ? newTabs.length - 1 : index); // get the next item in new tabs
            setTabs(newTabs);
            if (newTabs.length === 0) {
                // reset tabId to zero
                setTabIncId(0);
            }
        };
    };

    const handleDragEnd = (result: DropResult) => {
        const newTabs = Array.from(tabs);
        const draggedTab = newTabs.splice(result.source.index, 1)[0];
        const destIndex = result.destination?.index;
        if (destIndex !== undefined) {
            newTabs.splice(destIndex, 0, draggedTab);
            setSelectedIndex(destIndex);
            setTabs(newTabs);
        }
    };

    const handleTabsChange = (event: SyntheticEvent, newTabIndex: number) => {
        setSelectedIndex(newTabIndex);
    };

    // messages to show when no data
    const dynamicSimulationStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
    );
    const messages = useIntlResultStatusMessages(intl, true);
    const overlayMessage = useMemo(
        () => getNoRowsMessage(messages, result?.timeseriesMetadatas, dynamicSimulationStatus, !isLoading),
        [messages, result, dynamicSimulationStatus, isLoading]
    );

    return (
        <>
            {isLoading && (
                <Box sx={styles.loader}>
                    <LinearProgress />
                </Box>
            )}
            <Overlay message={overlayMessage}>
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
                                            key={`tab-${index}`}
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
                                                        tooltip={intl.formatMessage({
                                                            id: 'DynamicSimulationCloseTab',
                                                        })}
                                                        size="small"
                                                        component="span"
                                                        onClick={handleClose(index)}
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
                            tooltip={intl.formatMessage({
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
                            <Visibility key={`tab-${tab.id}`} value={selectedIndex} index={index}>
                                <DynamicSimulationResultChart
                                    groupId={`${tab.id}`}
                                    timeseriesMetadatas={result?.timeseriesMetadatas}
                                    selected={selectedIndex === index}
                                    loadTimeSeries={loadTimeSeries}
                                />
                            </Visibility>
                        ))}
                    </Box>
                </Box>
            </Overlay>
        </>
    );
});

export default DynamicSimulationResultTimeSeries;
