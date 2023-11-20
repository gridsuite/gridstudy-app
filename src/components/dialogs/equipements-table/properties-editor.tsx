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
import { COLUMNS_DEFINITIONS_INJECTIONS_SET } from '../parameters/sensi/columns-definitions';
import { DARK_THEME } from '@gridsuite/commons-ui';
import { getLocalStorageTheme } from 'redux/local-storage';
import {
    INJECTIONS,
    MONITORED_BRANCHES,
} from 'components/utils/field-constants';

interface IPropertiesData {
    id?: number;
    name: string;
    value: string;
}

interface PropertiesEditorProps {
    data: IPropertiesData[];
}

const PropertiesEditor: React.FC<PropertiesEditorProps> = ({
    data: initialData,
}) => {
    const [data, setData] = useState<IPropertiesData[]>(
        initialData.map((item, index) => ({ ...item, id: index }))
    );
    // const [data, setData] = useState<IPropertiesData[]>(initialData || [{ id: 0, name: '', value: '' }]);
    const [error, setError] = useState<string>('');

    const [invalidCells, setInvalidCells] = useState<number[]>([]);
    const intl = useIntl();
    const handleNameChange = (index: number, value: string) => {
        const newData = [...data];
        newData[index].name = value;
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

    const validateData = () => {
        const names = new Set<string>();
        let hasError = false;
        const invalidCells: number[] = [];

        data.forEach((item, index) => {
            if (item.name.trim() === '' || item.value.trim() === '') {
                setError('Please fill in all fields');
                hasError = true;
                invalidCells.push(index);
            } else if (names.has(item.name)) {
                setError('Duplicate names are not allowed');
                hasError = true;
                invalidCells.push(index);
            } else {
                names.add(item.name);
            }
        });

        if (!hasError) {
            setError('');
            // Perform any additional actions with the validated data
            console.log('gridref', data);
        }

        setInvalidCells(invalidCells);
    };

    const handleAddRow = () => {
        const newId = data.length;
        setData([...data, { id: newId, name: '', value: '' }]);
    };

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

    return (
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
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <TextField
                                    value={item.name}
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
                                <Button onClick={() => handleRemoveRow(index)}>
                                    Remove
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Button onClick={handleAddRow}>Add Row</Button>
            <Button onClick={validateData}>Validate</Button>
            {error && <p>{error}</p>}
        </TableContainer>
    );
};

export default PropertiesEditor;
