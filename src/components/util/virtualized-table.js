/**
 * This class has been taken from 'Virtualized Table' example at https://material-ui.com/components/tables/
 */
import { withStyles } from '@material-ui/core/styles';
import { MuiVirtualizedTable } from '@gridsuite/commons-ui';

const cellPadding = 16;

const styles = (theme) => ({
    flexContainer: {
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
    },
    table: {
        // temporary right-to-left patch, waiting for
        // https://github.com/bvaughn/react-virtualized/issues/454
        '& .ReactVirtualized__Table__headerRow': {
            flip: false,
            paddingRight:
                theme.direction === 'rtl' ? '0 !important' : undefined,
        },
    },
    tableRow: {
        cursor: 'pointer',
    },
    tableRowHover: {
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        },
    },
    tableCell: {
        flex: 1,
        padding: cellPadding,
    },
    noClick: {
        cursor: 'initial',
    },
    tableCellColor: {
        color: theme.link.color,
    },
    header: {
        paddingLeft: 16 + cellPadding,
        height: '100%',
    },
});

const VirtualizedTable = withStyles(styles)(MuiVirtualizedTable);
export default VirtualizedTable;
