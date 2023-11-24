/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, {
    FunctionComponent,
    useCallback,
    useMemo,
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
import { FormattedMessage, useIntl } from 'react-intl';
import { Box } from '@mui/system';
import Tooltip from '@mui/material/Tooltip';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { SelectOptionsDialog } from 'utils/dialogs';
import {
    formatPropertiesForBackend,
    modifySubstation,
} from 'services/study/network-modifications';
import { useSnackMessage } from '@gridsuite/commons-ui';

type SitePropertiesDialogProps = {
    open: boolean;
    spreadsheetApi: any;
    spreadsheetContext: any;
    closeDialog: (status: boolean) => void;
    studyUuid: string;
    currentNode: any;
    equipmentId: string;
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
    spreadsheetApi,
    spreadsheetContext,
    closeDialog,
    studyUuid,
    currentNode,
    equipmentId,
}) => {
    const theme = useTheme();
    const [error, setError] = useState<string>('');
    const [invalidCells, setInvalidCells] = useState<number[]>([]);
    const intl = useIntl();
    const { snackError } = useSnackMessage();
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
                setError(
                    intl.formatMessage({
                        id: 'FillAllFields',
                    })
                );
                hasError = true;
                invalidCells.push(index);
            } else if (names.has(item.key)) {
                setError(
                    intl.formatMessage({
                        id: 'DuplicateProperty',
                    })
                );
                hasError = true;
                invalidCells.push(index);
            } else {
                names.add(item.key);
            }
        });

        if (!hasError) {
            setError('');
            closeDialog(true);
            prepareDataAndSendRequest();
        }

        setInvalidCells(invalidCells);

        return !hasError;
    };

    const prepareDataAndSendRequest = () => {
        const initialProperties =
            spreadsheetContext.dynamicValidation.properties;
        //extract keys and values from initial properties to an array of objects with name and value
        const initialPropertiesMapped = initialProperties
            ? Object.keys(initialProperties).map((key) => {
                  return {
                      name: key,
                      value: initialProperties[key],
                  };
              })
            : [];

        //extract keys and values from current properties to an array of objects with name and value
        const properties = rowData.map((row) => {
            return {
                name: row.key,
                value: row.value,
            };
        });

        const propertiesSiteFormated = formatPropertiesForBackend(
            initialPropertiesMapped,
            properties
        );

        modifySubstation(
            studyUuid,
            currentNode.id,
            spreadsheetContext.dynamicValidation.id,
            equipmentId,
            null,
            false,
            null,
            propertiesSiteFormated
        )
            .catch((err) => {
                snackError({
                    messageTxt: err.message,
                    headerId: 'SubstationModificationError',
                });
            })
            .finally(() => {
                spreadsheetApi?.stopEditing();
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
