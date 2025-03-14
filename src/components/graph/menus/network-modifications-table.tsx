import React, { useState, useCallback, useRef, ReactNode, ReactElement } from 'react';
import { CustomAGGrid, NetworkModificationMetadata, useModificationLabelComputer } from '@gridsuite/commons-ui'; // Assuming this is the type
import { CellClickedEvent, RowClassParams, RowStyle } from 'ag-grid-community';
import { useIntl } from 'react-intl';
import { ChipCellRenderer } from 'components/spreadsheet/utils/cell-renderers';
import CellRendererSwitch from 'components/spreadsheet/utils/cell-renderer-switch';

interface NetworkModificationsTableProps {
    modifications: NetworkModificationMetadata[];
    setModifications: React.Dispatch<React.SetStateAction<NetworkModificationMetadata[]>>;
    isLoading?: () => boolean;
    isAnyNodeBuilding?: boolean;
    mapDataLoading?: boolean;
    handleSwitchAction: (item: NetworkModificationMetadata) => ReactElement | null;

    handleCellClick: (event: CellClickedEvent) => void;
    isRowDragEnabled?: boolean; // New prop to enable/disable drag
    onRowDragStart?: (event: any) => void;
    onRowDragEnd?: (event: any) => void;
    onRowSelected: (event: any) => void;
}
const NetworkModificationsTable: React.FC<NetworkModificationsTableProps> = ({
    modifications,
    setModifications,
    handleCellClick,
    handleSwitchAction,
    isLoading,
    isAnyNodeBuilding,
    mapDataLoading,
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

    const gridRef = useRef<any>(null);
    const [columnDefs] = useState([
        {
            headerName: 'Modification Name',
            field: 'modificationName',
            valueGetter: (params: any) => params?.data.messageValues,
            minWidth: 300,
            flex: 1,
            cellStyle: { cursor: 'pointer' },
        },
        {
            headerName: 'Switch',
            cellRenderer: CellRendererSwitch,
            minWidth: 100,
            flex: 1,
        },
        {
            headerName: 'RR1',
            field: 'RR1',
            cellRenderer: ChipCellRenderer,
            minWidth: 100,
            flex: 1,
        },
        { headerName: 'RR2', field: 'RR2', cellRenderer: ChipCellRenderer, minWidth: 100, flex: 1 },
        { headerName: 'RR3', field: 'RR3', cellRenderer: ChipCellRenderer, minWidth: 100, flex: 1 },
    ]);

    // Event handlers
    const onGridReady = useCallback((params: any) => {
        console.log('Grid is ready!', params);
    }, []);

    const handleCellContextualMenu = useCallback((event: any) => {
        console.log('Cell context menu:', event);
    }, []);

    const recomputeOverFlowableCells = useCallback((event: any) => {
        console.log('Grid size changed, recomputing overflowable cells...');
    }, []);

    const getRowId = (params: any) => {
        return params?.data?.uuid; // Assuming 'uuid' is unique for each row
    };
    const getRowStyle = useCallback((cellData: RowClassParams<NetworkModificationMetadata, unknown>) => {
        const style: RowStyle = {};
        if (!cellData?.data?.activated) {
            style.opacity = 0.4;
        }
        return style;
    }, []);

    // Modify column definitions to include row drag for 'modificationName' column
    const modifiedColumnDefs = columnDefs.map((col) => ({
        ...col,
        rowDrag: col.field === 'modificationName', // Enable dragging only for 'modificationName' column
    }));
    return (
        <CustomAGGrid
            ref={gridRef}
            rowData={modifications} // Use the mapped data
            getRowId={getRowId}
            rowSelection={{
                mode: 'multiRow',
                enableClickSelection: false,
                checkboxes: true,
                headerCheckbox: true,
            }}
            defaultColDef={defaultColumnDefinition}
            onGridReady={onGridReady}
            onCellContextMenu={handleCellContextualMenu}
            onCellClicked={handleCellClick}
            onRowSelected={onRowSelected}
            onGridSizeChanged={recomputeOverFlowableCells}
            animateRows
            // gridOptions={{
            //     headerHeight: 0,  // Hide header row by setting its height to 0
            //   }}
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
