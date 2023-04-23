/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Box } from '@mui/system';
import {
    Checkbox,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useIntl } from 'react-intl';
import DndTableBottomLeftButtons from './dnd-table-bottom-left-buttons';
import DndTableBottomRightButtons from './dnd-table-bottom-right-buttons';
import { TableNumericalInput } from '../../refactor/rhf-inputs/table-inputs/table-numerical-input';
import { TableTextInput } from '../../refactor/rhf-inputs/table-inputs/table-text-input';
import CheckboxInput from '../../refactor/rhf-inputs/booleans/checkbox-input';
import PropTypes from 'prop-types';
import { SELECTED } from '../../refactor/utils/field-constants';
import ErrorInput from '../../refactor/rhf-inputs/error-inputs/error-input';
import FieldErrorAlert from '../../refactor/rhf-inputs/error-inputs/field-error-alert';
import { ReadOnlyInput } from '../../refactor/rhf-inputs/read-only-input';
import DndTableAddRowsDialog from './dnd-table-add-rows-dialog';

export const MAX_ROWS_NUMBER = 100;

export const addSelectedFieldToRows = (rows) => {
    return rows?.map((row) => {
        return { ...row, [SELECTED]: false };
    });
};

function MultiCheckbox({
    arrayFormName,
    handleClickCheck,
    handleClickUncheck,
    ...props
}) {
    const arrayToWatch = useWatch({
        name: arrayFormName,
    });

    const allRowSelected = useMemo(
        () => arrayToWatch.every((row) => row[SELECTED]),
        [arrayToWatch]
    );
    const someRowSelected = useMemo(
        () => arrayToWatch.some((row) => row[SELECTED]),
        [arrayToWatch]
    );

    return (
        <Checkbox
            checked={arrayToWatch.length > 0 && allRowSelected}
            indeterminate={someRowSelected && !allRowSelected}
            onChange={(event) => {
                event.target.checked
                    ? handleClickCheck()
                    : handleClickUncheck();
            }}
            {...props}
        />
    );
}

function DefaultTableCell({ arrayFormName, rowIndex, column, ...props }) {
    return (
        <TableCell key={column.dataKey} sx={{ padding: 1 }}>
            <ReadOnlyInput
                name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                {...props}
            />
        </TableCell>
    );
}

function EditableTableCell({ arrayFormName, rowIndex, column, ...props }) {
    return (
        <TableCell key={column.dataKey} sx={{ padding: 0.5 }}>
            {column.numeric && (
                <TableNumericalInput
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                    {...props}
                />
            )}
            {!column.numeric && (
                <TableTextInput
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                    {...props}
                />
            )}
        </TableCell>
    );
}

const DndTable = ({
    arrayFormName,
    useFieldArrayOutput,
    columnsDefinition,
    tableHeight,
    allowedToAddRows = () => Promise.resolve(true),
    createRows,
    handleUploadButton,
    uploadButtonMessageId,
    disabled = false,
    withLeftButtons = true,
    withAddRowsDialog = true,
    previousValues,
    disableTableCell,
}) => {
    const intl = useIntl();

    const { getValues, setValue, setError, clearErrors } = useFormContext();

    const {
        fields: currentRows, // don't use it to access form data ! check doc
        move,
        swap,
        append,
        remove,
    } = useFieldArrayOutput;

    const [openAddRowsDialog, setOpenAddRowsDialog] = useState(false);

    function renderTableCell(rowId, rowIndex, column) {
        let CustomTableCell = column.editable
            ? EditableTableCell
            : DefaultTableCell;
        return (
            <CustomTableCell
                key={rowId + column.dataKey}
                arrayFormName={arrayFormName}
                rowIndex={rowIndex}
                column={column}
                disabled={
                    disableTableCell
                        ? disableTableCell(
                              rowIndex,
                              column,
                              arrayFormName,
                              previousValues
                          )
                        : disabled
                }
            />
        );
    }

    function handleAddRowsButton() {
        allowedToAddRows().then((isAllowed) => {
            if (isAllowed) {
                if (withAddRowsDialog) {
                    setOpenAddRowsDialog(true);
                } else {
                    // directly add a single row
                    addNewRows(1);
                }
            }
        });
    }

    function handleCloseAddRowsDialog() {
        setOpenAddRowsDialog(false);
    }

    function addNewRows(numberOfRows) {
        // checking if not exceeding 100 steps
        if (currentRows.length + numberOfRows > MAX_ROWS_NUMBER) {
            setError(arrayFormName, {
                type: 'custom',
                message: {
                    id: 'MaximumRowNumberError',
                    value: MAX_ROWS_NUMBER,
                },
            });
            return;
        }
        clearErrors(arrayFormName);

        const rowsToAdd = createRows(numberOfRows).map((row) => {
            return { ...row, [SELECTED]: false };
        });

        // note : an id prop is automatically added in each row
        append(rowsToAdd);
    }

    function deleteSelectedRows() {
        const currentRowsValues = getValues(arrayFormName);

        let rowsToDelete = [];
        for (let i = 0; i < currentRowsValues.length; i++) {
            if (currentRowsValues[i][SELECTED]) {
                rowsToDelete.push(i);
            }
        }

        remove(rowsToDelete);
    }

    function selectAllRows() {
        for (let i = 0; i < currentRows.length; i++) {
            setValue(`${arrayFormName}[${i}].${SELECTED}`, true);
        }
    }

    function unselectAllRows() {
        for (let i = 0; i < currentRows.length; i++) {
            setValue(`${arrayFormName}[${i}].${SELECTED}`, false);
        }
    }

    function moveUpSelectedRows() {
        const currentRowsValues = getValues(arrayFormName);

        if (currentRowsValues[0][SELECTED]) {
            // we can't move up more the rows, so we stop
            return;
        }

        for (let i = 1; i < currentRowsValues.length; i++) {
            if (currentRowsValues[i][SELECTED]) {
                swap(i - 1, i);
            }
        }
    }

    function moveDownSelectedRows() {
        const currentRowsValues = getValues(arrayFormName);

        if (currentRowsValues[currentRowsValues.length - 1][SELECTED]) {
            // we can't move down more the rows, so we stop
            return;
        }

        for (let i = currentRowsValues.length - 2; i >= 0; i--) {
            if (currentRowsValues[i][SELECTED]) {
                swap(i, i + 1);
            }
        }
    }

    function onDragEnd(result) {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        move(result.source.index, result.destination.index);
    }

    function renderTableHead() {
        return (
            <TableHead>
                <TableRow>
                    <TableCell sx={{ width: '3%' }}>
                        {/* empty cell for the drag and drop column */}
                    </TableCell>
                    <TableCell sx={{ width: '5%', textAlign: 'center' }}>
                        <MultiCheckbox
                            arrayFormName={arrayFormName}
                            handleClickCheck={selectAllRows}
                            handleClickUncheck={unselectAllRows}
                            disabled={disabled || currentRows.length === 0}
                        />
                    </TableCell>
                    {columnsDefinition.map((column) => (
                        <TableCell key={column.dataKey}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    margin: 1,
                                }}
                            >
                                {column.label}
                                {column.extra}
                            </Box>
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        );
    }

    function renderTableBody(providedDroppable) {
        return (
            <TableBody>
                {currentRows.map((row, index) => (
                    <Draggable
                        key={row.id}
                        draggableId={row.id.toString()}
                        index={index}
                    >
                        {(provided, snapshot) => (
                            <TableRow
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                            >
                                <Tooltip
                                    title={intl.formatMessage({
                                        id: 'DragAndDrop',
                                    })}
                                    placement="right"
                                >
                                    <TableCell
                                        sx={{ textAlign: 'center' }}
                                        {...(disabled
                                            ? {}
                                            : { ...provided.dragHandleProps })}
                                    >
                                        <DragIndicatorIcon />
                                    </TableCell>
                                </Tooltip>
                                <TableCell sx={{ textAlign: 'center' }}>
                                    <CheckboxInput
                                        name={`${arrayFormName}[${index}].${SELECTED}`}
                                        formProps={{ disabled }}
                                    />
                                </TableCell>
                                {columnsDefinition.map((column) =>
                                    renderTableCell(row.id, index, column)
                                )}
                            </TableRow>
                        )}
                    </Draggable>
                ))}
                {providedDroppable.placeholder}
            </TableBody>
        );
    }

    return (
        <Grid item container spacing={1}>
            <Grid item container>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="tapTable" isDropDisabled={disabled}>
                        {(provided, snapshot) => (
                            <TableContainer
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                sx={{ height: tableHeight }}
                            >
                                <Table stickyHeader size="small" padding="none">
                                    {renderTableHead()}
                                    {renderTableBody(provided)}
                                </Table>
                            </TableContainer>
                        )}
                    </Droppable>
                </DragDropContext>
                <ErrorInput name={arrayFormName} InputField={FieldErrorAlert} />
            </Grid>
            <Grid container item>
                {withLeftButtons && (
                    <DndTableBottomLeftButtons
                        handleUploadButton={handleUploadButton}
                        uploadButtonMessageId={uploadButtonMessageId}
                        disabled={disabled}
                    />
                )}
                <DndTableBottomRightButtons
                    arrayFormName={arrayFormName}
                    handleAddButton={handleAddRowsButton}
                    handleDeleteButton={deleteSelectedRows}
                    handleMoveUpButton={moveUpSelectedRows}
                    handleMoveDownButton={moveDownSelectedRows}
                    disabled={disabled}
                />
            </Grid>
            <DndTableAddRowsDialog
                open={openAddRowsDialog}
                handleAddButton={addNewRows}
                onClose={handleCloseAddRowsDialog}
            />
        </Grid>
    );
};

DndTable.prototype = {
    arrayFormName: PropTypes.string.isRequired,
    useFieldArrayOutput: PropTypes.object.isRequired,
    columnsDefinition: PropTypes.object.isRequired,
    tableHeight: PropTypes.number.isRequired,
    allowedToAddRows: PropTypes.func,
    createRows: PropTypes.func.isRequired,
    handleUploadButton: PropTypes.func.isRequired,
    uploadButtonMessageId: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    withLeftButtons: PropTypes.bool,
    withAddRowsDialog: PropTypes.bool,
};

export default DndTable;
