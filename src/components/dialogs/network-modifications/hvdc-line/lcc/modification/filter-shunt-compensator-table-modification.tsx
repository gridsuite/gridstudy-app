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
import { ComponentType, useCallback, useMemo, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import {
    FILTERS_SHUNT_COMPENSATOR_TABLE,
    MAX_Q_AT_NOMINAL_V,
    PREVIOUS_SHUNT_COMPENSATOR_SELECTED,
    SHUNT_COMPENSATOR_ID,
    SHUNT_COMPENSATOR_NAME,
    SHUNT_COMPENSATOR_SELECTED,
} from '../../../../../utils/field-constants';
import { FieldConstants, FloatInput, ReactivePowerAdornment, TextInput } from '@gridsuite/commons-ui';
import TextField from '@mui/material/TextField';
import CheckboxNullableInput from '../../../../../utils/rhf-inputs/boolean-nullable-input';
import { LccShuntCompensatorInfos } from '../../../../../../services/network-modification-types';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';

const SHUNT_COLUMNS_DEFINITION = [
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
];

type RowFormProps<T> = {
    id: string;
    deletionMark: boolean;
    previousValues?: T;
};

function ShuntRowForm({ id, deletionMark, previousValues }: Readonly<RowFormProps<LccShuntCompensatorInfos>>) {
    const intl = useIntl();
    const PreviousConnection = useCallback(() => {
        let previousValue: boolean | null = null;

        if (previousValues) {
            previousValue = previousValues?.terminalConnected ?? false;
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
                name={`${id}.${SHUNT_COMPENSATOR_SELECTED}`}
                disabled
                variant="standard"
                InputProps={{
                    disableUnderline: true,
                }}
                sx={{ marginLeft: '20%' }}
            />
        );
    }, [id, intl, previousValues]);

    return SHUNT_COLUMNS_DEFINITION.map((column) => (
        <TableCell key={column.dataKey} sx={{ width: column.width, textAlign: 'center' }}>
            {column.dataKey === SHUNT_COMPENSATOR_ID && (
                <TextInput name={`${id}.${SHUNT_COMPENSATOR_ID}`} formProps={{ disabled: true }} />
            )}
            {column.dataKey === SHUNT_COMPENSATOR_NAME && (
                <TextInput name={`${id}.${SHUNT_COMPENSATOR_NAME}`} formProps={{ disabled: deletionMark }} />
            )}
            {column.dataKey === MAX_Q_AT_NOMINAL_V && (
                <FloatInput
                    name={`${id}.${MAX_Q_AT_NOMINAL_V}`}
                    adornment={ReactivePowerAdornment}
                    formProps={{ disabled: deletionMark }}
                />
            )}
            {column.dataKey === PREVIOUS_SHUNT_COMPENSATOR_SELECTED && <PreviousConnection />}
            {column.dataKey === SHUNT_COMPENSATOR_SELECTED && (
                <CheckboxNullableInput
                    name={`${id}.${SHUNT_COMPENSATOR_SELECTED}`}
                    label=""
                    nullDisabled={false}
                    formProps={{ disabled: deletionMark, sx: { marginLeft: '50%', marginRight: '50%' } }}
                />
            )}
        </TableCell>
    ));
}

type DeletableMarkRowProps<T> = {
    id: string;
    RowForm: ComponentType<RowFormProps<T>>;
    rowFormProps: Omit<RowFormProps<T>, 'id' | 'deletionMark'>;
};

function DeletableMarkRow<T>({ id, RowForm, rowFormProps }: Readonly<DeletableMarkRowProps<T>>) {
    const intl = useIntl();

    const [hoveredRow, setHoveredRow] = useState<boolean>(false);

    const { getValues, setValue } = useFormContext();

    const watchedDeletionMark =
        useWatch({
            name: `${id}.${FieldConstants.DELETION_MARK}`,
        }) ?? false;

    const markRowToDeleteOrRestore = useCallback(() => {
        const newDeleteMark = !getValues(`${id}.${FieldConstants.DELETION_MARK}`);
        setValue(`${id}.${FieldConstants.DELETION_MARK}`, newDeleteMark, {
            shouldDirty: true,
        });
    }, [getValues, id, setValue]);

    return (
        <TableRow
            onMouseEnter={() => {
                setHoveredRow(true);
            }}
            onMouseLeave={() => {
                setHoveredRow(false);
            }}
        >
            <RowForm id={id} deletionMark={watchedDeletionMark} {...rowFormProps} />
            <TableCell>
                {hoveredRow && (
                    <Tooltip
                        title={intl.formatMessage({
                            id: !watchedDeletionMark ? 'DeleteRows' : 'button.restore',
                        })}
                    >
                        <IconButton onClick={() => markRowToDeleteOrRestore()}>
                            {!watchedDeletionMark ? <DeleteIcon /> : <RestoreFromTrashIcon />}
                        </IconButton>
                    </Tooltip>
                )}
            </TableCell>
        </TableRow>
    );
}

interface ModificationFiltersShuntCompensatorTableProps {
    id: string;
    previousValues?: LccShuntCompensatorInfos[];
}

export default function ModificationFiltersShuntCompensatorTable({
    id,
    previousValues,
}: Readonly<ModificationFiltersShuntCompensatorTableProps>) {
    const intl = useIntl();

    const { getValues } = useFormContext();

    const shuntTableId = `${id}.${FILTERS_SHUNT_COMPENSATOR_TABLE}`;
    const { fields: rows } = useFieldArray({ name: shuntTableId });

    const columnsDefinition = useMemo(() => {
        return SHUNT_COLUMNS_DEFINITION.map((column) => ({
            ...column,
            label: intl.formatMessage({ id: column.label }),
        }));
    }, [intl]);

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
                            {/* TODO : uncomment this code when we can add new shunt compensator */}
                            {/*
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
                            </Tooltip>
                            */}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row: Record<'id', string>, index: number) => {
                        const id = `${shuntTableId}[${index}]`;
                        const shuntId = getValues(`${id}.${SHUNT_COMPENSATOR_ID}`);
                        const previousShuntValues = previousValues?.find((shuntInfos) => shuntInfos.id === shuntId);
                        return (
                            <DeletableMarkRow
                                key={row.id}
                                id={id}
                                RowForm={ShuntRowForm}
                                rowFormProps={{ previousValues: previousShuntValues }}
                            />
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
