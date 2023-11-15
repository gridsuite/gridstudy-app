/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Grid, IconButton, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { AgGridReact } from 'ag-grid-react';
import { useIntl } from 'react-intl';
import { CustomAGGrid } from "../../custom-aggrid/custom-aggrid";

type SitePropertiesDialogProps = {
    spredsheetContext: any;
    onDataChanged: (data: IData[]) => void;
};

type IData = {
    id: number;
    key: string;
    value: any;
};

/**
 * @author Jamal KHEYYAD <jamal.kheyyad at rte-international.com>
 */
const SitePropertiesDialog: FunctionComponent<SitePropertiesDialogProps> = ({
    spredsheetContext,
    onDataChanged,
}) => {
    const theme = useTheme();
    const gridRef = useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = useState<any>(null);
    const intl = useIntl();
    const columnDefs = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'Key' }),
                field: 'key',
                editable: true,
                singleClickEdit: true,
            },
            {
                headerName: intl.formatMessage({ id: 'Value' }),
                field: 'value',
                editable: true,
                singleClickEdit: true,
            },
        ];
    }, [intl]);

    const [rowData, setRowData] = useState<IData[]>(() => {
        const data = spredsheetContext.dynamicValidation;
        if (!data?.properties) {
            return [];
        }
        const keys = Object.keys(data.properties);
        return keys.map((key, index) => {
            return { id: index, key: key, value: data.properties[key] };
        });
    });

    useEffect(() => {
        if (gridApi) {
            gridApi.api.sizeColumnsToFit();
        }
    }, [columnDefs, gridApi]);

    const onGridReady = (params: any) => {
        setGridApi(params);
    };

    useEffect(() => {
        if (gridApi) {
            gridApi.api.refreshCells({
                force: true,
            });
        }
    }, [gridApi, rowData]);

    const handleAddRow = useCallback(() => {
        const newRow = { id: rowData.length, key: '', value: '' };
        const updatedRowData = [...rowData, newRow];
        setRowData(updatedRowData);
    }, [rowData]);

    const handleDeleteRow = useCallback(() => {
        const selectedNodes = gridApi.api.getSelectedNodes();
        let updatedRowData = [...rowData];
        selectedNodes.forEach((node: any) => {
            const index = updatedRowData.indexOf(node.data);
            if (index !== -1) {
                updatedRowData.splice(index, 1);
            }
        });
        // Update the IDs of the rows to match their index in the array
        updatedRowData.forEach((row, index) => {
            row.id = index;
        });
        setRowData(updatedRowData);
        onDataChanged(updatedRowData);
    }, [gridApi, rowData, onDataChanged]);

    return (
        <Grid container spacing={2} style={{ width: '500px' }}>
            <Grid item xs={12}>
                <IconButton aria-label="delete" onClick={handleDeleteRow}>
                    <DeleteIcon />
                </IconButton>
                <IconButton aria-label="add" onClick={handleAddRow}>
                    <AddIcon />
                </IconButton>
            </Grid>
            <Grid item xs={12}>
                <Grid item xs={12} className={theme.aggrid}>
                    <CustomAGGrid
                        ref={gridRef}
                        rowData={rowData}
                        onGridReady={onGridReady}
                        domLayout={'autoHeight'}
                        rowDragEntireRow
                        columnDefs={[
                            {
                                headerName: '',
                                field: 'checkbox',
                                checkboxSelection: true,
                                width: 50,
                                headerCheckboxSelection: true,
                                headerCheckboxSelectionFilteredOnly: true,
                            },
                            ...columnDefs,
                        ]}
                        stopEditingWhenCellsLoseFocus
                        alwaysShowVerticalScroll
                        suppressRowClickSelection
                        rowSelection={'multiple'}
                        onCellEditingStopped={(event) => {
                            if (event.rowIndex !== null) {
                                const updatedRowData = [...rowData];
                                updatedRowData[event.rowIndex] = event.data;
                                setRowData(updatedRowData);
                                onDataChanged(updatedRowData);
                            }
                        }}
                    ></CustomAGGrid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default SitePropertiesDialog;
