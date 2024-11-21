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
import { useCallback, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFieldArray } from 'react-hook-form';
import {
    CONNECTED,
    FILTERS_MCS_TABLE,
    MAX_Q_AT_NOMINAL_V,
    SHUNT_COMPENSATOR_ID,
    SHUNT_COMPENSATOR_NAME,
} from '../../../../../utils/field-constants';
import { FloatInput, SwitchInput, TextInput } from '@gridsuite/commons-ui';

interface FiltersTableProps {
    id: string;
}
export default function FiltersTable({ id }: Readonly<FiltersTableProps>) {
    const intl = useIntl();
    const { fields: rows, insert, remove } = useFieldArray({ name: `${id}.${FILTERS_MCS_TABLE}` });
    const [isHover, setIsHover] = useState(false);
    function handleHover(enter: boolean) {
        return setIsHover(enter);
    }
    const insertRow = useCallback(
        (index: number) => {
            insert(index, {
                [SHUNT_COMPENSATOR_ID]: null,
                [SHUNT_COMPENSATOR_NAME]: null,
                [MAX_Q_AT_NOMINAL_V]: null,
                [CONNECTED]: false,
            });
        },
        [insert]
    );

    const handleInsertRow = () => {
        insertRow(rows.length - 1);
    };

    const handleRemoveRow = useCallback(
        (index: number) => {
            if (index >= 0 && index < rows.length) {
                remove(index);
            }
        },
        [remove, rows.length]
    );

    const shuntCompensatorIdField = (
        <TextInput
            name={`${id}.${FILTERS_MCS_TABLE}.${SHUNT_COMPENSATOR_ID}`}
            label={'shuntCompensatorId'}
            clearable={true}
        />
    );
    const shuntCompensatorNameField = (
        <TextInput
            name={`${id}.${FILTERS_MCS_TABLE}.${SHUNT_COMPENSATOR_NAME}`}
            label={'shuntCompensatorName'}
            clearable={true}
        />
    );
    const maxQAtNominalVField = (
        <FloatInput
            name={`${id}.${FILTERS_MCS_TABLE}.${MAX_Q_AT_NOMINAL_V}`}
            label={'maxQAtNominalV'}
            clearable={true}
        />
    );
    const connectedField = <SwitchInput name={`${id}.${FILTERS_MCS_TABLE}.${CONNECTED}`} />;

    return (
        <TableContainer
            sx={{
                height: 300,
                border: 'solid 0px rgba(0,0,0,0.1)',
            }}
        >
            <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                    {[
                        { id: 'shuntCompensatorId', width: '10rem' },
                        { id: 'shuntCompensatorName', width: '10rem' },
                        { id: 'maxQAtVnominal', width: '10rem' },
                    ].map(({ id, width }) => (
                        <TableCell key={id} sx={{ width: { width }, textAlign: 'center' }}>
                            <Box>{intl.formatMessage({ id })}</Box>
                        </TableCell>
                    ))}
                    <TableCell sx={{ width: '5rem', textAlign: 'center' }}>
                        <Tooltip title={intl.formatMessage({ id: 'AddRows' })}>
                            <span>
                                <IconButton onClick={() => handleInsertRow()}>
                                    <AddCircleIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </TableCell>
                </TableHead>
                <TableBody>
                    {rows.map((row: Record<'id', string>, index) => (
                        <TableRow onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                            <TableCell>{shuntCompensatorIdField}</TableCell>
                            <TableCell>{shuntCompensatorNameField}</TableCell>
                            <TableCell>{maxQAtNominalVField}</TableCell>
                            <TableCell>{connectedField}</TableCell>
                            <TableCell>
                                {isHover && (
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
