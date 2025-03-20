import React, { useCallback, useMemo, ReactNode } from 'react';
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
import { useIntl } from 'react-intl';
import {
    NetworkModificationEditorNameHeader,
    NetworkModificationEditorNameHeaderProps,
} from './network-modification-node-editor-name-header';

interface NetworkModificationsTableProps extends Omit<NetworkModificationEditorNameHeaderProps, 'modificationCount'> {
    modifications: NetworkModificationInfos[];
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
    ...nameHeaderProps
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

    const columnDefs = useMemo<ColDef<NetworkModificationInfos>[]>(() => {
        const numberOfRootNetworks = rootNetworks.length;
        const dynamicColumnFlex = numberOfRootNetworks > 1 ? 1 : 0.4; // Adjust based on root networks count
        const staticColumns = [
            {
                colId: 'modificationName',
                rowDrag: true,
                headerComponent: NetworkModificationEditorNameHeader,
                headerComponentParams: { modificationCount: modifications?.length, ...nameHeaderProps },
                cellRenderer: (params: ICellRendererParams<NetworkModificationInfos>) =>
                    getModificationLabel(params?.data?.modificationInfos),
                minWidth: 200,
                flex: 1,
                cellStyle: { cursor: 'pointer', paddingLeft: '10px' },
            },
            {
                cellRenderer: CellRendererSwitch,
                flex: 0.3,
                minWidth: 70,
            },
        ];
        const newDynamicColumns: ColDef<NetworkModificationInfos>[] = rootNetworks.map((rootNetwork) => {
            const rootNetworkUuid = rootNetwork.rootNetworkUuid;
            const isCurrentRootNetwork = rootNetworkUuid === currentRootNetworkUuid;
            return {
                colId: rootNetworkUuid,
                maxWidth: 100,
                flex: dynamicColumnFlex,
                cellRenderer: ChipRootNetworkCellRenderer,
                cellRendererParams: {
                    rootNetwork: rootNetwork,
                },
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

        return [...staticColumns, ...newDynamicColumns];
    }, [modifications?.length, rootNetworks, currentRootNetworkUuid, getModificationLabel, nameHeaderProps]);

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
