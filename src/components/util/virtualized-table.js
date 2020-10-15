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
import Grid from '@material-ui/core/Grid';

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
    },
    noClick: {
        cursor: 'initial',
    },
});

class MuiVirtualizedTable extends React.PureComponent {
    static defaultProps = {
        headerHeight: 48,
        rowHeight: 48,
    };

    sortInfos = {
        key: undefined,
        direction: 'asc',
        reorderedIndex: undefined,
    };

    sortableHeader = ({ label, columnIndex }) => {
        const { headerHeight, columns, classes } = this.props;

        return (
            <TableSortLabel
                component="div"
                className={clsx(classes.tableCell, classes.flexContainer)}
                active={columnIndex === this.sortInfos.key}
                style={{ height: headerHeight }}
                direction={this.sortInfos.direction}
                align={columns[columnIndex].numeric ? 'right' : 'left'}
                onClick={() => {
                    let newSortInfos = {};
                    if (columnIndex === this.sortInfos.key) {
                        newSortInfos.direction =
                            this.sortInfos.direction === 'asc' ? 'desc' : 'asc';
                        newSortInfos.key = this.sortInfos.key;
                    } else {
                        newSortInfos.direction = this.sortInfos.direction;
                        newSortInfos.key = columnIndex;
                    }
                    this.setSortInfos(newSortInfos);
                }}
            >
                <span>{label}</span>
            </TableSortLabel>
        );
    };

    setSortInfos = (sortInfos) => {
        let indexedArray = [];
        for (let i = 0; i < this.props.rowCount; i++) {
            const row = this.props.rowGetter({ index: i });
            if (this.acceptRow(row)) indexedArray.push([row, i]);
        }
        const reverse = sortInfos.direction === 'asc' ? 1 : -1;
        const isNumeric = this.props.columns[sortInfos.key].numeric;
        const key = this.props.columns[sortInfos.key].dataKey;
        indexedArray.sort((a, b) =>
            !isNumeric
                ? a[0][key].localeCompare(b[0][key]) * reverse
                : (Number(a[0][key]) < Number(b[0][key]) ? 1 : -1) * reverse
        );
        sortInfos.reorderedIndex = indexedArray.map((k) => k[1]);

        this.sortInfos = sortInfos;
        this.forceUpdate();
    };

    getIndexFor(index) {
        return this.sortInfos.reorderedIndex &&
            this.sortInfos.reorderedIndex.length > index
            ? this.sortInfos.reorderedIndex[index]
            : index;
    }

    getRowClassName = ({ index }) => {
        const { classes, onRowClick } = this.props;

        return clsx(classes.tableRow, classes.flexContainer, {
            [classes.tableRowHover]: index !== -1 && onRowClick != null,
        });
    };

    cellRenderer = ({ cellData, columnIndex }) => {
        const { columns, classes, rowHeight, onRowClick } = this.props;

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
                    [classes.noClick]: onRowClick == null,
                })}
                variant="body"
                style={{ height: rowHeight }}
                align={
                    (columnIndex != null && columns[columnIndex].numeric) ||
                    false
                        ? 'right'
                        : 'left'
                }
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

    rowGetter(index) {
        return this.props.rowGetter(this.getIndexFor(index));
    }

    acceptRow(cellData) {
        if (this.props.filter) return this.props.filter(cellData);
        return true;
    }

    render() {
        const {
            classes,
            columns,
            rowHeight,
            headerHeight,
            ...tableProps
        } = this.props;
        return (
            <AutoSizer>
                {({ height, width }) => (
                    <Table
                        rowCount={() =>
                            this.sortInfos.reorderedIndex
                                ? this.sortInfos.reorderedIndex.length
                                : this.props.rowCount
                        }
                        height={height}
                        width={width}
                        rowHeight={rowHeight}
                        gridStyle={{
                            direction: 'inherit',
                        }}
                        headerHeight={headerHeight}
                        className={classes.table}
                        {...tableProps}
                        rowClassName={this.getRowClassName}
                        rowGetter={({ index }) =>
                            this.props.rowGetter({
                                index: this.getIndexFor(index),
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
            width: PropTypes.number.isRequired,
            unit: PropTypes.string,
            fractionDigits: PropTypes.number,
        })
    ).isRequired,
    sortable: PropTypes.bool,
    headerHeight: PropTypes.number,
    onRowClick: PropTypes.func,
    rowHeight: PropTypes.number,
    filter: PropTypes.func,
};

const VirtualizedTable = withStyles(styles)(MuiVirtualizedTable);
export default VirtualizedTable;
