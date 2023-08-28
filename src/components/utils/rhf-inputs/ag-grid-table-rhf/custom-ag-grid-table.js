/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Grid } from '@mui/material';
import { useTheme } from '@mui/styles';

import { useIntl } from 'react-intl';
import { AG_GRID_ROW_UUID } from 'components/utils/field-constants';
import DndTableBottomRightButtons from 'components/utils/dnd-table/dnd-table-bottom-right-buttons';
import DndTableBottomLeftButtons from 'components/utils/dnd-table/dnd-table-bottom-left-buttons';
import { CsvDialog } from 'components/utils/csv-dialog';

export const ROW_DRAGGING_SELECTION_COLUMN_DEF = [
    {
        rowDrag: true,
    },
    {
        headerCheckboxSelection: true,
        checkboxSelection: true,
        maxWidth: 50,
    },
];

const style = (customProps) => ({
    grid: (theme) => ({
        width: 'auto',
        height: '100%',
        position: 'relative',
        // - AG Grid colors override -
        // It shouldn't be exactly like this, but I couldn't make it works otherwise
        // https://www.ag-grid.com/react-data-grid/global-style-customisation/
        '--ag-alpine-active-color': theme.palette.primary.main + ' !important',
        '--ag-background-color': theme.agGridBackground.color + ' !important',
        '--ag-header-background-color':
            theme.agGridBackground.color + ' !important',
        '--ag-odd-row-background-color':
            theme.agGridBackground.color + ' !important',
        '--ag-modal-overlay-background-color':
            theme.agGridBackground.color + ' !important',
        '--ag-selected-row-background-color': 'transparent !important',
        '--ag-range-selection-border-color': 'transparent !important',
        //overrides the default computed max heigt for ag grid default selector editor to make it more usable
        //can be removed if a custom selector editor is implemented
        '& .ag-select-list': {
            maxHeight: '300px !important',
        },

        '& .ag-root-wrapper-body': {
            maxHeight: '500px',
        },

        '& .ag-cell': {
            boxShadow: 'none',
        },
        '& .ag-cell-edit-wrapper': {
            height: 'inherit',
        },
        '& .ag-row-hover': {
            cursor: 'text',
        },
        '& .ag-overlay-loading-center': {
            border: 'none',
            boxShadow: 'none',
        },
        '& .numeric-input': {
            fontSize: 'calc(var(--ag-font-size) + 1px)',
            paddingLeft: 'calc(var(--ag-cell-horizontal-padding) - 1px)',
            width: '100%',
            height: '100%',
            border: 'inherit',
            outline: 'inherit',
            backgroundColor: theme.agGridBackground.color,
        },
        '& .Mui-focused .MuiOutlinedInput-root': {
            // borders moves row height
            outline:
                'var(--ag-borders-input) var(--ag-input-focus-border-color)',
            outlineOffset: '-1px',
            backgroundColor: theme.agGridBackground.color,
        },
        ...customProps,
    }),
});

export const CustomAgGridTable = ({
    name,
    columnDefs,
    makeDefaultRowData,
    csvProps,
    cssProps,
    ...props
}) => {
    const theme = useTheme();
    const [gridApi, setGridApi] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [newRowAdded, setNewRowAdded] = useState(false);
    const [openCsvDialog, setOpenCsvDialog] = useState(false);

    const { control, getValues, watch } = useFormContext();
    const useFieldArrayOutput = useFieldArray({
        control,
        name: name,
    });
    const { append, remove, update, swap, move } = useFieldArrayOutput;

    const rowData = watch(name);

    const isFirstSelected =
        rowData?.length &&
        gridApi?.api.getRowNode(rowData[0][AG_GRID_ROW_UUID])?.isSelected();

    const isLastSelected =
        rowData?.length &&
        gridApi?.api
            .getRowNode(rowData[rowData.length - 1][AG_GRID_ROW_UUID])
            ?.isSelected();

    const noRowSelected = selectedRows.length === 0;

    const handleMoveRowUp = () => {
        selectedRows
            .map((row) => getIndex(row))
            .sort()
            .forEach((idx) => {
                swap(idx, idx - 1);
            });
    };

    const handleMoveRowDown = () => {
        selectedRows
            .map((row) => getIndex(row))
            .sort()
            .reverse()
            .forEach((idx) => {
                swap(idx, idx + 1);
            });
    };

    const handleDeleteRows = () => {
        if (selectedRows.length === rowData.length) {
            remove();
        } else {
            selectedRows.forEach((val) => {
                const idx = getIndex(val);
                remove(idx);
            });
        }
    };

    useEffect(() => {
        if (gridApi) {
            gridApi.api.refreshCells({
                force: true,
            });
        }
    }, [gridApi, rowData]);

    const handleAddRow = () => {
        append(makeDefaultRowData());
        setNewRowAdded(true);
    };

    const getIndex = (val) => {
        return getValues(name).findIndex(
            (row) => row[AG_GRID_ROW_UUID] === val[AG_GRID_ROW_UUID]
        );
    };

    useEffect(() => {
        if (gridApi) {
            gridApi.api.sizeColumnsToFit();
        }
    }, [columnDefs, gridApi]);

    const intl = useIntl();
    const getLocaleText = useCallback(
        (params) => {
            const key = 'agGrid.' + params.key;
            return intl.messages[key] || params.defaultValue;
        },
        [intl]
    );

    const onGridReady = (params) => {
        setGridApi(params);
    };

    const onRowDataUpdated = () => {
        setNewRowAdded(false);
        if (gridApi?.api) {
            // update due to new appended row, let's scroll
            const lastIndex = rowData.length - 1;
            gridApi.api.paginationGoToLastPage();
            gridApi.api.ensureIndexVisible(lastIndex, 'bottom');
        }
    };

    return (
        <>
            <Grid container spacing={2}>
                <Grid
                    item
                    xs={12}
                    className={theme.aggrid}
                    sx={style(cssProps).grid}
                >
                    <AgGridReact
                        rowData={rowData}
                        onGridReady={onGridReady}
                        getLocaleText={getLocaleText}
                        cacheOverflowSize={10}
                        rowSelection={'multiple'}
                        domLayout={'autoHeight'}
                        rowDragEntireRow
                        rowDragManaged
                        onRowDragEnd={(e) =>
                            move(getIndex(e.node.data), e.overIndex)
                        }
                        suppressBrowserResizeObserver
                        columnDefs={columnDefs}
                        detailRowAutoHeight={true}
                        onSelectionChanged={(event) => {
                            setSelectedRows(gridApi.api.getSelectedRows());
                        }}
                        onRowDataUpdated={
                            newRowAdded ? onRowDataUpdated : undefined
                        }
                        onCellEditingStopped={(event) => {
                            update(event.rowIndex, event.data);
                        }}
                        getRowId={(row) => row.data[AG_GRID_ROW_UUID]}
                        {...props}
                    ></AgGridReact>
                </Grid>
            </Grid>
            <Grid container item sx={{ justifyContent: 'flex-start' }}>
                <DndTableBottomLeftButtons
                    handleUploadButton={() => setOpenCsvDialog(true)}
                    uploadButtonMessageId={'ImportCSV'}
                />
                <DndTableBottomRightButtons
                    arrayFormName={name}
                    handleAddButton={handleAddRow}
                    handleDeleteButton={handleDeleteRows}
                    handleMoveUpButton={handleMoveRowUp}
                    handleMoveDownButton={handleMoveRowDown}
                    toTheLeft={true}
                    disableUp={noRowSelected || isFirstSelected}
                    disableDown={noRowSelected || isLastSelected}
                    disableDelete={noRowSelected}
                />
            </Grid>
            {openCsvDialog && (
                <CsvDialog
                    title={'ImportIdentifierList'}
                    openCsvDialog={openCsvDialog}
                    setOpenCsvDialog={() => setOpenCsvDialog(false)}
                    csvColumns={csvProps.fileHeaders}
                    handleImportCsv={(file, keepData) =>
                        csvProps.getDataFromCsv(file, keepData)
                    }
                    fileName={intl.formatMessage({
                        id: 'filterCsvFileName',
                    })}
                />
            )}
        </>
    );
};

export default CustomAgGridTable;
