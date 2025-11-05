/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { useTheme, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { useIntl } from 'react-intl';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { ColDef, ColumnMovedEvent, GetRowIdParams, GridOptions, RowClassParams, RowStyle } from 'ag-grid-community';
import { useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import { AppState } from '../../../../redux/reducer';
import { suppressEventsToPreventEditMode } from '../../../dialogs/commons/utils';
import { CurrentTreeNode, NodeType } from 'components/graph/tree-node.type';
import { CalculationRowType } from '../../types/calculation.type';
import { isCalculationRow } from '../../utils/calculation-utils';
import { AGGRID_LOCALES } from '../../../../translations/not-intl/aggrid-locales';
import { refreshSpreadsheetAfterFilterChanged } from './hooks/use-spreadsheet-gs-filter';
import { useEquipmentContextMenu } from './hooks/useEquipmentContextMenu';

const DEFAULT_ROW_HEIGHT = 28;

interface RowData {
    id: string;
    rowType?: string;
    calculationType?: string;
}

// Handle row IDs for regular and calculation rows
const getRowId = (params: GetRowIdParams<RowData>) => {
    if (params.data.rowType) {
        return params.data.rowType + (params.data.calculationType ?? '');
    }
    return params.data.id;
};

const defaultColDef: ColDef = {
    filter: true,
    sortable: true,
    resizable: true,
    lockPinned: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    suppressKeyboardEvent: suppressEventsToPreventEditMode,
};

interface EquipmentTableProps {
    gridRef: React.RefObject<AgGridReact>;
    rowData: unknown[] | undefined;
    columnData: ColDef[];
    currentNode: CurrentTreeNode;
    handleColumnDrag: (e: ColumnMovedEvent) => void;
    isFetching: boolean | undefined;
    isExternalFilterPresent: GridOptions['isExternalFilterPresent'];
    doesExternalFilterPass: GridOptions['doesExternalFilterPass'];
    onModelUpdated?: GridOptions['onModelUpdated'];
    isDataEditable: boolean;
    onFirstDataRendered: GridOptions['onFirstDataRendered'];
    onGridReady: GridOptions['onGridReady'];
    onRowDataUpdated?: GridOptions['onRowDataUpdated'];
    handleModify: (equipmentId: string) => void;
    handleOpenDiagram: (voltageLevelId: string) => void;
    equipmentType?: string;
}

export const EquipmentTable: FunctionComponent<EquipmentTableProps> = ({
    gridRef,
    rowData,
    columnData,
    currentNode,
    handleColumnDrag,
    isFetching,
    isExternalFilterPresent,
    doesExternalFilterPass,
    onModelUpdated,
    onRowDataUpdated,
    isDataEditable,
    onFirstDataRendered,
    onGridReady,
    handleModify,
    handleOpenDiagram,
    equipmentType,
}) => {
    const theme = useTheme();
    const intl = useIntl();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const language = useSelector((state: AppState) => state.computedLanguage);

    const isEditDisabled = currentNode?.type === NodeType.ROOT || !isDataEditable;

    const { contextMenu, menuItems, openContextMenu, closeContextMenu } = useEquipmentContextMenu({
        equipmentType,
        isEditDisabled,
        handleModify,
        handleOpenDiagram,
    });

    const getRowStyle = useCallback(
        (params: RowClassParams): RowStyle | undefined => {
            const isRootNode = currentNode?.type === NodeType.ROOT;
            const cursorStyle = isRootNode || !isDataEditable ? 'initial' : 'pointer';

            if (isCalculationRow(params.data?.rowType)) {
                if (params.data?.rowType === CalculationRowType.CALCULATION) {
                    return {
                        backgroundColor: theme.palette.background.default,
                        fontWeight: 'bold',
                    };
                }

                if (params.data?.rowType === CalculationRowType.CALCULATION_BUTTON) {
                    return {
                        borderTop: '1px solid ' + theme.palette.divider,
                        backgroundColor: theme.palette.action.hover,
                    };
                }
            }

            if (params.rowIndex === 0 && params.node.rowPinned === 'top') {
                return {
                    borderTop: '1px solid ' + theme.palette.primary.main,
                    borderBottom: '1px solid ' + theme.palette.primary.main,
                    cursor: cursorStyle,
                };
            }
            return {
                cursor: cursorStyle,
            };
        },
        [currentNode?.type, theme, isDataEditable]
    );

    const gridContext = useMemo(() => ({ theme, currentNode, studyUuid }), [currentNode, studyUuid, theme]);

    return (
        <>
            <CustomAGGrid
                ref={gridRef}
                rowSelection={{ mode: 'singleRow', checkboxes: false, enableClickSelection: true }}
                getRowId={getRowId}
                debounceVerticalScrollbar
                getRowStyle={getRowStyle}
                columnDefs={columnData}
                defaultColDef={defaultColDef}
                onColumnMoved={handleColumnDrag}
                suppressDragLeaveHidesColumns
                rowBuffer={5}
                onModelUpdated={onModelUpdated}
                context={gridContext}
                rowHeight={DEFAULT_ROW_HEIGHT}
                loading={isFetching}
                overlayLoadingTemplate={intl.formatMessage({ id: 'LoadingRemoteData' })}
                isExternalFilterPresent={isExternalFilterPresent}
                doesExternalFilterPass={doesExternalFilterPass}
                onFirstDataRendered={onFirstDataRendered}
                onGridReady={onGridReady}
                onRowDataUpdated={onRowDataUpdated}
                overrideLocales={AGGRID_LOCALES}
                suppressNoRowsOverlay={rowData === undefined}
                valueCache
                accentedSort
                onFilterChanged={refreshSpreadsheetAfterFilterChanged}
                onCellContextMenu={openContextMenu}
            />

            <Menu
                open={contextMenu !== null}
                onClose={closeContextMenu}
                anchorReference="anchorPosition"
                anchorPosition={contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
            >
                {menuItems.map((item, index) => (
                    <MenuItem onClick={item.onClick} key={item.label + index}>
                        <ListItemIcon>
                            <item.icon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
