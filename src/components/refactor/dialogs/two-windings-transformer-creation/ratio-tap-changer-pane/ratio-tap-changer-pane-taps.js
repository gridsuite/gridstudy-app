/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {
    HIGH_TAP_POSITION,
    LOW_TAP_POSITION,
    RATIO_TAP_CHANGER,
    STEPS,
    STEPS_CONDUCTANCE,
    STEPS_RATIO,
    STEPS_REACTANCE,
    STEPS_RESISTANCE,
    STEPS_SUSCEPTANCE,
    STEPS_TAP,
    TAP_POSITION,
} from 'components/refactor/utils/field-constants';
import Papa from 'papaparse';
import React, { useCallback, useMemo, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { CreateRuleDialog } from '../../../../dialogs/two-windings-transformer/create-rule-dialog';
import { ImportRuleDialog } from '../../../../dialogs/two-windings-transformer/import-rule-dialog';
import {
    MAX_TAP_NUMBER,
    RATIO_TAP,
} from '../../../../dialogs/two-windings-transformer/two-windings-transformer-creation-dialog';
import VirtualizedTable from '../../../../util/virtualized-table';
import FieldErrorAlert from '../../../rhf-inputs/field-error-alert';
import IntegerInput from '../../../rhf-inputs/integer-input';
import { TableNumericalInput } from '../../../rhf-inputs/table-inputs/table-numerical-input';
import RatioTapChangerPaneButtons from './ratio-tap-changer-pane-buttons';

const useStyles = makeStyles((theme) => ({
    tableCell: {
        fontSize: 'small',
        cursor: 'initial',
        padding: theme.spacing(1.25),
        display: 'flex',
        '&:before': {
            content: '""',
            position: 'absolute',
            left: theme.spacing(0.5),
            right: theme.spacing(0.5),
            bottom: 0,
            borderBottom: '1px solid ' + theme.palette.divider,
        },
    },
}));

const RatioTapChangerPaneTaps = ({ disabled }) => {
    const intl = useIntl();
    const classes = useStyles();
    const { trigger, getValues, setValue } = useFormContext();

    const [openCreateRuleDialog, setOpenCreateRuleDialog] = useState(false);
    const [openImportRuleDialog, setOpenImportRuleDialog] = useState(false);

    const { fields: ratioTapFields, replace } = useFieldArray({
        name: `${RATIO_TAP_CHANGER}.${STEPS}`,
    });

    const COLUMNS_DEFINITIONS = useMemo(() => {
        return [
            {
                label: intl.formatMessage({ id: 'Tap' }).toUpperCase(),
                id: 'tap',
                dataKey: STEPS_TAP,
                numeric: true,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaResistance' })
                    .toUpperCase(),
                id: 'resistance',
                dataKey: STEPS_RESISTANCE,
                numeric: true,
                editor: TableNumericalInput,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaReactance' })
                    .toUpperCase(),
                id: 'reactance',
                dataKey: STEPS_REACTANCE,
                numeric: true,
                editor: TableNumericalInput,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaConductance' })
                    .toUpperCase(),
                id: 'conductance',
                dataKey: STEPS_CONDUCTANCE,
                numeric: true,
                editor: TableNumericalInput,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaSusceptance' })
                    .toUpperCase(),
                id: 'susceptance',
                dataKey: STEPS_SUSCEPTANCE,
                numeric: true,
                editor: TableNumericalInput,
            },
            {
                label: intl.formatMessage({ id: 'Ratio' }).toUpperCase(),
                id: 'ratio',
                dataKey: STEPS_RATIO,
                numeric: true,
                fractionDigits: 5,
                editor: TableNumericalInput,
            },
        ];
    }, [intl]);

    const defaultCellRender = useCallback(
        (rowData) => {
            return (
                <>
                    <div
                        component="span"
                        variant="body"
                        className={classes.tableCell}
                        align={'right'}
                    >
                        {rowData.cellData}
                    </div>
                </>
            );
        },
        [classes.tableCell]
    );

    const editableCellRender = useCallback(
        (row) => {
            const index = row.columnIndex;
            const Editor = COLUMNS_DEFINITIONS[index].editor;
            if (Editor) {
                return (
                    <div className={classes.tableCell}>
                        <Editor
                            disabled={disabled}
                            key={row.dataKey + row.rowData.id}
                            name={`${RATIO_TAP_CHANGER}.${STEPS}[${row.rowIndex}].${row.dataKey}`}
                            columnDefinition={COLUMNS_DEFINITIONS[index]}
                        />
                    </div>
                );
            }
            return defaultCellRender(row);
        },
        [COLUMNS_DEFINITIONS, classes.tableCell, disabled, defaultCellRender]
    );

    const columns = useMemo(() => {
        let tableColumns = Object.values(COLUMNS_DEFINITIONS).map((c) => {
            if (c.editor) {
                c.cellRenderer = editableCellRender;
            }
            return c;
        });
        return tableColumns;
    }, [COLUMNS_DEFINITIONS, editableCellRender]);

    const handleCreateRatioTapRule = (lowTapRatio, highTapRatio) => {
        const currentTapRows = getValues(`${RATIO_TAP_CHANGER}.${STEPS}`);

        if (currentTapRows.length > 1) {
            let ratioInterval =
                (highTapRatio - lowTapRatio) / (currentTapRows.length - 1);
            let currentRatio = lowTapRatio;

            currentTapRows.forEach((row, index) => {
                currentTapRows[index][STEPS_RATIO] = currentRatio;

                currentRatio += ratioInterval;
            });
            replace(currentTapRows);
        }
    };

    const arrayFromNToM = (n, m) =>
        [...Array(m - n + 1).keys()].map((i) => i + n);

    const generateTapRows = useCallback(() => {
        // triggerig validation on low/high tap rows before generating rows
        Promise.all([
            trigger(`${RATIO_TAP_CHANGER}.${LOW_TAP_POSITION}`),
            trigger(`${RATIO_TAP_CHANGER}.${HIGH_TAP_POSITION}`),
        ]).then((results) => {
            //if any of the trigger returns false, it means one of the field validation didn't pass -> we don't generate rows
            if (results.some((result) => !result)) {
                return;
            }
            const currentLowTapPosition = getValues(
                `${RATIO_TAP_CHANGER}.${LOW_TAP_POSITION}`
            );
            const currentHighTapPosition = getValues(
                `${RATIO_TAP_CHANGER}.${HIGH_TAP_POSITION}`
            );
            const currentTapRows = getValues(`${RATIO_TAP_CHANGER}.${STEPS}`);

            //removing all steps not within the min/max values
            const newSteps = currentTapRows.filter(
                (tapRow) =>
                    tapRow[STEPS_TAP] >= currentLowTapPosition &&
                    tapRow[STEPS_TAP] <= currentHighTapPosition
            );

            // if newSteps is empty, we fill it with empty rows
            if (newSteps.length === 0) {
                replace(
                    arrayFromNToM(
                        currentLowTapPosition,
                        currentHighTapPosition
                    ).map((i) => ({
                        [STEPS_TAP]: i,
                        [STEPS_RESISTANCE]: 0,
                        [STEPS_REACTANCE]: 0,
                        [STEPS_CONDUCTANCE]: 0,
                        [STEPS_SUSCEPTANCE]: 0,
                        [STEPS_RATIO]: 1,
                    }))
                );
                return;
            }

            // if newSteps is not empty, we fill the gaps
            const lowestTapRowIndex = newSteps?.[0][STEPS_TAP];
            const highestTapRowIndex = lowestTapRowIndex + newSteps.length - 1;

            //adding steps from lowTap to lowest current index
            for (
                let i = lowestTapRowIndex - 1;
                i >= currentLowTapPosition;
                i--
            ) {
                newSteps.unshift({
                    [STEPS_TAP]: i,
                    [STEPS_RESISTANCE]: 0,
                    [STEPS_REACTANCE]: 0,
                    [STEPS_CONDUCTANCE]: 0,
                    [STEPS_SUSCEPTANCE]: 0,
                    [STEPS_RATIO]: 1,
                });
            }

            //adding steps from highest current index to highTap
            for (
                let i = highestTapRowIndex + 1;
                i <= currentHighTapPosition;
                i++
            ) {
                newSteps.push({
                    [STEPS_TAP]: i,
                    [STEPS_RESISTANCE]: 0,
                    [STEPS_REACTANCE]: 0,
                    [STEPS_CONDUCTANCE]: 0,
                    [STEPS_SUSCEPTANCE]: 0,
                    [STEPS_RATIO]: 1,
                });
            }

            replace(newSteps);
        });
    }, [getValues, replace, trigger]);

    const csvColumns = useMemo(() => {
        return [
            intl.formatMessage({ id: 'Tap' }),
            intl.formatMessage({ id: 'ImportFileResistance' }),
            intl.formatMessage({ id: 'ImportFileReactance' }),
            intl.formatMessage({ id: 'ImportFileConductance' }),
            intl.formatMessage({ id: 'ImportFileSusceptance' }),
            intl.formatMessage({ id: 'Ratio' }),
        ];
    }, [intl]);

    const parseIntData = (data, defaultValue) => {
        const intValue = parseInt(data);
        return isNaN(intValue) ? defaultValue : intValue;
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
                let rows = results.data.map((val) => {
                    return {
                        [STEPS_TAP]: val[intl.formatMessage({ id: 'Tap' })],
                        [STEPS_RESISTANCE]: parseIntData(
                            val[
                                intl.formatMessage({
                                    id: 'ImportFileResistance',
                                })
                            ],
                            0
                        ),
                        [STEPS_REACTANCE]: parseIntData(
                            val[
                                intl.formatMessage({
                                    id: 'ImportFileReactance',
                                })
                            ],
                            0
                        ),
                        [STEPS_CONDUCTANCE]: parseIntData(
                            val[
                                intl.formatMessage({
                                    id: 'ImportFileConductance',
                                })
                            ],
                            0
                        ),
                        [STEPS_SUSCEPTANCE]: parseIntData(
                            val[
                                intl.formatMessage({
                                    id: 'ImportFileSusceptance',
                                })
                            ],
                            0
                        ),
                        [STEPS_RATIO]: isNaN(
                            parseFloat(val[intl.formatMessage({ id: 'Ratio' })])
                        )
                            ? 1
                            : parseFloat(
                                  val[intl.formatMessage({ id: 'Ratio' })]
                              ),
                    };
                });
                if (rows && rows.length > 0) {
                    let tapValues = rows.map((row) => {
                        return parseInt(row[STEPS_TAP]);
                    });
                    let tempLowTapPosition = Math.min(...tapValues);
                    let tempHighTapPosition = Math.max(...tapValues);

                    setValue(
                        `${RATIO_TAP_CHANGER}.${LOW_TAP_POSITION}`,
                        tempLowTapPosition
                    );
                    setValue(
                        `${RATIO_TAP_CHANGER}.${HIGH_TAP_POSITION}`,
                        tempHighTapPosition
                    );

                    replace(rows);
                }
            },
        });
    };

    const lowTapPositionField = (
        <IntegerInput
            name={`${RATIO_TAP_CHANGER}.${LOW_TAP_POSITION}`}
            label="LowTapPosition"
            formProps={{
                disabled: disabled,
            }}
        />
    );

    const highTapPositionField = (
        <IntegerInput
            name={`${RATIO_TAP_CHANGER}.${HIGH_TAP_POSITION}`}
            label="HighTapPosition"
            formProps={{
                disabled: disabled,
            }}
        />
    );

    const tapPositionField = (
        <IntegerInput
            name={`${RATIO_TAP_CHANGER}.${TAP_POSITION}`}
            label="TapPosition"
            formProps={{
                disabled: disabled,
            }}
        />
    );

    return (
        <>
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

            <Grid
                item
                container
                spacing={2}
                style={{
                    minHeight: '200px',
                }}
            >
                <Grid item xs={10}>
                    <VirtualizedTable rows={ratioTapFields} columns={columns} />
                </Grid>
                <RatioTapChangerPaneButtons
                    disabled={disabled}
                    isCreateRuleButtonDisabled={ratioTapFields.length === 0}
                    generateTapRows={generateTapRows}
                    setOpenCreateRuleDialog={setOpenCreateRuleDialog}
                    setOpenImportRuleDialog={setOpenImportRuleDialog}
                />
                <FieldErrorAlert name={`${RATIO_TAP_CHANGER}.${STEPS}`} />
            </Grid>
            <CreateRuleDialog
                ruleType={RATIO_TAP}
                openCreateRuleDialog={openCreateRuleDialog}
                setOpenCreateRuleDialog={setOpenCreateRuleDialog}
                handleCreateTapRule={handleCreateRatioTapRule}
                allowNegativeValues={false}
            />

            <ImportRuleDialog
                ruleType={RATIO_TAP}
                openImportRuleDialog={openImportRuleDialog}
                setOpenImportRuleDialog={setOpenImportRuleDialog}
                csvColumns={csvColumns}
                handleImportTapRule={handleImportTapRule}
            />
        </>
    );
};

export default RatioTapChangerPaneTaps;
