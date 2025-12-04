import { Grid, Table, TableContainer, TableRow } from '@mui/material';
import { CellRender } from '../cell-render';
import { formatValue, styles } from '../generic-equipment-popover-utils';
import { VoltageLevelTooltipInfos } from '../equipment-popover-type';

export const VoltageLevelPopoverInfos = ({ equipmentInfos }: { equipmentInfos?: VoltageLevelTooltipInfos }) => {
    return (
        <Grid item sx={styles.grid}>
            <TableContainer>
                <Table size="small" sx={styles.layout}>
                    <TableRow>
                        <CellRender isLabel={true} label="Umin" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                        <CellRender
                            isLabel={true}
                            label={formatValue(equipmentInfos?.umin, 2)}
                            colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                        />
                    </TableRow>
                    <TableRow>
                        <CellRender isLabel={true} label="Umax" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                        <CellRender
                            isLabel={true}
                            label={formatValue(equipmentInfos?.umax, 2)}
                            colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                        />
                    </TableRow>
                </Table>
            </TableContainer>
        </Grid>
    );
};
