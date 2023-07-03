/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Grid, IconButton, Tooltip } from '@mui/material';
import AddchartIcon from '@mui/icons-material/Addchart';
import Papa from 'papaparse';
import { useIntl } from 'react-intl';
import IntegerInput from 'components/utils/rhf-inputs/integer-input';
import DndTable, {
    MAX_ROWS_NUMBER,
} from 'components/utils/dnd-table/dnd-table';
import { CreateRuleDialog } from './create-rule/create-rule-dialog';
import { ImportRuleDialog } from './import-rule-dialog';
import {
    HIGH_TAP_POSITION,
    LOW_TAP_POSITION,
    SELECTED,
    STEPS,
    STEPS_CONDUCTANCE,
    STEPS_RATIO,
    STEPS_ALPHA,
    STEPS_REACTANCE,
    STEPS_RESISTANCE,
    STEPS_SUSCEPTANCE,
    STEPS_TAP,
    TAP_POSITION,
} from 'components/utils/field-constants';
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
    previousValues,
    modifiedValues,
    modification,
}) => {
    const intl = useIntl();

    const { trigger, getValues, setValue, clearErrors } = useFormContext();

    const useFieldArrayOutput = useFieldArray({
        name: `${tapChanger}.${STEPS}`,
    });

    const {
        fields: tapSteps, // don't use it to access form data ! check doc
        replace,
    } = useFieldArrayOutput;

    const lowTapPosition = useWatch({
        name: `${tapChanger}.${LOW_TAP_POSITION}`,
    });

    const [openCreateRuleDialog, setOpenCreateRuleDialog] = useState(false);
    const [openImportRuleDialog, setOpenImportRuleDialog] = useState(false);

    const [isDirty, setDirty] = useState(false);

    function allowedToAddTapRows() {
        // triggering validation on low tap position before generating rows (the field is required)
        // if the trigger returns false, it means the field validation didn't pass -> we don't generate rows
        // the user will see the low tap field in red
        return trigger(`${tapChanger}.${LOW_TAP_POSITION}`);
    }

    function createTapRows(numberOfRows) {
        const currentLowTapPosition = getValues(
            `${tapChanger}.${LOW_TAP_POSITION}`
        );
        const currentTapRows = getValues(`${tapChanger}.${STEPS}`);

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
                { [STEPS_TAP]: nextHighestTap }
            );
            tapRowsToAdd.push(newRow);
            if (i !== numberOfRows - 1) {
                nextHighestTap++;
            }
        }

        setValue(`${tapChanger}.${HIGH_TAP_POSITION}`, nextHighestTap);

        return tapRowsToAdd;
    }

    const resetTapNumbers = useCallback(
        (tapSteps, modification) => {
            const currentTapRows =
                tapSteps ?? getValues(`${tapChanger}.${STEPS}`);

            const currentLowTapPosition =
                modification && !lowTapPosition
                    ? previousValues?.[LOW_TAP_POSITION]
                    : lowTapPosition;

            if (currentLowTapPosition !== previousValues?.[LOW_TAP_POSITION]) {
                setDirty(true);
            }

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
        [getValues, tapChanger, previousValues, lowTapPosition, setValue]
    );

    const adjustedStepsPreviousValues = useMemo(() => {
        let adjustedTapSteps;
        if (previousValues?.[STEPS]) {
            adjustedTapSteps = previousValues[STEPS].map((step) => {
                return {
                    index: lowTapPosition
                        ? step.index +
                          (lowTapPosition - previousValues?.[LOW_TAP_POSITION])
                        : step.index,
                    r: step.r,
                    x: step.x,
                    b: step.b,
                    g: step.g,
                    rho: step.rho,
                    alpha: step.alpha,
                };
            });
        }
        resetTapNumbers(null, modification);
        return adjustedTapSteps;
    }, [previousValues, resetTapNumbers, modification, lowTapPosition]);

    // Adjust high tap position when low tap position change + remove red if value fixed
    useEffect(() => {
        trigger(`${tapChanger}.${LOW_TAP_POSITION}`).then((result) => {
            if (result) {
                resetTapNumbers(null, modification);
            }
        });
    }, [
        trigger,
        tapChanger,
        lowTapPosition,
        adjustedStepsPreviousValues,
        resetTapNumbers,
        modification,
    ]);

    // when we detect a change in tapSteps (so when the size or the order of the list of rows change), we reset the tap fields
    useEffect(() => {
        resetTapNumbers(tapSteps, modification);
    }, [tapSteps, resetTapNumbers, modification]);

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

    const findTap = useCallback(
        (rowIndex, arrayFormName, tapSteps) => {
            return adjustedStepsPreviousValues?.find(
                (e) => e.index === getValues(arrayFormName)[rowIndex]?.index
            );
        },
        [adjustedStepsPreviousValues, getValues]
    );

    const getTapPreviousValue = useCallback(
        (rowIndex, column, arrayFormName, tapSteps) => {
            const temporaryLimit = findTap(rowIndex, arrayFormName, tapSteps);
            if (temporaryLimit === undefined) {
                return undefined;
            }
            switch (column.dataKey) {
                case STEPS_RESISTANCE:
                    return temporaryLimit?.r;
                case STEPS_REACTANCE:
                    return temporaryLimit?.x;
                case STEPS_CONDUCTANCE:
                    return temporaryLimit?.g;
                case STEPS_SUSCEPTANCE:
                    return temporaryLimit?.b;
                case STEPS_RATIO:
                    return temporaryLimit?.rho;
                case STEPS_ALPHA:
                    return temporaryLimit?.alpha;
                default:
                    return undefined;
            }
        },
        [findTap]
    );

    const handleImportTapRule = (selectedFile, setFileParseError) => {
        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                if (results.data.length > MAX_ROWS_NUMBER) {
                    setFileParseError(
                        intl.formatMessage(
                            { id: 'TapPositionValueError' },
                            { value: MAX_ROWS_NUMBER }
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

    const computeHighTapPosition = (steps) => {
        const values = steps?.map((step) => step[STEPS_TAP]);
        return Array.isArray(values) && values.length > 0
            ? Math.max(...values)
            : null;
    };

    const lowTapPositionField = (
        <IntegerInput
            name={`${tapChanger}.${LOW_TAP_POSITION}`}
            label="LowTapPosition"
            formProps={{
                disabled: disabled,
            }}
            previousValue={previousValues?.[LOW_TAP_POSITION]}
        />
    );

    const highTapPositionField = (
        <IntegerInput
            name={`${tapChanger}.${HIGH_TAP_POSITION}`}
            label="HighTapPosition"
            formProps={{
                disabled: true,
            }}
            previousValue={computeHighTapPosition(previousValues?.[STEPS])}
        />
    );

    const tapPositionField = (
        <IntegerInput
            name={`${tapChanger}.${TAP_POSITION}`}
            label="TapPosition"
            formProps={{
                disabled: disabled,
            }}
            previousValue={previousValues?.[TAP_POSITION]}
        />
    );

    const completedColumnsDefinition = useMemo(() => {
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
        const columnsDef = columnsDefinition.map((columnDefinition) => {
            return {
                ...columnDefinition,
                handleChange: () => {
                    setDirty(true);
                },
            };
        });

        columnsDef[columnsDef.length - 1] = {
            ...columnsDef[columnsDef.length - 1],
            extra: createRuleButton,
        };

        return columnsDef;
    }, [
        columnsDefinition,
        createRuleMessageId,
        disabled,
        intl,
        tapSteps.length,
    ]);

    const isValueModified = useCallback(
        () => (modification && isDirty) || modifiedValues,
        [isDirty, modification, modifiedValues]
    );

    const handleResetButton = useCallback(() => {
        replace(adjustedStepsPreviousValues);
        setValue(`${tapChanger}.${LOW_TAP_POSITION}`, null);
        clearErrors(`${tapChanger}.${STEPS}`);
        setDirty(false);
    }, [
        adjustedStepsPreviousValues,
        clearErrors,
        replace,
        setValue,
        tapChanger,
    ]);

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
                tableHeight={400}
                allowedToAddRows={allowedToAddTapRows}
                createRows={createTapRows}
                handleUploadButton={handleImportTapRuleButton}
                handleResetButton={modification ? handleResetButton : undefined}
                uploadButtonMessageId={importRuleMessageId}
                disabled={disabled}
                previousValues={adjustedStepsPreviousValues}
                getPreviousValue={getTapPreviousValue}
                isValueModified={isValueModified}
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
