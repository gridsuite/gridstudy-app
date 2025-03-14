import React, { useState, useCallback, useRef, ReactNode, ReactElement } from 'react';
import { CustomAGGrid, NetworkModificationMetadata, useModificationLabelComputer } from '@gridsuite/commons-ui'; // Assuming this is the type
import { CellClickedEvent } from 'ag-grid-community';
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
}) => {
    const defaultColumnDefinition = {
        sortable: false,
        resizable: false,
        suppressMovable: true,
    };

    const gridRef = useRef<any>(null); // Assuming this is the type for CustomAGGrid
    const [columnDefs] = useState([
        {
            headerName: 'Modification Name',
            field: 'modificationName',
            valueGetter: (params: any) => params?.data.messageValues,
            minWidth: 300,
            flex: 1,
            cellStyle: { cursor: 'pointer' }, // Apply cursor style only for this column
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

    const handleRowSelected = useCallback((event: any) => {
        console.log('Row selected:', event);
    }, []);

    const recomputeOverFlowableCells = useCallback((event: any) => {
        console.log('Grid size changed, recomputing overflowable cells...');
    }, []);

    const getRowId = (params: any) => {
        return params?.data?.uuid; // Assuming 'uuid' is unique for each row
    };
    // Adding rowDrag to the column definitions if you want the row to be draggable
    const modifiedColumnDefs = columnDefs.map((col) => ({
        ...col,
        // Enable dragging only for a specific column, or apply it globally
        rowDrag: col.field === 'modificationName', // Adjust condition based on your needs
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
            onRowSelected={handleRowSelected}
            onGridSizeChanged={recomputeOverFlowableCells}
            animateRows
            // gridOptions={{
            //     headerHeight: 0,  // Hide header row by setting its height to 0
            //   }}
            columnDefs={modifiedColumnDefs}
            rowClass="custom-row-class"
            onRowDragEnter={onRowDragStart} // Trigger on drag start
            onRowDragEnd={onRowDragEnd} // Add row drag end handler
            rowDragManaged={isRowDragEnabled} // Enables row drag behavior
        />
    );
};

export default NetworkModificationsTable;
