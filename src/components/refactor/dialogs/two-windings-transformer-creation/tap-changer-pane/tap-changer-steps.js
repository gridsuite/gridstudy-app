/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Grid, IconButton, Tooltip } from '@mui/material';
import AddchartIcon from '@mui/icons-material/Addchart';
import Papa from 'papaparse';
import { useIntl } from 'react-intl';
import IntegerInput from '../../../rhf-inputs/integer-input';
import DndTable from '../../../../util/dnd-table/dnd-table';
import DndTableAddRowsDialog from '../../../../util/dnd-table/dnd-table-add-rows-dialog';
import { CreateRuleDialog } from './create-rule/create-rule-dialog';
import { ImportRuleDialog } from './import-rule-dialog';
import {
    HIGH_TAP_POSITION,
    LOW_TAP_POSITION,
    SELECTED,
    STEPS,
    STEPS_TAP,
    TAP_POSITION,
} from 'components/refactor/utils/field-constants';
import { MAX_TAP_CHANGER_STEPS_NUMBER } from '../two-windings-transformer-creation-dialog';
import PropTypes from 'prop-types';

const TapChangerSteps = ({
    tapChanger,
    ruleType,
    createTapRuleColumn,
    columnsDefinition,
    csvColumns,
    createRuleMessageId,
    createRuleAllowNegativeValues,
    importRuleMessageId,
    handleImportRow,
    disabled,
}) => {
    const intl = useIntl();

    const { trigger, getValues, setValue, setError, clearErrors } =
        useFormContext();

    const useFieldArrayOutput = useFieldArray({
        name: `${tapChanger}.${STEPS}`,
    });

    const {
        fields: tapSteps, // don't use it to access form data ! check doc
        replace,
        append,
        remove,
    } = useFieldArrayOutput;

    const lowTapPosition = useWatch({
        name: `${tapChanger}.${LOW_TAP_POSITION}`,
    });

    const [openCreateRuleDialog, setOpenCreateRuleDialog] = useState(false);
    const [openImportRuleDialog, setOpenImportRuleDialog] = useState(false);
    const [openAddRowsDialog, setOpenAddRowsDialog] = useState(false);

    function handleAddRowsButton() {
        // triggering validation on low tap position before generating rows (the field is required)
        trigger(`${tapChanger}.${LOW_TAP_POSITION}`).then((result) => {
            // if the trigger returns false, it means the field validation didn't pass -> we don't generate rows
            // the user will see the low tap field in red
            if (result) {
                setOpenAddRowsDialog(true);
            }
        });
    }

    function addNewRows(numberOfRows) {
        const currentLowTapPosition = getValues(
            `${tapChanger}.${LOW_TAP_POSITION}`
        );
        const currentTapRows = getValues(`${tapChanger}.${STEPS}`);

        // checking if not exceeding 100 steps
        if (
            currentTapRows.length + numberOfRows >
            MAX_TAP_CHANGER_STEPS_NUMBER
        ) {
            setError(`${tapChanger}.${STEPS}`, {
                type: 'custom',
                message: {
                    id: 'TapPositionValueError',
                    value: MAX_TAP_CHANGER_STEPS_NUMBER,
                },
            });
            return;
        }
        clearErrors(`${tapChanger}.${STEPS}`);

        let nextHighestTap;
        if (currentTapRows.length === 0) {
            nextHighestTap = currentLowTapPosition;
        } else {
            nextHighestTap =
                currentTapRows[currentTapRows.length - 1][STEPS_TAP] + 1;
        }

        const tapRowsToAdd = [];
        for (let i = 0; i < numberOfRows; i++) {
            // we remove STEPS_TAP from the columns with slice
            const newRow = columnsDefinition.slice(1).reduce(
                (accumulator, currentValue) => ({
                    ...accumulator,
                    [currentValue.dataKey]: currentValue.initialValue,
                }),
                { [SELECTED]: false, [STEPS_TAP]: nextHighestTap }
            );
            tapRowsToAdd.push(newRow);
            if (i !== numberOfRows - 1) {
                nextHighestTap++;
            }
        }

        // note : an id prop is automatically added in each row
        append(tapRowsToAdd);
        setValue(`${tapChanger}.${HIGH_TAP_POSITION}`, nextHighestTap);
    }

    function handleCloseAddRowsDialog() {
        setOpenAddRowsDialog(false);
    }

    function deleteSelectedRows() {
        const currentTapRows = getValues(`${tapChanger}.${STEPS}`);

        let rowsToDelete = [];
        for (let i = 0; i < currentTapRows.length; i++) {
            if (currentTapRows[i][SELECTED]) {
                rowsToDelete.push(i);
            }
        }

        remove(rowsToDelete);

        const currentHighTapPosition = getValues(
            `${tapChanger}.${HIGH_TAP_POSITION}`
        );

        let newHighTapPosition;
        if (currentTapRows.length === rowsToDelete.length) {
            newHighTapPosition = null;
        } else {
            newHighTapPosition = currentHighTapPosition - rowsToDelete.length;
        }
        setValue(`${tapChanger}.${HIGH_TAP_POSITION}`, newHighTapPosition);
    }

    const resetTapNumbers = useCallback(
        (tapSteps) => {
            const currentTapRows =
                tapSteps ?? getValues(`${tapChanger}.${STEPS}`);
            if (currentTapRows.length === 0) {
                return;
            }

            const currentLowTapPosition = getValues(
                `${tapChanger}.${LOW_TAP_POSITION}`
            );

            for (
                let tapPosition = currentLowTapPosition, index = 0;
                index < currentTapRows.length;
                tapPosition++, index++
            ) {
                setValue(
                    `${tapChanger}.${STEPS}[${index}].${STEPS_TAP}`,
                    tapPosition
                );
            }

            const newHighTapPosition =
                currentTapRows.length !== 0
                    ? currentLowTapPosition + currentTapRows.length - 1
                    : null;
            setValue(`${tapChanger}.${HIGH_TAP_POSITION}`, newHighTapPosition);
        },
        [tapChanger, getValues, setValue]
    );

    // Adjust high tap position when low tap position change + remove red if value fixed
    useEffect(() => {
        trigger(`${tapChanger}.${LOW_TAP_POSITION}`).then((result) => {
            if (result) {
                resetTapNumbers(null);
            }
        });
    }, [
        trigger,
        tapChanger,
        lowTapPosition, // the only value supposed to change
        resetTapNumbers,
    ]);

    // when we detect a change in tapSteps (so when the size or the order of the list of rows change), we reset the tap fields
    useEffect(() => {
        resetTapNumbers(tapSteps);
    }, [tapSteps, resetTapNumbers]);

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

    function handleImportTapRuleButton() {
        trigger(`${tapChanger}.${LOW_TAP_POSITION}`).then((result) => {
            if (result) {
                setOpenImportRuleDialog(true);
            }
        });
    }

    const handleImportTapRule = (selectedFile, setFileParseError) => {
        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                if (results.data.length > MAX_TAP_CHANGER_STEPS_NUMBER) {
                    setFileParseError(
                        intl.formatMessage(
                            { id: 'TapPositionValueError' },
                            { value: MAX_TAP_CHANGER_STEPS_NUMBER }
                        )
                    );
                    return;
                }
                let rows = results.data.map((val) => ({
                    ...handleImportRow(val),
                    [SELECTED]: false,
                }));
                if (rows && rows.length > 0) {
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
                    disabled={disabled || tapSteps.length === 0}
                >
                    <AddchartIcon />
                </IconButton>
            </span>
        </Tooltip>
    );

    const completedColumnsDefinition = columnsDefinition;
    completedColumnsDefinition[completedColumnsDefinition.length - 1] = {
        ...completedColumnsDefinition[completedColumnsDefinition.length - 1],
        extra: createRuleButton,
    };

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
            <DndTable
                arrayFormName={`${tapChanger}.${STEPS}`}
                useFieldArrayOutput={useFieldArrayOutput}
                columnsDefinition={completedColumnsDefinition}
                tableHeight={320}
                handleAddButton={handleAddRowsButton}
                handleDeleteButton={deleteSelectedRows}
                handleUploadButton={handleImportTapRuleButton}
                uploadButtonMessageId={importRuleMessageId}
                disabled={disabled}
            />
            <CreateRuleDialog
                ruleType={ruleType}
                openCreateRuleDialog={openCreateRuleDialog}
                setOpenCreateRuleDialog={setOpenCreateRuleDialog}
                handleCreateTapRule={handleCreateTapRule}
                allowNegativeValues={createRuleAllowNegativeValues}
            />
            <ImportRuleDialog
                ruleType={ruleType}
                openImportRuleDialog={openImportRuleDialog}
                setOpenImportRuleDialog={setOpenImportRuleDialog}
                csvColumns={csvColumns}
                handleImportTapRule={handleImportTapRule}
            />
            <DndTableAddRowsDialog
                open={openAddRowsDialog}
                handleAddRowsButton={addNewRows}
                onClose={handleCloseAddRowsDialog}
            />
        </Grid>
    );
};

TapChangerSteps.prototype = {
    tapChanger: PropTypes.string.isRequired,
    ruleType: PropTypes.string.isRequired,
    createTapRuleColumn: PropTypes.string.isRequired,
    columnsDefinition: PropTypes.object.isRequired,
    csvColumns: PropTypes.object.isRequired,
    createRuleMessageId: PropTypes.string.isRequired,
    createRuleAllowNegativeValues: PropTypes.bool.isRequired,
    importRuleMessageId: PropTypes.string.isRequired,
    handleImportRow: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default TapChangerSteps;
