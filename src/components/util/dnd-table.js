/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
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
import FieldErrorAlert from '../refactor/rhf-inputs/field-error-alert';
import DndTableButtons from './dnd-table-buttons';
import { TableNumericalInput } from '../refactor/rhf-inputs/table-inputs/table-numerical-input';
import CheckboxInput from '../refactor/rhf-inputs/booleans/checkbox-input';
import PropTypes from 'prop-types';

function MultiCheckbox({
    arrayFormName,
    handleClickIfChecked,
    handleClickIfUnchecked,
}) {
    const arrayToWatch = useWatch({
        name: arrayFormName,
    });

    const allRowSelected = arrayToWatch.every((row) => row.selected);

    return (
        <Checkbox
            checked={arrayToWatch.length > 0 && allRowSelected}
            onChange={(event) => {
                event.target.checked
                    ? handleClickIfChecked()
                    : handleClickIfUnchecked();
            }}
        />
    );
}

function DefaultTableCell({ arrayFormName, rowIndex, column }) {
    const valueToWatch = useWatch({
        name: `${arrayFormName}[${rowIndex}].${column.dataKey}`,
    });
    return <TableCell key={column.dataKey}>{valueToWatch}</TableCell>;
}

function EditableTableCell({ arrayFormName, rowIndex, column }) {
    return (
        <TableCell key={column.dataKey}>
            <TableNumericalInput
                name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
            />
        </TableCell>
    );
}

const DndTable = ({
    arrayFormName,
    useFieldArrayOutput,
    disabled,
    columnsDefinition,
    handleAddButton,
    handleDeleteButton,
    handleUploadButton,
    uploadButtonMessageId,
}) => {
    const intl = useIntl();

    const { getValues, setValue } = useFormContext();

    const {
        fields: tapFields, // don't use it to access form data ! check doc
        move,
        swap,
    } = useFieldArrayOutput;

    function renderTableCell(rowIndex, column) {
        let CustomTableCell = column.editable
            ? EditableTableCell
            : DefaultTableCell;
        return (
            <CustomTableCell
                key={rowIndex.toString() + column.dataKey}
                arrayFormName={arrayFormName}
                rowIndex={rowIndex}
                column={column}
            />
        );
    }

    function selectAllRows() {
        for (let i = 0; i < tapFields.length; i++) {
            setValue(`${arrayFormName}[${i}].selected`, true);
        }
    }

    function unselectAllRows() {
        for (let i = 0; i < tapFields.length; i++) {
            setValue(`${arrayFormName}[${i}].selected`, false);
        }
    }

    function moveUpSelectedRows() {
        const currentTapRows = getValues(arrayFormName);

        if (currentTapRows[0].selected) {
            // we can't move up more the rows, so we stop
            return;
        }

        for (let i = 1; i < currentTapRows.length; i++) {
            if (currentTapRows[i].selected) {
                swap(i - 1, i);
            }
        }
    }

    function moveDownSelectedRows() {
        const currentTapRows = getValues(arrayFormName);

        if (currentTapRows[currentTapRows.length - 1].selected) {
            // we can't move down more the rows, so we stop
            return;
        }

        for (let i = currentTapRows.length - 2; i >= 0; i--) {
            if (currentTapRows[i].selected) {
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

    //TODO fix alignment of column names when no rows ?
    function renderTableHead() {
        return (
            <TableHead>
                <TableRow>
                    <TableCell>
                        {/* empty cell for the drag and drop column */}
                    </TableCell>
                    <TableCell>
                        <MultiCheckbox
                            arrayFormName={arrayFormName}
                            handleClickIfChecked={selectAllRows}
                            handleClickIfUnchecked={unselectAllRows}
                        />
                    </TableCell>
                    {columnsDefinition.map((column, index) => (
                        <TableCell key={column.dataKey}>
                            {column.label}
                            {column.extra}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        );
    }

    function renderTableBody(providedDroppable) {
        return (
            <TableBody>
                {tapFields.map((row, index) => (
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
                                    <TableCell {...provided.dragHandleProps}>
                                        <DragIndicatorIcon />
                                    </TableCell>
                                </Tooltip>
                                <TableCell>
                                    <CheckboxInput
                                        name={`${arrayFormName}[${index}].selected`}
                                    />
                                </TableCell>
                                {columnsDefinition.map((column) =>
                                    renderTableCell(index, column)
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
                    <Droppable droppableId="tapTable">
                        {(provided, snapshot) => (
                            <TableContainer
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                sx={{ minHeight: 200, maxHeight: 500 }}
                            >
                                <Table stickyHeader size="small">
                                    {renderTableHead()}
                                    {renderTableBody(provided)}
                                </Table>
                            </TableContainer>
                        )}
                    </Droppable>
                </DragDropContext>
                <FieldErrorAlert name={arrayFormName} />
            </Grid>
            <DndTableButtons
                arrayFormName={arrayFormName}
                disabled={disabled}
                handleAddButton={handleAddButton}
                handleDeleteButton={handleDeleteButton}
                handleMoveUpButton={moveUpSelectedRows}
                handleMoveDownButton={moveDownSelectedRows}
                handleUploadButton={handleUploadButton}
                uploadButtonMessageId={uploadButtonMessageId}
            />
        </Grid>
    );
};

DndTable.prototype = {
    tapChanger: PropTypes.string.isRequired,
    ruleType: PropTypes.string.isRequired,
    createTapRuleColumn: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    columnsDefinition: PropTypes.object.isRequired,
    csvColumns: PropTypes.object.isRequired,
    createRuleMessageId: PropTypes.string.isRequired,
    importRuleMessageId: PropTypes.string.isRequired,
    handleImportRow: PropTypes.func.isRequired,
};

export default DndTable;
