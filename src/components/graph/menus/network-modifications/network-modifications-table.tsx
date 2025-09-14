/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useMemo, SetStateAction, useRef, useEffect, useState } from 'react';
import { CustomAGGrid, NetworkModificationMetadata, useModificationLabelComputer } from '@gridsuite/commons-ui';
import {
    CellClickedEvent,
    ColDef,
    GetRowIdParams,
    IRowDragItem,
    RowClassParams,
    RowDragEndEvent,
    RowDragEnterEvent,
    RowSelectedEvent,
    RowStyle,
    ValueGetterParams,
} from 'ag-grid-community';
import { RemoveRedEye as RemoveRedEyeIcon } from '@mui/icons-material';
import { Badge, Box, Theme, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { useIntl } from 'react-intl';
import {
    NetworkModificationEditorNameHeader,
    NetworkModificationEditorNameHeaderProps,
} from './network-modification-node-editor-name-header';
import RootNetworkChipCellRenderer from './root-network-chip-cell-renderer';
import SwitchCellRenderer from './switch-cell-renderer';
import { AGGRID_LOCALES } from '../../../../translations/not-intl/aggrid-locales';
import { ExcludedNetworkModifications } from './network-modification-menu.type';
import { NetworkModificationNameCellRenderer } from 'components/custom-aggrid/cell-renderers';
import { AgGridReact } from 'ag-grid-react';

const styles = {
    container: (theme: Theme) => ({
        position: 'relative',
        flexGrow: 1,
        marginTop: theme.spacing(1),
        '& .ag-root-wrapper': {
            borderLeft: 'none',
            borderBottom: 'none',
            borderRight: 'none',
            marginRight: 1,
            backgroundColor: theme.palette.background.paper,
        },
        '& .ag-row-even, & .ag-row-odd, & .ag-header-row': {
            backgroundColor: theme.palette.background.paper,
        },
    }),
};

interface NetworkModificationsTableProps extends Omit<NetworkModificationEditorNameHeaderProps, 'modificationCount'> {
    modifications: NetworkModificationMetadata[];
    setModifications: React.Dispatch<SetStateAction<NetworkModificationMetadata[]>>;
    handleCellClick?: (event: CellClickedEvent) => void;
    isRowDragDisabled?: boolean;
    isDragging?: boolean;
    onRowDragStart?: (event: RowDragEnterEvent) => void;
    onRowDragEnd?: (event: RowDragEndEvent) => void;
    onRowSelected?: (event: RowSelectedEvent) => void;
    modificationsToExclude: ExcludedNetworkModifications[];
    setModificationsToExclude: React.Dispatch<SetStateAction<ExcludedNetworkModifications[]>>;
}

const NetworkModificationsTable: React.FC<NetworkModificationsTableProps> = ({
    modifications,
    setModifications,
    handleCellClick,
    isRowDragDisabled,
    isDragging,
    onRowDragStart,
    onRowDragEnd,
    onRowSelected,
    modificationsToExclude,
    setModificationsToExclude,
    ...nameHeaderProps
}) => {
    const gridRef = useRef<AgGridReact>(null);
    const theme = useTheme();

    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);
    const isMonoRootStudy = useSelector((state: AppState) => state.isMonoRootStudy);
    const hightlightedModificationUuid = useSelector((state: AppState) => state.hightlightedModificationUuid);
    const [isGridReady, setIsGridReady] = useState(false);

    const intl = useIntl();
    const { computeLabel } = useModificationLabelComputer();

    const defaultColumnDefinition: ColDef<NetworkModificationMetadata> = {
        sortable: false,
        resizable: false,
        suppressMovable: true,
        cellStyle: { padding: 0 },
    };

    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const getModificationLabel = useCallback(
        (modif?: NetworkModificationMetadata, formatBold: boolean = true) => {
            if (!modif) {
                return '';
            }
            return intl.formatMessage(
                { id: 'network_modifications.' + modif.messageType },
                {
                    ...modif,
                    ...computeLabel(modif, formatBold),
                }
            );
        },
        [computeLabel, intl]
    );

    const getRowDragText = useCallback(
        (params: IRowDragItem) => {
            const label = getModificationLabel(params?.rowNode?.data, false);
            return typeof label === 'string' ? label : '';
        },
        [getModificationLabel]
    );

    const columnDefs = useMemo(() => {
        const staticColumns: ColDef<NetworkModificationMetadata>[] = [
            {
                colId: 'modificationName',
                rowDrag: !isRowDragDisabled,
                headerComponent: NetworkModificationEditorNameHeader,
                headerComponentParams: {
                    modificationCount: modifications?.length,
                    ...nameHeaderProps,
                },
                cellRenderer: NetworkModificationNameCellRenderer,
                valueGetter: (value: ValueGetterParams) => getModificationLabel(value?.data),
                rowDragText: getRowDragText,
                minWidth: 200,
                flex: 1,
                cellStyle: { cursor: 'pointer' },
            },
            {
                cellRenderer: SwitchCellRenderer,
                cellRendererParams: {
                    setModifications: setModifications,
                },
                width: 60,
            },
        ];
        const dynamicColumns: ColDef<NetworkModificationMetadata>[] = !isMonoRootStudy
            ? rootNetworks.map((rootNetwork) => {
                  const rootNetworkUuid = rootNetwork.rootNetworkUuid;
                  const isCurrentRootNetwork = rootNetworkUuid === currentRootNetworkUuid;

                  return {
                      colId: rootNetworkUuid,
                      cellRenderer: RootNetworkChipCellRenderer,
                      cellRendererParams: {
                          rootNetwork: rootNetwork,
                          modificationsToExclude: modificationsToExclude,
                          setModificationsToExclude: setModificationsToExclude,
                      },
                      cellStyle: { textAlign: 'center' },
                      headerStyle: { padding: 0 },
                      width: 72,
                      headerComponent: () =>
                          isCurrentRootNetwork &&
                          modifications.length >= 1 && (
                              <Box
                                  sx={{
                                      width: '100%',
                                      display: 'flex',
                                      justifyContent: 'center',
                                  }}
                              >
                                  <Badge overlap="circular" color="primary" variant="dot">
                                      <RemoveRedEyeIcon />
                                  </Badge>
                              </Box>
                          ),
                  };
              })
            : [];

        return [...staticColumns, ...dynamicColumns];
    }, [
        isRowDragDisabled,
        modifications.length,
        nameHeaderProps,
        getRowDragText,
        setModifications,
        isMonoRootStudy,
        rootNetworks,
        getModificationLabel,
        currentRootNetworkUuid,
        modificationsToExclude,
        setModificationsToExclude,
    ]);

    const getRowId = (params: GetRowIdParams<NetworkModificationMetadata>) => params.data.uuid;

    const getRowStyle = useCallback(
        (cellData: RowClassParams<NetworkModificationMetadata, unknown>) => {
            const style: RowStyle = {};
            if (!cellData?.data?.activated) {
                style.opacity = 0.4;
            }

            // Highlight the selected modification
            if (cellData?.data?.uuid === hightlightedModificationUuid) {
                style.backgroundColor = theme.aggrid.highlightColor;
            }
            return style;
        },
        [hightlightedModificationUuid, theme]
    );

    const onGridReady = useCallback(() => {
        setIsGridReady(true);
    }, []);

    useEffect(() => {
        if (!gridRef.current?.api) {
            return;
        }
        const gridApi = gridRef.current.api;

        const tryHighlight = () => {
            let node = undefined;
            if (hightlightedModificationUuid) {
                node = gridApi.getRowNode(hightlightedModificationUuid);
            }

            if (node) {
                gridApi.ensureNodeVisible(node, 'middle');
            }
            gridApi.removeEventListener('modelUpdated', tryHighlight);
        };

        tryHighlight();

        gridApi.addEventListener('modelUpdated', tryHighlight);
    }, [isGridReady, hightlightedModificationUuid]);

    return (
        <Box sx={styles.container}>
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
                onCellClicked={handleCellClick}
                onRowSelected={onRowSelected}
                animateRows
                columnDefs={columnDefs}
                getRowStyle={getRowStyle}
                onRowDragEnter={onRowDragStart}
                onRowDragEnd={onRowDragEnd}
                rowDragManaged={!isRowDragDisabled}
                suppressNoRowsOverlay={true}
                overrideLocales={AGGRID_LOCALES}
                onGridReady={onGridReady}
            />
        </Box>
    );
};

export default NetworkModificationsTable;
