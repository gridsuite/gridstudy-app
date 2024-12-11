/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useIntl } from 'react-intl';
import { useMemo, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFieldArray } from 'react-hook-form';
import {
    FILTERS_SHUNT_COMPENSATOR_TABLE,
    MAX_Q_AT_NOMINAL_V,
    SHUNT_COMPENSATOR_ID,
    SHUNT_COMPENSATOR_NAME,
    SHUNT_COMPENSATOR_SELECTED,
} from '../../../../../utils/field-constants';
import { FloatInput, SwitchInput, TextInput } from '@gridsuite/commons-ui';
import { ReactivePowerAdornment } from '../../../../dialog-utils';

interface FiltersShuntCompensatorTableProps {
    id: string;
}
export default function FiltersShuntCompensatorTable({ id }: Readonly<FiltersShuntCompensatorTableProps>) {
    const intl = useIntl();
    const {
        fields: rows,
        append: handleAddRow,
        remove: handleRemoveRow,
    } = useFieldArray({ name: `${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}` });
    const [isHover, setIsHover] = useState<Record<number, boolean>>({});
    const handleHover = (rowIndex: number, hoverState: boolean) => {
        setIsHover((prev) => ({
            ...prev,
            [rowIndex]: hoverState,
        }));
    };
    const columnsDefinition = useMemo(() => {
        return [
            {
                label: 'shuntCompensatorId',
                dataKey: SHUNT_COMPENSATOR_ID,
                initialValue: '',
                width: '30%',
            },
            {
                label: 'shuntCompensatorName',
                dataKey: SHUNT_COMPENSATOR_NAME,
                initialValue: '',
                width: '30%',
            },
            {
                label: 'maxQAtNominalV',
                dataKey: MAX_Q_AT_NOMINAL_V,
                initialValue: null,
                width: '30%',
            },
            {
                label: 'connected',
                dataKey: SHUNT_COMPENSATOR_SELECTED,
                initialValue: true,
                width: '10%',
            },
        ].map((column) => ({
            ...column,
            label: intl.formatMessage({ id: column.label }),
        }));
    }, [intl]);

    const newRowData = useMemo(() => {
        const newRowData: { [key: string]: null | string | boolean } = {};
        columnsDefinition.forEach((column) => {
            newRowData[column.dataKey] = column.initialValue;
        });
        return newRowData;
    }, [columnsDefinition]);

    return (
        <TableContainer>
            <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', textAlign: 'center' }}>
                <TableHead>
                    <TableRow>
                        {columnsDefinition.map((column) => (
                            <TableCell key={column.dataKey} sx={{ width: column.width, textAlign: 'center' }}>
                                <Box>{column.label}</Box>
                            </TableCell>
                        ))}
                        <TableCell sx={{ width: '10%', textAlign: 'right' }}>
                            <Tooltip
                                title={intl.formatMessage({
                                    id: 'AddRows',
                                })}
                            >
                                <span>
                                    <IconButton onClick={() => handleAddRow(newRowData)}>
                                        <AddCircleIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row: Record<'id', string>, index) => (
                        <TableRow
                            key={row.id}
                            className={isHover[index] ? 'hover-row' : ''}
                            onMouseEnter={() => handleHover(index, true)}
                            onMouseLeave={() => handleHover(index, false)}
                        >
                            {columnsDefinition.map((column) => (
                                <TableCell key={column.dataKey} sx={{ width: column.width, textAlign: 'center' }}>
                                    {column.dataKey === SHUNT_COMPENSATOR_ID && (
                                        <TextInput
                                            name={`${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}[${index}].${SHUNT_COMPENSATOR_ID}`}
                                        />
                                    )}
                                    {column.dataKey === SHUNT_COMPENSATOR_NAME && (
                                        <TextInput
                                            name={`${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}[${index}].${SHUNT_COMPENSATOR_NAME}`}
                                        />
                                    )}
                                    {column.dataKey === MAX_Q_AT_NOMINAL_V && (
                                        <FloatInput
                                            name={`${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}[${index}].${MAX_Q_AT_NOMINAL_V}`}
                                            adornment={ReactivePowerAdornment}
                                        />
                                    )}
                                    {column.dataKey === SHUNT_COMPENSATOR_SELECTED && (
                                        <SwitchInput
                                            name={`${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}[${index}].${SHUNT_COMPENSATOR_SELECTED}`}
                                        />
                                    )}
                                </TableCell>
                            ))}
                            <TableCell>
                                {isHover[index] && (
                                    <Tooltip
                                        title={intl.formatMessage({
                                            id: 'DeleteRows',
                                        })}
                                    >
                                        <IconButton onClick={() => handleRemoveRow(index)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
