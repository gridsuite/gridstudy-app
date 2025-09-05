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
import { AutocompleteInput, CustomAGGrid, IntegerInput, TextInput } from '@gridsuite/commons-ui';
import {
    BUSBAR_SECTION_ID,
    BUSBAR_SECTION_IDS,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE,
} from '../../../utils/field-constants';
import FeederBayDirectionCellRenderer from './feeder-bay-direction-cell-render';
import GridItem from '../../commons/grid-item';
import Button from '@mui/material/Button';
import { InfoOutlined } from '@mui/icons-material';
import { UUID } from 'crypto';
import { FeederBaysFormInfos, FeederBaysInfos } from './move-voltage-level-feeder-bays.type';
import PositionDiagramPane from '../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';

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
                        const watchTable: FeederBaysInfos[] = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE);
                        const formIndex = watchTable?.findIndex((item) => item.voltageLevelId === data.voltageLevelId);
                        return (
                            <div>
                                <TextInput
                                    name={`${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${CONNECTION_NAME}`}
                                    formProps={{
                                        size: 'small',
                                        variant: 'filled',
                                        sx: {
                                            padding: '8px',
                                            '& input': {
                                                textAlign: 'center',
                                            },
                                        },
                                    }}
                                />
                            </div>
                        );
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
            },
            {
                field: BUSBAR_SECTION_ID,
                filter: true,
                flex: 2,
                cellRenderer: ({ data }: { data?: any }) => {
                    if (data.type === 'SEPARATOR') {
                        return SeparatorCellRenderer({
                            value: data.title,
                        });
                    } else {
                        const watchTable: FeederBaysInfos[] = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE);
                        const formIndex = watchTable?.findIndex((item) => item.voltageLevelId === data.voltageLevelId);
                        const busBarSectionIds = getValues(
                            `${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${BUSBAR_SECTION_IDS}`
                        );
                        return (
                            <AutocompleteInput
                                name={`${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${BUSBAR_SECTION_ID}`}
                                options={busBarSectionIds}
                                size="small"
                                sx={{ padding: '8px 0' }}
                                disableClearable
                            />
                        );
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
                        const watchTable: FeederBaysInfos[] = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE);
                        const formIndex = watchTable?.findIndex((item) => item.voltageLevelId === data.voltageLevelId);
                        return FeederBayDirectionCellRenderer({
                            name: `${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${CONNECTION_DIRECTION}`,
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
            },
            {
                field: CONNECTION_POSITION,
                filter: true,
                flex: 1,
                cellRenderer: ({ data }: { data?: any }) => {
                    if (data.type === 'SEPARATOR') {
                        return null;
                    } else {
                        const watchTable: FeederBaysInfos[] = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE);
                        const formIndex = watchTable?.findIndex((item) => item.voltageLevelId === data.voltageLevelId);
                        return (
                            <div>
                                <IntegerInput
                                    name={`${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${CONNECTION_POSITION}`}
                                    formProps={{
                                        size: 'small',
                                        variant: 'filled',
                                        sx: {
                                            padding: '8px',
                                            '& input': {
                                                textAlign: 'center',
                                            },
                                        },
                                    }}
                                    inputTransform={(value) => String(value ?? 0)}
                                    outputTransform={(value) => (value === '0' ? null : Number(value))}
                                />
                            </div>
                        );
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
                    rowData={feederBaysInfos}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    suppressMovableColumns={true}
                    animateRows={false}
                    domLayout="normal"
                    headerHeight={48}
                    rowHeight={60}
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
