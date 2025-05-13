/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { useIntl } from 'react-intl';
import { useCallback, useMemo, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormContext, useWatch } from 'react-hook-form';
import {
    DELETION_MARK,
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
    const rows = useWatch({ name: `${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}` });
    const { getValues, setValue } = useFormContext();
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
                label: SHUNT_COMPENSATOR_ID,
                dataKey: SHUNT_COMPENSATOR_ID,
                initialValue: '',
                width: '25%',
            },
            {
                label: SHUNT_COMPENSATOR_NAME,
                dataKey: SHUNT_COMPENSATOR_NAME,
                initialValue: '',
                width: '20%',
            },
            {
                label: MAX_Q_AT_NOMINAL_V,
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

    const markRowToDeleteOrRestore = useCallback(
        (index: number) => {
            const newDeleteMark = !getValues(`${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}[${index}].${DELETION_MARK}`);
            setValue(`${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}[${index}].${DELETION_MARK}`, newDeleteMark, {
                shouldDirty: true,
            });
        },
        [getValues, id, setValue]
    );

    const PreviousConnection = useCallback(
        (index: number) => {
            const currentId = getValues(`${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}[${index}].${SHUNT_COMPENSATOR_ID}`);
            const filteredValues = previousValues?.filter((value) => value.id === currentId);
            let previousValue: boolean | null = null;

            if (filteredValues?.length === 1) {
                previousValue = filteredValues[0]?.connectedToHvdc ?? false;
            }
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
                    variant="standard"
                    InputProps={{
                        disableUnderline: true,
                    }}
                />
            );
        },
        [getValues, id, intl, previousValues]
    );

    const IdField = useCallback(
        (index: number) => {
            return (
                <TextField
                    fullWidth
                    size="small"
                    value={
                        getValues(`${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}[${index}].${SHUNT_COMPENSATOR_ID}`) ?? ''
                    }
                    disabled
                />
            );
        },
        [getValues, id]
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

    const DeleteOrRestoreIcon = useCallback((shouldDelete: boolean) => {
        return !shouldDelete ? <DeleteIcon /> : <RestoreFromTrashIcon />;
    }, []);

    const ShuntCompensatorSelectedField = useCallback(
        (index: number, disabled: boolean) => {
            return (
                <CheckboxNullableInput
                    name={`${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}[${index}].${SHUNT_COMPENSATOR_SELECTED}`}
                    label=""
                    nullDisabled={false}
                    disabled={disabled}
                />
            );
        },
        [id]
    );

    const shouldDeleteRow = useCallback(
        (index: number) => {
            return rows?.[index].deletionMark ?? false;
        },
        [rows]
    );

    const renderTableCell = (index: number) => {
        const disabled = shouldDeleteRow(index);
        return columnsDefinition.map((column) => (
            <TableCell key={column.dataKey} sx={{ width: column.width, textAlign: 'center' }}>
                {column.dataKey === SHUNT_COMPENSATOR_ID && IdField(index)}
                {column.dataKey === SHUNT_COMPENSATOR_NAME && NameField(index, disabled)}
                {column.dataKey === MAX_Q_AT_NOMINAL_V && NominalVoltageField(index, disabled)}
                {column.dataKey === PREVIOUS_SHUNT_COMPENSATOR_SELECTED && PreviousConnection(index)}
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
                            {/*   TODO : uncomment this code when we can add new shunt compensators
                                                      <Tooltip
                                title={intl.formatMessage({
                                    id: 'AddRows',
                                })}
                            >
                                <span>
                                    <IconButton disabled>
                                        <AddCircleIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>*/}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row: Record<'id', string>, index: number) => (
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
                                            id: !shouldDeleteRow(index) ? 'DeleteRows' : 'button.restore',
                                        })}
                                    >
                                        <IconButton onClick={() => markRowToDeleteOrRestore(index)}>
                                            {DeleteOrRestoreIcon(shouldDeleteRow(index))}
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
