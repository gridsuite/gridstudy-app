import React, { useState, useCallback, useRef, ReactElement, ReactNode } from 'react';
import { CustomAGGrid, NetworkModificationMetadata, useModificationLabelComputer } from '@gridsuite/commons-ui'; // Assuming this is the type
import { CellClickedEvent, RowClassParams, RowStyle } from 'ag-grid-community';
import CustomHeaderComponent from 'components/custom-aggrid/custom-aggrid-header';
import { RemoveRedEye as RemoveRedEyeIcon } from '@mui/icons-material';
import { Badge } from '@mui/material';
import { NetworkModificationInfos } from './network-modification-menu.type';
import { ChipCellRenderer } from 'components/spreadsheet/utils/cell-renderers';
import CellRendererSwitch from 'components/spreadsheet/utils/cell-renderer-switch';
import { useIntl } from 'react-intl';
interface NetworkModificationsTableProps {
    modifications: NetworkModificationInfos[];
    setModifications: React.Dispatch<React.SetStateAction<NetworkModificationInfos[]>>;
    isLoading?: () => boolean;
    isAnyNodeBuilding?: boolean;
    mapDataLoading?: boolean;
    handleSwitchAction?: (item: NetworkModificationInfos) => ReactElement | null;

    handleCellClick?: (event: CellClickedEvent) => void;
    isRowDragEnabled?: boolean; // prop to enable/disable drag
    onRowDragStart?: (event: any) => void;
    onRowDragEnd?: (event: any) => void;
    onRowSelected?: (event: any) => void;
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

    // const dynamicColumns = rootNetworkChanges.map((network, index) => ({
    //     headerName: `Network ${index + 1}`,
    //     field: `network_${index}`,
    //     cellRenderer: ChipCellRenderer,
    //     minWidth: 100,
    //     flex: 1,
    // }));

    //TO CHECK TO DO MAISSA
    const intl = useIntl();
    const { computeLabel } = useModificationLabelComputer();
    const getModificationLabel = (modif: NetworkModificationMetadata): ReactNode => {
        if (!modif) {
            return '';
        }
        
        return modif.messageValues;
        // return intl.formatMessage(
        //     { id: 'network_modifications.' + modif.messageValues },
        //     {
        //         ...modif,
        //         ...computeLabel(modif),
        //     }
        // );
    };
    const gridRef = useRef<any>(null);
    const [columnDefs] = useState([
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
        {
            cellRenderer: ChipCellRenderer,
            minWidth: 100,
            flex: 1,
            headerComponent: CustomHeaderComponent,
            headerComponentParams: {
                icon: (
                    <Badge
                        overlap="circular"
                        color="primary"
                        variant="dot"
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <RemoveRedEyeIcon />
                    </Badge>
                ),
            },
        },

        { cellRenderer: ChipCellRenderer, minWidth: 100, flex: 1 },
        { cellRenderer: ChipCellRenderer, minWidth: 100, flex: 1 },
        // ...dynamicColumns, // Add dynamically generated columns
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
        return params?.data?.modificationInfos?.uuid; // Assuming 'uuid' is unique for each row
    };
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
        rowDrag: col.field === 'modificationName' && isRowDragEnabled, // Enable dragging only for 'modificationName' column
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
