import React, { useState } from 'react';
import { Grid, useTheme, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { AgGridReact } from 'ag-grid-react';

type Props = {
    data: any;
    onOK: () => void;
    onCancel: () => void;
};

const SitePropertiesDialog: React.FC<Props> = ({ data, onOK, onCancel }) => {
    const theme = useTheme();
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
                        rowData={rowData}
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
