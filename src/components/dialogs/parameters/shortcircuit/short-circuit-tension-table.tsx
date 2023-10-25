import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { useIntl } from 'react-intl';

interface TensionTableProps {
    isNominal: boolean;
}
const TensionTable: FunctionComponent<TensionTableProps> = ({ isNominal }) => {
    const intl = useIntl();

    const createRow = useCallback(
        (
            name: string,
            v1: number,
            v2: number,
            v3: number,
            v4: number,
            v5: number,
            v6: number,
            v7: number
        ) => {
            return { name, v1, v2, v3, v4, v5, v6, v7 };
        },
        []
    );

    const rows = useMemo(() => {
        return [
            createRow(
                intl.formatMessage({ id: 'shortCircuitNominalVoltage' }),
                380,
                225,
                150,
                90,
                63,
                45,
                20
            ),
            createRow(
                intl.formatMessage({ id: 'shortCircuitInitialTension' }),
                isNominal ? 400 : 420,
                isNominal ? 225 : 245,
                isNominal ? 150 : 165,
                isNominal ? 90 : 99,
                isNominal ? 63 : 69.3,
                isNominal ? 45 : 49.5,
                isNominal ? 20 : 22
            ),
        ];
    }, [isNominal, createRow, intl]);
    return (
        <Table>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.name}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.v1}</TableCell>
                        <TableCell>{row.v2}</TableCell>
                        <TableCell>{row.v3}</TableCell>
                        <TableCell>{row.v4}</TableCell>
                        <TableCell>{row.v5}</TableCell>
                        <TableCell>{row.v6}</TableCell>
                        <TableCell>{row.v7}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default TensionTable;
