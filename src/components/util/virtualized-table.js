/**
 * This class has been taken from 'Virtualized Table' example at https://material-ui.com/components/tables/
 */
import withStyles from '@mui/styles/withStyles';
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
        // Used to remove the "transform" property that breaks fixed columns
        '& + div': {
            willChange: 'false !important',
        },
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
        paddingLeft: cellPadding,
        height: '100%',
    },
});

const VirtualizedTable = withStyles(styles)(MuiVirtualizedTable);
export default VirtualizedTable;
