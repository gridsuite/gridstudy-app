/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SwitchInfos } from './voltage-level-topology.type';
import { useEffect, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { filledTextField } from '../../dialog-utils';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { styles } from '../tabular-creation/tabular-creation-utils';
import { useIntl } from 'react-intl';
import {
    CURRENT_CONNECTION_STATUS,
    PREV_CONNECTION_STATUS,
    SWITCH_ID,
    TOPOLOGY_MODIFICATION_TABLE,
} from '../../../utils/field-constants';
import { useFieldArray } from 'react-hook-form';
import { EquipmentAttributeModificationInfos } from '../../../../services/network-modification-types';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { HeaderComponentWithTooltip } from './header-component-with-tooltip';
import { BooleanNullableCellRenderer } from './multi-state-checkbox-cell-render';

export function VoltageLevelTopologyModificationForm({
    currentNode,
    equipmentId,
    switches,
    equipmentAttributeModification,
}: {
    currentNode: CurrentTreeNode;
    equipmentId: string;
    switches: SwitchInfos[];
    equipmentAttributeModification?: EquipmentAttributeModificationInfos[];
}) {
    const intl = useIntl();
    const { replace } = useFieldArray({
        name: `${TOPOLOGY_MODIFICATION_TABLE}`,
    });

    const rowData = useMemo(() => {
        const isSwitchModified = (switchId: string) => {
            return equipmentAttributeModification?.some((mod) => mod.equipmentId === switchId) || false;
        };
        const unmodifiedSwitches = switches
            .filter((sw) => !isSwitchModified(sw.id))
            .map((switchRow) => ({
                [SWITCH_ID]: switchRow.id,
                [PREV_CONNECTION_STATUS]: intl.formatMessage({
                    id: switchRow.open ? 'Open' : 'Closed',
                }),
                [CURRENT_CONNECTION_STATUS]: null,
                isModified: false,
            }));

        const modifiedSwitches = switches
            .filter((sw) => isSwitchModified(sw.id))
            .map((switchRow) => ({
                [SWITCH_ID]: switchRow.id,
                [PREV_CONNECTION_STATUS]: intl.formatMessage({
                    id: switchRow.open ? 'Open' : 'Closed',
                }),
                [CURRENT_CONNECTION_STATUS]:
                    equipmentAttributeModification?.find((mod) => mod.equipmentId === switchRow.id)
                        ?.equipmentAttributeValue ?? null,
                isModified: true,
            }));

        const separatorRow = {
            [SWITCH_ID]: '',
            [PREV_CONNECTION_STATUS]: '',
            [CURRENT_CONNECTION_STATUS]: null,
            isSeparator: true,
        };
        return [...modifiedSwitches, separatorRow, ...unmodifiedSwitches];
    }, [equipmentAttributeModification, intl, switches]);

    useEffect(() => {
        if (rowData.length > 0) {
            const updatedData = rowData.map((row) => ({
                ...row,
                currentConnectionStatus: row.currentConnectionStatus === undefined ? null : row.currentConnectionStatus,
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

    const columnDefs: any = useMemo(
        () => [
            {
                field: SWITCH_ID,
                filter: true,
                flex: 1,
                cellStyle: (params: any) => {
                    return params.data.isSeparator ? { backgroundColor: '#f0f0f0', fontWeight: 'bold' } : {};
                },
                headerComponent: HeaderComponentWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'switchId' }),
                    isNodeBuilt: isNodeBuilt(currentNode),
                },
            },
            {
                field: PREV_CONNECTION_STATUS,
                flex: 1,
                cellStyle: (params: any) => {
                    return params.data.isSeparator ? { backgroundColor: '#f0f0f0', fontWeight: 'bold' } : {};
                },
                headerComponent: HeaderComponentWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'previousStatus' }),
                    isNodeBuilt: isNodeBuilt(currentNode),
                },
            },
            {
                field: CURRENT_CONNECTION_STATUS,
                flex: 1,
                cellRenderer: (params: any) => {
                    if (params.data.isSeparator) {
                        return '';
                    }
                    return BooleanNullableCellRenderer(params);
                },
                cellStyle: (params: any) => {
                    return params.data.isSeparator ? { backgroundColor: '#f0f0f0', fontWeight: 'bold' } : {};
                },
                headerComponent: HeaderComponentWithTooltip,
                headerComponentParams: {
                    displayName: intl.formatMessage({ id: 'currentStatus' }),
                    isNodeBuilt: isNodeBuilt(currentNode),
                },
                editable: false,
            },
        ],
        [currentNode, intl]
    );

    const getRowId = (params: any) => {
        if (params.data.isSeparator) {
            return 'separator-row';
        }
        return params.data[SWITCH_ID];
    };

    const modifiedSwitchIds = useMemo(() => {
        const switchSet = new Set<string>();
        if (equipmentAttributeModification && equipmentAttributeModification.length > 0) {
            equipmentAttributeModification.forEach((mod: EquipmentAttributeModificationInfos) => {
                switchSet.add(mod.equipmentId);
            });
        }
        return switchSet;
    }, [equipmentAttributeModification]);

    const getRowClass = (params: any): string => {
        if (params.rowIndex > 0) {
            const currentRowIsModified = modifiedSwitchIds.has(params.data[SWITCH_ID]);
            const prevRowData = params.api.getDisplayedRowAtIndex(params.rowIndex - 1).data;
            const prevRowIsModified = modifiedSwitchIds.has(prevRowData[SWITCH_ID]);
            if (!currentRowIsModified && prevRowIsModified) {
                return 'separator-row';
            }
        }
        return '';
    };

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
            <Grid item xs={12} sx={styles.grid}>
                <div className="ag-theme-material" style={{ height: 400, width: '100%' }}>
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
