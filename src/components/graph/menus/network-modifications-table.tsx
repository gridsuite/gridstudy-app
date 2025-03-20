/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo, ReactNode } from 'react';
import { CustomAGGrid, NetworkModificationMetadata, useModificationLabelComputer } from '@gridsuite/commons-ui';
import {
    CellClickedEvent,
    ColDef,
    GetRowIdParams,
    ICellRendererParams,
    RowClassParams,
    RowDragEndEvent,
    RowDragEnterEvent,
    RowSelectedEvent,
    RowStyle,
} from 'ag-grid-community';
import CustomHeaderComponent from 'components/custom-aggrid/custom-aggrid-header';
import { RemoveRedEye as RemoveRedEyeIcon } from '@mui/icons-material';
import { Badge, useTheme } from '@mui/material';
import { NetworkModificationInfos } from './network-modification-menu.type';
import CellRendererSwitch from 'components/spreadsheet/utils/cell-renderer-switch';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import ChipRootNetworkCellRenderer from 'components/spreadsheet/utils/chip-root-network-cell-renderer';
import { FormattedMessage, useIntl } from 'react-intl';

interface NetworkModificationsTableProps {
    modifications: NetworkModificationInfos[];
    isLoading?: () => boolean;
    handleCellClick?: (event: CellClickedEvent) => void;
    isRowDragEnabled?: boolean;
    onRowDragStart?: (event: RowDragEnterEvent) => void;
    onRowDragEnd?: (event: RowDragEndEvent) => void;
    onRowSelected?: (event: RowSelectedEvent) => void;
}

const NetworkModificationsTable: React.FC<NetworkModificationsTableProps> = ({
    modifications,
    handleCellClick,
    isRowDragEnabled,
    onRowDragStart,
    onRowDragEnd,
    onRowSelected,
    isLoading,
}) => {
    const theme = useTheme();
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);

    const intl = useIntl();
    const { computeLabel } = useModificationLabelComputer();

    const defaultColumnDefinition = {
        sortable: false,
        resizable: false,
        suppressMovable: true,
    };

    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const dynamicColumnsRef = useRef<ColDef<NetworkModificationInfos>[]>([]);

    const getModificationLabel = useCallback(
        (modif?: NetworkModificationMetadata): ReactNode => {
            if (!modif) {
                return '';
            }
            return intl.formatMessage(
                { id: 'network_modifications.' + modif.messageType },
                {
                    ...modif,
                    ...computeLabel(modif),
                }
            );
        },
        [computeLabel, intl]
    );

    const staticColumns: ColDef<NetworkModificationInfos>[] = useMemo(() => {
        const numberOfRootNetworks = rootNetworks.length;
        const staticColumnFlex = numberOfRootNetworks > 1 ? 1 : 0.3;
        return [
            {
                colId: 'modificationName',
                headerComponent: () => (
                    <>
                        <FormattedMessage
                            id={'network_modifications.modificationsCount'}
                            values={{
                                count: modifications?.length ?? '',
                                hide: isLoading?.(),
                            }}
                        />
                    </>
                ),
                cellRenderer: (params: ICellRendererParams<NetworkModificationInfos>) =>
                    getModificationLabel(params?.data?.modificationInfos),
                minWidth: 250,
                cellStyle: { cursor: 'pointer' },
            },
            {
                cellRenderer: CellRendererSwitch,
                flex: staticColumnFlex, // Dynamic width based on root network count
            },
        ];
    }, [isLoading, modifications?.length, getModificationLabel, rootNetworks.length]);

    const [columnDefs, setColumnDefs] = useState<ColDef<NetworkModificationInfos>[]>(staticColumns);

    useEffect(() => {
        const numberOfRootNetworks = rootNetworks.length;

        const dynamicColumnFlex = numberOfRootNetworks > 1 ? 1 : 0.4; // Adjust based on root networks count
        const newDynamicColumns: ColDef<NetworkModificationInfos>[] = rootNetworks.map((rootNetwork) => {
            const rootNetworkUuid = rootNetwork.rootNetworkUuid;
            const isCurrentRootNetwork = rootNetworkUuid === currentRootNetworkUuid;
            return {
                colId: rootNetworkUuid,
                maxWidth: 100,
                flex: dynamicColumnFlex,
                cellRenderer: (param: ICellRendererParams<NetworkModificationInfos>) => (
                    <ChipRootNetworkCellRenderer rootNetwork={rootNetwork} {...param} />
                ),
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
                    flex: 0.2,
                },
            };
        });

        if (JSON.stringify(newDynamicColumns) !== JSON.stringify(dynamicColumnsRef.current)) {
            dynamicColumnsRef.current = newDynamicColumns;
            setColumnDefs([...staticColumns, ...newDynamicColumns]);
        }
    }, [rootNetworks, currentRootNetworkUuid, staticColumns]);

    const getRowId = (params: GetRowIdParams<NetworkModificationInfos>) => params.data.modificationInfos.uuid;

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
        rowDrag: col.colId === 'modificationName',
    }));

    return (
        <div style={{ position: 'relative', flexGrow: 1, marginTop: theme.spacing(1) }}>
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
        </div>
    );
};

export default NetworkModificationsTable;
