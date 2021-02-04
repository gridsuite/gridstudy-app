/**
 * This class has been taken from 'Virtualized Table' example at https://material-ui.com/components/tables/
 */
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import { AutoSizer, Column, Table } from 'react-virtualized';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import memoize from 'memoize-one';

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
        padding: '16px 8px',
    },
    noClick: {
        cursor: 'initial',
    },
    tableCellColor: {
        color: theme.link.color,
    },
    header: {
        marginLeft: 16,
    },
});

class MuiVirtualizedTable extends React.PureComponent {
    static defaultProps = {
        headerHeight: 48,
        rowHeight: 48,
    };

    state = {
        key: undefined,
        direction: 'asc',
    };

    reorderIndex = memoize((key, direction, filter) => {
        let indexedArray = [];
        for (let i = 0; i < this.props.rowCount; i++) {
            const row = this.props.rowGetter({ index: i });
            if (!filter || filter(row)) indexedArray.push([row, i]);
        }

        function compareValue(a, b, isNumeric, reverse) {
            const mult = reverse ? 1 : -1;
            if (a === undefined && b === undefined) return 0;
            else if (a === undefined) return mult;
            else if (b === undefined) return -mult;

            return isNumeric
                ? (Number(a) < Number(b) ? 1 : -1) * mult
                : ('' + a).localeCompare(b) * mult;
        }

        if (key !== undefined) {
            const reverse = direction === 'asc';
            const isNumeric = this.props.columns[key].numeric;
            const dataKey = this.props.columns[key].dataKey;
            if (dataKey && dataKey !== '' && this.state.direction !== '')
                if (this.props.sort)
                    return this.props.sort(dataKey, reverse, isNumeric);
            indexedArray.sort((a, b) =>
                compareValue(a[0][dataKey], b[0][dataKey], isNumeric, reverse)
            );
        }
        return indexedArray.map((k) => k[1]);
    });

    sortableHeader = ({ label, columnIndex }) => {
        const { headerHeight, columns, classes } = this.props;

        return (
            <TableSortLabel
                component="div"
                className={clsx(
                    classes.tableCell,
                    classes.flexContainer,
                    classes.header
                )}
                active={columnIndex === this.state.key}
                style={{
                    height: headerHeight,
                    justifyContent: columns[columnIndex].numeric
                        ? 'flex-end'
                        : 'baseline',
                }}
                direction={this.state.direction}
                onClick={() => {
                    let { key, direction } = this.state;
                    if (key === undefined) key = columnIndex;
                    else if (direction === 'asc') direction = 'desc';
                    else {
                        key = undefined;
                        direction = 'asc';
                    }
                    this.setState({
                        key: key,
                        direction: direction,
                    });
                }}
            >
                <span>{label}</span>
            </TableSortLabel>
        );
    };

    getRowClassName = ({ index }) => {
        const { classes, onRowClick } = this.props;

        return clsx(classes.tableRow, classes.flexContainer, {
            [classes.tableRowHover]: index !== -1 && onRowClick != null,
        });
    };

    cellRenderer = ({ cellData, columnIndex, rowIndex }) => {
        const {
            columns,
            classes,
            rowHeight,
            onCellClick,
            rowGetter,
        } = this.props;

        let displayedValue;
        if (columns[columnIndex].numeric) {
            if (!isNaN(cellData)) {
                if (
                    columns[columnIndex].fractionDigits !== undefined &&
                    columns[columnIndex].fractionDigits !== 0
                ) {
                    displayedValue = Number(cellData).toFixed(
                        columns[columnIndex].fractionDigits
                    );
                } else {
                    displayedValue = Math.round(cellData);
                }
            } else {
                displayedValue = '';
            }
        } else {
            displayedValue = cellData;
        }

        if (columns[columnIndex].unit !== undefined) {
            displayedValue += ' ';
            displayedValue += columns[columnIndex].unit;
        }

        return (
            <TableCell
                component="div"
                className={clsx(classes.tableCell, classes.flexContainer, {
                    [classes.noClick]:
                        displayedValue === undefined ||
                        onCellClick == null ||
                        columns[columnIndex].clickable === undefined ||
                        !columns[columnIndex].clickable,
                    [classes.tableCellColor]:
                        displayedValue === undefined ||
                        (onCellClick !== null &&
                            columns[columnIndex].clickable !== undefined &&
                            columns[columnIndex].clickable),
                })}
                variant="body"
                style={{ height: rowHeight }}
                align={
                    (columnIndex != null && columns[columnIndex].numeric) ||
                    false
                        ? 'right'
                        : 'left'
                }
                onClick={(e) => {
                    if (onCellClick) {
                        onCellClick(
                            rowGetter({ index: rowIndex }),
                            columns[columnIndex]
                        );
                    }
                }}
            >
                {displayedValue}
            </TableCell>
        );
    };

    headerRenderer = ({ label, columnIndex }) => {
        const { headerHeight, columns, classes } = this.props;

        return (
            <TableCell
                component="div"
                className={clsx(classes.tableCell, classes.noClick)}
                variant="head"
                style={{ height: headerHeight }}
                align={columns[columnIndex].numeric || false ? 'right' : 'left'}
            >
                <span>{label}</span>
            </TableCell>
        );
    };

    render() {
        const {
            classes,
            columns,
            rowHeight,
            headerHeight,
            rowCount,
            ...tableProps
        } = this.props;

        const reorderedIndex = this.reorderIndex(
            this.state.key,
            this.state.direction,
            this.props.filter
        );

        const getIndexFor = (index) => {
            return index < reorderedIndex.length ? reorderedIndex[index] : 0;
        };

        return (
            <AutoSizer>
                {({ height, width }) => (
                    <Table
                        height={height}
                        width={width}
                        rowHeight={rowHeight}
                        gridStyle={{
                            direction: 'inherit',
                        }}
                        headerHeight={headerHeight}
                        className={classes.table}
                        {...tableProps}
                        rowCount={reorderedIndex.length}
                        rowClassName={this.getRowClassName}
                        rowGetter={({ index }) =>
                            this.props.rowGetter({
                                index: getIndexFor(index),
                            })
                        }
                    >
                        {columns.map(({ dataKey, ...other }, index) => {
                            return (
                                <Column
                                    key={dataKey}
                                    headerRenderer={(headerProps) =>
                                        this.sortableHeader({
                                            ...headerProps,
                                            columnIndex: index,
                                            key: { dataKey },
                                        })
                                    }
                                    className={classes.flexContainer}
                                    cellRenderer={this.cellRenderer}
                                    dataKey={dataKey}
                                    width={width}
                                    {...other}
                                />
                            );
                        })}
                    </Table>
                )}
            </AutoSizer>
        );
    }
}

MuiVirtualizedTable.propTypes = {
    classes: PropTypes.object.isRequired,
    rowGetter: PropTypes.func.isRequired,
    rowCount: PropTypes.number.isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            dataKey: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            numeric: PropTypes.bool,
            width: PropTypes.number,
            minWidth: PropTypes.number,
            unit: PropTypes.string,
            fractionDigits: PropTypes.number,
        })
    ).isRequired,
    sortable: PropTypes.bool,
    headerHeight: PropTypes.number,
    onRowClick: PropTypes.func,
    onCellClick: PropTypes.func,
    rowHeight: PropTypes.number,
    filter: PropTypes.func,
    sort: PropTypes.func,
};

const VirtualizedTable = withStyles(styles)(MuiVirtualizedTable);
export default VirtualizedTable;
