/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    useCallback,
    useState,
    forwardRef,
    useImperativeHandle,
    useMemo,
} from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {
    Autocomplete,
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
import { FormattedMessage, useIntl } from 'react-intl';
import {
    checkValidationsAndRefreshCells,
    deepUpdateValue,
} from './equipment-table-utils';
import { LocalizedCountries } from 'components/utils/localized-countries-hook';
import { SelectOptionsDialog } from 'utils/dialogs';
import yup from 'components/utils/yup-config';

export const NumericalField = forwardRef(
    ({ defaultValue, gridContext, colDef, gridApi, rowData }, ref) => {
        const error = useMemo(() => {
            return Object.keys(gridContext.editErrors).includes(colDef.field);
        }, [colDef.field, gridContext.editErrors]);

        const intl = useIntl();

        const minExpression = colDef.crossValidation?.minExpression;
        const maxExpression = colDef.crossValidation?.maxExpression;

        //minExpression and maxExpression are either a reference to a variable or a static number
        const minValue = useMemo(() => {
            if (!isNaN(minExpression)) {
                return minExpression;
            }
            return rowData[minExpression];
        }, [minExpression, rowData]);

        const maxValue = useMemo(() => {
            if (!isNaN(maxExpression)) {
                return maxExpression;
            }
            return rowData[maxExpression];
        }, [maxExpression, rowData]);

        const [value, setValue] = useState(defaultValue);

        useImperativeHandle(
            ref,
            () => {
                return {
                    getValue: () => {
                        return value;
                    },
                    getField: () => {
                        return colDef.field;
                    },
                };
            },
            [colDef.field, value]
        );

        const validateEvent = useCallback(
            (ev) => {
                let newVal = parseFloat(ev.target.value);
                if (isNaN(newVal)) {
                    newVal = undefined;
                }
                setValue(newVal);
                gridContext.dynamicValidation = deepUpdateValue(
                    gridContext.dynamicValidation,
                    colDef.field,
                    newVal
                );
                checkValidationsAndRefreshCells(gridApi, gridContext);
            },
            [colDef.field, gridApi, gridContext]
        );

        function renderNumericText() {
            return (
                <TextField
                    value={value}
                    onChange={validateEvent}
                    error={error}
                    type={'number'}
                    size={'small'}
                    margin={'none'}
                    autoFocus
                    inputProps={{
                        style: {
                            textAlign: 'center',
                            fontSize: 'small',
                        },
                        min: { minValue },
                        max: { maxValue },
                        step: 'any',
                        lang: 'en-US', // to have . as decimal separator
                    }}
                />
            );
        }

        function renderNumericTextWithTooltip() {
            let tooltip = '';
            if (minValue !== undefined && maxValue !== undefined) {
                tooltip = intl.formatMessage(
                    { id: 'MinMax' },
                    { min: minValue, max: maxValue }
                );
            } else if (minValue !== undefined) {
                tooltip = intl.formatMessage(
                    { id: 'OnlyMin' },
                    { min: minValue }
                );
            } else if (maxValue !== undefined) {
                tooltip = intl.formatMessage(
                    { id: 'OnlyMax' },
                    { max: maxValue }
                );
            }
            if (tooltip !== '') {
                return <Tooltip title={tooltip}>{renderNumericText()}</Tooltip>;
            }
            return renderNumericText();
        }

        return (
            <div style={{ width: 'inherit' }}>
                {renderNumericTextWithTooltip()}
            </div>
        );
    }
);

export const BooleanListField = forwardRef(
    ({ defaultValue, gridContext, colDef, gridApi }, ref) => {
        const intl = useIntl();
        const [value, setValue] = useState(defaultValue);

        useImperativeHandle(
            ref,
            () => {
                return {
                    getValue: () => {
                        return value;
                    },
                    getField: () => {
                        return colDef.field;
                    },
                };
            },
            [colDef.field, value]
        );

        const validateChange = useCallback(
            (ev) => {
                const val = ev.target.value;
                setValue(val);
                gridContext.dynamicValidation = deepUpdateValue(
                    gridContext.dynamicValidation,
                    colDef.field,
                    val
                );
                checkValidationsAndRefreshCells(gridApi, gridContext);
            },
            [colDef.field, gridApi, gridContext]
        );

        return (
            <Select
                value={value}
                onChange={validateChange}
                size={'medium'}
                margin={'none'}
                style={{ width: '100%' }}
                autoFocus
            >
                <MenuItem value={1} key={colDef.field + '_1'}>
                    <em>{intl.formatMessage({ id: 'true' })}</em>
                </MenuItem>
                <MenuItem value={0} key={colDef.field + '_0'}>
                    <em>{intl.formatMessage({ id: 'false' })}</em>
                </MenuItem>
            </Select>
        );
    }
);

export const SelectCountryField = forwardRef(({ gridContext, colDef }, ref) => {
    const [value, setValue] = useState(null);
    const { translate, countryCodes } = LocalizedCountries();

    useImperativeHandle(
        ref,
        () => {
            return {
                getValue: () => {
                    return value;
                },
                getField: () => {
                    return colDef.field;
                },
            };
        },
        [colDef.field, value]
    );

    return (
        <Autocomplete
            options={countryCodes}
            getOptionLabel={(countryCode) => translate(countryCode)}
            style={{ width: '100%' }}
            onChange={(event, newValue) => {
                setValue(newValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={<FormattedMessage id={'descLfAllCountries'} />}
                />
            )}
        />
    );
});

const validationSchema = yup
    .array()
    .of(
        yup.object().shape({
            key: yup.string().required('FillAllFields'),
            value: yup.string().required('FillAllFields'),
        })
    )
    .test('unique-keys', 'DuplicatedProps', (values) => {
        const keys = values.map((value) => value.key);
        const uniqueKeys = new Set(keys);
        return keys.length === uniqueKeys.size;
    });

/**
 * @author Jamal KHEYYAD <jamal.kheyyad at rte-international.com>
 */
export const SitePropertiesEditor = forwardRef(
    ({ gridContext, colDef, gridApi, rowData }, ref) => {
        const theme = useTheme();
        const [error, setError] = useState('');
        const intl = useIntl();
        const [open, setOpen] = useState(true);
        const [localRowData, setRowData] = useState(() => {
            const data = rowData; //spreadsheetContext.dynamicValidation;
            if (!data?.properties) {
                return [];
            }
            const keys = Object.keys(data.properties);
            return keys.map((key, index) => {
                return { id: index, key: key, value: data.properties[key] };
            });
        });

        function arrayToObject(arr) {
            return arr.reduce((obj, item) => {
                obj[item.key] = item.value;
                return obj;
            }, {});
        }

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
                };
            },
            [colDef.field, localRowData]
        );

        const handleRemoveRow = useCallback(
            (index) => {
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
            //validate rowData with yup and display error message and erros cells if any
            let hasError = false;
            try {
                hasError = !validationSchema.isValidSync(localRowData);
                validationSchema.validateSync(localRowData, {
                    abortEarly: true,
                });
            } catch (err) {
                setError(
                    intl.formatMessage({
                        id: err.errors[0],
                    })
                );
            }
            if (!hasError) {
                setError('');
                setOpen(false);
                prepareDataAndSendRequest();
            }

            return !hasError;
        };

        const prepareDataAndSendRequest = () => {
            gridApi.stopEditing();
            // add properties to editingData
        };

        const handleNameChange = (index, value) => {
            const newData = [...localRowData];
            newData[index].key = value;
            setRowData(newData);
        };

        const handleValueChange = (index, value) => {
            const newData = [...localRowData];
            newData[index].value = value;
            setRowData(newData);
        };

        const handleCancelPopupSelectEditSiteProperties = () => {
            setOpen(false);
            gridApi.stopEditing();
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

const PropertiesEditorHeader = ({ darkTheme, handleAddRow }) => {
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
