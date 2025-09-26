/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import { Box, Grid, TextField, Tooltip } from '@mui/material';
import { filledTextField } from '../../../dialog-utils';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { useFormContext } from 'react-hook-form';
import HeaderWithTooltip from '../topology-modification/header-with-tooltip';
import { AutocompleteInput, CustomAGGrid, IntegerInput, TextInput } from '@gridsuite/commons-ui';
import {
    BUSBAR_SECTION_ID,
    BUSBAR_SECTION_IDS,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    IS_REMOVED,
    MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE,
} from '../../../../utils/field-constants';
import FeederBayDirectionCellRenderer from './feeder-bay-direction-cell-render';
import GridItem from '../../../commons/grid-item';
import Button from '@mui/material/Button';
import { InfoOutlined } from '@mui/icons-material';
import { UUID } from 'crypto';
import { FeederBaysFormInfos, FeederBaysInfos } from './move-voltage-level-feeder-bays.type';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import SeparatorCellRenderer from '../topology-modification/separator-cell-renderer';

const defaultColDef = {
    sortable: false,
    resizable: true,
    editable: false,
    headerClass: 'centered-header',
    cellClass: 'centered-cell',
    suppressMovable: true,
};

interface MoveVoltageLevelFeederBaysFormProps {
    currentNode: CurrentTreeNode;
    selectedId: string;
    isUpdate: boolean;
    currentRootNetworkUuid: UUID;
    studyUuid: UUID;
    isReady: boolean;
}

export function MoveVoltageLevelFeederBaysForm({
    currentNode,
    selectedId,
    isUpdate,
    currentRootNetworkUuid,
    studyUuid,
    isReady = false,
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

    const isNodeBuiltValue = useMemo(() => isNodeBuilt(currentNode), [currentNode]);
    const shouldDisableTooltip = useMemo(() => !isUpdate && isNodeBuiltValue, [isUpdate, isNodeBuiltValue]);

    // build group
    const groupedRowData = useMemo(() => {
        if (!isReady) {
            return [];
        }

        const rows = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE) as FeederBaysFormInfos[];
        // grouping by isRemove
        const groups: Record<string, FeederBaysFormInfos[]> = {};
        for (const row of rows) {
            const key = row[IS_REMOVED] ? 'REMOVED' : 'ACTIVE';
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(row);
        }
        return Object.entries(groups).flatMap(([key, rows]) =>
            // do not show the ACTIVE group's header
            key === 'ACTIVE' ? [...rows] : [{ isGroup: true, key }, ...rows]
        );
    }, [isReady, getValues]);

    const getGroupLabel = useCallback(
        (group: { key: string }) => {
            return group.key === 'REMOVED' ? intl.formatMessage({ id: 'MissingConnectionsInVoltageLevel' }) : undefined;
        },
        [intl]
    );

    const renderGroupCell = useCallback(
        ({ data }: { data?: any }) => {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        paddingLeft: 2,
                    }}
                >
                    <SeparatorCellRenderer value={getGroupLabel(data) ?? ''} sx={{ textAlign: 'center' }} />
                </Box>
            );
        },
        [getGroupLabel]
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

    const commonHeaderParams = useMemo(
        () => ({
            tooltipTitle: intl.formatMessage({
                id: isNodeBuiltValue ? 'builtNodeTooltipVlTopoModif' : 'notBuiltNodeTooltipVlTopoModif',
            }),
            isNodeBuilt: isNodeBuiltValue,
            disabledTooltip: shouldDisableTooltip,
        }),
        [intl, isNodeBuiltValue, shouldDisableTooltip]
    );

    const renderConnectionNameCell = useCallback(
        ({ data }: { data?: any }) => {
            const watchTable: FeederBaysInfos = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE);
            const formIndex = watchTable?.findIndex((item) => item.equipmentId === data.equipmentId);

            return (
                <TextInput
                    name={`${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${CONNECTION_NAME}`}
                    formProps={{
                        disabled: data.isRemoved,
                        size: 'small',
                        variant: 'outlined',
                        autoFocus: true,
                        sx: {
                            paddingTop: '8%',
                            '& input': {
                                textAlign: 'center',
                                textOverflow: 'ellipsis',
                            },
                        },
                    }}
                />
            );
        },
        [getValues]
    );

    const renderBusbarSectionCell = useCallback(
        ({ data }: { data?: any }) => {
            const watchTable: FeederBaysInfos = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE);
            const formIndex = watchTable?.findIndex((item) => item.equipmentId === data.equipmentId);
            const busBarSectionIds = getValues(
                `${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${BUSBAR_SECTION_IDS}`
            );

            return (
                <AutocompleteInput
                    name={`${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${BUSBAR_SECTION_ID}`}
                    options={busBarSectionIds}
                    size="small"
                    sx={{ padding: '8%' }}
                    disabled={data.isRemoved}
                    disableClearable
                />
            );
        },
        [getValues]
    );

    const renderConnectionDirectionCell = useCallback(
        ({ data }: { data?: any }) => {
            const watchTable: FeederBaysInfos = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE);
            const formIndex = watchTable?.findIndex((item) => item.equipmentId === data.equipmentId);

            return FeederBayDirectionCellRenderer({
                name: `${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${CONNECTION_DIRECTION}`,
                disabled: data.isRemoved,
            });
        },
        [getValues]
    );

    const renderConnectionPositionCell = useCallback(
        ({ data }: { data?: any }) => {
            const watchTable: FeederBaysInfos = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE);
            const formIndex = watchTable?.findIndex((item) => item.equipmentId === data.equipmentId);

            return (
                <div style={{ position: 'relative' }}>
                    <IntegerInput
                        name={`${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${CONNECTION_POSITION}`}
                        formProps={{
                            disabled: data.isRemoved,
                            size: 'small',
                            variant: 'outlined',
                            sx: {
                                padding: '8%',
                                '& input': { textAlign: 'center' },
                            },
                        }}
                        inputTransform={(value) => String(value ?? 0)}
                        outputTransform={(value) => (value === '0' ? null : Number(value))}
                    />
                </div>
            );
        },
        [getValues]
    );

    const columnDefs = useMemo(
        () => [
            {
                field: CONNECTION_NAME,
                filter: true,
                flex: 2,
                cellRenderer: renderConnectionNameCell,
                headerComponent: HeaderWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'Feeders' }),
                    ...commonHeaderParams,
                },
            },
            {
                field: BUSBAR_SECTION_ID,
                filter: true,
                flex: 2,
                cellRenderer: renderBusbarSectionCell,
                headerComponent: HeaderWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'BusBarBus' }),
                    ...commonHeaderParams,
                },
            },
            {
                field: CONNECTION_DIRECTION,
                filter: true,
                flex: 2,
                cellRenderer: renderConnectionDirectionCell,
                headerComponent: HeaderWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'connectionDirection' }),
                    ...commonHeaderParams,
                },
            },
            {
                field: CONNECTION_POSITION,
                filter: true,
                flex: 2,
                cellRenderer: renderConnectionPositionCell,
                headerComponent: HeaderWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: CONNECTION_POSITION }),
                    ...commonHeaderParams,
                },
            },
        ],
        [
            intl,
            commonHeaderParams,
            renderConnectionNameCell,
            renderBusbarSectionCell,
            renderConnectionDirectionCell,
            renderConnectionPositionCell,
        ]
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
        <Grid container sx={{ height: '100%', width: 'auto' }} direction="column">
            <Grid container item spacing={2}>
                <Grid item xs={4}>
                    {voltageLevelIdField}
                </Grid>
                {isNodeBuiltValue && (
                    <GridItem size={3}>
                        <Button onClick={handleClickOpenDiagramPane} variant="outlined">
                            <FormattedMessage id={'CreateCouplingDeviceDiagramButton'} />
                        </Button>
                        {diagramToolTip}
                    </GridItem>
                )}
            </Grid>
            <Grid item xs paddingTop={2}>
                <CustomAGGrid
                    rowData={groupedRowData}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    suppressMovableColumns={true}
                    animateRows={false}
                    domLayout="normal"
                    headerHeight={48}
                    rowHeight={80}
                    rowStyle={{ border: 'none' }}
                    suppressRowHoverHighlight={true}
                    // group config
                    getRowHeight={(rowParam) => {
                        return rowParam.node.data?.isGroup ? 48 : undefined;
                    }}
                    isFullWidthRow={(rowParam) => {
                        return rowParam.rowNode.data?.isGroup;
                    }}
                    fullWidthCellRenderer={renderGroupCell}
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
