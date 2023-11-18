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
import {
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow, TextField,
    useTheme
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { AgGridReact } from 'ag-grid-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { CustomAGGrid } from '../../custom-aggrid/custom-aggrid';
import { Box } from '@mui/system';
import Tooltip from '@mui/material/Tooltip';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { getLocalStorageTheme } from '../../../redux/local-storage';
import { DARK_THEME, elementType } from '@gridsuite/commons-ui';
import TableRowComponent from '../parameters/sensi/table-row';
import { INJECTIONS, MONITORED_BRANCHES } from '../../utils/field-constants';
import {
    INJECTIONS_EQUIPMENT_TYPES,
    MONITORED_BRANCHES_EQUIPMENT_TYPES,
} from '../parameters/sensi/columns-definitions';
import { TableTextInput } from "../../utils/rhf-inputs/table-inputs/table-text-input";
import { filledTextField, standardTextField } from "../dialogUtils";

type SitePropertiesDialogProps = {
    spreadsheetContext: any;
    onDataChanged: (data: IData[]) => void;
    arrayFormName: string;
    useFieldArrayOutput: any;
    columnsDefinition: any;
    tableHeight: number;
    createRows: (a: number) => void;
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
    spreadsheetContext,
    onDataChanged,
    arrayFormName,
    useFieldArrayOutput,
    columnsDefinition,
    tableHeight,
    createRows,
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
        const data = spreadsheetContext.dynamicValidation;
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

    const isDarkTheme = getLocalStorageTheme() === DARK_THEME;
    const COLUMNS_DEFINITIONS_INJECTIONS_SET = [
        {
            label: 'Key',
            dataKey: MONITORED_BRANCHES,
            initialValue: [],
            editable: true,
            directoryItems: true,
        },
        {
            label: 'Value',
            dataKey: INJECTIONS,
            initialValue: [],
            editable: true,
            directoryItems: true,
        },
    ];
    //create rows data

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
                <TableContainer
                    sx={{
                        height: 100,
                        border: 'solid 0px rgba(0,0,0,0.1)',
                    }}
                >
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                {COLUMNS_DEFINITIONS_INJECTIONS_SET.map(
                                    (column: any) => (
                                        <TableCell>
                                            <Box
                                                sx={{
                                                    backgroundColor:
                                                        column.color,
                                                }}
                                            >
                                                <FormattedMessage
                                                    id={column.label}
                                                />
                                            </Box>
                                        </TableCell>
                                    )
                                )}
                                <TableCell>
                                    <Tooltip
                                        title={intl.formatMessage({
                                            id: 'AddRows',
                                        })}
                                    >
                                        <Box>
                                            <IconButton
                                                color="primary"
                                                onClick={() => {
                                                    console.log('add row');
                                                }}
                                            >
                                                <AddCircleIcon
                                                    sx={{
                                                        color:
                                                            getLocalStorageTheme() ===
                                                            DARK_THEME
                                                                ? 'white'
                                                                : 'black',
                                                    }}
                                                />
                                            </IconButton>
                                        </Box>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody></TableBody>
                        <TableRow>
                            <TableCell>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label={'ID'}
                                    value={'equipementId'}
                                    InputProps={{
                                        readOnly: false,
                                        ...standardTextField,
                                    }}
                                    disabled={false}
                                />
                            </TableCell>
                        </TableRow>
                        {/*<TableBody>*/}
                        {/*    <TableRow  key={'id'}>*/}
                        {/*        <TableCell>*/}
                        {/*             /!*a cell that allow to edit a string property*!/*/}
                        {/*            <Box*/}
                        {/*                sx={{*/}
                        {/*                    backgroundColor: 'red',*/}
                        {/*                }}*/}
                        {/*            >*/}
                        {/*                <FormattedMessage*/}
                        {/*                    id={'Key'}*/}
                        {/*                />*/}
                        {/*            </Box>*/}
                        {/*        </TableCell>*/}
                        {/*    </TableRow>*/}
                        {/*        /!*{rowData.map((row: any, index: number) => (*!/*/}
                        {/*        /!*    <TableRowComponent*!/*/}
                        {/*        /!*        arrayFormName={arrayFormName}*!/*/}
                        {/*        /!*        columnsDefinition={columnsDefinition}*!/*/}
                        {/*        /!*        row={row}*!/*/}
                        {/*        /!*        index={index}*!/*/}
                        {/*        /!*        handleDeleteButton={()=>{*!/*/}
                        {/*        /!*            console.log('delete row');*!/*/}
                        {/*        /!*            }*!/*/}
                        {/*        /!*        }*!/*/}
                        {/*        /!*        theme={isDarkTheme}*!/*/}
                        {/*        /!*    />*!/*/}
                        {/*        /!*))}*!/*/}
                        {/*</TableBody>*/}
                    </Table>
                    <CustomAGGrid
                        ref={gridRef}
                        rowData={rowData}
                        onGridReady={onGridReady}
                        domLayout={'autoHeight'}
                        rowDragEntireRow
                        // columnDefs={[
                        //     {
                        //         headerName: '',
                        //         field: 'checkbox',
                        //         checkboxSelection: true,
                        //         width: 50,
                        //         headerCheckboxSelection: true,
                        //         headerCheckboxSelectionFilteredOnly: true,
                        //     },
                        //     ...columnDefs,
                        // ]}
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
                </TableContainer>
                <Grid item xs={12} className={theme.aggrid}></Grid>
            </Grid>
        </Grid>
    );
};

export default SitePropertiesDialog;
