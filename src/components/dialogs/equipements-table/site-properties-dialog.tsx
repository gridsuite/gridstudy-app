/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
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
import { FormattedMessage, useIntl } from 'react-intl';
import { Box } from '@mui/system';
import Tooltip from '@mui/material/Tooltip';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { SelectOptionsDialog } from 'utils/dialogs';
import yup from '../../utils/yup-config';

type IData = {
    id: number;
    key: string;
    value: any;
};

const validationSchema = yup
    .array()
    .of(
        yup.object().shape({
            key: yup.string().required('FillAllFields'),
            value: yup.string().required('FillAllFields'),
        })
    )
    .test('unique-keys', 'DuplicatedProps', (values: any) => {
        const keys = values.map((value: IData) => value.key);
        const uniqueKeys = new Set(keys);
        return keys.length === uniqueKeys.size;
    });

type SitePropertiesDialogProps = {
    open: boolean;
    spreadsheetContext: any;
    closeDialog: (status: boolean) => void;
    editingData: any;
    setEditingData: any;
};

/**
 * @author Jamal KHEYYAD <jamal.kheyyad at rte-international.com>
 */
const SitePropertiesDialog: FunctionComponent<SitePropertiesDialogProps> = ({
    open,
    spreadsheetContext,
    closeDialog,
    editingData,
    setEditingData,
}) => {
    const theme = useTheme();
    const [error, setError] = useState<string>('');
    const intl = useIntl();
    const [rowData, setRowData] = useState<IData[]>(() => {
        const data = editingData; //spreadsheetContext.dynamicValidation;
        if (!data?.properties) {
            return [];
        }
        const keys = Object.keys(data.properties);
        return keys.map((key, index) => {
            return { id: index, key: key, value: data.properties[key] };
        });
    });

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
        //validate rowData with yup and display error message and erros cells if any
        let hasError = false;
        try {
            hasError = !validationSchema.isValidSync(rowData);
            validationSchema.validateSync(rowData, {
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
            closeDialog(true);
            prepareDataAndSendRequest();
        }

        return !hasError;
    };

    const prepareDataAndSendRequest = () => {
        //take each value from properties Array and add it to editingData where 'name' is the key and 'value' is the value
        function arrayToObject(arr: IData[]) {
            return arr.reduce((obj: any, item) => {
                obj[item.key] = item.value;
                return obj;
            }, {});
        }
        // add properties to editingData
        setEditingData({
            ...editingData,
            properties: arrayToObject(rowData),
            previousProperties: spreadsheetContext.dynamicValidation.properties,
        });
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
                                    darkTheme={theme.palette.mode === 'dark'}
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
};

export default SitePropertiesDialog;

const PropertiesEditorHeader = ({
    darkTheme,
    handleAddRow,
}: {
    darkTheme: boolean;
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
                    <TableCell key={column.label}>
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
