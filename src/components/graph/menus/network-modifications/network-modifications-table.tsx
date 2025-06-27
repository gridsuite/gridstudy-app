/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
import { Badge, Box, Theme } from '@mui/material';
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
            backgroundColor: theme.networkModificationPanel.backgroundColor,
        },
        '& .ag-row-even, & .ag-row-odd, & .ag-header-row': {
            backgroundColor: theme.networkModificationPanel.backgroundColor,
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
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);
    const isMonoRootStudy = useSelector((state: AppState) => state.isMonoRootStudy);

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
        const staticColumns: ColDef<NetworkModificationMetadata>[] = [
            {
                colId: 'modificationName',
                rowDrag: !isRowDragDisabled,
                headerComponent: NetworkModificationEditorNameHeader,
                headerComponentParams: {
                    modificationCount: modifications?.length,
                    ...nameHeaderProps,
                },
                cellRenderer: (params: ICellRendererParams<NetworkModificationMetadata>) =>
                    getModificationLabel(params?.data),
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
        setModifications,
        isMonoRootStudy,
        rootNetworks,
        getModificationLabel,
        currentRootNetworkUuid,
        modificationsToExclude,
        setModificationsToExclude,
    ]);

    const getRowId = (params: GetRowIdParams<NetworkModificationMetadata>) => params.data.uuid;

    const getRowStyle = useCallback((cellData: RowClassParams<NetworkModificationMetadata, unknown>) => {
        const style: RowStyle = {};
        if (!cellData?.data?.activated) {
            style.opacity = 0.4;
        }
        return style;
    }, []);

    return (
        <Box sx={styles.container}>
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
                onRowDragEnter={onRowDragStart}
                onRowDragEnd={onRowDragEnd}
                rowDragManaged={!isRowDragDisabled}
                suppressNoRowsOverlay={true}
                overrideLocales={AGGRID_LOCALES}
            />
        </Box>
    );
};

export default NetworkModificationsTable;
