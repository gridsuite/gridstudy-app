import React, { useEffect, useRef, useState } from 'react';
import LoaderWithOverlay from '../util/loader-with-overlay';
import { MultiGrid, AutoSizer } from 'react-virtualized';

const ROW_HEIGHT = 38;
const HEADER_ROW_HEIGHT = 64;
const MIN_COLUMN_WIDTH = 160;

export const EquipmentTable = (props) => {
    const gridRef = useRef();

    const [fixedColumnsCount, setFixedColumnsCount] = useState(0);

    useEffect(() => {
        const count = props.columns.filter((c) => c.locked).length;
        setFixedColumnsCount(count);
        if (gridRef && gridRef.current) {
            gridRef.current.recomputeGridSize();
        }
    }, [props.columns]);

    function cellRenderer({ columnIndex, key, rowIndex, style }) {
        if (!props.columns || !props.columns[columnIndex]) {
            return <div style={{ opacity: '0.5' }}>...loading</div>;
        }
        let columnDefinition = props.columns[columnIndex];

        if (rowIndex === 0) {
            return props.columns.headerCellRender(columnDefinition, key, style);
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
                return <div style={{ opacity: '0.5' }}>loading...</div>;
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
                        columnWidth={({ index }) => getColumnWidth(index)}
                        rowCount={props.rows.length + 1}
                        rowHeight={({ index }) => getRowHeight(index)}
                        enableFixedColumnScroll={true}
                        enableFixedRowScroll={true}
                        hideTopRightGridScrollbar={true}
                        hideBottomLeftGridScrollbar={true}
                    />
                )}
            </AutoSizer>
        </>
    );
};
