import React, { useState, useEffect, useCallback, useRef, ReactElement, ReactNode } from 'react';
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

    const firstModification = modifications[0];
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const getModificationLabel = (modif: NetworkModificationMetadata): ReactNode => {
        if (!modif) {
            return '';
        }
        return modif.messageValues;
    };

    const gridRef = useRef<any>(null);

    // Static columns definition
    const staticColumns = [
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
        
     ];

    // Initialize dynamic columns state
    const [columnDefs, setColumnDefs] = useState<any[]>(staticColumns);

    useEffect(() => {
        const dynamicColumns = firstModification?.activationStatusByRootNetwork
            ? Object.keys(firstModification.activationStatusByRootNetwork).map((rootNetworkUuid) => {
                  const isCurrentRootNetwork = rootNetworkUuid === currentRootNetworkUuid;
                  return {
                      minWidth: 100,
                      flex: 1,
                      cellRenderer: ChipCellRenderer,  // Apply the ChipCellRenderer here
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
                          shouldShowIcon: isCurrentRootNetwork,
                      },
                  };
              })
            : [];

        // Combine static and dynamic columns
        setColumnDefs((prevColumnDefs) => [...prevColumnDefs, ...dynamicColumns]);
    }, [firstModification?.activationStatusByRootNetwork, currentRootNetworkUuid]); // Re-run when modifications or currentRootNetworkUuid change

    // Event handlers
    const onGridReady = useCallback((params: any) => {
        console.log('Grid is ready!', params);
    }, []);

    const getRowId = (params: any) => {
        return params?.data?.modificationInfos?.uuid;
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
        rowDrag: col.field === 'modificationName' && isRowDragEnabled,
    }));

    return (
        <CustomAGGrid
            ref={gridRef}
            rowData={modifications}
            getRowId={getRowId}
            rowSelection={{
                mode: 'multiRow',
                enableClickSelection: false,
                checkboxes: true,
                headerCheckbox: true,
            }}
            defaultColDef={defaultColumnDefinition}
            onGridReady={onGridReady}
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
