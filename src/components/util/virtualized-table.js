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

function getTextWidth(text) {
    // re-use canvas object for better performance
    let canvas =
        getTextWidth.canvas ||
        (getTextWidth.canvas = document.createElement('canvas'));
    let context = canvas.getContext('2d');
    // TODO find a better way to find Material UI style
    context.font = '14px "Roboto", "Helvetica", "Arial", sans-serif';
    let metrics = context.measureText(text);
    return metrics.width;
}

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

    reorderIndex = memoize((key, direction, filter, rows) => {
        if (!rows) return [];
        let indexedArray = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
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

    computeDataWidth = (text) => {
        return getTextWidth(text || '') + 2 * cellPadding;
    };

    sizes = memoize((columns) => {
        let sizes = {};
        columns.forEach((col) => {
            if (col.width) {
                sizes[col.dataKey] = col.width;
            } else {
                /* calculate the header (and min size if exists) */
                let size = Math.max(
                    col.minWidth || 0,
                    this.computeDataWidth(col.label)
                );
                /* calculate for each row the width, and keep the max  */
                for (let i = 0; i < this.props.rowCount; ++i) {
                    let text = this.getDisplayValue(
                        col,
                        this.props.rowGetter({ index: i })[col.dataKey]
                    );
                    size = Math.max(size, this.computeDataWidth(text));
                }
                if (col.maxWidth) size = Math.min(col.maxWidth, size);
                sizes[col.dataKey] = Math.ceil(size);
            }
        });
        return sizes;
    });

    sortableHeader = ({ label, columnIndex, width }) => {
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
                width={width}
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

    cellRenderer = ({ cellData, columnIndex, rowIndex, width }) => {
        const { columns, classes, rowHeight, onCellClick, rows } = this.props;

        let displayedValue = this.getDisplayValue(
            columns[columnIndex],
            cellData
        );

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
                        onCellClick(rows[rowIndex], columns[columnIndex]);
                    }
                }}
                width={width}
            >
                {displayedValue}
            </TableCell>
        );
    };

    getDisplayValue(column, cellData) {
        let displayedValue;
        if (column.numeric) {
            if (!isNaN(cellData)) {
                if (
                    column.fractionDigits !== undefined &&
                    column.fractionDigits !== 0
                ) {
                    displayedValue = Number(cellData).toFixed(
                        column.fractionDigits
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

        if (column.unit !== undefined) {
            displayedValue += ' ';
            displayedValue += column.unit;
        }
        return displayedValue;
    }

    headerRenderer = ({ label, columnIndex }) => {
        const { headerHeight, columns, classes } = this.props;

        return (
            <TableCell
                component="div"
                className={clsx(
                    classes.tableCell,
                    classes.flexContainer,
                    classes.noClick
                )}
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
            this.props.filter,
            this.props.rows
        );

        const getIndexFor = (index) => {
            return index < reorderedIndex.length ? reorderedIndex[index] : 0;
        };
        const sizes = this.sizes(this.props.columns);
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
                            this.props.rows[getIndexFor(index)]
                        }
                    >
                        {columns.map(({ dataKey, ...other }, index) => {
                            return (
                                <Column
                                    key={dataKey}
                                    headerRenderer={(headerProps) =>
                                        this.sortableHeader({
                                            ...headerProps,
                                            width: sizes[dataKey],
                                            columnIndex: index,
                                            key: { dataKey },
                                        })
                                    }
                                    className={classes.flexContainer}
                                    cellRenderer={this.cellRenderer}
                                    dataKey={dataKey}
                                    flexGrow={1}
                                    width={sizes[dataKey]}
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
    rows: PropTypes.array,
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            dataKey: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            numeric: PropTypes.bool,
            width: PropTypes.number,
            minWidth: PropTypes.number,
            maxWidth: PropTypes.number,
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
