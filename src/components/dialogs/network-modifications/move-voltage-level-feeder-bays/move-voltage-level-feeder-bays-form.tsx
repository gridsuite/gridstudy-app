/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { Grid, TextField } from '@mui/material';
import { filledTextField } from '../../dialog-utils';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { useFormContext } from 'react-hook-form';
import SeparatorCellRenderer from '../voltage-level-topology-modification/separator-cell-renderer';
import HeaderWithTooltip from '../voltage-level-topology-modification/header-with-tooltip';
import { CustomAGGrid, IntegerInput } from '@gridsuite/commons-ui';
import { BUSBAR_SECTION_ID, CONNECTION_DIRECTION, CONNECTION_NAME, CONNECTION_POSITION,
  CURRENT_CONNECTION_STATUS, MOVE_VOLTAGE_LEVEL_FEEDER_BAYS, MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE,
  TOPOLOGY_MODIFICATION_TABLE
} from "../../../utils/field-constants";
import ConnectionCellRenderer from "../voltage-level-topology-modification/connection-cell-render";
import ConnectionPositionCellRenderer from "./connection-position-cell-render";
import { SwitchRowForm } from "../voltage-level-topology-modification/voltage-level-topology.type";
import ConnectionDirectionCellRenderer from "./connection-direction-cell-render";

export type FeederBayData = {
    equipmentId: string;
    busbarId: string;
    targetBusbarId: string;
    connectionDirection: string;
    connectionName: string;
    connectionPosition: number;
};

interface MoveVoltageLevelFeederBaysFormProps {
    moveVoltageLevelFeederBaysData: FeederBayData[];
    currentNode: CurrentTreeNode;
    selectedId: string;
    isUpdate: boolean;
}

export function MoveVoltageLevelFeederBaysForm({
    id = MOVE_VOLTAGE_LEVEL_FEEDER_BAYS,
    moveVoltageLevelFeederBaysData,
    currentNode,
    selectedId,
    isUpdate,
}: Readonly<MoveVoltageLevelFeederBaysFormProps>) {
    const intl = useIntl();
    const { getValues } = useFormContext();

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
                        return data[CONNECTION_NAME];
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
                field: BUSBAR_SECTION_ID,
                filter: true,
                flex: 2,
                cellRenderer: ({ data }: { data?: any }) => {
                    if (data.type === 'SEPARATOR') {
                        return SeparatorCellRenderer({
                            value: data.title,
                        });
                    } else {
                        return data['busbarId'];
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
                        const formIndex = watchTable?.findIndex((item: FeederBayData) => item.equipmentId === data.equipmentId);
                        console.log();
                        return ConnectionDirectionCellRenderer({
                            direction: getValues(`${MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE}[${formIndex}].${CONNECTION_DIRECTION}`),
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
                      const formIndex = watchTable?.findIndex((item: FeederBayData) => item.equipmentId === data.equipmentId);
                      return ConnectionPositionCellRenderer({
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

    return (
        <Grid container sx={{ height: '100%' }} direction="column">
            <Grid container item spacing={2}>
                <Grid item xs={4}>
                    <TextField
                        fullWidth
                        label="ID"
                        value={selectedId}
                        size="small"
                        InputProps={{ readOnly: true }}
                        disabled
                        {...filledTextField}
                    />
                </Grid>
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
        </Grid>
    );
}
