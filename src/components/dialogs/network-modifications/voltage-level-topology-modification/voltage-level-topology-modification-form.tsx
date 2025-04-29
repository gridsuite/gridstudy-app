/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { EquipmentAttributeModificationInfos } from '../../../../services/network-modification-types';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { Button, Grid, Paper, TextField, Typography, useTheme } from '@mui/material';
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
import ResetSettings from '@material-symbols/svg-400/outlined/reset_settings.svg?react';
import { useFormContext, useWatch } from 'react-hook-form';
import { SwitchRowForm } from './voltage-level-topology.type';

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
    const theme = useTheme();
    const { getValues, setValue } = useFormContext();
    const isSwitchModified = useCallback(
        (switchId: string): boolean => {
            return switchesEditData?.some((mod) => mod.equipmentId === switchId) || false;
        },
        [switchesEditData]
    );

    const watchTable = useWatch({
        name: TOPOLOGY_MODIFICATION_TABLE,
    });

    const mergedRowData = useMemo(() => {
        const SEPARATOR_TYPE = 'SEPARATOR';
        const SWITCH_TYPE = 'SWITCH';
        const result = [];

        const sortedWatchTable = [...(watchTable || [])].sort((a, b) =>
            (a.switchId || '').localeCompare(b.switchId || '')
        );

        const modifiedSwitches =
            sortedWatchTable
                ?.filter((sw: SwitchRowForm) => sw.switchId && isSwitchModified(sw.switchId))
                .sort((a: SwitchRowForm, b: SwitchRowForm) => a.switchId.localeCompare(b.switchId)) || [];
        const unmodifiedSwitches =
            sortedWatchTable
                ?.filter((sw: SwitchRowForm) => sw.switchId && !isSwitchModified(sw.switchId))
                .sort((a: SwitchRowForm, b: SwitchRowForm) => a.switchId.localeCompare(b.switchId)) || [];

        if (modifiedSwitches.length > 0) {
            result.push({
                type: SEPARATOR_TYPE,
                id: 'modified-separator',
                title: intl.formatMessage({ id: 'modifiedSwitchesSeparatorTitle' }) + ` (${modifiedSwitches.length})`,
                count: modifiedSwitches.length,
                [SWITCH_ID]: '',
                [PREV_CONNECTION_STATUS]: '',
                [CURRENT_CONNECTION_STATUS]: null,
            });
            modifiedSwitches.forEach((sw: SwitchInfos) => {
                const matchingAttributeEditData = switchesEditData?.find(
                    (attr: EquipmentAttributeModificationInfos) => attr.equipmentId === sw.id
                );
                result.push({
                    ...sw,
                    type: SWITCH_TYPE,
                    isModified: true,
                    [CURRENT_CONNECTION_STATUS]: isNodeBuilt(currentNode)
                        ? sw.open
                        : matchingAttributeEditData
                          ? matchingAttributeEditData.equipmentAttributeValue
                          : sw.open,
                });
            });
            if (unmodifiedSwitches.length > 0) {
                result.push({
                    type: SEPARATOR_TYPE,
                    id: 'unmodified-separator',
                    title:
                        intl.formatMessage({ id: 'unModifiedSwitchesSeparatorTitle' }) +
                        ` (${unmodifiedSwitches.length})`,
                    count: unmodifiedSwitches.length,
                    [SWITCH_ID]: '',
                    [PREV_CONNECTION_STATUS]: '',
                    [CURRENT_CONNECTION_STATUS]: null,
                });

                unmodifiedSwitches.forEach((sw: SwitchInfos) => {
                    result.push({
                        ...sw,
                        type: SWITCH_TYPE,
                        isModified: false,
                    });
                });
            }
        } else {
            unmodifiedSwitches.forEach((sw: SwitchInfos) => {
                result.push({
                    ...sw,
                    type: SWITCH_TYPE,
                    isModified: false,
                });
            });
        }
        return result;
    }, [watchTable, isSwitchModified, intl, switchesEditData, currentNode]);

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

    const SeparatorCellRenderer = (props: { data: { type: string }; value: string }) => {
        if (props.data.type === 'SEPARATOR') {
            return (
                <Typography
                    variant="subtitle1"
                    sx={{
                        backgroundColor: '#f3f3f3',
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        width: '100%',
                    }}
                >
                    {props.value}
                </Typography>
            );
        }
        return props.value;
    };

    const columnDefs = useMemo(
        () => [
            {
                field: SWITCH_ID,
                filter: true,
                flex: 2,
                cellRenderer: (params: { data?: any; node?: any }) => {
                    if (params.data.type === 'SEPARATOR') {
                        return SeparatorCellRenderer({
                            data: params.data,
                            value: params.data.title,
                        });
                    } else {
                        return params.data[SWITCH_ID];
                    }
                },
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
                field: CURRENT_CONNECTION_STATUS,
                flex: 1,
                cellRenderer: (params: { data?: any; node?: any }) => {
                    if (params.data.type === 'SEPARATOR') {
                        return null;
                    }
                    const formIndex = watchTable.findIndex(
                        (item: SwitchRowForm) => item.switchId === params.data.switchId
                    );
                    return BooleanNullableCellRenderer({
                        name: `${TOPOLOGY_MODIFICATION_TABLE}[${formIndex}].${CURRENT_CONNECTION_STATUS}`,
                        connected: params.data.currentConnectionStatus,
                    });
                },
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
        [currentNode, intl, isUpdate, watchTable]
    );

    const copyPreviousToCurrentStatus = useCallback(() => {
        const formValues = getValues(TOPOLOGY_MODIFICATION_TABLE);
        formValues.forEach((row: SwitchRowForm, index: number) => {
            if (row.type === 'SEPARATOR') {
                return;
            }
            const isOpen = row[PREV_CONNECTION_STATUS] === intl.formatMessage({ id: 'Open' });
            const isClosed = row[PREV_CONNECTION_STATUS] === intl.formatMessage({ id: 'Closed' });
            const newValue = isOpen ? true : isClosed ? false : null;
            setValue(`${TOPOLOGY_MODIFICATION_TABLE}[${index}].${CURRENT_CONNECTION_STATUS}`, newValue);
        });
    }, [getValues, setValue, intl]);

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
                    startIcon={
                        <ResetSettings
                            style={{
                                width: 24,
                                height: 24,
                                fill: !isUpdate ? theme.palette.action.disabled : theme.palette.primary.main,
                                opacity: !isUpdate ? 0.3 : 1,
                            }}
                        />
                    }
                    disabled={!isUpdate}
                >
                    {intl.formatMessage({ id: 'copyPreviousTopologyStatus' })}
                </Button>
            </Grid>

            <Grid item xs={12}>
                <Paper
                    elevation={1}
                    sx={{
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                    }}
                >
                    <div className="ag-theme-material" style={{ height: 600, width: '100%' }}>
                        <CustomAGGrid
                            rowData={mergedRowData}
                            defaultColDef={defaultColDef}
                            columnDefs={columnDefs}
                            suppressMovableColumns={true}
                            animateRows={false}
                            domLayout="normal"
                            headerHeight={48}
                        />
                    </div>
                </Paper>
            </Grid>
        </Grid>
    );
}
