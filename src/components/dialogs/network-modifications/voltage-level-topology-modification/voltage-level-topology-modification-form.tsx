/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useFieldArray } from 'react-hook-form';
import { EquipmentAttributeModificationInfos } from '../../../../services/network-modification-types';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { Button, Grid, Paper, TextField, Typography } from '@mui/material';
import {
    CURRENT_CONNECTION_STATUS,
    PREV_CONNECTION_STATUS,
    SWITCH_ID,
    TOPOLOGY_MODIFICATION_TABLE,
} from '../../../utils/field-constants';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { filledTextField } from '../../dialog-utils';
import { HeaderWithTooltip } from './header-with-tooltip';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { SwitchInfos } from '../../../../services/study/network-map.type';
import { BooleanNullableCellRenderer } from './boolean-nullable-cell-render';
import { ResetSettingsIcon } from './ResetSettingsIcon';

interface VoltageLevelTopologyModificationFormProps {
    currentNode: CurrentTreeNode;
    selectedId: string;
    switchesToModify: SwitchInfos[];
    switchesEditData?: EquipmentAttributeModificationInfos[];
    isUpdate: boolean;
}

export function VoltageLevelTopologyModificationForm({
    currentNode,
    selectedId,
    switchesToModify,
    switchesEditData,
    isUpdate,
}: VoltageLevelTopologyModificationFormProps) {
    const intl = useIntl();
    const { replace } = useFieldArray({
        name: `${TOPOLOGY_MODIFICATION_TABLE}`,
    });

    const isSwitchModified = useCallback(
        (switchId: string): boolean => {
            return switchesEditData?.some((mod) => mod.equipmentId === switchId) || false;
        },
        [switchesEditData]
    );

    const { modifiedSwitches, unmodifiedSwitches } = useMemo(() => {
        const modified = switchesToModify
            .filter((sw) => isSwitchModified(sw.id))
            .map((switchRow) => ({
                [SWITCH_ID]: switchRow.id,
                [PREV_CONNECTION_STATUS]: intl.formatMessage({
                    id: switchRow.open ? 'Open' : 'Closed',
                }),
                [CURRENT_CONNECTION_STATUS]:
                    switchesEditData?.find((mod) => mod.equipmentId === switchRow.id)?.equipmentAttributeValue ?? null,
                isModified: true,
            }))
            .sort((a, b) => a[SWITCH_ID].localeCompare(b[SWITCH_ID]));

        const unmodified = switchesToModify
            .filter((sw) => !isSwitchModified(sw.id))
            .map((switchRow) => ({
                [SWITCH_ID]: switchRow.id,
                [PREV_CONNECTION_STATUS]: intl.formatMessage({
                    id: switchRow.open ? 'Open' : 'Closed',
                }),
                [CURRENT_CONNECTION_STATUS]: null,
                isModified: false,
            }))
            .sort((a, b) => a[SWITCH_ID].localeCompare(b[SWITCH_ID]));

        return { modifiedSwitches: modified, unmodifiedSwitches: unmodified };
    }, [switchesEditData, intl, switchesToModify, isSwitchModified]);

    useEffect(() => {
        const allData = [...modifiedSwitches, ...unmodifiedSwitches];
        if (allData.length > 0) {
            replace(allData);
        }
    }, [modifiedSwitches, unmodifiedSwitches, replace]);

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
                field: SWITCH_ID,
                filter: true,
                flex: 2,
                headerComponent: HeaderWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'switchId' }),
                    tooltipTitle: intl.formatMessage({
                        id: isNodeBuilt(currentNode) ? 'builtNodeTooltipVlTopoModif' : 'notBuiltNodeTooltipVlTopoModif',
                    }),
                    isNodeBuilt: isNodeBuilt(currentNode),
                    disabledTooltip: !isUpdate && isNodeBuilt(currentNode),
                },
            },
            {
                field: PREV_CONNECTION_STATUS,
                flex: 1,
                cellClass: 'ag-cell-center',
                headerComponent: HeaderWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'previousStatus' }),
                    tooltipTitle: intl.formatMessage({
                        id: isNodeBuilt(currentNode) ? 'builtNodeTooltipVlTopoModif' : 'notBuiltNodeTooltipVlTopoModif',
                    }),
                    isNodeBuilt: isNodeBuilt(currentNode),
                    disabledTooltip: !isUpdate && isNodeBuilt(currentNode),
                },
            },
            {
                field: 'CURRENT_CONNECTION_STATUS',
                flex: 1,
                cellRenderer: BooleanNullableCellRenderer,
                cellRendererParams: (params: {
                    node: { rowIndex: number };
                    colDef: { field: any };
                    data: { currentConnectionStatus: null | boolean };
                }) => ({
                    name: `${TOPOLOGY_MODIFICATION_TABLE}[${params.node.rowIndex}].${params.colDef.field}`,
                    connected: params.data.currentConnectionStatus,
                }),
                cellStyle: () => ({ textAlign: 'center' }),
                headerComponent: HeaderWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'currentStatus' }),
                    tooltipTitle: intl.formatMessage({
                        id: isNodeBuilt(currentNode) ? 'builtNodeTooltipVlTopoModif' : 'notBuiltNodeTooltipVlTopoModif',
                    }),
                    isNodeBuilt: isNodeBuilt(currentNode),
                    disabledTooltip: true,
                },
                editable: false,
            },
        ],
        [currentNode, intl, isUpdate]
    );

    const copyPreviousToCurrentStatus = useCallback(() => {
        const updatedData = [...modifiedSwitches, ...unmodifiedSwitches].map((row) => ({
            ...row,
            [CURRENT_CONNECTION_STATUS]:
                row[PREV_CONNECTION_STATUS] === intl.formatMessage({ id: 'Open' })
                    ? true
                    : row[PREV_CONNECTION_STATUS] === intl.formatMessage({ id: 'Closed' })
                      ? false
                      : null,
            isModified: true,
        }));
        replace(updatedData);
    }, [modifiedSwitches, unmodifiedSwitches, replace, intl]);

    const getTableHeight = (items: string | any[]) => {
        const rowHeight = 48;
        const headerHeight = 56;
        const minHeight = 150;
        const maxHeight = 350;

        const calculatedHeight = headerHeight + items.length * rowHeight;

        return Math.max(minHeight, Math.min(calculatedHeight, maxHeight));
    };

    return (
        <Grid container spacing={2}>
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
            <Grid item xs={8} container justifyContent="flex-end">
                <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={copyPreviousToCurrentStatus}
                    startIcon={<ResetSettingsIcon />}
                    disabled={!isUpdate}
                >
                    {intl.formatMessage({ id: 'copyPreviousTopologyStatus' })}
                </Button>
            </Grid>

            {modifiedSwitches.length > 0 && (
                <Grid item xs={12} sx={{ mb: 0 }}>
                    <Paper
                        elevation={1}
                        sx={{
                            overflow: 'hidden',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px 4px 0 0',
                            borderBottom: 'none',
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                backgroundColor: '#f3f3f3',
                                padding: '12px 16px',
                                fontWeight: 'bold',
                                fontSize: '0.95rem',
                                borderBottom: '1px solid #e0e0e0',
                            }}
                        >
                            {intl.formatMessage({ id: 'modifiedSwitchesSeparatorTitle' })} ({modifiedSwitches.length})
                        </Typography>
                        <div
                            className="ag-theme-material"
                            style={{
                                height: getTableHeight(modifiedSwitches),
                                width: '100%',
                            }}
                        >
                            <CustomAGGrid
                                rowData={modifiedSwitches}
                                defaultColDef={defaultColDef}
                                columnDefs={columnDefs}
                                rowSelection="multiple"
                                suppressMovableColumns={true}
                                animateRows={false}
                                domLayout="normal"
                                headerHeight={48}
                            />
                        </div>
                    </Paper>
                </Grid>
            )}

            <Grid item xs={12} sx={{ mt: modifiedSwitches.length > 0 ? '-1px' : 0 }}>
                <Paper
                    elevation={1}
                    sx={{
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0',
                        borderRadius: modifiedSwitches.length > 0 ? '0 0 4px 4px' : '4px',
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        sx={{
                            backgroundColor: '#f3f3f3',
                            padding: '12px 16px',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            borderBottom: '1px solid #e0e0e0',
                        }}
                    >
                        {intl.formatMessage({ id: 'unModifiedSwitchesSeparatorTitle' })} ({unmodifiedSwitches.length})
                    </Typography>
                    <div
                        className="ag-theme-material"
                        style={{
                            height: getTableHeight(unmodifiedSwitches),
                            width: '100%',
                        }}
                    >
                        <CustomAGGrid
                            rowData={unmodifiedSwitches}
                            defaultColDef={defaultColDef}
                            columnDefs={columnDefs}
                            rowSelection="multiple"
                            suppressMovableColumns={true}
                            animateRows={false}
                            domLayout="normal"
                            headerHeight={modifiedSwitches.length > 0 ? 0 : 48}
                        />
                    </div>
                </Paper>
            </Grid>
        </Grid>
    );
}
