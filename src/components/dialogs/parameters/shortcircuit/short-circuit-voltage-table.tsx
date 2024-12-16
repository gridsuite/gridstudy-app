/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, useMemo } from 'react';
import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { useIntl } from 'react-intl';
import { VoltageTableProps } from './short-circuit-parameters.type';
import { INITIAL_VOLTAGE } from '../../../utils/constants';

const VoltageTable: FunctionComponent<VoltageTableProps> = ({ voltageProfileMode }) => {
    const intl = useIntl();

    const rows = useMemo(
        () => [
            {
                name: intl.formatMessage({ id: 'shortCircuitNominalVoltage' }),
                values: ['380 ' + intl.formatMessage({ id: 'Or' }) + ' 400', 225, 150, 90, 63, 45, 20],
            },
            {
                name: intl.formatMessage({ id: 'shortCircuitInitialVoltage' }),
                values:
                    voltageProfileMode === INITIAL_VOLTAGE.NOMINAL
                        ? [400, 225, 150, 90, 63, 45, 20]
                        : [420, 245, 165, 99, 69.3, 49.5, 22],
            },
        ],
        [voltageProfileMode, intl]
    );
    return (
        <Table>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.name}>
                        <TableCell>{row.name}</TableCell>
                        {row.values.map((value) => (
                            <TableCell
                                sx={{
                                    width: '10%',
                                    textAlign: 'center',
                                }}
                                key={value}
                            >
                                {value}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default VoltageTable;
