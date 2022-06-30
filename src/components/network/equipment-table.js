import React, { useEffect, useRef, useState } from 'react';
import LoaderWithOverlay from '../util/loader-with-overlay';
import { MultiGrid, AutoSizer } from 'react-virtualized';
import {
    MIN_COLUMN_WIDTH,
    HEADER_ROW_HEIGHT,
    ROW_HEIGHT,
} from './config-tables';
import { useTheme } from '@mui/material/styles';

export const EquipmentTable = (props) => {
    const gridRef = useRef();

    const [fixedColumnsCount, setFixedColumnsCount] = useState(0);
    const theme = useTheme();
    const [scrollTopIndex, setScrollTopIndex] = useState(
        props.scrollTop !== -1
    );
    const [verticalScrollbarPresence, setVerticalScrollbarPresence] =
        useState(false);

    useEffect(() => {
        const count = props.columns.filter((c) => c.locked).length;
        setFixedColumnsCount(count);
        if (gridRef && gridRef.current) {
            gridRef.current.recomputeGridSize();
        }
    }, [props.columns]);

    useEffect(() => {
        setScrollTopIndex(props.scrollTop !== -1);
    }, [props.scrollTop]);

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
        } else {
            let cell = props.rows[rowIndex - 1];
            if (columnDefinition.cellRenderer) {
                if (props.rows[props.scrollTop]?.id === cell?.id) {
                    style = {
                        ...style,
                        backgroundColor: theme.selectedRow.background,
                    };
                }
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
                props.rows?.length > 0 &&
                props.columns?.length > 0 && (
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
                                rowCount={props.rows.length + 1} // +1 for the header
                                rowHeight={({ index }) => getRowHeight(index)}
                                enableFixedColumnScroll={true}
                                enableFixedRowScroll={true}
                                hideTopRightGridScrollbar={true}
                                hideBottomLeftGridScrollbar={true}
                                styleBottomLeftGrid={
                                    props.disableVerticalScroll
                                        ? { overflowY: 'hidden' }
                                        : {}
                                }
                                styleBottomRightGrid={
                                    props.disableVerticalScroll
                                        ? { overflowY: 'hidden' }
                                        : {}
                                }
                                scrollTop={
                                    verticalScrollbarPresence && scrollTopIndex
                                        ? props.scrollTop *
                                          getRowHeight(props.scrollTop)
                                        : -1
                                }
                                onScrollbarPresenceChange={(scrollBars) => {
                                    setVerticalScrollbarPresence(
                                        scrollBars?.vertical
                                    );
                                }}
                                onScroll={setScrollTopIndex(false)}
                            />
                        )}
                    </AutoSizer>
                )}
        </>
    );
};
