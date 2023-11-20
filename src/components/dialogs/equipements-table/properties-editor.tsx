import React, { useState } from 'react';
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TextField,
    Button,
    IconButton,
    Tooltip,
    Box,
    TableContainer,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { FormattedMessage, useIntl } from 'react-intl';
import { DARK_THEME } from '@gridsuite/commons-ui';
import { getLocalStorageTheme } from 'redux/local-storage';
import { DeleteForeverOutlined } from '@mui/icons-material';

interface IPropertiesData {
    id?: number;
    key: string;
    value: string;
}

interface PropertiesEditorProps {
    data: IPropertiesData[];
    validateData: () => void;
}

const PropertiesEditor: React.FC<PropertiesEditorProps> = ({
    data: initialData,
    validateData,
}) => {
    const [data, setData] = useState<IPropertiesData[]>(
        initialData.map((item, index) => ({ ...item, id: index }))
    );
    // const [data, setData] = useState<IPropertiesData[]>(initialData || [{ id: 0, name: '', value: '' }]);
    const [error, setError] = useState<string>('');

    const [invalidCells, setInvalidCells] = useState<number[]>([]);
    const intl = useIntl();
    const theme = getLocalStorageTheme() === DARK_THEME;
    const handleNameChange = (index: number, value: string) => {
        const newData = [...data];
        newData[index].key = value;
        setData(newData);
    };

    const handleValueChange = (index: number, value: string) => {
        const newData = [...data];
        newData[index].value = value;
        setData(newData);
    };

    const handleRemoveRow = (index: number) => {
        const newData = [...data];
        newData.splice(index, 1);
        // Update the id of the remaining rows
        newData.forEach((item, i) => {
            item.id = i;
        });
        setData(newData);
    };

    const performValidation = () => {
        const names = new Set<string>();
        let hasError = false;
        const invalidCells: number[] = [];

        data.forEach((item, index) => {
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
            validateData();
            console.log('gridref', data);
        }

        setInvalidCells(invalidCells);
    };

    const handleAddRow = () => {
        const newId = data.length;
        setData([...data, { id: newId, key: '', value: '' }]);
    };

    return (
        <TableContainer
            sx={{
                height: 300,
                border: 'solid 0px rgba(0,0,0,0.1)',
            }}
        >
            <Table stickyHeader size="small">
                <PropertiesEditorHeader
                    theme={theme}
                    handleAddRow={handleAddRow}
                />

                <TableBody>
                    {data.map((item, index) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <TextField
                                    value={item.key}
                                    onChange={(e) =>
                                        handleNameChange(index, e.target.value)
                                    }
                                    error={invalidCells.includes(index)}
                                />
                            </TableCell>
                            <TableCell>
                                <TextField
                                    value={item.value}
                                    onChange={(e) =>
                                        handleValueChange(index, e.target.value)
                                    }
                                    error={invalidCells.includes(index)}
                                />
                            </TableCell>
                            <TableCell>
                                <Tooltip
                                    title={intl.formatMessage({
                                        id: 'DeleteRows',
                                    })}
                                    placement="top"
                                >
                                    <span>
                                        <IconButton
                                            onClick={() =>
                                                handleRemoveRow(index)
                                            }
                                        >
                                            <DeleteForeverOutlined
                                                sx={{
                                                    color: theme
                                                        ? 'white'
                                                        : 'black',
                                                }}
                                            />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Button onClick={performValidation}>Validate</Button>
            {error && <p>{error}</p>}
        </TableContainer>
    );
};

export default PropertiesEditor;

const PropertiesEditorHeader = ({
    theme,
    handleAddRow,
}: {
    theme: boolean;
    handleAddRow: () => void;
}) => {
    const intl = useIntl();
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
    return (
        <TableHead>
            <TableRow>
                {COLUMNS_DEFINITIONS_SET.map((column: any) => (
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
                                        color: theme ? 'white' : 'black',
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
