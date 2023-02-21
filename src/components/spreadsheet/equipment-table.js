import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-material.css';

import { useTheme } from '@mui/styles';
import LoaderWithOverlay from '../util/loader-with-overlay';
import CommonContextualMenu from './common-contextual-menu';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export const EquipmentTable = ({
    rows,
    columns,
    scrollTop,
    gridRef,
    handleColumnDrag,
    commitChanges,
    onCellEditRequest,
    ...props
}) => {
    const [menuItems, setMenuItems] = useState([]);
    const [openContextualMenu, setOpenContextualMenu] = useState(false);
    const theme = useTheme();

    const defaultColDef = useMemo(
        () => ({
            sortable: true,
            resizable: true,
        }),
        []
    );

    const initialMousePosition = {
        mouseX: null,
        mouseY: null,
    };
    const [mousePosition, setMousePosition] = useState(initialMousePosition);

    const handleCloseContextualMenu = useCallback(() => {
        setOpenContextualMenu(false);
    }, []);

    const cellContextMenuListener = useCallback((event) => {
        setMousePosition({
            mouseX: event.event.clientX,
            mouseY: event.event.clientY,
        });

        setMenuItems([
            {
                messageDescriptorId: event.data.id,
                callback: () => {
                    console.log('open context menu element');
                },
                icon: <HelpOutlineIcon fontSize="small" />,
                disabled: true,
            },
        ]);
        setOpenContextualMenu(true);
    }, []);

    const cellClickedListener = useCallback((event) => {
        console.log('cellClicked', event);
    }, []);

    const rowEditingListener = useCallback((event) => {
        console.log('row edited ', event);
    }, []);

    const cellEditingListener = useCallback((event) => {
        console.log('cell edited ', event);
    }, []);

    const getRowId = useMemo(() => {
        return (params) => params.data.id;
    }, []);

    useEffect(() => {
        gridRef.current.api?.ensureIndexVisible(scrollTop, 'top');
    }, [gridRef, scrollTop]);

    const getRowStyle = useCallback(
        (params) => {
            if (params.rowIndex === scrollTop) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            }
        },
        [scrollTop, theme.selectedRow.background]
    );

    const onFirstDataRendered = useCallback(
        (params) => {
            const allColumnIds = [];
            gridRef.current.columnApi.getColumns().forEach((column) => {
                allColumnIds.push(column.getId());
            });
            gridRef.current.columnApi.autoSizeColumns(allColumnIds, false);
        },
        [gridRef]
    );

    return (
        <span
            onMouseDown={(event) => {
                if (event.button === 2) {
                    handleCloseContextualMenu();
                }
            }}
        >
            {!props.fetched && (
                <LoaderWithOverlay
                    color="inherit"
                    loaderSize={70}
                    loadingMessageText={'LoadingRemoteData'}
                />
            )}
            {props.fetched && (
                <div style={{ height: '100%' }}>
                    <div
                        className={theme.aggrid}
                        style={{ width: 'auto', height: '100%' }}
                    >
                        <AgGridReact
                            ref={gridRef}
                            getRowId={getRowId}
                            rowData={rows}
                            columnDefs={columns}
                            defaultColDef={defaultColDef}
                            animateRows={true}
                            rowSelection="multiple"
                            editType={'fullRow'}
                            suppressPropertyNamesCheck={true}
                            getRowStyle={getRowStyle}
                            enableCellTextSelection={true}
                            onColumnMoved={handleColumnDrag}
                            readOnlyEdit={true}
                            alwaysMultiSort={true}
                            onFirstDataRendered={onFirstDataRendered}
                            onCellEditRequest={onCellEditRequest}
                            onCellClicked={cellClickedListener}
                            onCellValueChanged={cellEditingListener}
                            onRowValueChanged={rowEditingListener}
                            onCellContextMenu={cellContextMenuListener}
                        />
                    </div>
                </div>
            )}

            {openContextualMenu && (
                <CommonContextualMenu
                    menuItems={menuItems}
                    open={openContextualMenu}
                    anchorReference="anchorPosition"
                    anchorPosition={
                        mousePosition.mouseY !== null &&
                        mousePosition.mouseX !== null
                            ? {
                                  top: mousePosition.mouseY,
                                  left: mousePosition.mouseX,
                              }
                            : undefined
                    }
                    onClose={() => {
                        handleCloseContextualMenu();
                    }}
                />
            )}
        </span>
    );
};
