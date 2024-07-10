/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    useCallback,
    useState,
    forwardRef,
    useImperativeHandle,
    useMemo,
    useEffect,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {
    Box,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    useTheme,
} from '@mui/material';
import { SelectOptionsDialog } from 'utils/dialogs';
import yup from 'components/utils/yup-config';
import { ICellEditorParams } from 'ag-grid-community';

const validationSchema = yup
    .array()
    .of(
        yup.object().shape({
            key: yup.string().required('FillAllFields'),
            value: yup.string().required('FillAllFields'),
        })
    )
    .test('unique-keys', 'DuplicatedPropsError', (values) => {
        const keys = values?.map((value) => value.key);
        const uniqueKeys = new Set(keys);
        return keys?.length === uniqueKeys.size;
    });

function arrayToObject(arr: any[]) {
    return arr.reduce((obj, item) => {
        obj[item.key] = item.value;
        return obj;
    }, {});
}

function initializeLocalRowData(rowData: any) {
    if (!rowData?.properties) {
        return [];
    }
    const keys = Object.keys(rowData.properties);
    return keys.map((key, index) => {
        return { id: index, key: key, value: rowData.properties[key] };
    });
}

export const SitePropertiesEditor = forwardRef(
    ({ colDef, data, stopEditing }: ICellEditorParams, ref) => {
        const theme = useTheme();
        const [error, setError] = useState('');
        const intl = useIntl();
        const [open, setOpen] = useState(true);
        const [cancel, setCancel] = useState(false);
        const [localRowData, setRowData] = useState(() =>
            initializeLocalRowData(data)
        );

        // Documented in https://www.ag-grid.com/archive/31.2.0/react-data-grid/component-cell-editor-imperative-react/
        useImperativeHandle(
            ref,
            () => {
                return {
                    getValue: () => {
                        return arrayToObject(localRowData);
                    },
                    getField: () => {
                        return colDef.field;
                    },
                    isCancelAfterEnd: () => {
                        return cancel;
                    },
                };
            },
            [colDef.field, localRowData, cancel]
        );

        useEffect(() => {
            if (cancel) {
                stopEditing();
            }
        }, [cancel, stopEditing]);

        const handleRemoveRow = useCallback(
            (index: number) => {
                const newData = [...localRowData];
                newData.splice(index, 1);
                // Update the id of the remaining rows
                newData.forEach((item, i) => {
                    item.id = i;
                });
                setRowData(newData);
            },
            [localRowData]
        );

        const handleAddRow = () => {
            const newId = localRowData.length;
            setRowData([...localRowData, { id: newId, key: '', value: '' }]);
        };

        const performValidation = () => {
            //validate rowData with yup and display error message and errors cells if any
            let hasError = false;
            try {
                hasError = !validationSchema.isValidSync(localRowData);
                validationSchema.validateSync(localRowData, {
                    abortEarly: true,
                });
            } catch (err: any) {
                setError(
                    intl.formatMessage({
                        id: err.errors[0],
                    })
                );
            }
            if (!hasError) {
                setError('');
                setOpen(false);
                stopEditing();
            }

            return !hasError;
        };

        const handleNameChange = (index: number, value: any) => {
            const newData = [...localRowData];
            newData[index].key = value;
            setRowData(newData);
        };

        const handleValueChange = (index: number, value: any) => {
            const newData = [...localRowData];
            newData[index].value = value;
            setRowData(newData);
        };

        const handleCancelPopupSelectEditSiteProperties = () => {
            setOpen(false);
            setCancel(true);
        };

        return (
            <SelectOptionsDialog
                open={open}
                onClose={handleCancelPopupSelectEditSiteProperties}
                onClick={performValidation}
                title={intl.formatMessage({
                    id: 'editSiteProperties',
                })}
                style={undefined}
                child={
                    <Grid container spacing={2} style={{ width: '500px' }}>
                        <Grid item xs={12}>
                            <TableContainer
                                sx={{
                                    border: 'solid 0px rgba(0,0,0,0.1)',
                                }}
                            >
                                <Table stickyHeader size="small">
                                    <PropertiesEditorHeader
                                        darkTheme={
                                            theme.palette.mode === 'dark'
                                        }
                                        handleAddRow={handleAddRow}
                                    />
                                    <TableBody>
                                        {localRowData?.map((row, index) => {
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
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
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
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
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
                                                                        color:
                                                                            theme
                                                                                .palette
                                                                                .mode ===
                                                                            'dark'
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
                            </TableContainer>
                        </Grid>
                        <Grid item>
                            <Box
                                sx={{
                                    color: 'red',
                                }}
                            >
                                {error && <p>{error}</p>}
                            </Box>
                        </Grid>
                    </Grid>
                }
            />
        );
    }
);

const PropertiesEditorHeader = ({ darkTheme, handleAddRow }: any) => {
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
                {columnDefs.map((column) => (
                    <TableCell key={column.label}>
                        <Box>
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
                                        color: darkTheme ? 'white' : 'black',
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
