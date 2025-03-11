/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo, useState } from 'react';
import { UseFieldArrayReturn, useFormContext, useWatch } from 'react-hook-form';
import {
    Box,
    Checkbox,
    CheckboxProps,
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
import { DragDropContext, Draggable, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';
import { useIntl } from 'react-intl';
import DndTableBottomLeftButtons from './dnd-table-bottom-left-buttons';
import DndTableBottomRightButtons from './dnd-table-bottom-right-buttons';
import { TableNumericalInput } from '../rhf-inputs/table-inputs/table-numerical-input';
import { TableTextInput } from '../rhf-inputs/table-inputs/table-text-input';
import { AutocompleteInput, CheckboxInput, RawReadOnlyInput } from '@gridsuite/commons-ui';
import { SELECTED } from '../field-constants';
import { ErrorInput } from '@gridsuite/commons-ui';
import { FieldErrorAlert } from '@gridsuite/commons-ui';
import DndTableAddRowsDialog from './dnd-table-add-rows-dialog';
import { DirectoryItemsInput } from '@gridsuite/commons-ui';
import ChipItemsInput from '../rhf-inputs/chip-items-input';
import { ColumnBase, DndColumn, DndColumnType } from './dnd-table.type';

export const MAX_ROWS_NUMBER = 100;
const styles = {
    columnsStyle: {
        display: 'inline-flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 1,
        textTransform: 'none',
    },
};

interface MultiCheckboxProps extends Omit<CheckboxProps, 'checked' | 'indeterminate' | 'onChange'> {
    arrayFormName: string;
    handleClickCheck: () => void;
    handleClickUncheck: () => void;
}

function MultiCheckbox({ arrayFormName, handleClickCheck, handleClickUncheck, ...props }: MultiCheckboxProps) {
    const arrayToWatch: ({ selected: boolean } & Record<string, any>)[] = useWatch({
        name: arrayFormName,
    });

    const allRowSelected = useMemo(() => arrayToWatch.every((row) => row[SELECTED]), [arrayToWatch]);
    const someRowSelected = useMemo(() => arrayToWatch.some((row) => row[SELECTED]), [arrayToWatch]);

    return (
        <Checkbox
            checked={arrayToWatch.length > 0 && allRowSelected}
            indeterminate={someRowSelected && !allRowSelected}
            onChange={(event) => {
                event.target.checked ? handleClickCheck() : handleClickUncheck();
            }}
            {...props}
        />
    );
}

interface DefaultTableCellProps {
    arrayFormName: string;
    rowIndex: number;
    column: ColumnBase;
}

function DefaultTableCell({ arrayFormName, rowIndex, column, ...props }: DefaultTableCellProps) {
    return (
        <TableCell key={column.dataKey} sx={{ padding: 1 }}>
            <RawReadOnlyInput name={`${arrayFormName}[${rowIndex}].${column.dataKey}`} {...props} />
        </TableCell>
    );
}

interface EditableTableCellProps {
    arrayFormName: string;
    rowIndex: number;
    column: DndColumn;
    previousValue?: number;
    valueModified: boolean;
    disabled?: boolean;
}

function EditableTableCell({
    arrayFormName,
    rowIndex,
    column,
    previousValue,
    valueModified,
    ...props
}: EditableTableCellProps) {
    return (
        <TableCell key={column.dataKey} sx={{ padding: 0.5, maxWidth: column.maxWidth }}>
            {column.type === DndColumnType.NUMERIC && (
                <TableNumericalInput
                    {...props}
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                    previousValue={previousValue}
                    valueModified={valueModified}
                    adornment={column?.adornment}
                    isClearable={column?.clearable}
                    style={{
                        textAlign: column?.textAlign,
                    }}
                />
            )}
            {column.type === DndColumnType.TEXT && (
                <TableTextInput
                    {...props}
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                    showErrorMsg={column.showErrorMsg}
                />
            )}
            {column.type === DndColumnType.AUTOCOMPLETE && (
                <AutocompleteInput
                    forcePopupIcon
                    freeSolo
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                    options={column.options}
                    inputTransform={(value) => (value === null ? '' : value)}
                    outputTransform={(value) => value}
                    size={'small'}
                />
            )}
            {column.type === DndColumnType.DIRECTORY_ITEMS && (
                <DirectoryItemsInput
                    name={`${arrayFormName}[${rowIndex}].${column.dataKey}`}
                    equipmentTypes={column.equipmentTypes}
                    elementType={column.elementType}
                    titleId={column.titleId}
                    hideErrorMessage={true}
                    label={undefined}
                />
            )}
            {column.type === DndColumnType.CHIP_ITEMS && (
                <ChipItemsInput name={`${arrayFormName}[${rowIndex}].${column.dataKey}`} hideErrorMessage={true} />
            )}
        </TableCell>
    );
}

interface DndTableBaseProps {
    arrayFormName: string;
    useFieldArrayOutput: UseFieldArrayReturn;
    columnsDefinition: DndColumn[];
    tableHeight?: number;
    allowedToAddRows?: () => Promise<boolean>;
    createRows?: (numberOfRows: number) => {
        [key: string]: any;
    }[];
    disabled?: boolean;
    withResetButton?: boolean;
    withLeftButtons?: boolean;
    withAddRowsDialog?: boolean;
    previousValues?: any[];
    disableTableCell?: (rowIndex: number, column: any, arrayFormName: string, temporaryLimits?: any[]) => boolean;
    getPreviousValue?: (
        rowIndex: number,
        column: any,
        arrayFormName: string,
        temporaryLimits?: any[]
    ) => number | undefined;
    isValueModified?: (index: number, arrayFormName: string) => boolean;
    disableAddingRows?: boolean;
    showMoveArrow?: boolean;
    disableDragAndDrop?: boolean;
}

interface DndTableWithLeftButtonsProps extends DndTableBaseProps {
    withLeftButtons?: true;
    handleUploadButton: () => void;
    uploadButtonMessageId: string;
    handleResetButton: () => void;
    resetButtonMessageId: string;
}

interface DndTableWithoutLeftButtonsProps extends DndTableBaseProps {
    withLeftButtons: false;
}

type DndTableProps = DndTableWithLeftButtonsProps | DndTableWithoutLeftButtonsProps;

const DndTable = (props: DndTableProps) => {
    const {
        arrayFormName,
        useFieldArrayOutput,
        columnsDefinition,
        tableHeight,
        allowedToAddRows = () => Promise.resolve(true),
        createRows,
        disabled = false,
        withResetButton = false,
        withAddRowsDialog = true,
        previousValues,
        disableTableCell,
        getPreviousValue,
        isValueModified,
        disableAddingRows = false,
        showMoveArrow = true,
        disableDragAndDrop = false,
    } = props;
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

    function renderTableCell(rowId: string, rowIndex: number, column: DndColumn) {
        let CustomTableCell = column.editable ? EditableTableCell : DefaultTableCell;
        return (
            <CustomTableCell
                key={rowId + column.dataKey}
                arrayFormName={arrayFormName}
                rowIndex={rowIndex}
                column={column}
                disabled={
                    disableTableCell ? disableTableCell(rowIndex, column, arrayFormName, previousValues) : disabled
                }
                previousValue={
                    getPreviousValue ? getPreviousValue(rowIndex, column, arrayFormName, previousValues) : undefined
                }
                valueModified={isValueModified ? isValueModified(rowIndex, arrayFormName) : false}
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

    function addNewRows(numberOfRows: number) {
        // checking if not exceeding 100 steps
        if (currentRows.length + numberOfRows > MAX_ROWS_NUMBER) {
            setError(arrayFormName, {
                type: 'custom',
                message: intl.formatMessage(
                    {
                        id: 'MaximumRowNumberError',
                    },
                    {
                        value: MAX_ROWS_NUMBER,
                    }
                ),
            });
            return;
        }
        clearErrors(arrayFormName);

        const rowsToAdd = createRows?.(numberOfRows).map((row) => {
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

    function onDragEnd(result: DropResult) {
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
                    {!disableDragAndDrop && (
                        <TableCell sx={{ width: '3%' }}>{/* empty cell for the drag and drop column */}</TableCell>
                    )}
                    <TableCell sx={{ width: '5%', textAlign: 'center' }}>
                        <MultiCheckbox
                            arrayFormName={arrayFormName}
                            handleClickCheck={selectAllRows}
                            handleClickUncheck={unselectAllRows}
                            disabled={disabled || currentRows.length === 0}
                        />
                    </TableCell>
                    {columnsDefinition.map((column) => (
                        <TableCell key={column.dataKey} sx={{ width: column.width, maxWidth: column.maxWidth }}>
                            <Box sx={styles.columnsStyle}>
                                {column.label}
                                {column.extra}
                            </Box>
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        );
    }

    function renderTableBody(providedDroppable: DroppableProvided) {
        return (
            <TableBody>
                {currentRows.map((row, index) => (
                    <Draggable
                        key={row.id}
                        draggableId={row.id.toString()}
                        index={index}
                        isDragDisabled={disableDragAndDrop}
                    >
                        {(provided, snapshot) => (
                            <TableRow ref={provided.innerRef} {...provided.draggableProps}>
                                {!disableDragAndDrop && (
                                    <Tooltip
                                        title={intl.formatMessage({
                                            id: 'DragAndDrop',
                                        })}
                                        placement="right"
                                    >
                                        <TableCell
                                            sx={{ textAlign: 'center' }}
                                            {...(disabled ? {} : { ...provided.dragHandleProps })}
                                        >
                                            <DragIndicatorIcon />
                                        </TableCell>
                                    </Tooltip>
                                )}
                                <TableCell sx={{ textAlign: 'center' }}>
                                    <CheckboxInput
                                        name={`${arrayFormName}[${index}].${SELECTED}`}
                                        formProps={{ disabled }}
                                    />
                                </TableCell>
                                {columnsDefinition.map((column) => renderTableCell(row.id, index, column))}
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
                                sx={{
                                    height: tableHeight,
                                    border: 'solid 1px rgba(0,0,0,0.1)',
                                }}
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
                {props.withLeftButtons === undefined || props.withLeftButtons ? (
                    <DndTableBottomLeftButtons
                        withResetButton={withResetButton}
                        disableUploadButton={disableAddingRows}
                        disabled={disabled}
                        handleUploadButton={props.handleResetButton}
                        uploadButtonMessageId={props.uploadButtonMessageId}
                        handleResetButton={props.handleResetButton}
                        resetButtonMessageId={props.resetButtonMessageId}
                    />
                ) : null}
                <DndTableBottomRightButtons
                    arrayFormName={arrayFormName}
                    handleAddButton={handleAddRowsButton}
                    handleDeleteButton={deleteSelectedRows}
                    handleMoveUpButton={moveUpSelectedRows}
                    handleMoveDownButton={moveDownSelectedRows}
                    disableAddingRows={disableAddingRows}
                    showMoveArrow={showMoveArrow}
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

export default DndTable;
