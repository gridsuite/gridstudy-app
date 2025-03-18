/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo, ReactElement, ReactNode } from 'react';
import { CustomAGGrid, NetworkModificationMetadata } from '@gridsuite/commons-ui';
import { CellClickedEvent, RowClassParams, RowStyle } from 'ag-grid-community';
import CustomHeaderComponent from 'components/custom-aggrid/custom-aggrid-header';
import { RemoveRedEye as RemoveRedEyeIcon } from '@mui/icons-material';
import { Badge } from '@mui/material';
import { NetworkModificationInfos } from './network-modification-menu.type';
import { ChipCellRenderer } from 'components/spreadsheet/utils/cell-renderers';
import CellRendererSwitch from 'components/spreadsheet/utils/cell-renderer-switch';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';

interface NetworkModificationsTableProps {
    modifications: NetworkModificationInfos[];
    setModifications: React.Dispatch<React.SetStateAction<NetworkModificationInfos[]>>;
    isLoading?: () => boolean;
    isAnyNodeBuilding?: boolean;
    mapDataLoading?: boolean;
    handleSwitchAction?: (item: NetworkModificationInfos) => ReactElement | null;
    handleCellClick?: (event: CellClickedEvent) => void;
    isRowDragEnabled?: boolean;
    onRowDragStart?: (event: any) => void;
    onRowDragEnd?: (event: any) => void;
    onRowSelected?: (event: any) => void;
}

const NetworkModificationsTable: React.FC<NetworkModificationsTableProps> = ({
    modifications,
    handleCellClick,
    isRowDragEnabled,
    onRowDragStart,
    onRowDragEnd,
    onRowSelected,
}) => {
    const defaultColumnDefinition = {
        sortable: false,
        resizable: false,
        suppressMovable: true,
    };

    const modificationRef = useRef<NetworkModificationInfos | null>(null);
    const firstModification = modifications[0];
    if (firstModification) {
        modificationRef.current = firstModification;
    }

    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const dynamicColumnsRef = useRef<any[]>([]);

    const getModificationLabel = (modif: NetworkModificationMetadata): ReactNode => {
        return modif ? modif.messageValues : '';
    };

    const staticColumns = useMemo(
        () => [
            {
                headerName: 'Modification Name',
                field: 'modificationName',
                valueGetter: (params: any) => getModificationLabel(params?.data.modificationInfos),
                minWidth: 300,
                flex: 1,
                cellStyle: { cursor: 'pointer' },
            },
            {
                cellRenderer: CellRendererSwitch,
                minWidth: 100,
                flex: 1,
            },
        ],
        []
    );

    const [columnDefs, setColumnDefs] = useState<any[]>(staticColumns);

    useEffect(() => {
        if (!modificationRef.current?.activationStatusByRootNetwork) {
            return;
        }
        const newDynamicColumns = Object.keys(modificationRef.current.activationStatusByRootNetwork).map(
            (rootNetworkUuid) => {
                const isCurrentRootNetwork = rootNetworkUuid === currentRootNetworkUuid;
                return {
                    minWidth: 100,
                    flex: 1,
                    cellRenderer: ChipCellRenderer,
                    headerComponent: CustomHeaderComponent,
                    headerComponentParams: {
                        icon: (
                            <Badge
                                overlap="circular"
                                color="primary"
                                variant="dot"
                                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            >
                                <RemoveRedEyeIcon />
                            </Badge>
                        ),
                        shouldShowIcon: isCurrentRootNetwork,
                    },
                };
            }
        );

        if (JSON.stringify(newDynamicColumns) !== JSON.stringify(dynamicColumnsRef.current)) {
            dynamicColumnsRef.current = newDynamicColumns;
            setColumnDefs([...staticColumns, ...newDynamicColumns]);
        }
    }, [modificationRef.current?.activationStatusByRootNetwork, currentRootNetworkUuid, staticColumns]);

    const getRowId = (params: any) => params?.data?.modificationInfos?.uuid;

    const getRowStyle = useCallback((cellData: RowClassParams<NetworkModificationInfos, unknown>) => {
        const style: RowStyle = {};
        if (!cellData?.data?.modificationInfos?.activated) {
            style.opacity = 0.4;
        }
        return style;
    }, []);

    // Modify column definitions to include row drag for 'modificationName' column
    const modifiedColumnDefs = columnDefs.map((col) => ({
        ...col,
        rowDrag: col.field === 'modificationName' && isRowDragEnabled,
    }));

    return (
        <CustomAGGrid
            rowData={modifications}
            getRowId={getRowId}
            rowSelection={{
                mode: 'multiRow',
                enableClickSelection: false,
                checkboxes: true,
                headerCheckbox: true,
            }}
            defaultColDef={defaultColumnDefinition}
            onCellClicked={handleCellClick}
            onRowSelected={onRowSelected}
            animateRows
            columnDefs={modifiedColumnDefs}
            getRowStyle={getRowStyle}
            rowClass="custom-row-class"
            onRowDragEnter={onRowDragStart}
            onRowDragEnd={onRowDragEnd}
            rowDragManaged={isRowDragEnabled}
        />
    );
};

export default NetworkModificationsTable;
