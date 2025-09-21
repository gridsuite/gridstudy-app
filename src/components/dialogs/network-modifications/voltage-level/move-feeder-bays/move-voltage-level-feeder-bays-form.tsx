/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import { Box, Grid, TextField, Tooltip, Typography } from '@mui/material';
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
    MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE,
} from '../../../../utils/field-constants';
import FeederBayDirectionCellRenderer from './feeder-bay-direction-cell-render';
import GridItem from '../../../commons/grid-item';
import Button from '@mui/material/Button';
import { InfoOutlined } from '@mui/icons-material';
import { UUID } from 'crypto';
import { FeederBaysFormInfos, FeederBaysInfos } from './move-voltage-level-feeder-bays.type';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import { RowClassParams, RowStyle } from 'ag-grid-community';

interface MoveVoltageLevelFeederBaysFormProps {
    feederBaysInfos: FeederBaysFormInfos[];
    currentNode: CurrentTreeNode;
    selectedId: string;
    isUpdate: boolean;
    currentRootNetworkUuid: UUID;
    studyUuid: UUID;
}

export function MoveVoltageLevelFeederBaysForm({
    feederBaysInfos,
    currentNode,
    selectedId,
    isUpdate,
    currentRootNetworkUuid,
    studyUuid,
}: Readonly<MoveVoltageLevelFeederBaysFormProps>) {
    const intl = useIntl();
    const {
        getValues,
        formState: { errors },
    } = useFormContext();
    const [isDiagramPaneOpen, setIsDiagramPaneOpen] = useState(false);

    const handleCloseDiagramPane = useCallback(() => {
        setIsDiagramPaneOpen(false);
    }, []);
    const handleClickOpenDiagramPane = useCallback(() => {
        setIsDiagramPaneOpen(true);
    }, []);

    const isNodeBuiltValue = useMemo(() => isNodeBuilt(currentNode), [currentNode]);
    const shouldDisableTooltip = useMemo(() => !isUpdate && isNodeBuiltValue, [isUpdate, isNodeBuiltValue]);

    const defaultColDef = useMemo(
        () => ({
            sortable: false,
            resizable: true,
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

    const renderSeparatorCell = useCallback((data: any, content: React.ReactNode = '') => {
        if (data.type === 'SEPARATOR') {
            return content;
        }
        return null;
    }, []);

    const renderConnectionNameCell = useCallback(
        ({ data }: { data?: any }) => {
            if (data.type === 'SEPARATOR') {
                return (
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '40px',
                            zIndex: 1,
                        }}
                    >
                        <Typography
                            variant="body1"
                            color="primary"
                            sx={{ textAlign: 'center', width: '100%', padding: '8px 0' }}
                        >
                            {data.title}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: '10px',
                                color: 'red',
                                textAlign: 'center',
                                width: '100%',
                                padding: '8px 0',
                            }}
                        >
                            {data.helperMessage}
                        </Typography>
                    </div>
                );
            }

            const watchTable: FeederBaysInfos = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE);
            const formIndex = watchTable?.findIndex((item) => item.equipmentId === data.equipmentId);

            return (
                <TextInput
                    name={`${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${CONNECTION_NAME}`}
                    formProps={{
                        disabled: data.type === 'FEEDER_BAY_REMOVED',
                        size: 'small',
                        variant: 'filled',
                        sx: {
                            padding: '8px',
                            '& input': { textAlign: 'center' },
                        },
                    }}
                />
            );
        },
        [getValues]
    );

    const renderBusbarSectionCell = useCallback(
        ({ data }: { data?: any }) => {
            const separatorContent = renderSeparatorCell(data, '');
            if (separatorContent !== null) {
                return separatorContent;
            }

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
                    sx={{ padding: '8px 0' }}
                    disabled={data.type === 'FEEDER_BAY_REMOVED'}
                    disableClearable
                />
            );
        },
        [getValues, renderSeparatorCell]
    );

    const renderConnectionDirectionCell = useCallback(
        ({ data }: { data?: any }) => {
            const separatorContent = renderSeparatorCell(data, '');
            if (separatorContent !== null) {
                return separatorContent;
            }

            const watchTable: FeederBaysInfos = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE);
            const formIndex = watchTable?.findIndex((item) => item.equipmentId === data.equipmentId);

            return FeederBayDirectionCellRenderer({
                name: `${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${CONNECTION_DIRECTION}`,
                disabled: data.type === 'FEEDER_BAY_REMOVED',
            });
        },
        [getValues, renderSeparatorCell]
    );

    const renderConnectionPositionCell = useCallback(
        ({ data }: { data?: any }) => {
            const separatorContent = renderSeparatorCell(data, '');
            if (separatorContent !== null) {
                return separatorContent;
            }

            const watchTable: FeederBaysInfos = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE);
            const formIndex = watchTable?.findIndex((item) => item.equipmentId === data.equipmentId);
            const fieldError = (errors[MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE] as any)?.[formIndex]?.[
                CONNECTION_POSITION
            ];

            return (
                <div style={{ position: 'relative' }}>
                    <IntegerInput
                        name={`${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${CONNECTION_POSITION}`}
                        formProps={{
                            disabled: data.type === 'FEEDER_BAY_REMOVED',
                            size: 'small',
                            variant: fieldError ? 'outlined' : 'filled',
                            sx: {
                                padding: '8px',
                                '& input': { textAlign: 'center' },
                            },
                        }}
                        inputTransform={(value) => String(value ?? 0)}
                        outputTransform={(value) => (value === '0' ? null : Number(value))}
                    />
                </div>
            );
        },
        [getValues, errors, renderSeparatorCell]
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

    const getRowStyle = useCallback((params: RowClassParams): RowStyle | undefined => {
        return params.data?.type === 'SEPARATOR' ? { fontWeight: 'bold' } : undefined;
    }, []);

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
                    rowData={feederBaysInfos}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    getRowStyle={getRowStyle}
                    suppressMovableColumns={true}
                    animateRows={false}
                    domLayout="normal"
                    headerHeight={48}
                    rowHeight={80}
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
