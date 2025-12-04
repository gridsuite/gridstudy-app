import { Grid, TableRow } from '@mui/material';
import { VoltageLevelTooltipBusInfos } from '../equipment-popover-type';
import { CellRender } from '../cell-render';
import { formatValue, styles } from '../generic-equipment-popover-utils';
import { useIntl } from 'react-intl';

export const VoltageLevelPopoverBusInfos = ({ buses }: { buses?: VoltageLevelTooltipBusInfos[] }) => {
    const intl = useIntl();

    const renderSpecificRow = (label: string, valueGetter: (b: VoltageLevelTooltipBusInfos) => number) => (
        <TableRow>
            <CellRender isLabel={true} label={label} colStyle={{ ...styles.cell, fontWeight: 'bold' }} />

            {buses?.map((b) => (
                <CellRender
                    key={`${label}-${b.id}`}
                    isLabel={false}
                    value={formatValue(valueGetter(b), 2)}
                    colStyle={styles.cell}
                />
            ))}
        </TableRow>
    );

    return (
        <Grid item sx={styles.grid}>
            <TableRow>
                <CellRender isLabel={true} label="" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                {buses?.map((b) => (
                    <CellRender
                        key={b.id}
                        isLabel={true}
                        label={`${b.id}`}
                        colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                    />
                ))}
            </TableRow>

            {renderSpecificRow(intl.formatMessage({ id: 'tooltip.u' }), (bus) => bus.u)}
            {renderSpecificRow(intl.formatMessage({ id: 'tooltip.angle' }), (bus) => bus.angle)}
            {renderSpecificRow(intl.formatMessage({ id: 'tooltip.generation' }), (bus) => bus.generation)}
            {renderSpecificRow(intl.formatMessage({ id: 'tooltip.load' }), (bus) => bus.load)}
            {renderSpecificRow(intl.formatMessage({ id: 'tooltip.balance' }), (bus) => bus.balance)}
            {renderSpecificRow(intl.formatMessage({ id: 'tooltip.icc' }), (bus) => bus.icc / 1000)}
        </Grid>
    );
};
