import React, { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { requestNetworkChange } from '../../utils/rest-api';
import { IconButton, TextField } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import Grid from '@mui/material/Grid';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import TableCell from '@mui/material/TableCell';
import LoaderWithOverlay from '../util/loader-with-overlay';
import VirtualizedTable from '../util/virtualized-table';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { OverflowableText } from '@gridsuite/commons-ui';
import Paper from '@mui/material/Paper';
import MultiGrid from 'react-virtualized/dist/commonjs/MultiGrid/MultiGrid';
import { AutoSizer } from 'react-virtualized';
//import { CharlyDebug } from '../util/charly';

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
    selectedColumnsNames,
    tableDefinition,
    filter,
    scrollToIndex,
    scrollToAlignment,
    network,
    selectedDataKey,
    fluxConvention,
}) => {
    /*const [charlyTime, setCharlyTime] = useState(
        useEffect(() => {
            setCharlyTime(Date.now());
        }, [])
    );*/

    const [lineEdit, setLineEdit] = useState(undefined);
    const classes = useStyles();
    const intl = useIntl();
    const isLineOnEditMode = useCallback(
        (cellData) => {
            return lineEdit && cellData.rowData.id === lineEdit.id;
        },
        [lineEdit]
    );

    useEffect(() => setLineEdit({}), [tableDefinition]);

    function startEdition(lineInfo) {
        setLineEdit(lineInfo);
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
                            id: cellData.rowData['id'],
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
                            onClick={() => commitChanges(cellData.rowData)}
                        >
                            <CheckIcon />
                        </IconButton>
                        <IconButton
                            size={'small'}
                            onClick={() => resetChanges(cellData.rowData)}
                        >
                            <ClearIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            )
        );
    }

    const formatCell = useCallback(
        (cellData, dataKey, isNumeric, fractionDigit, normed = undefined) => {
            let value = cellData[dataKey];
            if (typeof value === 'function') value = cellData.dataKey(network);
            if (normed) value = normed(fluxConvention, value);
            return value && isNumeric && fractionDigit
                ? parseFloat(value).toFixed(fractionDigit)
                : value;
        },
        [fluxConvention, network]
    );

    const defaultCellRender = useCallback(
        (cellData, dataKey, numeric, fractionDigit, normed = undefined) => {
            const text = formatCell(cellData, dataKey, numeric, fractionDigit, normed);
            return (
                /*<TableCell
                    component="div"
                    variant="body"
                    style={{ width: cellData.width }}
                    className={classes.tableCell}
                    align={numeric ? 'right' : 'left'}
                >
                    <OverflowableText text={text} />
                </TableCell>*/
                <span>{text}</span>
            );
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
        (cellData, numeric, changeCmd, fractionDigit, Editor) => {
            if (
                !isLineOnEditMode(cellData) ||
                cellData.rowData[cellData.dataKey] === undefined
            ) {
                return defaultCellRender(cellData, numeric, fractionDigit);
            } else {
                const ref = React.createRef();
                const text = formatCell(cellData, numeric, fractionDigit);
                const changeRequest = (value) =>
                    registerChangeRequest(cellData, changeCmd, value);
                return Editor ? (
                    <Editor
                        key={cellData.dataKey + cellData.rowData.id}
                        className={classes.tableCell}
                        equipment={cellData.rowData}
                        defaultValue={formatCell(
                            cellData,
                            numeric,
                            fractionDigit
                        )}
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

    const columnDisplayStyle = (key) => {
        return selectedColumnsNames.has(key) ? '' : 'none';
    };

    const generateMinWidthTable = (table) => {
        return table.columns
            .filter((c) => {
                // Only keep the displayed columns
                return selectedColumnsNames.has(c.id);
            })
            .map((c) => {
                // Get all the displayed columns' widths
                return c.columnWidth !== undefined
                    ? c.columnWidth
                    : MIN_COLUMN_WIDTH;
            })
            .reduce(function (sum, currentWidth) {
                // Sum the widths
                return sum + currentWidth;
            }, 0);
    };

    const generateTableColumns = (table) => {
        let generatedTableColumns = table.columns.map((c) => {
            let columnWidth =
                c.columnWidth !== undefined ? c.columnWidth : MIN_COLUMN_WIDTH;
            let column = {
                label: intl.formatMessage({ id: c.id }),
                headerStyle: {
                    display: columnDisplayStyle(c.id),
                    width: columnWidth + 'px',
                },
                style: {
                    display: columnDisplayStyle(c.id),
                    width: columnWidth + 'px',
                },
                ...c,
            };
            if (c.changeCmd !== undefined) {
                column.cellRenderer = (cell) =>
                    EditableCellRender(
                        cell,
                        c.numeric,
                        c.changeCmd,
                        c.fractionDigits,
                        c.editor
                    );
            } else {
                column.cellRenderer = (cell, dataKey) =>
                    defaultCellRender(
                        cell,
                        dataKey,
                        c.numeric,
                        c.fractionDigits,
                        c.normed
                    );
            }
            delete column.changeCmd;
            return column;
        });
        /*let firstColumnWidth =
            generatedTableColumns[0].columnWidth !== undefined
                ? generatedTableColumns[0].columnWidth
                : MIN_COLUMN_WIDTH;
        generatedTableColumns[0].style = {
            position: 'fixed',
            width: firstColumnWidth + 'px',
            backgroundColor: '#224433',
            ...generatedTableColumns[0].style,
        };
        generatedTableColumns[0].headerStyle = {
            position: 'fixed',
            width: firstColumnWidth + 'px',
            backgroundColor: '#224433',
            zIndex: '2',
            ...generatedTableColumns[0].headerStyle,
        };
        generatedTableColumns[1].style = {
            marginLeft: firstColumnWidth + 'px',
            ...generatedTableColumns[1].style,
        };
        generatedTableColumns[1].headerStyle = {
            marginLeft: firstColumnWidth + 'px',
            ...generatedTableColumns[1].headerStyle,
        };*/
        return generatedTableColumns;
    };

    /*const generateCell = (rowIndex, columnIndex) => {
        //return rows[rowIndex][columnIndex].cellRenderer;
        //return formatCell(rows[rowIndex][columnIndex], numeric, fractionDigit, normed);
        return '[' + rowIndex + '_' + columnIndex + ']';
        //return {
        //    width: MIN_COLUMN_WIDTH,
        //    maxWidth: MIN_COLUMN_WIDTH,
        //    label: 'label',
        //   dataKey: 'dataKey',
        //   style: {},
        //   cellRenderer: defaultCellRender,
        //};
    };*/

    function makeHeaderCell() {
        return {
            width: HEADER_CELL_WIDTH,
            maxWidth: HEADER_CELL_WIDTH,
            label: '',
            dataKey: '',
            style: {
                display: selectedColumnsNames.size > 0 ? '' : 'none',
            },
            cellRenderer: createEditableRow,
        };
    }

    // CHARLY TEST BELOW
    // https://bvaughn.github.io/react-virtualized/#/components/MultiGrid
    // https://codesandbox.io/s/react-virtualized-multigrid-y9e08?from-embed=&file=/src/Gridtable.js:2358-2977
    // https://github.com/bvaughn/react-virtualized/blob/master/source/MultiGrid/MultiGrid.example.js
    // https://github.com/bvaughn/react-virtualized/blob/master/docs/MultiGrid.md

    function cellRenderer({ columnIndex, key, rowIndex, style }) {
        //style = {backgroundColor: getBackgroundColor(), ...style};
        let col = columns[columnIndex];
        if (rowIndex === 0) {
            return (
                <div key={key} style={style}>
                    {col.label}
                </div>
            );
        } else {
            let cell = rows[rowIndex-1];
            console.error("cellRender cell.dataKey="+cell.dataKey+", col.dataKey="+col.dataKey);
            //console.error(col.cellRenderer);
            //col.cellRenderer(cell);

            return (
                <div key={key} style={style}>
                    {
                        col.cellRenderer(cell, col.dataKey)
                    }
                </div>
            );
            //col.cellRenderer(rows[rowIndex][columnIndex]);
        }
    }

    function getColumnWidth(index) {
        return tableDefinition.columns[index].columnWidth !== undefined
            ? tableDefinition.columns[index].columnWidth
            : MIN_COLUMN_WIDTH;
    }

    const columns = generateTableColumns(tableDefinition);

    /*
    <CharlyDebug
                charlyTime={charlyTime}
                show={'lignes ' + rows.length}
            />
     */

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
                        cellRenderer={cellRenderer}
                        fixedColumnCount={1}
                        fixedRowCount={1}
                        height={height}
                        width={width}
                        columnCount={tableDefinition.columns.length}
                        columnWidth={({ index }) => getColumnWidth(index)}
                        rowCount={rows.length + 1}
                        rowHeight={40}
                    />
                )}
            </AutoSizer>
        </>
    );

    /*
    return (
        <>
            {!fetched && (
                <LoaderWithOverlay
                    color="inherit"
                    loaderSize={70}
                    loadingMessageText={'LoadingRemoteData'}
                />
            )}
            <Paper
                style={{
                    height: 100 + '%',
                    width: 100 + '%',
                    overflowX: 'auto',
                }}
            >
                <VirtualizedTable
                    width={
                        generateMinWidthTable(tableDefinition) +
                        (tableDefinition.modifiableEquipmentType &&
                        !workingNode?.readOnly
                            ? HEADER_CELL_WIDTH
                            : 0)
                    }
                    rows={rows}
                    rowHeight={ROW_HEIGHT}
                    filter={filter}
                    columns={
                        tableDefinition.modifiableEquipmentType &&
                        !workingNode?.readOnly
                            ? [
                                  makeHeaderCell(),
                                  ...generateTableColumns(tableDefinition),
                              ]
                            : generateTableColumns(tableDefinition)
                    }
                    scrollToIndex={scrollToIndex}
                    scrollToAlignment={scrollToAlignment}
                    enableExportCSV={true}
                    exportCSVDataKeys={selectedDataKey}
                    sortable={true}
                />
            </Paper>
        </>
    );
*/
};
