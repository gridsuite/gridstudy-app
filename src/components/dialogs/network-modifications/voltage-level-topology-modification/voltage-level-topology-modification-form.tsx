/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { Button, Grid, TextField, useTheme } from '@mui/material';
import {
    CURRENT_CONNECTION_STATUS,
    PREV_CONNECTION_STATUS,
    SWITCH_ID,
    TOPOLOGY_MODIFICATION_TABLE,
} from '../../../utils/field-constants';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { filledTextField } from '../../dialog-utils';
import HeaderWithTooltip from './header-with-tooltip';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import ConnectionCellRenderer from './connection-cell-render';
import ResetSettings from '@material-symbols/svg-400/outlined/reset_settings.svg?react';
import { useFormContext } from 'react-hook-form';
import { SwitchRowForm } from './voltage-level-topology.type';
import SeparatorCellRenderer from './separator-cell-renderer';

interface VoltageLevelTopologyModificationFormProps {
    currentNode: CurrentTreeNode;
    selectedId: string;
    mergedRowData: SwitchRowForm[];
    isUpdate: boolean;
}

export function VoltageLevelTopologyModificationForm({
    currentNode,
    selectedId,
    mergedRowData,
    isUpdate,
}: Readonly<VoltageLevelTopologyModificationFormProps>) {
    const intl = useIntl();
    const theme = useTheme();
    const { getValues, setValue } = useFormContext();

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
                cellRenderer: ({ data }: { data?: any }) => {
                    if (data.type === 'SEPARATOR') {
                        return SeparatorCellRenderer({
                            value: data.title,
                        });
                    } else {
                        return data[SWITCH_ID];
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
                cellRenderer: ({ data }: { data?: any }) => {
                    if (data.type === 'SEPARATOR') {
                        return null;
                    } else {
                        return intl.formatMessage({ id: data[PREV_CONNECTION_STATUS] });
                    }
                },
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
                cellRenderer: ({ data }: { data?: any }) => {
                    if (data.type === 'SEPARATOR') {
                        return null;
                    }
                    const watchTable: SwitchRowForm[] = getValues(TOPOLOGY_MODIFICATION_TABLE);
                    const formIndex = watchTable.findIndex((item: SwitchRowForm) => item.switchId === data.switchId);
                    return ConnectionCellRenderer({
                        name: `${TOPOLOGY_MODIFICATION_TABLE}[${formIndex}].${CURRENT_CONNECTION_STATUS}`,
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
        [currentNode, intl, isUpdate, getValues]
    );

    const copyPreviousToCurrentStatus = useCallback(() => {
        const formValues = getValues(TOPOLOGY_MODIFICATION_TABLE);
        formValues.forEach((row: SwitchRowForm, index: number) => {
            if (row.type === 'SEPARATOR') {
                return;
            }
            let newValue = null;
            if (row[PREV_CONNECTION_STATUS] === 'Open') {
                newValue = true;
            } else if (row[PREV_CONNECTION_STATUS] === 'Closed') {
                newValue = false;
            }
            setValue(`${TOPOLOGY_MODIFICATION_TABLE}[${index}].${CURRENT_CONNECTION_STATUS}`, newValue, {
                shouldDirty: true,
            });
        });
    }, [getValues, setValue]);

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
            </Grid>
            <Grid xs paddingTop={2}>
                <CustomAGGrid
                    rowData={mergedRowData}
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
