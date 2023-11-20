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
    TableRow,
    TextField,
    useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { AgGridReact } from 'ag-grid-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box } from '@mui/system';
import Tooltip from '@mui/material/Tooltip';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { getLocalStorageTheme } from '../../../redux/local-storage';
import { DARK_THEME, elementType } from '@gridsuite/commons-ui';
import { INJECTIONS, MONITORED_BRANCHES } from '../../utils/field-constants';
import { standardTextField } from '../dialogUtils';
import PropertiesEditor from './properties-editor';

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

interface IPropertiesData {
    id?: number;
    name: string;
    value: string;
}

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
    const [error, setError] = useState<string>('');
    const [invalidCells, setInvalidCells] = useState<number[]>([]);
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

    // const handleDeleteRow = useCallback(() => {
    //     const selectedNodes = gridApi.api.getSelectedNodes();
    //     let updatedRowData = [...rowData];
    //     selectedNodes.forEach((node: any) => {
    //         const index = updatedRowData.indexOf(node.data);
    //         if (index !== -1) {
    //             updatedRowData.splice(index, 1);
    //         }
    //     });
    //     // Update the IDs of the rows to match their index in the array
    //     updatedRowData.forEach((row, index) => {
    //         row.id = index;
    //     });
    //     setRowData(updatedRowData);
    //     onDataChanged(updatedRowData);
    // }, [gridApi, rowData, onDataChanged]);

    const handleRemoveRow = useCallback(
        (index: number) => {
            const newData = [...rowData];
            newData.splice(index, 1);
            // Update the id of the remaining rows
            newData.forEach((item, i) => {
                item.id = i;
            });
            setRowData(newData);
        },
        [rowData]
    );

    const isDarkTheme = getLocalStorageTheme() === DARK_THEME;
    const COLUMNS_DEFINITIONS_SET = [
        {
            label: 'Key',
            editable: true,
        },
        {
            label: 'Value',
            editable: true,
        },
    ];

    const handleAddRow = () => {
        const newId = rowData.length;
        setRowData([...rowData, { id: newId, key: '', value: '' }]);
    };

    const performValidation = () => {
        const names = new Set<string>();
        let hasError = false;
        const invalidCells: number[] = [];

        rowData.forEach((item, index) => {
            if (item.key.trim() === '' || item.value.trim() === '') {
                setError('Please fill in all fields');
                hasError = true;
                invalidCells.push(index);
            } else if (names.has(item.key)) {
                setError('Duplicate names are not allowed');
                hasError = true;
                invalidCells.push(index);
            } else {
                names.add(item.key);
            }
        });

        if (!hasError) {
            setError('');
            // Perform any additional actions with the validated data
            console.log('gridref', rowData);
        }

        setInvalidCells(invalidCells);
    };

    const handleNameChange = (index: number, value: string) => {
        const newData = [...rowData];
        newData[index].key = value;
        setRowData(newData);
    };

    const handleValueChange = (index: number, value: string) => {
        const newData = [...rowData];
        newData[index].value = value;
        setRowData(newData);
    };

    return (
        <Grid container spacing={2} style={{ width: '500px' }}>
            <Grid item xs={12}>
                <TableContainer
                    sx={{
                        height: 300,
                        border: 'solid 0px rgba(0,0,0,0.1)',
                    }}
                >
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                {COLUMNS_DEFINITIONS_SET.map((column: any) => (
                                    <TableCell>
                                        <Box
                                            sx={{
                                                backgroundColor: column.color,
                                            }}
                                        >
                                            <FormattedMessage
                                                id={column.label}
                                            />
                                        </Box>
                                    </TableCell>
                                ))}
                                <TableCell>
                                    <Tooltip
                                        title={intl.formatMessage({
                                            id: 'AddRows',
                                        })}
                                    >
                                        <Box>
                                            <IconButton
                                                color="primary"
                                                onClick={handleAddRow}
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
                        <TableBody>
                            {rowData?.map((row, index) => {
                                return (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                value={row.key}
                                                onChange={(e) =>
                                                    handleNameChange(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                                error={invalidCells.includes(
                                                    index
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                value={row.value}
                                                onChange={(e) =>
                                                    handleValueChange(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                                error={invalidCells.includes(
                                                    index
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <IconButton
                                                    onClick={() => {
                                                        handleRemoveRow(index);
                                                    }}
                                                >
                                                    <DeleteIcon
                                                        sx={{
                                                            color: theme
                                                                ? 'white'
                                                                : 'black',
                                                        }}
                                                    />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    {error && <p>{error}</p>}
                </TableContainer>
                <Grid item xs={12} className={theme.aggrid}></Grid>
            </Grid>
        </Grid>
    );
};

export default SitePropertiesDialog;
