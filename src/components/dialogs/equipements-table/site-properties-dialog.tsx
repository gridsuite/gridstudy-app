import { RadioInput } from '@gridsuite/commons-ui';
import React, { useState } from 'react';
import { Grid, useTheme, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { AgGridReact } from 'ag-grid-react';

type Props = {
    text: string;
    onOK: () => void;
    onCancel: () => void;
};

const SitePropertiesDialog: React.FC<Props> = ({ text, onOK, onCancel }) => {
    const theme = useTheme();
    const [columnDefs, setColumnDefs] = useState([
        { field: 'make' },
        { field: 'model' },
        { field: 'price' },
    ]);

    const rowDataA = [
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Jamal', model: 'Zineb', price: 35000 },
        { make: 'Porsche', model: 'Boxster', price: 72000 },
        { make: 'Aston Martin', model: 'DBX', price: 190000 },
    ];

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
                        rowData={rowDataA}
                        // onGridReady={onGridReady}
                        // getLocaleText={getLocaleText}
                        cacheOverflowSize={10}
                        domLayout={'autoHeight'}
                        rowDragEntireRow
                        suppressBrowserResizeObserver
                        columnDefs={columnDefs}
                        detailRowAutoHeight={true}
                        rowSelection={'single'}
                        // onSelectionChanged={(event) => {
                        //     setSelectedRows(gridApi.api.getSelectedRows());
                        // }}
                        // onRowDataUpdated={
                        //     newRowAdded ? onRowDataUpdated : undefined
                        // }
                        // onCellEditingStopped={(event) => {
                        //     update(event.rowIndex, event.data);
                        // }}
                        // getRowId={(row) => row.data[AG_GRID_ROW_UUID]}
                        // {...props}
                    ></AgGridReact>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default SitePropertiesDialog;
