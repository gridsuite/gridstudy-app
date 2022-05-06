import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from 'react-intl';
import { requestNetworkChange } from '../../utils/rest-api';
import { IconButton, TextField } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import Grid from '@mui/material/Grid';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import LoaderWithOverlay from '../util/loader-with-overlay';
import { MultiGrid, AutoSizer } from 'react-virtualized';

const ROW_HEIGHT = 38;
const HEADER_ROW_HEIGHT = 64;
const MIN_COLUMN_WIDTH = 160;

export const EquipmentTable = (props) => {

    const [lineEdit, setLineEdit] = useState(undefined);
    const gridRef = useRef();
    const intl = useIntl();
    const isLineOnEditMode = useCallback(
        (cellData) => {
            return lineEdit && cellData.id === lineEdit.id;
        },
        [lineEdit]
    );
    const [fixedColumnsCount, setFixedColumnsCount] = useState(0);
    useEffect(() => setLineEdit({}), [props.tableDefinition]);

    useEffect(() => {
        const count = props.columns.filter((c) => c.locked).length
        setFixedColumnsCount(count);

        // Used to recalculate the grid's width
        if(gridRef && gridRef.current) {
            //gridRef.current.forceUpdateGrids();
            gridRef.current.recomputeGridSize();
        }
    }, [props.columns]);

    function startEdition(lineInfo) {
        setLineEdit(lineInfo);
    }

    function capitaliseFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function commitChanges(rowData) {
        let groovyCr =
            'equipment = network.get' +
            capitaliseFirst(props.tableDefinition.modifiableEquipmentType) +
            "('" +
            lineEdit.id.replace(/'/g, "\\'") +
            "')\n";
        Object.values(lineEdit.newValues).forEach((cr) => {
            groovyCr += cr.changeCmd.replace(/\{\}/g, cr.value) + '\n';
        });
        requestNetworkChange(props.studyUuid, props.workingNode?.id, groovyCr).then(
            (response) => {
                if (response.ok) {
                    Object.entries(lineEdit.newValues).forEach(([key, cr]) => {
                        rowData[key] = cr.value;
                    });
                } else {
                    Object.entries(lineEdit.oldValues).forEach(
                        ([key, oldValue]) => {
                            rowData[key] = oldValue;
                        }
                    );
                }
                setLineEdit({});
            }
        );
    }

    function resetChanges(rowData) {
        Object.entries(lineEdit.oldValues).forEach(([key, oldValue]) => {
            rowData[key] = oldValue;
        });
        setLineEdit({});
    }

    function createEditableRow(cellData) {
        // TODO CHARLY maybe unshift d'une case, si on a la colonne d'édition
        return (
            (!isLineOnEditMode(cellData) && (
                <IconButton
                    disabled={lineEdit && lineEdit.id && true}
                    onClick={() =>
                        startEdition({
                            line: cellData.rowIndex,
                            oldValues: {},
                            newValues: {},
                            id: cellData.rowData['id'], // TODO CHARLY potentiellement à remplacer seulement par cellData.id, si ça plante.
                            equipmentType: props.tableDefinition.modifiableEquipmentType,
                        })
                    }
                >
                    <CreateIcon alignmentBaseline={'middle'} />
                </IconButton>
            )) || (
                <Grid container>
                    <Grid item>
                        <IconButton
                            size={'small'}
                            onClick={() => commitChanges(cellData.rowData)} // TODO CHARLY potentiellement à remplacer seulement par cellData.id, si ça plante.
                        >
                            <CheckIcon />
                        </IconButton>
                        <IconButton
                            size={'small'}
                            onClick={() => resetChanges(cellData.rowData)} // TODO CHARLY potentiellement à remplacer seulement par cellData.id, si ça plante.
                        >
                            <ClearIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            )
        );
    }

    const registerChangeRequest = useCallback(
        (data, changeCmd, value) => {
            // save original value, dont erase if exists
            if (!lineEdit.oldValues[data.dataKey])
                lineEdit.oldValues[data.dataKey] = data.rowData[data.dataKey];
            lineEdit.newValues[data.dataKey] = {
                changeCmd: changeCmd,
                value: value,
            };
            data.rowData[data.dataKey] = value;
        },
        [lineEdit]
    );

    /*const EditableCellRender = useCallback(
        (cellData, columnDefinition) => {
            if (
                !isLineOnEditMode(cellData) ||
                cellData.rowData[cellData.dataKey] === undefined // TODO CHARLY potentiellement à remplacer seulement par cellData.id, si ça plante.
            ) {
                return defaultCellRender(cellData, columnDefinition);
            } else {
                const ref = React.createRef();
                const text = formatCell(cellData, columnDefinition);
                const changeRequest = (value) =>
                    registerChangeRequest(
                        cellData,
                        columnDefinition.changeCmd,
                        value
                    );
                const Editor = columnDefinition.editor;
                return Editor ? (
                    <Editor
                        key={cellData.dataKey + cellData.rowData.id} // TODO CHARLY potentiellement à remplacer seulement par cellData.id, si ça plante.
                        className={classes.tableCell}
                        equipment={cellData.rowData} // TODO CHARLY potentiellement à remplacer seulement par cellData.id, si ça plante.
                        defaultValue={formatCell(cellData, columnDefinition)}
                        setter={(val) => changeRequest(val)}
                    />
                ) : (
                    <OverflowableText text={text} childRef={ref}>
                        <TextField
                            id={cellData.dataKey}
                            type="Number"
                            className={clsx(classes.tableCell, classes.textDiv)}
                            size={'medium'}
                            margin={'normal'}
                            inputProps={{
                                style: { textAlign: 'center' },
                            }}
                            onChange={(obj) => changeRequest(obj.target.value)}
                            defaultValue={text}
                            ref={ref}
                        />
                    </OverflowableText>
                );
            }
        },
        [
            classes.tableCell,
            classes.textDiv,
            defaultCellRender,
            isLineOnEditMode,
            registerChangeRequest,
            formatCell,
        ]
    );*/


    // https://bvaughn.github.io/react-virtualized/#/components/MultiGrid
    // https://codesandbox.io/s/react-virtualized-multigrid-y9e08?from-embed=&file=/src/Gridtable.js:2358-2977
    // https://github.com/bvaughn/react-virtualized/blob/master/source/MultiGrid/MultiGrid.example.js
    // https://github.com/bvaughn/react-virtualized/blob/master/docs/MultiGrid.md

    function cellRenderer({ columnIndex, key, rowIndex, style }) {
        if(!props.columns || !props.columns[columnIndex])
        {
            return (<div style={{
                ...style,
                backgroundColor: 'yellow',
                color:'black',
                zIndex: 99999,
            }}>MISSING_DEF:{columnIndex}-{rowIndex}</div>);
        }
        let columnDefinition = props.columns[columnIndex];

        if (rowIndex === 0) {
            return (props.columns.headerCellRender(columnDefinition, key, style));
        } else {
            let cell = props.rows[rowIndex - 1];
            if(columnDefinition.cellRenderer)
            {
                return (columnDefinition.cellRenderer(cell, columnDefinition, key, style));
            } else {
                return (<div>NO CELL RENDERER</div>);
            }
        }
    }

    function getColumnWidth(index) {
        const width = props.columns[index]?.columnWidth;
        if(width) {
            return width;
        }
        return MIN_COLUMN_WIDTH;
    }

    function getRowHeight(index) {
        if(index==0) {
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
