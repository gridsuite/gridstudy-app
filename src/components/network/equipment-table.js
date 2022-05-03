import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from 'react-intl';
import { requestNetworkChange } from '../../utils/rest-api';
import { IconButton, TextField } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import Grid from '@mui/material/Grid';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import LoaderWithOverlay from '../util/loader-with-overlay';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { OverflowableText } from '@gridsuite/commons-ui';
import { MultiGrid, AutoSizer } from 'react-virtualized';
import LockIcon from "@mui/icons-material/Lock";
import { render } from "react-dom";
import { TABLES_DEFINITION_INDEXES } from "./config-tables";

const ROW_HEIGHT = 38;
const MIN_COLUMN_WIDTH = 160;
const HEADER_CELL_WIDTH = 65;

const useStyles = makeStyles((theme) => ({
    tableCell: {
        display: 'flex',
        alignItems: 'right',
        textAlign: 'right',
        boxSizing: 'border-box',
        padding: theme.spacing(1),
        flex: 1,
        minWidth: 0,
        height: ROW_HEIGHT + 'px',
        cursor: 'initial',
    },
}));

export const EquipmentTable = ({
    fetched,
    studyUuid,
    workingNode,
    rows,
    visibleColumnsNames,
    lockedColumnsNames,
    tableDefinition,
    filter,
    scrollToIndex,
    scrollToAlignment,
    network,
    selectedDataKey,
    fluxConvention,
    tabIndex,
    // TODO CHARLY extraire columns et le passer en state depuis network-table
}) => {

    const [lineEdit, setLineEdit] = useState(undefined);
    const classes = useStyles();
    let columns = [];
    const intl = useIntl();
    const isLineOnEditMode = useCallback(
        (cellData) => {
            return lineEdit && cellData.id === lineEdit.id;
        },
        [lineEdit]
    );

    useEffect(() => setLineEdit({}), [tableDefinition]);

    useEffect(() => { // used to force a MultiGrid re-render
        if(gridRef && gridRef.current)
        {
            gridRef.current.forceUpdateGrids();
            gridRef.current.recomputeGridSize();
        }
    }, [tabIndex]);

    function startEdition(lineInfo) {
        setLineEdit(lineInfo);
    }

    function isEditColumnVisible() {
        return (
            tableDefinition.modifiableEquipmentType && !workingNode?.readOnly
        );
    }

    function capitaliseFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function commitChanges(rowData) {
        let groovyCr =
            'equipment = network.get' +
            capitaliseFirst(tableDefinition.modifiableEquipmentType) +
            "('" +
            lineEdit.id.replace(/'/g, "\\'") +
            "')\n";
        Object.values(lineEdit.newValues).forEach((cr) => {
            groovyCr += cr.changeCmd.replace(/\{\}/g, cr.value) + '\n';
        });
        requestNetworkChange(studyUuid, workingNode?.id, groovyCr).then(
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
                    size="small"
                    disabled={lineEdit && lineEdit.id && true}
                    onClick={() =>
                        startEdition({
                            line: cellData.rowIndex,
                            oldValues: {},
                            newValues: {},
                            id: cellData.rowData['id'], // TODO CHARLY potentiellement à remplacer seulement par cellData.id, si ça plante.
                            equipmentType:
                                tableDefinition.modifiableEquipmentType,
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

    const formatCell = useCallback(
        (cellData, columnDefinition) => {
            let value = cellData[columnDefinition.dataKey];
            if (columnDefinition.cellDataGetter) {
                value = columnDefinition.cellDataGetter(cellData, network);
            }
            if (columnDefinition.normed) {
                console.error("CHARLY fluxconvention "+fluxConvention); // TODO CHARLY ne fonctionne pas quand on change le param (maybe d'autres soucis)
                value = columnDefinition.normed(fluxConvention, value);
            }
            return value &&
                columnDefinition.numeric &&
                columnDefinition.fractionDigits
                ? parseFloat(value).toFixed(columnDefinition.fractionDigits)
                : value;
        },
        [fluxConvention, network]
    );

    const defaultCellRender = useCallback(
        (cellData, columnDefinition) => {
            const text = formatCell(cellData, columnDefinition);
            /*<TableCell
                    component="div"
                    variant="body"
                    style={{ width: cellData.width }}
                    className={classes.tableCell}
                    align={numeric ? 'right' : 'left'}
                >
                    <OverflowableText text={text} />
                </TableCell>*/
            //return (<span style={columnDefinition.style}>{text}</span>);
            return text;
        },
        [classes.tableCell, formatCell]
    );

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

    const EditableCellRender = useCallback(
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
    );

    const generateTableColumns = useCallback (() => {
            let generatedTableColumns = tableDefinition.columns.filter((c) => {
                return visibleColumnsNames.has(c.id);
            }).map((c) => {
                let column = {
                    label: intl.formatMessage({ id: c.id }),
                    ...c,
                };
                if (lockedColumnsNames.has(c.id)) {
                    column.locked = true;
                }
                if (c.changeCmd !== undefined) {
                    console.error("ATTENTION code pas terminé ici");
                    column.cellRenderer = (cell, columnDefinition) =>
                        EditableCellRender(cell, columnDefinition);
                } else {
                    column.cellRenderer = (cell, columnDefinition) =>
                        defaultCellRender(cell, columnDefinition);
                }
                delete column.changeCmd;
                return column;
            });

            if (generatedTableColumns.length > 0 && isEditColumnVisible()) {
                generatedTableColumns.unshift({
                    style: { display: '', width: HEADER_CELL_WIDTH },
                    label: 'Edit',
                    cellRenderer: (cell, columnDefinition) =>
                        defaultCellRender(cell, columnDefinition),
                });
            }
            return generatedTableColumns;

        }, [rows, tableDefinition, visibleColumnsNames, lockedColumnsNames]
    );

    /*function makeHeaderCell() {
        return {
            width: HEADER_CELL_WIDTH,
            maxWidth: HEADER_CELL_WIDTH,
            label: '',
            dataKey: '',
            style: {
                display: visibleColumnsNames.size > 0 ? '' : 'none',
            },
            cellRenderer: createEditableRow,
        };
    }*/

    const lockIcon = () => {
        return (<LockIcon style={{fontSize: 'small'}}/>);
    }

    // CHARLY TEST BELOW
    // https://bvaughn.github.io/react-virtualized/#/components/MultiGrid
    // https://codesandbox.io/s/react-virtualized-multigrid-y9e08?from-embed=&file=/src/Gridtable.js:2358-2977
    // https://github.com/bvaughn/react-virtualized/blob/master/source/MultiGrid/MultiGrid.example.js
    // https://github.com/bvaughn/react-virtualized/blob/master/docs/MultiGrid.md

    function cellRenderer({ columnIndex, key, rowIndex, style }) {
        if(!columns || !columns[columnIndex])
        {
            return (<div>MISSING COLUMN DEF</div>);
        }
        let columnDefinition = columns[columnIndex];
        style = {
            ...style,
            backgroundColor: 'black',
            border: 'solid 1px red',
            fontSize: 'smaller',
        };

        if (rowIndex === 0) {
            return (
                <div key={key} style={style}>
                    {columnDefinition.locked ? lockIcon() : ''}
                    {columnDefinition.label}
                </div>
            );
        } else {
            let cell = rows[rowIndex - 1];
            if(columnDefinition.cellRenderer)
            {
                return (
                    <div key={key} style={style}>
                        {columnDefinition.cellRenderer(cell, columnDefinition)}
                    </div>
                );
            } else {
                return (<div>NO CELL RENDERER</div>);
            }
        }
    }

    /*function getColumnWidth(columnsParam, index) {
        return columnsParam[index].style.width !== undefined
            ? columnsParam[index].style.width
            : MIN_COLUMN_WIDTH;
    }*/

    const headerLinesCount = 1;
    const fixedColumnsCount = parseInt(1) + parseInt(isEditColumnVisible() ? 1 : 0); // We need to use parseInt to do additions in javascript (even if the IDE is not happy).

    /*return (
        <>
            {!fetched && (
                <LoaderWithOverlay
                    color="inherit"
                    loaderSize={70}
                    loadingMessageText={'LoadingRemoteData'}
                />
            )}
            <AutoSizer>
                {({ width, height }) => (
                    <MultiGrid
                        cellRenderer={cellRenderer}
                        fixedColumnCount={fixedColumnsCount}
                        fixedRowCount={headerLinesCount}
                        height={height}
                        width={width}
                        columnCount={columns.length}
                        //columnWidth={({ index }) => getColumnWidth(columns, index)}
                        columnWidth={MIN_COLUMN_WIDTH}
                        rowCount={rows.length + headerLinesCount}
                        rowHeight={40}
                    />
                )}
            </AutoSizer>
        </>
    );*/
    const gridRef = useRef();


    function render() {
        columns = generateTableColumns();
        if(!columns || columns.length ==0) return (<div>NOT LOADED YET</div>);
        return (
            <>
                {!fetched && (
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
                            fixedRowCount={headerLinesCount}
                            height={height}
                            width={width}
                            columnCount={columns.length}
                            //columnWidth={({ index }) => getColumnWidth(columns, index)}
                            columnWidth={MIN_COLUMN_WIDTH}
                            rowCount={rows.length + headerLinesCount}
                            rowHeight={40}
                        />
                    )}
                </AutoSizer>
            </>
        );
    }
    return (render());
};
