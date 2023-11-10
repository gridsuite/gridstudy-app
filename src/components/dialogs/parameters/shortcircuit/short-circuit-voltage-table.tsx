/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { FunctionComponent, useMemo } from 'react';
import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { useIntl } from 'react-intl';
import { VoltageTableProps } from './short-circuit-parameters.type';
import { getValues } from './short-circuit-parameters-utils';

const VoltageTable: FunctionComponent<VoltageTableProps> = ({
    voltageProfileMode,
    values,
}) => {
    const intl = useIntl();

    const valuesToDisplay = useMemo(() => {
        return getValues(values, voltageProfileMode);
    }, [values, voltageProfileMode]);

    const rows = useMemo(
        () => [
            {
                name: intl.formatMessage({ id: 'shortCircuitNominalVoltage' }),
                values: valuesToDisplay.nominalTension,
            },
            {
                name: intl.formatMessage({ id: 'shortCircuitInitialVoltage' }),
                values: valuesToDisplay.initialTension,
            },
        ],
        [valuesToDisplay, intl]
    );
    return (
        <Table>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.name}>
                        <TableCell>{row.name}</TableCell>
                        {row.values.map((value) => (
                            <TableCell key={value}>{value}</TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default VoltageTable;
