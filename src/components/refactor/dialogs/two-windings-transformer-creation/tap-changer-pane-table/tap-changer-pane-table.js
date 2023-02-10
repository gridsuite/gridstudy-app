/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import {
    Checkbox,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from '@mui/material';
import AddchartIcon from '@mui/icons-material/Addchart';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import Papa from 'papaparse';
import { useIntl } from 'react-intl';
import FieldErrorAlert from '../../../rhf-inputs/field-error-alert';
import IntegerInput from '../../../rhf-inputs/integer-input';
import { TableNumericalInput } from '../../../rhf-inputs/table-inputs/table-numerical-input';
import TapChangerPaneButtons from './tap-changer-pane-buttons';
import CheckboxInput from '../../../rhf-inputs/booleans/checkbox-input';
import AddRowsDialog from './add-rows-dialog';
import { CreateRuleDialog } from '../create-rule/create-rule-dialog';
import { ImportRuleDialog } from '../import-rule-dialog';
import {
    HIGH_TAP_POSITION,
    LOW_TAP_POSITION,
    STEPS,
    STEPS_TAP,
    TAP_POSITION,
} from 'components/refactor/utils/field-constants';
import { MAX_TAP_NUMBER } from '../two-windings-transformer-creation-dialog';
import PropTypes from 'prop-types';

function MultiCheckbox({
    associatedArrayName,
    selectedPropName,
    handleClickIfChecked,
    handleClickIfUnchecked,
}) {
    const arrayToWatch = useWatch({
        name: associatedArrayName,
    });

    const allRowSelected = arrayToWatch.every((row) => row[selectedPropName]);

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

function DefaultTableCell({ tapChanger, rowIndex, column }) {
    const valueToWatch = useWatch({
        name: `${tapChanger}.${STEPS}[${rowIndex}].${column.dataKey}`,
    });
    return <TableCell key={column.dataKey}>{valueToWatch}</TableCell>;
}

function EditableTableCell({ tapChanger, rowIndex, column }) {
    return (
        <TableCell key={column.dataKey}>
            <TableNumericalInput
                name={`${tapChanger}.${STEPS}[${rowIndex}].${column.dataKey}`}
            />
        </TableCell>
    );
}

const TapChangerPaneTable = ({
    tapChanger,
    ruleType,
    createTapRuleColumn,
    disabled,
    columnsDefinition,
    csvColumns,
    createRuleMessageId,
    importRuleMessageId,
    handleImportRow,
}) => {
    const intl = useIntl();

    const { trigger, getValues, setValue, setError } = useFormContext();

    const {
        fields: tapFields, // don't use it to access form data ! check doc
        replace,
        move,
        swap,
        append,
        remove,
    } = useFieldArray({
        name: `${tapChanger}.${STEPS}`,
    });

    const lowTapPosition = useWatch({
        name: `${tapChanger}.${LOW_TAP_POSITION}`,
    });

    const [openCreateRuleDialog, setOpenCreateRuleDialog] = useState(false);
    const [openImportRuleDialog, setOpenImportRuleDialog] = useState(false);
    const [openAddRowsDialog, setOpenAddRowsDialog] = useState(false);

    function renderTableCell(rowIndex, column) {
        let CustomTableCell = column.editable
            ? EditableTableCell
            : DefaultTableCell;
        return (
            <CustomTableCell
                key={rowIndex.toString() + column.dataKey}
                tapChanger={tapChanger}
                rowIndex={rowIndex}
                column={column}
            />
        );
    }

    function handleAddRowsButton() {
        // triggering validation on low tap position before generating rows (the field is required)
        trigger(`${tapChanger}.${LOW_TAP_POSITION}`).then((result) => {
            // if the trigger returns false, it means the field validation didn't pass -> we don't generate rows
            // the user will see the low tap field in red
            if (!result) {
                return;
            }
            setOpenAddRowsDialog(true);
        });
    }

    function addNewRows(numberOfRows) {
        const currentLowTapPosition = getValues(
            `${tapChanger}.${LOW_TAP_POSITION}`
        );
        const currentTapRows = getValues(`${tapChanger}.${STEPS}`);

        // checking if not exceeding 100 steps
        if (currentTapRows.length + numberOfRows > MAX_TAP_NUMBER) {
            setError(`${tapChanger}.${STEPS}`, {
                type: 'custom',
                message: {
                    id: 'TapPositionValueError',
                    value: MAX_TAP_NUMBER,
                },
            });
            return;
        }

        let currentHighestTap;
        if (currentTapRows.length === 0) {
            currentHighestTap = currentLowTapPosition - 1; // we do + 1 right after
        } else {
            currentHighestTap =
                currentTapRows[currentTapRows.length - 1][STEPS_TAP];
        }

        const tapRowsToAdd = [];
        for (let i = 0; i < numberOfRows; i++) {
            // we directly use currentHighestTap + 1 as first tap value
            currentHighestTap++;
            // we remove STEPS_TAP from the columns with slice
            const newRow = columnsDefinition.slice(1).reduce(
                (accumulator, currentValue) => ({
                    ...accumulator,
                    [currentValue.dataKey]: currentValue.initialValue,
                }),
                { selected: false, [STEPS_TAP]: currentHighestTap }
            );
            tapRowsToAdd.push(newRow);
        }

        // note : an id prop is automatically added in each row
        append(tapRowsToAdd);
        setValue(`${tapChanger}.${HIGH_TAP_POSITION}`, currentHighestTap);
    }

    function handleCloseAddRowsDialog() {
        setOpenAddRowsDialog(false);
    }

    function selectAllRows() {
        for (let i = 0; i < tapFields.length; i++) {
            setValue(`${tapChanger}.${STEPS}[${i}].selected`, true);
        }
    }

    function unselectAllRows() {
        for (let i = 0; i < tapFields.length; i++) {
            setValue(`${tapChanger}.${STEPS}[${i}].selected`, false);
        }
    }

    function deleteSelectedRows() {
        const currentTapRows = getValues(`${tapChanger}.${STEPS}`);

        let rowsToDelete = [];
        for (let i = 0; i < currentTapRows.length; i++) {
            if (currentTapRows[i].selected) {
                rowsToDelete.push(i);
            }
        }

        remove(rowsToDelete);

        const currentHighTapPosition = getValues(
            `${tapChanger}.${HIGH_TAP_POSITION}`
        );

        const newHighTapPosition = currentHighTapPosition - rowsToDelete.length;
        setValue(`${tapChanger}.${HIGH_TAP_POSITION}`, newHighTapPosition);
    }

    function moveUpSelectedRows() {
        const currentTapRows = getValues(`${tapChanger}.${STEPS}`);

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
        const currentTapRows = getValues(`${tapChanger}.${STEPS}`);

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

    const resetTapNumbers = useCallback(
        (tapFields) => {
            const currentTapRows =
                tapFields ?? getValues(`${tapChanger}.${STEPS}`);
            if (currentTapRows.length === 0) {
                return;
            }

            const lowestTapPosition = getValues(
                `${tapChanger}.${LOW_TAP_POSITION}`
            );

            for (
                let tapPosition = lowestTapPosition, index = 0;
                index < currentTapRows.length;
                tapPosition++, index++
            ) {
                setValue(
                    `${tapChanger}.${STEPS}[${index}].${STEPS_TAP}`,
                    tapPosition
                );
            }
        },
        [tapChanger, getValues, setValue]
    );

    // Adjust high tap position when low tap position change + remove red if value fixed
    useEffect(() => {
        trigger(`${tapChanger}.${LOW_TAP_POSITION}`).then((result) => {
            if (!result) {
                return;
            }

            const currentTapRows = getValues(`${tapChanger}.${STEPS}`);
            const newHighTapPosition =
                currentTapRows.length !== 0
                    ? lowTapPosition + currentTapRows.length - 1
                    : null;
            setValue(`${tapChanger}.${HIGH_TAP_POSITION}`, newHighTapPosition);

            resetTapNumbers(null);
        });
    }, [
        trigger,
        tapChanger,
        lowTapPosition, // the only value supposed to change
        getValues,
        setValue,
        resetTapNumbers,
    ]);

    // when we detect a change in tapFields (so when the size or the order of the list of rows change), we reset the tap fields
    useEffect(() => {
        resetTapNumbers(tapFields);
    }, [tapFields, resetTapNumbers]);

    const handleCreateTapRule = (lowTap, highTap) => {
        const currentTapRows = getValues(`${tapChanger}.${STEPS}`);

        if (currentTapRows.length > 1) {
            let interval = (highTap - lowTap) / (currentTapRows.length - 1);
            let current = lowTap;

            currentTapRows.forEach((row, index) => {
                currentTapRows[index][createTapRuleColumn] = current;

                current += interval;
            });
            replace(currentTapRows);
        }
    };

    const handleImportTapRule = (selectedFile, setFileParseError) => {
        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                if (results.data.length > MAX_TAP_NUMBER) {
                    setFileParseError(
                        intl.formatMessage(
                            { id: 'TapPositionValueError' },
                            { value: MAX_TAP_NUMBER }
                        )
                    );
                    return;
                }
                let rows = results.data.map(handleImportRow);
                if (rows && rows.length > 0) {
                    let tapValues = rows.map((row) => {
                        return parseInt(row[STEPS_TAP]);
                    });
                    let tempLowTapPosition = Math.min(...tapValues);
                    let tempHighTapPosition = Math.max(...tapValues);

                    setValue(
                        `${tapChanger}.${LOW_TAP_POSITION}`,
                        tempLowTapPosition
                    );
                    setValue(
                        `${tapChanger}.${HIGH_TAP_POSITION}`,
                        tempHighTapPosition
                    );

                    replace(rows);
                }
            },
        });
    };

    const lowTapPositionField = (
        <IntegerInput
            name={`${tapChanger}.${LOW_TAP_POSITION}`}
            label="LowTapPosition"
            formProps={{
                disabled: disabled,
            }}
        />
    );

    const highTapPositionField = (
        <IntegerInput
            name={`${tapChanger}.${HIGH_TAP_POSITION}`}
            label="HighTapPosition"
            formProps={{
                disabled: true,
            }}
        />
    );

    const tapPositionField = (
        <IntegerInput
            name={`${tapChanger}.${TAP_POSITION}`}
            label="TapPosition"
            formProps={{
                disabled: disabled,
            }}
        />
    );

    const createRuleButton = (
        <Tooltip
            title={intl.formatMessage({
                id: createRuleMessageId,
            })}
            placement="left"
        >
            <span>
                <IconButton
                    onClick={() => setOpenCreateRuleDialog(true)}
                    disabled={disabled || tapFields.length === 0}
                    sx={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        padding: 1.5,
                    }}
                    //TODO uncomment if you can fix the vertical alignment of 'column.label'
                    // sx={{
                    //     paddingTop: 0,
                    //     paddingRight: 0,
                    // }}
                >
                    <AddchartIcon />
                </IconButton>
            </span>
        </Tooltip>
    );

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
                            associatedArrayName={`${tapChanger}.${STEPS}`}
                            selectedPropName={'selected'}
                            handleClickIfChecked={selectAllRows}
                            handleClickIfUnchecked={unselectAllRows}
                        />
                    </TableCell>
                    {columnsDefinition.map((column, index) => (
                        <TableCell key={column.dataKey}>
                            {/* TODO uncomment if you can fix the vertical alignment of 'column.label' */}
                            {/*{index === columnsDefinition.length - 1 ? (*/}
                            {/*    <Grid container>*/}
                            {/*        <Grid item xs={8} sx={{verticalAlign: 'middle', display: 'table-cell'}}>*/}
                            {/*            {column.label}*/}
                            {/*        </Grid>*/}
                            {/*        <Grid item xs={4}>*/}
                            {/*            {createRuleButton}*/}
                            {/*        </Grid>*/}
                            {/*    </Grid>*/}
                            {/*) : (*/}
                            {/*    column.label*/}
                            {/*)}*/}
                            {column.label}
                            {index === columnsDefinition.length - 1 &&
                                createRuleButton}
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
                                        name={`${tapChanger}.${STEPS}[${index}].selected`}
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
            <Grid item container spacing={2}>
                <Grid item xs={4}>
                    {lowTapPositionField}
                </Grid>
                <Grid item xs={4}>
                    {highTapPositionField}
                </Grid>
                <Grid item xs={4}>
                    {tapPositionField}
                </Grid>
            </Grid>
            <Grid item container>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="tapTable">
                        {(provided, snapshot) => (
                            <TableContainer
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                sx={{ minHeight: 200, maxHeight: 440 }}
                            >
                                <Table stickyHeader size="small">
                                    {renderTableHead()}
                                    {renderTableBody(provided)}
                                </Table>
                            </TableContainer>
                        )}
                    </Droppable>
                </DragDropContext>
                <FieldErrorAlert name={`${tapChanger}.${STEPS}`} />
            </Grid>
            <TapChangerPaneButtons
                tapChanger={tapChanger}
                disabled={disabled}
                handleAddButton={handleAddRowsButton}
                handleDeleteButton={deleteSelectedRows}
                handleMoveUpButton={moveUpSelectedRows}
                handleMoveDownButton={moveDownSelectedRows}
                handleUploadButton={() => setOpenImportRuleDialog(true)}
                uploadButtonMessageId={importRuleMessageId}
            />
            <CreateRuleDialog
                ruleType={ruleType}
                openCreateRuleDialog={openCreateRuleDialog}
                setOpenCreateRuleDialog={setOpenCreateRuleDialog}
                handleCreateTapRule={handleCreateTapRule}
                allowNegativeValues={false}
            />
            <ImportRuleDialog
                ruleType={ruleType}
                openImportRuleDialog={openImportRuleDialog}
                setOpenImportRuleDialog={setOpenImportRuleDialog}
                csvColumns={csvColumns}
                handleImportTapRule={handleImportTapRule}
            />
            <AddRowsDialog
                open={openAddRowsDialog}
                handleAddRowsButton={addNewRows}
                onClose={handleCloseAddRowsDialog}
            />
        </Grid>
    );
};

TapChangerPaneTable.prototype = {
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

export default TapChangerPaneTable;
