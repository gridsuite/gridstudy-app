/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Grid, IconButton, Tooltip } from '@mui/material';
import AddchartIcon from '@mui/icons-material/Addchart';
import Papa from 'papaparse';
import { useIntl } from 'react-intl';
import { IntegerInput } from '@gridsuite/commons-ui';
import DndTable, { MAX_ROWS_NUMBER } from 'components/utils/dnd-table/dnd-table';
import { CreateRuleDialog } from './create-rule/create-rule-dialog';
import { ImportRuleDialog } from './import-rule-dialog';
import {
    HIGH_TAP_POSITION,
    LOW_TAP_POSITION,
    SELECTED,
    STEPS,
    STEPS_TAP,
    TAP_POSITION,
} from 'components/utils/field-constants';
import PropTypes from 'prop-types';
import { compareStepsWithPreviousValues, computeHighTapPosition } from 'components/utils/utils';
import { isNodeBuilt } from 'components/graph/util/model-functions';

const TapChangerSteps = ({
    tapChanger,
    ruleType,
    createTapRuleColumn,
    columnsDefinition,
    csvColumns,
    createRuleMessageId,
    createRuleAllowNegativeValues,
    importRuleMessageId,
    resetButtonMessageId,
    handleImportRow,
    disabled,
    previousValues,
    editData,
    currentNode,
    isModification = false,
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

    const disableAddingRows = useMemo(() => {
        return isModification && lowTapPosition === null && previousValues?.[LOW_TAP_POSITION] === undefined;
    }, [isModification, lowTapPosition, previousValues]);

    function allowedToAddTapRows() {
        // triggering validation on low tap position before generating rows (the field is required)
        // if the trigger returns false, it means the field validation didn't pass -> we don't generate rows
        // the user will see the low tap field in red
        return trigger(`${tapChanger}.${LOW_TAP_POSITION}`);
    }

    function createTapRows(numberOfRows) {
        const currentLowTapPosition = getValues(`${tapChanger}.${LOW_TAP_POSITION}`);
        const currentTapRows = getValues(`${tapChanger}.${STEPS}`);

        let nextHighestTap;
        if (currentTapRows.length === 0) {
            nextHighestTap = currentLowTapPosition;
        } else {
            nextHighestTap = currentTapRows[currentTapRows.length - 1][STEPS_TAP] + 1;
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

    const tapStepsWatcher = useWatch({
        name: `${tapChanger}.${STEPS}`,
    });

    const areStepsModified = useMemo(() => {
        if (editData?.[STEPS] && isNodeBuilt(currentNode)) {
            return true;
        } else {
            return !compareStepsWithPreviousValues(tapStepsWatcher, previousValues?.[STEPS]);
        }
    }, [currentNode, editData, previousValues, tapStepsWatcher]);

    const resetTapNumbers = useCallback(
        (tapSteps, isModification) => {
            const currentTapRows = tapSteps ?? getValues(`${tapChanger}.${STEPS}`);

            const currentLowTapPosition =
                isModification && lowTapPosition === null ? previousValues?.[LOW_TAP_POSITION] : lowTapPosition;

            for (
                let tapPosition = currentLowTapPosition, index = 0;
                index < currentTapRows.length;
                tapPosition++, index++
            ) {
                setValue(`${tapChanger}.${STEPS}[${index}].${STEPS_TAP}`, tapPosition);
            }

            const newHighTapPosition =
                currentTapRows.length !== 0 ? currentLowTapPosition + currentTapRows.length - 1 : null;
            setValue(`${tapChanger}.${HIGH_TAP_POSITION}`, newHighTapPosition);
        },
        [getValues, tapChanger, lowTapPosition, previousValues, setValue]
    );

    // Adjust high tap position when low tap position change + remove red if value fixed
    useEffect(() => {
        trigger(`${tapChanger}.${LOW_TAP_POSITION}`).then((result) => {
            if (result) {
                resetTapNumbers(null, isModification);
            }
        });
    }, [trigger, tapChanger, lowTapPosition, resetTapNumbers, isModification]);

    // when we detect a change in tapSteps (so when the size or the order of the list of rows change), we reset the tap fields
    useEffect(() => {
        resetTapNumbers(tapSteps, isModification);
    }, [tapSteps, resetTapNumbers, isModification]);

    const handleResetButton = useCallback(() => {
        replace(previousValues?.[STEPS] ?? []);
        setValue(`${tapChanger}.${LOW_TAP_POSITION}`, null);
        clearErrors(`${tapChanger}.${STEPS}`);
    }, [clearErrors, previousValues, replace, setValue, tapChanger]);

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
                if (results.data.length > MAX_ROWS_NUMBER) {
                    setFileParseError(intl.formatMessage({ id: 'TapPositionValueError' }, { value: MAX_ROWS_NUMBER }));
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

    const createRuleButton = (
        <Tooltip
            title={intl.formatMessage({
                id: createRuleMessageId,
            })}
            placement="left"
        >
            <span>
                <IconButton onClick={() => setOpenCreateRuleDialog(true)} disabled={disabled || tapSteps.length === 0}>
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

    const getTapPreviousValue = useCallback(
        (rowIndex, column, arrayFormName, tapSteps) => {
            const step = tapSteps?.find((e) => e.index === getValues(arrayFormName)[rowIndex]?.index);
            if (step === undefined) {
                return undefined;
            }
            return step?.[column.dataKey];
        },
        [getValues]
    );

    const isTapModified = useCallback(() => areStepsModified, [areStepsModified]);

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
                uploadButtonMessageId={importRuleMessageId}
                handleResetButton={isModification ? handleResetButton : undefined}
                resetButtonMessageId={resetButtonMessageId}
                previousValues={previousValues?.[STEPS]}
                getPreviousValue={getTapPreviousValue}
                isValueModified={isTapModified}
                withResetButton={isModification && areStepsModified}
                disableAddingRows={disableAddingRows}
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
