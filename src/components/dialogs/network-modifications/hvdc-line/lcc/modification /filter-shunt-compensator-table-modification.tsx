/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useIntl } from 'react-intl';
import { useCallback, useMemo, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
    FILTERS_SHUNT_COMPENSATOR_TABLE,
    MAX_Q_AT_NOMINAL_V,
    PREVIOUS_SHUNT_COMPENSATOR_SELECTED,
    SHUNT_COMPENSATOR_ID,
    SHUNT_COMPENSATOR_NAME,
    SHUNT_COMPENSATOR_SELECTED,
} from '../../../../../utils/field-constants';
import { FloatInput, TextInput } from '@gridsuite/commons-ui';
import { ReactivePowerAdornment } from '../../../../dialog-utils';
import TextField from '@mui/material/TextField';
import CheckboxNullableInput from '../../../../../utils/rhf-inputs/boolean-nullable-input';
import { LccShuntCompensatorInfos } from '../../../../../../services/network-modification-types';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';

interface ModificationFiltersShuntCompensatorTableProps {
    id: string;
    previousValues?: LccShuntCompensatorInfos[];
}
export function ModificationFiltersShuntCompensatorTable({
    id,
    previousValues,
}: Readonly<ModificationFiltersShuntCompensatorTableProps>) {
    const intl = useIntl();
    const {
        fields: rows,
        append: handleAddRow,
        remove: handleRemoveRow,
    } = useFieldArray({ name: `${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}` });
    const { getValues } = useFormContext();
    const [isHover, setIsHover] = useState<Record<number, boolean>>({});
    const [rowsToDelete, setRowsToDelete] = useState<Array<number>>([]);
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
                width: '25%',
            },
            {
                label: 'shuntCompensatorName',
                dataKey: SHUNT_COMPENSATOR_NAME,
                initialValue: '',
                width: '20%',
            },
            {
                label: 'maxQAtNominalV',
                dataKey: MAX_Q_AT_NOMINAL_V,
                initialValue: null,
                width: '25%',
            },
            {
                label: 'previousConnection',
                dataKey: PREVIOUS_SHUNT_COMPENSATOR_SELECTED,
                initialValue: null,
                width: '20%',
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

    const markRowToDeleteOrRestore = useCallback(
        (index: number) => {
            if (rowsToDelete.includes(index)) {
                setRowsToDelete(rowsToDelete.filter((row) => row !== index));
            } else {
                setRowsToDelete([...rowsToDelete, index]);
            }
        },
        [rowsToDelete]
    );

    const PreviousConnexion = useCallback(
        (index: number) => {
            const previousValue = previousValues?.[index]?.connectedToHvdc;
            const value = previousValue
                ? intl.formatMessage({ id: 'connected' })
                : previousValue === false
                  ? intl.formatMessage({ id: 'disconnected' })
                  : '';

            return (
                <TextField
                    size="small"
                    fullWidth
                    value={value}
                    name={`${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}[${index}].${SHUNT_COMPENSATOR_SELECTED}`}
                    disabled
                />
            );
        },
        [id, intl, previousValues]
    );

    const IdField = useCallback(
        (index: number) => {
            return previousValues && index >= previousValues.length ? (
                <TextInput name={`${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}[${index}].${SHUNT_COMPENSATOR_ID}`} />
            ) : (
                <TextField fullWidth size="small" value={previousValues?.[index]?.id ?? ''} name={``} disabled />
            );
        },
        [id, previousValues]
    );

    const NameField = useCallback(
        (index: number, disabled: boolean) => {
            return disabled ? (
                <TextField
                    fullWidth
                    size="small"
                    value={getValues(`${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}[${index}].${SHUNT_COMPENSATOR_NAME}`)}
                    disabled
                />
            ) : (
                <TextInput name={`${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}[${index}].${SHUNT_COMPENSATOR_NAME}`} />
            );
        },
        [getValues, id]
    );

    const NominalVoltageField = useCallback(
        (index: number, disabled: boolean) => {
            return disabled ? (
                <TextField
                    fullWidth
                    size="small"
                    value={getValues(`${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}[${index}].${MAX_Q_AT_NOMINAL_V}`)}
                    disabled
                />
            ) : (
                <FloatInput
                    name={`${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}[${index}].${MAX_Q_AT_NOMINAL_V}`}
                    adornment={ReactivePowerAdornment}
                />
            );
        },
        [getValues, id]
    );

    const DeleteOrRestoreIcon = useCallback(
        (index: number) => {
            return rowsToDelete.find((element) => element === index) === undefined ? (
                <DeleteIcon />
            ) : (
                <RestoreFromTrashIcon />
            );
        },
        [rowsToDelete]
    );

    const ShuntCompensatorSelectedField = useCallback(
        (index: number, disabled: boolean) => {
            return (
                <CheckboxNullableInput
                    name={`${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}[${index}].${SHUNT_COMPENSATOR_SELECTED}`}
                    label=""
                    nullDisabled={previousValues && index >= previousValues.length}
                    disabled={disabled}
                />
            );
        },
        [id, previousValues]
    );

    const renderTableCell = (index: number) => {
        const disabled = rowsToDelete.includes(index);
        return columnsDefinition.map((column) => (
            <TableCell key={column.dataKey} sx={{ width: column.width, textAlign: 'center' }}>
                {column.dataKey === SHUNT_COMPENSATOR_ID && IdField(index)}
                {column.dataKey === SHUNT_COMPENSATOR_NAME && NameField(index, disabled)}
                {column.dataKey === MAX_Q_AT_NOMINAL_V && NominalVoltageField(index, disabled)}
                {column.dataKey === PREVIOUS_SHUNT_COMPENSATOR_SELECTED && PreviousConnexion(index)}
                {column.dataKey === SHUNT_COMPENSATOR_SELECTED && ShuntCompensatorSelectedField(index, disabled)}
            </TableCell>
        ));
    };

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
                            {renderTableCell(index)}
                            <TableCell>
                                {isHover[index] && (
                                    <Tooltip
                                        title={intl.formatMessage({
                                            id: 'DeleteRows',
                                        })}
                                    >
                                        <IconButton
                                            onClick={() =>
                                                previousValues && index >= previousValues?.length
                                                    ? handleRemoveRow(index)
                                                    : markRowToDeleteOrRestore(index)
                                            }
                                        >
                                            {DeleteOrRestoreIcon(index)}
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
