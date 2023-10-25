import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Grid, useTheme, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { AgGridReact } from 'ag-grid-react';
import { useFieldArray, useForm, useFormContext } from 'react-hook-form';
import {
    ColDef,
    ColGroupDef,
    GetRowIdFunc,
    GetRowIdParams,
    GridOptions,
} from 'ag-grid-community';

type Props = {
    data: any;
    onOK: () => void;
    onCancel: () => void;
};

const SitePropertiesDialog: React.FC<Props> = ({ data, onOK, onCancel }) => {
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
    const { control, register } = useForm();
    const useFieldArrayOutput = useFieldArray({
        control,
        name: 'properties editor',
    });
    const { append, remove, update, swap, move } = useFieldArrayOutput;
    const getRowId = (params: GetRowIdParams) => {
        console.log('sites1', params.data.key);
        return params.data.key;
    };
    const onGridReady = (params:any) => {
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

    console.log('sites', data.data.properties);
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
                        columnDefs={columnDefs}
                        detailRowAutoHeight={true}
                        rowSelection={'multiple'}
                        // onSelectionChanged={(event) => {
                        //     setSelectedRows(gridApi.api.getSelectedRows());
                        // }}
                        onRowDataUpdated={
                            newRowAdded ? onRowDataUpdated : undefined
                        }
                        onCellEditingStopped={(event) => {
                            if (event.rowIndex) {
                                console.log('sites', event.data);
                                update(event.rowIndex, event.data);
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
