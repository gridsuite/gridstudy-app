import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Grid, useTheme, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { AgGridReact } from 'ag-grid-react';
import { useFieldArray, useForm, useFormContext } from 'react-hook-form';
import {
    CellEditRequestEvent,
    CellValueChangedEvent,
    ColDef,
    ColGroupDef,
    GetRowIdFunc,
    GetRowIdParams,
    GridOptions,
} from 'ag-grid-community';

type Props = {
    data: any;
    onDataChanged: (data: any) => void;
    onOK: () => void;
    onCancel: () => void;
};

const SitePropertiesDialog: React.FC<Props> = ({
    data,
    onDataChanged,
    onOK,
    onCancel,
}) => {
    const theme = useTheme();
    const gridRef = useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = useState<any>(null);
    const [newRowAdded, setNewRowAdded] = useState(false);
    const [columnDefs, setColumnDefs] = useState([
        { field: 'key' },
        { field: 'value' },
    ]);

    const [rowData, setRowData] = useState(() => {
        const keys = Object.keys(data.data.properties);
        const rowData = keys.map((key) => {
            return { key: key, value: data.data.properties[key] };
        });
        return rowData;
    });
    useEffect(() => {
        if (gridApi) {
            gridApi.api.sizeColumnsToFit();
        }
    }, [columnDefs, gridApi]);
    const getRowId = (params: GetRowIdParams) => {
        return params.data.key;
    };
    const onGridReady = (params: any) => {
        setGridApi(params);
    };

    const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
            const updatedRowData = rowData.map((row) => {
                if (row.key === event.data.key) {
                    return { ...row, value: event.newValue };
                }
                return row;
            });
            setRowData(updatedRowData);
        },
        [rowData]
    );

    const onCellEditRequest = useCallback((event: CellEditRequestEvent) => {
        const oldData = event.data;
        const field = event.colDef.field;
        const newValue = event.newValue;
        const newData = { ...oldData };
        newData[field!] = event.newValue;
        console.log(
            'sitesAAA',
            'onCellEditRequest, updating ' + field + ' to ' + newValue
        );
        const tx = {
            update: [newData],
        };
        event.api.applyTransaction(tx);
    }, []);

    useEffect(() => {
        if (gridApi) {
            gridApi.api.refreshCells({
                force: true,
            });
        }
    }, [gridApi, rowData]);

    // console.log('sites', 'state Row data', rowData);
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <IconButton aria-label="delete">
                    <DeleteIcon />
                </IconButton>
                <IconButton aria-label="add">
                    <AddIcon />
                </IconButton>
            </Grid>
            <Grid item xs={12}>
                <Grid item xs={12} className={theme.aggrid}>
                    <AgGridReact
                        // rowData={gridApi && rowData?.length ? rowData : null} // to display loader at first render before we get the initial data and before the columns are sized to avoid glitch
                        ref={gridRef}
                        rowData={rowData}
                        onGridReady={onGridReady}
                        // getLocaleText={getLocaleText}
                        cacheOverflowSize={10}
                        domLayout={'autoHeight'}
                        rowDragEntireRow
                        suppressBrowserResizeObserver
                        columnDefs={columnDefs.map((colDef) => ({
                            ...colDef,
                            editable: true,
                        }))}
                        detailRowAutoHeight={true}
                        rowSelection={'multiple'}
                        // onSelectionChanged={(event) => {
                        //     setSelectedRows(gridApi.api.getSelectedRows());
                        // }}
                        // onRowDataUpdated={newRowAdded ? onRowDataUpdated : undefined}
                        // onCellValueChanged={onCellValueChanged}
                        // onCellEditRequest={onCellEditRequest}
                        onCellEditingStopped={(event) => {
                            if (event.rowIndex !== null) {
                                const updatedRowData = [...rowData];
                                updatedRowData[event.rowIndex] = event.data;
                                setRowData(updatedRowData);
                                onDataChanged(updatedRowData);
                            }
                        }}
                        getRowId={getRowId}
                        // enableCellChangeFlash={true}
                        // {...props}
                    ></AgGridReact>
                </Grid>
            </Grid>
        </Grid>
    );
    
};

export default SitePropertiesDialog;
