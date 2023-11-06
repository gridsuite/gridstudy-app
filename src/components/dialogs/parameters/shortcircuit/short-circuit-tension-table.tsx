/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { FunctionComponent, useMemo } from 'react';
import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { useIntl } from 'react-intl';

interface TensionTableProps {
    isNominal: boolean;
}
const TensionTable: FunctionComponent<TensionTableProps> = ({ isNominal }) => {
    const intl = useIntl();

    const rows = useMemo(
        () => [
            {
                name: intl.formatMessage({ id: 'shortCircuitNominalVoltage' }),
                values: [380, 225, 150, 90, 63, 45, 20],
            },
            {
                name: intl.formatMessage({ id: 'shortCircuitInitialTension' }),
                values: isNominal
                    ? [400, 225, 150, 90, 63, 45, 20]
                    : [420, 245, 165, 99, 69.3, 49.5, 22],
            },
        ],
        [isNominal, intl]
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

export default TensionTable;
