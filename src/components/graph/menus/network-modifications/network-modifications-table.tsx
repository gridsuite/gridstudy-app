import React, { useCallback, useMemo, ReactNode, SetStateAction } from 'react';
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
import { RemoveRedEye as RemoveRedEyeIcon } from '@mui/icons-material';
import { Badge, Box, useTheme } from '@mui/material';
import { NetworkModificationInfos } from './network-modification-menu.type';
import CellRendererSwitch from 'components/graph/menus/network-modifications/cell-renderer-switch';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import ChipRootNetworkCellRenderer from 'components/graph/menus/network-modifications/chip-root-network-cell-renderer';
import { useIntl } from 'react-intl';
import {
    NetworkModificationEditorNameHeader,
    NetworkModificationEditorNameHeaderProps,
} from './network-modification-node-editor-name-header';
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';

interface NetworkModificationsTableProps extends Omit<NetworkModificationEditorNameHeaderProps, 'modificationCount'> {
    modifications: NetworkModificationInfos[];
    setModifications: React.Dispatch<SetStateAction<NetworkModificationInfos[]>>;
    handleCellClick?: (event: CellClickedEvent) => void;
    isRowDragEnabled?: boolean;
    isDragging?: boolean;
    onRowDragStart?: (event: RowDragEnterEvent) => void;
    onRowDragEnd?: (event: RowDragEndEvent) => void;
    onRowSelected?: (event: RowSelectedEvent) => void;
}

const NetworkModificationsTable: React.FC<NetworkModificationsTableProps> = ({
    modifications,
    setModifications,
    handleCellClick,
    isRowDragEnabled,
    isDragging,
    onRowDragStart,
    onRowDragEnd,
    onRowSelected,
    ...nameHeaderProps
}) => {
    const theme = useTheme();
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const intl = useIntl();
    const { computeLabel } = useModificationLabelComputer();

    const defaultColumnDefinition: ColDef<NetworkModificationInfos> = {
        sortable: false,
        resizable: false,
        suppressMovable: true,
        cellStyle: { padding: 0 },
    };

    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

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

    const columnDefs = useMemo(() => {
        const staticColumns: ColDef<NetworkModificationInfos>[] = [
            {
                colId: 'modificationName',
                rowDrag: isDragging,
                headerComponent: NetworkModificationEditorNameHeader,
                headerComponentParams: { modificationCount: modifications?.length, ...nameHeaderProps },
                cellRenderer: (params: ICellRendererParams<NetworkModificationInfos>) =>
                    getModificationLabel(params?.data?.modificationInfos),
                minWidth: 200,
                flex: 1,
                cellStyle: { cursor: 'pointer' },
            },
            {
                cellRenderer: CellRendererSwitch,
                cellRendererParams: {
                    setModifications: setModifications,
                },
                maxWidth: 99,
                width: 99,
            },
        ];
        const newDynamicColumns: ColDef<NetworkModificationInfos>[] = enableDeveloperMode
            ? rootNetworks.map((rootNetwork) => {
                  const rootNetworkUuid = rootNetwork.rootNetworkUuid;
                  const isCurrentRootNetwork = rootNetworkUuid === currentRootNetworkUuid;
                  return {
                      colId: rootNetworkUuid,
                      cellRenderer: ChipRootNetworkCellRenderer,
                      cellRendererParams: {
                          rootNetwork: rootNetwork,
                          setModifications: setModifications,
                      },
                      cellStyle: { textAlign: 'center' },
                      headerStyle: { padding: 0 },
                      maxWidth: 72,
                      minWidth: 72,
                      headerComponent: () =>
                          isCurrentRootNetwork && (
                              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                  <Badge overlap="circular" color="primary" variant="dot">
                                      <RemoveRedEyeIcon />
                                  </Badge>
                              </Box>
                          ),
                  };
              })
            : [];

        return [...staticColumns, ...newDynamicColumns];
    }, [
        isDragging,
        modifications?.length,
        rootNetworks,
        currentRootNetworkUuid,
        enableDeveloperMode,
        getModificationLabel,
        setModifications,
        nameHeaderProps,
    ]);

    const getRowId = (params: GetRowIdParams<NetworkModificationInfos>) => params.data.modificationInfos.uuid;

    const getRowStyle = useCallback((cellData: RowClassParams<NetworkModificationInfos, unknown>) => {
        const style: RowStyle = {};
        if (!cellData?.data?.modificationInfos?.activated) {
            style.opacity = 0.4;
        }
        return style;
    }, []);

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
                columnDefs={columnDefs}
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
