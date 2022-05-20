import React, { useCallback, useEffect, useRef, useState } from 'react';
import LoaderWithOverlay from '../util/loader-with-overlay';
import { MultiGrid, AutoSizer } from 'react-virtualized';
import {
    MIN_COLUMN_WIDTH,
    HEADER_ROW_HEIGHT,
    ROW_HEIGHT,
} from './config-tables';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
    emptyLastLineCell: {
        margin: theme.spacing(0.5),
        padding: theme.spacing(1.25),
        borderTop: '1px solid #515151',
        display: 'flex',
    },
}));

export const EquipmentTable = (props) => {
    const classes = useStyles();
    const LAST_LINE_ROW_HEIGHT = 10;
    const gridRef = useRef();

    const [fixedColumnsCount, setFixedColumnsCount] = useState(0);

    useEffect(() => {
        const count = props.columns.filter((c) => c.locked).length;
        setFixedColumnsCount(count);
        if (gridRef && gridRef.current) {
            gridRef.current.recomputeGridSize();
        }
    }, [props.columns]);

    const lastLineCellRender = useCallback(
        (columnDefinition, key, style) => {
            return (
                <div key={key} style={style}>
                    {!columnDefinition.editColumn && (
                        <div className={classes.emptyLastLineCell}></div>
                    )}
                </div>
            );
        },
        [classes.emptyLastLineCell]
    );

    function cellRenderer({ columnIndex, key, rowIndex, style }) {
        if (!props.columns || !props.columns[columnIndex]) {
            return (
                <div key={key} style={{ opacity: '0.5' }}>
                    ...loading
                </div>
            );
        }
        let columnDefinition = props.columns[columnIndex];

        if (rowIndex === 0) {
            return props.columns.headerCellRender(columnDefinition, key, style);
        } else if (rowIndex === props.rows.length + 1) {
            return lastLineCellRender(columnDefinition, key, style);
        } else {
            let cell = props.rows[rowIndex - 1];
            if (columnDefinition.cellRenderer) {
                return columnDefinition.cellRenderer(
                    cell,
                    columnDefinition,
                    key,
                    style
                );
            } else {
                return (
                    <div key={key} style={{ opacity: '0.5' }}>
                        loading...
                    </div>
                );
            }
        }
    }

    function getColumnWidth(index) {
        const width = props.columns[index]?.columnWidth;
        if (width) {
            return width;
        }
        return MIN_COLUMN_WIDTH;
    }

    function getRowHeight(index) {
        if (index === 0) {
            return HEADER_ROW_HEIGHT;
        } else if (index === props.rows.length + 1) {
            return LAST_LINE_ROW_HEIGHT;
        }
        return ROW_HEIGHT;
    }

    return (
        <>
            {!props.fetched && (
                <LoaderWithOverlay
                    color="inherit"
                    loaderSize={70}
                    loadingMessageText={'LoadingRemoteData'}
                />
            )}
            {props.fetched &&
                props.rows &&
                props.columns &&
                props.columns.length > 0 && (
                    <AutoSizer>
                        {({ width, height }) => (
                            <MultiGrid
                                ref={gridRef}
                                cellRenderer={cellRenderer}
                                fixedColumnCount={fixedColumnsCount}
                                fixedRowCount={1}
                                height={height}
                                width={width}
                                columnCount={props.columns.length}
                                columnWidth={({ index }) =>
                                    getColumnWidth(index)
                                }
                                rowCount={props.rows.length + 2} // +1 for the header, +1 for an empty last line used to fix display
                                rowHeight={({ index }) => getRowHeight(index)}
                                enableFixedColumnScroll={true}
                                enableFixedRowScroll={true}
                                hideTopRightGridScrollbar={true}
                                hideBottomLeftGridScrollbar={true}
                            />
                        )}
                    </AutoSizer>
                )}
        </>
    );
};
