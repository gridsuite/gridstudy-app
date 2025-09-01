/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { Box, Grid, TextField, Tooltip } from '@mui/material';
import { filledTextField } from '../../dialog-utils';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { useFormContext } from 'react-hook-form';
import SeparatorCellRenderer from '../voltage-level-topology-modification/separator-cell-renderer';
import HeaderWithTooltip from '../voltage-level-topology-modification/header-with-tooltip';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import {
    BUSBAR_SECTION_IDS,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    MOVE_VOLTAGE_LEVEL_FEEDER_BAYS,
    MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE,
    TARGET_BUSBAR_SECTION_ID,
} from '../../../utils/field-constants';
import FeederBayPositionCellRenderer from './feeder-bay-position-cell-render';
import FeeederBayDirectionCellRenderer from './feeder-bay-direction-cell-render';
import FeederBayNameCellRenderer from './feeder-bay-name-cell-render';
import FeederBayTargetBusbarIdCellRenderer from './feeder-bay-target-busbar-id-cell-render';
import GridItem from '../../commons/grid-item';
import Button from '@mui/material/Button';
import { InfoOutlined } from '@mui/icons-material';
import PositionDiagramPane from '../../../diagrams/singleLineDiagram/position-diagram-pane';
import { UUID } from 'crypto';

export type FeederBayData = {
    connectableId: string;
    busbarSectionId: string;
    targetBusbarSectionId: string;
    connectionDirection: string;
    connectionName: string;
    connectionPosition: number;
};

interface MoveVoltageLevelFeederBaysFormProps {
    moveVoltageLevelFeederBaysData: FeederBayData[];
    currentNode: CurrentTreeNode;
    selectedId: string;
    isUpdate: boolean;
    currentRootNetworkUuid: UUID;
    studyUuid: UUID;
}

export function MoveVoltageLevelFeederBaysForm({
    id = MOVE_VOLTAGE_LEVEL_FEEDER_BAYS,
    moveVoltageLevelFeederBaysData,
    currentNode,
    selectedId,
    isUpdate,
    currentRootNetworkUuid,
    studyUuid,
}: Readonly<MoveVoltageLevelFeederBaysFormProps>) {
    const intl = useIntl();
    const { getValues } = useFormContext();
    const [isDiagramPaneOpen, setIsDiagramPaneOpen] = useState(false);

    const handleCloseDiagramPane = useCallback(() => {
        setIsDiagramPaneOpen(false);
    }, []);
    const handleClickOpenDiagramPane = useCallback(() => {
        setIsDiagramPaneOpen(true);
    }, []);

    const defaultColDef = useMemo(
        () => ({
            sortable: false,
            resizable: true,
            wrapHeaderText: true,
            editable: false,
            headerClass: 'centered-header',
            suppressMovable: true,
        }),
        []
    );

    const voltageLevelIdField = useMemo(
        () => (
            <TextField
                fullWidth
                label="ID"
                value={selectedId}
                size="small"
                InputProps={{ readOnly: true }}
                disabled
                {...filledTextField}
            />
        ),
        [selectedId]
    );

    const columnDefs = useMemo(
        () => [
            {
                field: CONNECTION_NAME,
                filter: true,
                flex: 2,
                cellRenderer: ({ data }: { data?: any }) => {
                    if (data.type === 'SEPARATOR') {
                        return SeparatorCellRenderer({
                            value: data.title,
                        });
                    } else {
                        const watchTable: FeederBayData[] = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE);
                        const formIndex = watchTable?.findIndex(
                            (item: FeederBayData) => item.connectableId === data.connectableId
                        );
                        return FeederBayNameCellRenderer({
                            name: `${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${CONNECTION_NAME}`,
                        });
                    }
                },
                headerComponent: HeaderWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'Feeders' }),
                    tooltipTitle: intl.formatMessage({
                        id: isNodeBuilt(currentNode) ? 'builtNodeTooltipVlTopoModif' : 'notBuiltNodeTooltipVlTopoModif',
                    }),
                    isNodeBuilt: isNodeBuilt(currentNode),
                    disabledTooltip: !isUpdate && isNodeBuilt(currentNode),
                },
                editable: false,
            },
            {
                field: TARGET_BUSBAR_SECTION_ID,
                filter: true,
                flex: 2,
                cellRenderer: ({ data }: { data?: any }) => {
                    if (data.type === 'SEPARATOR') {
                        return SeparatorCellRenderer({
                            value: data.title,
                        });
                    } else {
                        const watchTable: FeederBayData[] = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE);
                        const formIndex = watchTable?.findIndex(
                            (item: FeederBayData) => item.connectableId === data.connectableId
                        );
                        const value = getValues(
                            `${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${TARGET_BUSBAR_SECTION_ID}`
                        );
                        return FeederBayTargetBusbarIdCellRenderer({
                            name: `${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${TARGET_BUSBAR_SECTION_ID}`,
                            value: { id: value, label: value },
                            busBarSectionIds: getValues(BUSBAR_SECTION_IDS),
                        });
                    }
                },
                headerComponent: HeaderWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'BusBarBus' }),
                    tooltipTitle: intl.formatMessage({
                        id: isNodeBuilt(currentNode) ? 'builtNodeTooltipVlTopoModif' : 'notBuiltNodeTooltipVlTopoModif',
                    }),
                    isNodeBuilt: isNodeBuilt(currentNode),
                    disabledTooltip: !isUpdate && isNodeBuilt(currentNode),
                },
                editable: false,
            },
            {
                field: CONNECTION_DIRECTION,
                filter: true,
                flex: 2,
                cellRenderer: ({ data }: { data?: any }) => {
                    if (data.type === 'SEPARATOR') {
                        return SeparatorCellRenderer({
                            value: data.title,
                        });
                    } else {
                        const watchTable: FeederBayData[] = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE);
                        const formIndex = watchTable?.findIndex(
                            (item: FeederBayData) => item.connectableId === data.connectableId
                        );
                        return FeeederBayDirectionCellRenderer({
                            direction: getValues(
                                `${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${CONNECTION_DIRECTION}`
                            ),
                        });
                    }
                },
                headerComponent: HeaderWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'connectionDirection' }),
                    tooltipTitle: intl.formatMessage({
                        id: isNodeBuilt(currentNode) ? 'builtNodeTooltipVlTopoModif' : 'notBuiltNodeTooltipVlTopoModif',
                    }),
                    isNodeBuilt: isNodeBuilt(currentNode),
                    disabledTooltip: !isUpdate && isNodeBuilt(currentNode),
                },
                editable: false,
            },
            {
                field: CONNECTION_POSITION,
                filter: true,
                flex: 1,
                cellRenderer: ({ data }: { data?: any }) => {
                    if (data.type === 'SEPARATOR') {
                        return null;
                    } else {
                        const watchTable: FeederBayData[] = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE);
                        const formIndex = watchTable?.findIndex(
                            (item: FeederBayData) => item.connectableId === data.connectableId
                        );
                        return FeederBayPositionCellRenderer({
                            name: `${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${CONNECTION_POSITION}`,
                        });
                    }
                },
                headerComponent: HeaderWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: CONNECTION_POSITION }),
                    tooltipTitle: intl.formatMessage({
                        id: isNodeBuilt(currentNode) ? 'builtNodeTooltipVlTopoModif' : 'notBuiltNodeTooltipVlTopoModif',
                    }),
                    isNodeBuilt: isNodeBuilt(currentNode),
                    disabledTooltip: !isUpdate && isNodeBuilt(currentNode),
                },
                editable: false,
            },
        ],
        [currentNode, intl, isUpdate, getValues]
    );

    const diagramToolTip = useMemo(
        () => (
            <Tooltip sx={{ paddingLeft: 1 }} title={intl.formatMessage({ id: 'builtNodeTooltipForDiagram' })}>
                <InfoOutlined color="info" fontSize="medium" />
            </Tooltip>
        ),
        [intl]
    );

    return (
        <Grid container sx={{ height: '100%' }} direction="column">
            <Grid container item spacing={2}>
                <Grid item xs={4}>
                    {voltageLevelIdField}
                </Grid>
                {isNodeBuilt(currentNode) && (
                    <GridItem size={3}>
                        <Button onClick={handleClickOpenDiagramPane} variant="outlined">
                            <FormattedMessage id={'CreateCouplingDeviceDiagramButton'} />
                        </Button>
                        {diagramToolTip}
                    </GridItem>
                )}
            </Grid>
            <Grid xs paddingTop={2}>
                <CustomAGGrid
                    rowData={moveVoltageLevelFeederBaysData}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    suppressMovableColumns={true}
                    animateRows={false}
                    domLayout="normal"
                    headerHeight={48}
                />
            </Grid>
            <Box>
                <PositionDiagramPane
                    studyUuid={studyUuid}
                    open={isDiagramPaneOpen}
                    onClose={handleCloseDiagramPane}
                    voltageLevelId={selectedId}
                    currentNodeUuid={currentNode?.id}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </Box>
        </Grid>
    );
}
