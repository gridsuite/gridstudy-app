import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Grid } from '@mui/material';
import { RunningStatus } from '../utils/running-status';
import { IntlShape } from 'react-intl';
import { generateRows, styles } from './generic-equipment-popover-utils';
import { EquipmentInfos } from '@gridsuite/commons-ui';

interface LimitsTableProps {
    equipmentInfos: any;
    intl: IntlShape;
    loadFlowStatus?: RunningStatus;
}

export const LimitsTable: React.FC<LimitsTableProps> = ({ equipmentInfos, intl, loadFlowStatus }) => {
    return (
        <Grid item sx={{ width: '100%' }}>
            <TableContainer sx={styles.table}>
                <Table size="small" sx={{ width: '100%', tableLayout: 'auto' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...styles.cell, fontWeight: 'bold' }}>
                                {intl.formatMessage({ id: 'Limit_name' })}
                            </TableCell>
                            <TableCell sx={{ ...styles.cell, fontWeight: 'bold' }}>
                                {intl.formatMessage({ id: 'LimitLabel' })}
                            </TableCell>
                            <TableCell sx={{ ...styles.cell, fontWeight: 'bold' }}>
                                {intl.formatMessage({ id: 'Loading' })}
                            </TableCell>
                            <TableCell sx={{ ...styles.cell, fontWeight: 'bold' }}>
                                {intl.formatMessage({ id: 'Side' })}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {generateRows(equipmentInfos, equipmentInfos?.currentLimits1, '1', intl, loadFlowStatus)}
                        {generateRows(equipmentInfos, equipmentInfos?.currentLimits2, '2', intl, loadFlowStatus)}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    );
};
