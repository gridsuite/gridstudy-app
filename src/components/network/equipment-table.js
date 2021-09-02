import React, { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { requestNetworkChange } from '../../utils/rest-api';
import { IconButton, TextField } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import Grid from '@material-ui/core/Grid';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import TableCell from '@material-ui/core/TableCell';
import LoaderWithOverlay from '../loader-with-overlay';
import VirtualizedTable from '../util/virtualized-table';
import { makeStyles } from '@material-ui/core/styles';

const ROW_HEIGHT = 50;

const useStyles = makeStyles((theme) => ({
    tableCell: {
        display: 'flex',
        alignItems: 'right',
        textAlign: 'right',
        boxSizing: 'border-box',
        flex: 1,
        minWidth: 0,
        height: ROW_HEIGHT + 'px',
        cursor: 'initial',
    },
    textDiv: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
}));

export const EquipmentTable = ({
    fetched,
    studyUuid,
    rows,
    selectedColumnsNames,
    tableDefinition,
    filter,
    scrollToIndex,
    scrollToAlignment,
    network,
    selectedDataKey,
}) => {
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
        requestNetworkChange(studyUuid, groovyCr).then((response) => {
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
        });
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
        (cellData, isNumeric, fractionDigit) => {
            let value = cellData.cellData;
            if (typeof value === 'function') value = cellData.cellData(network);

            return value && isNumeric && fractionDigit
                ? parseFloat(value).toFixed(fractionDigit)
                : value;
        },
        [network]
    );

    const defaultCellRender = useCallback(
        (cellData, numeric, fractionDigit) => {
            return (
                <TableCell
                    component="div"
                    variant="body"
                    style={{ width: cellData.width }}
                    className={classes.tableCell}
                    align={numeric ? 'right' : 'left'}
                >
                    <div
                        className={classes.textDiv}
                        style={{ textAlign: numeric ? 'right' : 'left' }}
                    >
                        {formatCell(cellData, numeric, fractionDigit)}
                    </div>
                </TableCell>
            );
        },
        [classes.tableCell, classes.textDiv, formatCell]
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
                const changeRequest = (value) =>
                    registerChangeRequest(cellData, changeCmd, value);
                return Editor ? (
                    <Editor
                        key={cellData.dataKey + cellData.rowData.id}
                        className={classes.tableCell}
                        equipment={rows[lineEdit.line]}
                        defaultValue={formatCell(
                            cellData,
                            numeric,
                            fractionDigit
                        )}
                        setter={(val) => changeRequest(val)}
                    />
                ) : (
                    <TextField
                        id={cellData.dataKey}
                        type="Number"
                        className={classes.tableCell}
                        size={'medium'}
                        margin={'normal'}
                        inputProps={{ style: { textAlign: 'center' } }}
                        onChange={(obj) => changeRequest(obj.target.value)}
                        defaultValue={formatCell(
                            cellData,
                            numeric,
                            fractionDigit
                        )}
                    />
                );
            }
        },
        [
            classes.tableCell,
            defaultCellRender,
            isLineOnEditMode,
            registerChangeRequest,
            lineEdit,
            rows,
            formatCell,
        ]
    );

    const columnDisplayStyle = (key) => {
        return selectedColumnsNames.has(key) ? '' : 'none';
    };

    const generateTableColumns = (table) => {
        return table.columns.map((c) => {
            let column = {
                label: intl.formatMessage({ id: c.id }),
                headerStyle: { display: columnDisplayStyle(c.id) },
                style: { display: columnDisplayStyle(c.id) },
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
                column.cellRenderer = (cell) =>
                    defaultCellRender(cell, c.numeric, c.fractionDigits);
            }
            delete column.changeCmd;
            return column;
        });
    };

    function makeHeaderCell() {
        return {
            width: 65,
            maxWidth: 65,
            label: '',
            dataKey: '',
            style: {
                display: selectedColumnsNames.size > 0 ? '' : 'none',
            },
            cellRenderer: createEditableRow,
        };
    }

    return (
        <>
            {!fetched && (
                <LoaderWithOverlay
                    color="inherit"
                    loaderSize={70}
                    loadingMessageText={'LoadingRemoteData'}
                />
            )}
            <VirtualizedTable
                rows={rows}
                rowHeight={ROW_HEIGHT}
                filter={filter}
                columns={
                    tableDefinition.modifiableEquipmentType
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
            />
        </>
    );
};
