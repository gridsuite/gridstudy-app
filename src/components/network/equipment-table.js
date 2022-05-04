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

export const EquipmentTable = (props) => {

    const [lineEdit, setLineEdit] = useState(undefined);
    const classes = useStyles();
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
                    size="small"
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

    //const defaultCellRender = useCallback(
    //    (cellData, columnDefinition) => {
    //        const text = formatCell(cellData, columnDefinition);
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
    //        return text;
    //    },
    //    [classes.tableCell, formatCell]
    //);

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

    const lockIcon = () => {
        return (<LockIcon style={{fontSize: 'small'}}/>);
    }

    // https://bvaughn.github.io/react-virtualized/#/components/MultiGrid
    // https://codesandbox.io/s/react-virtualized-multigrid-y9e08?from-embed=&file=/src/Gridtable.js:2358-2977
    // https://github.com/bvaughn/react-virtualized/blob/master/source/MultiGrid/MultiGrid.example.js
    // https://github.com/bvaughn/react-virtualized/blob/master/docs/MultiGrid.md

    function cellRenderer({ columnIndex, key, rowIndex, style }) {
        if(!props.columns || !props.columns[columnIndex])
        {
            //console.error("MISSING DEF : col["+columnIndex+"]row["+rowIndex+"]");
            return (<div style={{
                ...style,
                backgroundColor: 'yellow',
                color:'black',
                zIndex: 99999,
            }}>MISSING_DEF:{columnIndex}-{rowIndex}</div>);
        }
        let columnDefinition = props.columns[columnIndex];
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
            let cell = props.rows[rowIndex - 1];
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

    function getColumnWidth(index) {
        const width = props.columns[index]?.style?.width;
        if(width) {
            return width;
        }
        return MIN_COLUMN_WIDTH;
    }

    const headerLinesCount = 1;

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
                        fixedRowCount={headerLinesCount}
                        height={height}
                        width={width}
                        columnCount={props.columns.length}
                        columnWidth={({ index }) => getColumnWidth(index)}
                        rowCount={props.rows.length + headerLinesCount}
                        rowHeight={40}
                    />
                )}
            </AutoSizer>
        </>
    );
};
