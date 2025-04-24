/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CellRendererParams,
    CellStyleParams,
    ColumnDef,
    styles,
    SwitchInfos,
    SwitchRowData,
} from './voltage-level-topology.type';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useFieldArray } from 'react-hook-form';
import { EquipmentAttributeModificationInfos } from '../../../../services/network-modification-types';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { Grid, TextField } from '@mui/material';
import {
    CURRENT_CONNECTION_STATUS,
    PREV_CONNECTION_STATUS,
    SWITCH_ID,
    TOPOLOGY_MODIFICATION_TABLE,
} from '../../../utils/field-constants';
import { HeaderComponentWithTooltip } from './header-component-with-tooltip';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { BooleanNullableCellRenderer } from './multi-state-checkbox-cell-render';
import { RowClassParams } from 'ag-grid-community';
import { filledTextField } from '../../dialog-utils';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import Button from '@mui/material/Button';

export function VoltageLevelTopologyModificationForm({
    currentNode,
    equipmentId,
    switchesToModify,
    switchesEditData,
    isUpdate,
}: {
    currentNode: CurrentTreeNode;
    equipmentId: string;
    switchesToModify: SwitchInfos[];
    switchesEditData?: EquipmentAttributeModificationInfos[];
    isUpdate: boolean;
}) {
    const intl = useIntl();
    const { replace } = useFieldArray({
        name: `${TOPOLOGY_MODIFICATION_TABLE}`,
    });

    const rowData = useMemo(() => {
        const isSwitchModified = (switchId: string) => {
            return switchesEditData?.some((mod) => mod.equipmentId === switchId) || false;
        };
        const unmodifiedSwitches = switchesToModify
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

        const modifiedSwitches = switchesToModify
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

        const separatorRow: SwitchRowData = {
            [SWITCH_ID]: '',
            [PREV_CONNECTION_STATUS]: '',
            [CURRENT_CONNECTION_STATUS]: null,
            isSeparator: true,
        };
        return [...modifiedSwitches, separatorRow, ...unmodifiedSwitches];
    }, [switchesEditData, intl, switchesToModify]);

    useEffect(() => {
        if (rowData.length > 0) {
            const updatedData = rowData.map((row) => ({
                ...row,
                [CURRENT_CONNECTION_STATUS]:
                    row[CURRENT_CONNECTION_STATUS] === undefined ? null : row[CURRENT_CONNECTION_STATUS],
            }));
            replace(updatedData);
        }
    }, [rowData, replace]);

    const defaultColDef = {
        sortable: false,
        resizable: true,
        wrapHeaderText: true,
        editable: false,
        headerClass: 'centered-header',
    };

    const columnDefs: ColumnDef[] = useMemo(
        () => [
            {
                field: SWITCH_ID,
                filter: true,
                flex: 1,
                cellStyle: (params: CellStyleParams) => {
                    return params.data.isSeparator
                        ? {
                              backgroundColor: '#f0f0f0',
                              fontWeight: 'bold',
                          }
                        : {};
                },
                headerComponent: HeaderComponentWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'switchId' }),
                    tooltipTitle: intl.formatMessage({
                        id: isNodeBuilt(currentNode) ? 'builtNodeTooltipVlTopoModif' : 'notBuiltNodeTooltipVlTopoModif',
                    }),
                    isNodeBuilt: isNodeBuilt(currentNode),
                    disabledTooltip: !isUpdate && isNodeBuilt(currentNode),
                },
            } as ColumnDef,
            {
                field: PREV_CONNECTION_STATUS,
                flex: 1,
                cellStyle: (params: CellStyleParams): Record<string, string> => {
                    if (params.data.isSeparator) {
                        return {
                            backgroundColor: '#f0f0f0',
                            fontWeight: 'bold',
                        };
                    } else {
                        return {};
                    }
                },
                cellClass: 'ag-cell-center',
                headerComponent: HeaderComponentWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'previousStatus' }),
                    tooltipTitle: intl.formatMessage({
                        id: isNodeBuilt(currentNode) ? 'builtNodeTooltipVlTopoModif' : 'notBuiltNodeTooltipVlTopoModif',
                    }),
                    isNodeBuilt: isNodeBuilt(currentNode),
                    disabledTooltip: !isUpdate && isNodeBuilt(currentNode),
                },
            } as ColumnDef,
            {
                field: CURRENT_CONNECTION_STATUS,
                flex: 1,
                cellRenderer: (params: CellRendererParams) => {
                    if (params.data.isSeparator) {
                        return '';
                    }
                    return BooleanNullableCellRenderer(params);
                },
                cellStyle: (params: CellStyleParams): Record<string, string> => {
                    if (params.data.isSeparator) {
                        return {
                            backgroundColor: '#f0f0f0',
                            fontWeight: 'bold',
                        };
                    } else {
                        return {
                            textAlign: 'center',
                        };
                    }
                },
                headerComponent: HeaderComponentWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'currentStatus' }),
                    tooltipTitle: intl.formatMessage({
                        id: isNodeBuilt(currentNode) ? 'builtNodeTooltipVlTopoModif' : 'notBuiltNodeTooltipVlTopoModif',
                    }),
                    isNodeBuilt: isNodeBuilt(currentNode),
                    disabledTooltip: true,
                },
                editable: false,
            } as ColumnDef,
        ],
        [currentNode, intl, isUpdate]
    );

    const getRowId = (params: { data: SwitchRowData }) => {
        if (params.data.isSeparator) {
            return 'separator-row';
        }
        return params.data[SWITCH_ID];
    };

    const modifiedSwitchIds = useMemo(() => {
        const switchSet = new Set<string>();
        if (switchesEditData && switchesEditData.length > 0) {
            switchesEditData.forEach((mod: EquipmentAttributeModificationInfos) => {
                switchSet.add(mod.equipmentId);
            });
        }
        return switchSet;
    }, [switchesEditData]);

    const getRowClass = (params: RowClassParams<SwitchRowData, unknown>): string => {
        if (params.rowIndex > 0) {
            const currentRowId = params.data?.[SWITCH_ID];
            const currentRowIsModified = currentRowId ? modifiedSwitchIds.has(currentRowId) : false;

            const prevRowNode = params.api.getDisplayedRowAtIndex(params.rowIndex - 1);
            const prevRowData = prevRowNode?.data;

            if (prevRowData) {
                const prevRowId = prevRowData[SWITCH_ID];
                const prevRowIsModified = prevRowId ? modifiedSwitchIds.has(prevRowId) : false;

                if (!currentRowIsModified && prevRowIsModified) {
                    return 'separator-row';
                }
            }
        }
        return '';
    };

    const copyPreviousToCurrentStatus = useCallback(() => {
        const updatedData = rowData.map((row) => {
            if ('isSeparator' in row && row.isSeparator) {
                return row;
            }

            return {
                ...row,
                [CURRENT_CONNECTION_STATUS]:
                    row[PREV_CONNECTION_STATUS] === intl.formatMessage({ id: 'Open' })
                        ? true
                        : row[PREV_CONNECTION_STATUS] === intl.formatMessage({ id: 'Closed' })
                          ? false
                          : null,
                isModified: true,
            };
        });
        replace(updatedData);
    }, [rowData, replace, intl]);

    return (
        <Grid container spacing={2}>
            <Grid item xs={4}>
                <TextField
                    fullWidth
                    label="ID"
                    value={equipmentId}
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
                    //startIcon=
                    disabled={!isUpdate}
                >
                    {intl.formatMessage({ id: 'copyPreviousTopologyStatus' })}
                </Button>
            </Grid>
            <Grid item xs={12} sx={styles.grid}>
                <div className="ag-theme-material" style={{ height: 500, width: '100%' }}>
                    <CustomAGGrid
                        getRowId={getRowId}
                        rowData={rowData}
                        defaultColDef={defaultColDef}
                        columnDefs={columnDefs}
                        getRowClass={getRowClass}
                    />
                </div>
            </Grid>
        </Grid>
    );
}
