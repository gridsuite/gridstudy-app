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
import { AgGridReact } from 'ag-grid-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box } from '@mui/system';
import Tooltip from '@mui/material/Tooltip';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { getLocalStorageTheme } from '../../../redux/local-storage';
import { DARK_THEME, elementType } from '@gridsuite/commons-ui';
import { SelectOptionsDialog } from 'utils/dialogs';

type SitePropertiesDialogProps = {
    open: boolean;
    spreadsheetContext: any;
    onDataChanged: (data: IData[]) => void;
    closeDialog: (status: boolean) => void;
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
    open,
    spreadsheetContext,
    onDataChanged,
    closeDialog,
}) => {
    const theme = useTheme();
    const gridRef = useRef<AgGridReact>(null);
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
    const [editedSubstationPropertiesData, setEditedSubstationPropertiesData] =
    useState({});


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

    const handleCancelPopupSelectEditSiteProperties = () => {
        closeDialog(true);
    };

    const handleSavePopupSelectEditSiteProperties = () => {
        closeDialog(true);

        // const properties = Object.keys(editedSubstationPropertiesData).map(
        //     (key) => {
        //         return {
        //             name: editedSubstationPropertiesData[key].key,
        //             value: editedSubstationPropertiesData[key].value,
        //         };
        //     }
        // );

        // const initialProperties = gridContext.dynamicValidation.properties;
        // //extract keys and values from initial properties to an array of objects with key and value
        // const initialPropertiesMapped = initialProperties
        //     ? Object.keys(initialProperties).map((key) => {
        //           return {
        //               name: key,
        //               value: initialProperties[key],
        //           };
        //       })
        //     : [];

        // const propertiesSiteFormated = formatPropertiesForBackend(
        //     initialPropertiesMapped,
        //     properties
        // );

        // modifySubstation(
        //     studyUuid,
        //     currentNode.id,
        //     gridContext.dynamicValidation.id,
        //     equipmentId,
        //     null,
        //     false,
        //     null,
        //     propertiesSiteFormated
        // ).catch((err) => {
        //     console.debug(err);
        // });
    };
    return (
        <SelectOptionsDialog
            open={open}
            onClose={handleCancelPopupSelectEditSiteProperties}
            onClick={handleSavePopupSelectEditSiteProperties}
            title={intl.formatMessage({
                id: 'editSiteProperties',
            })}
            child={
                <Grid container spacing={2} style={{ width: '500px' }}>
                    <Grid item xs={12}>
                        <TableContainer
                            sx={{
                                height: 300,
                                border: 'solid 0px rgba(0,0,0,0.1)',
                            }}
                        >
                            <Table stickyHeader size="small">
                                <PropertiesEditorHeader
                                    theme={theme.palette.mode === 'dark'}
                                    handleAddRow={handleAddRow}
                                />
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
                                                                handleRemoveRow(
                                                                    index
                                                                );
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
                    </Grid>
                </Grid>
            }
        />
    );
};

export default SitePropertiesDialog;

const PropertiesEditorHeader = ({
    theme,
    handleAddRow,
}: {
    theme: boolean;
    handleAddRow: () => void;
}) => {
    const intl = useIntl();
    const columnDefs = useMemo(() => {
        return [
            {
                label: intl.formatMessage({ id: 'Key' }),
                editable: true,
            },
            {
                label: intl.formatMessage({ id: 'Value' }),
                editable: true,
            },
        ];
    }, [intl]);

    return (
        <TableHead>
            <TableRow>
                {columnDefs.map((column: any) => (
                    <TableCell>
                        <Box
                            sx={{
                                backgroundColor: column.color,
                            }}
                        >
                            <FormattedMessage id={column.label} />
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
                            <IconButton color="primary" onClick={handleAddRow}>
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
    );
};
