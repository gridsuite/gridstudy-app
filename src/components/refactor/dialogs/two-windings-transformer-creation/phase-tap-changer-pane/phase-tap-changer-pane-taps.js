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
    PHASE_TAP_CHANGER,
    STEPS,
    STEPS_ALPHA,
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
import { CreateRuleDialog } from '../create-rule/create-rule-dialog';
import { ImportRuleDialog } from '../import-rule-dialog';
import {
    MAX_TAP_NUMBER,
    PHASE_TAP,
} from '../two-windings-transformer-creation-dialog';
import VirtualizedTable from '../../../../util/virtualized-table';
import FieldErrorAlert from '../../../rhf-inputs/field-error-alert';
import IntegerInput from '../../../rhf-inputs/integer-input';
import { TableNumericalInput } from '../../../rhf-inputs/table-inputs/table-numerical-input';
import PhaseTapChangerPaneButtons from './phase-tap-changer-pane-buttons';

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

const PhaseTapChangerPaneTaps = ({ disabled }) => {
    const intl = useIntl();
    const classes = useStyles();
    const { getValues, setValue, setError, clearErrors } = useFormContext();

    const [openCreateRuleDialog, setOpenCreateRuleDialog] = useState(false);
    const [openImportRuleDialog, setOpenImportRuleDialog] = useState(false);

    const { fields: phaseTapFields, replace } = useFieldArray({
        name: `${PHASE_TAP_CHANGER}.${STEPS}`,
    });

    const COLUMNS_DEFINITIONS = useMemo(() => {
        return [
            {
                label: 'Tap',
                id: 'tap',
                dataKey: STEPS_TAP,
                maxWidth: 200,
            },
            {
                label: 'DeltaResistance',
                id: 'resistance',
                dataKey: STEPS_RESISTANCE,
                editor: TableNumericalInput,
            },
            {
                label: 'DeltaReactance',
                id: 'reactance',
                dataKey: STEPS_REACTANCE,
                editor: TableNumericalInput,
            },
            {
                label: 'DeltaConductance',
                id: 'conductance',
                dataKey: STEPS_CONDUCTANCE,
                editor: TableNumericalInput,
            },
            {
                label: 'DeltaSusceptance',
                id: 'susceptance',
                dataKey: STEPS_SUSCEPTANCE,
                editor: TableNumericalInput,
            },
            {
                label: 'Ratio',
                id: 'ratio',
                dataKey: STEPS_RATIO,
                editor: TableNumericalInput,
            },
            {
                label: 'Alpha',
                id: 'alpha',
                dataKey: STEPS_ALPHA,
                editor: TableNumericalInput,
            },
        ].map((column) => ({
            ...column,
            label: intl.formatMessage({ id: column.label }).toUpperCase(),
        }));
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
                            key={row.dataKey + row.rowData.id}
                            name={`${PHASE_TAP_CHANGER}.${STEPS}[${row.rowIndex}].${row.dataKey}`}
                        />
                    </div>
                );
            }
            return defaultCellRender(row);
        },
        [COLUMNS_DEFINITIONS, classes.tableCell, defaultCellRender]
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

    const handleCreateAlphaTapRule = (lowTapAlpha, highTapAlpha) => {
        const currentTapRows = getValues(`${PHASE_TAP_CHANGER}.${STEPS}`);

        if (currentTapRows.length > 1) {
            let alphaInterval =
                (highTapAlpha - lowTapAlpha) / (currentTapRows.length - 1);
            let currentAlpha = lowTapAlpha;

            currentTapRows.forEach((row, index) => {
                currentTapRows[index][STEPS_ALPHA] = currentAlpha;

                currentAlpha += alphaInterval;
            });
            replace(currentTapRows);
        }
    };

    const arrayFromNToM = (n, m) =>
        [...Array(m - n + 1).keys()].map((i) => i + n);

    const generateTapRows = useCallback(() => {
        const currentLowTapPosition = getValues(
            `${PHASE_TAP_CHANGER}.${LOW_TAP_POSITION}`
        );
        const currentHighTapPosition = getValues(
            `${PHASE_TAP_CHANGER}.${HIGH_TAP_POSITION}`
        );
        const currentTapRows = getValues(`${PHASE_TAP_CHANGER}.${STEPS}`);

        if (
            currentHighTapPosition < currentLowTapPosition ||
            currentHighTapPosition > MAX_TAP_NUMBER
        ) {
            setError(`${PHASE_TAP_CHANGER}.${HIGH_TAP_POSITION}`, {
                type: 'custom',
                message: 'HighTapPositionError',
            });
            return;
        }
        clearErrors(`${PHASE_TAP_CHANGER}.${HIGH_TAP_POSITION}`);

        // checking if not exceeding MAX_TAP_NUMBER steps before trying to generate
        if (
            currentHighTapPosition - currentLowTapPosition + 1 >
            MAX_TAP_NUMBER
        ) {
            setError(`${PHASE_TAP_CHANGER}.${STEPS}`, {
                type: 'custom',
                message: {
                    id: 'TapPositionValueError',
                    value: MAX_TAP_NUMBER,
                },
            });
            return;
        }
        clearErrors(`${PHASE_TAP_CHANGER}.${STEPS}`);

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
                    [STEPS_ALPHA]: 0,
                }))
            );
            return;
        }

        // if newSteps is not empty, we fill the gaps
        const lowestTapRowIndex = newSteps?.[0][STEPS_TAP];
        const highestTapRowIndex = lowestTapRowIndex + newSteps.length - 1;

        //adding steps from lowTap to lowest current index
        for (let i = lowestTapRowIndex - 1; i >= currentLowTapPosition; i--) {
            newSteps.unshift({
                [STEPS_TAP]: i,
                [STEPS_RESISTANCE]: 0,
                [STEPS_REACTANCE]: 0,
                [STEPS_CONDUCTANCE]: 0,
                [STEPS_SUSCEPTANCE]: 0,
                [STEPS_RATIO]: 1,
                [STEPS_ALPHA]: 0,
            });
        }

        //adding steps from highest current index to highTap
        for (let i = highestTapRowIndex + 1; i <= currentHighTapPosition; i++) {
            newSteps.push({
                [STEPS_TAP]: i,
                [STEPS_RESISTANCE]: 0,
                [STEPS_REACTANCE]: 0,
                [STEPS_CONDUCTANCE]: 0,
                [STEPS_SUSCEPTANCE]: 0,
                [STEPS_RATIO]: 1,
                [STEPS_ALPHA]: 0,
            });
        }

        replace(newSteps);
    }, [getValues, replace, clearErrors, setError]);

    const csvColumns = useMemo(() => {
        return [
            intl.formatMessage({ id: 'Tap' }),
            intl.formatMessage({ id: 'ImportFileResistance' }),
            intl.formatMessage({ id: 'ImportFileReactance' }),
            intl.formatMessage({ id: 'ImportFileConductance' }),
            intl.formatMessage({ id: 'ImportFileSusceptance' }),
            intl.formatMessage({ id: 'Ratio' }),
            intl.formatMessage({ id: 'ImportFileAlpha' }),
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
                        [STEPS_ALPHA]: isNaN(
                            parseFloat(
                                val[
                                    intl.formatMessage({
                                        id: 'ImportFileAlpha',
                                    })
                                ]
                            )
                        )
                            ? 1
                            : parseFloat(
                                  val[
                                      intl.formatMessage({
                                          id: 'ImportFileAlpha',
                                      })
                                  ]
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
                        `${PHASE_TAP_CHANGER}.${LOW_TAP_POSITION}`,
                        tempLowTapPosition
                    );
                    setValue(
                        `${PHASE_TAP_CHANGER}.${HIGH_TAP_POSITION}`,
                        tempHighTapPosition
                    );

                    replace(rows);
                }
            },
        });
    };

    const lowTapPositionField = (
        <IntegerInput
            name={`${PHASE_TAP_CHANGER}.${LOW_TAP_POSITION}`}
            label="LowTapPosition"
            formProps={{
                disabled: disabled,
            }}
        />
    );

    const highTapPositionField = (
        <IntegerInput
            name={`${PHASE_TAP_CHANGER}.${HIGH_TAP_POSITION}`}
            label="HighTapPosition"
            formProps={{
                disabled: disabled,
            }}
        />
    );

    const tapPositionField = (
        <IntegerInput
            name={`${PHASE_TAP_CHANGER}.${TAP_POSITION}`}
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
                    <VirtualizedTable rows={phaseTapFields} columns={columns} />
                </Grid>
                <PhaseTapChangerPaneButtons
                    disabled={disabled}
                    isCreateRuleButtonDisabled={phaseTapFields.length === 0}
                    generateTapRows={generateTapRows}
                    setOpenCreateRuleDialog={setOpenCreateRuleDialog}
                    setOpenImportRuleDialog={setOpenImportRuleDialog}
                />
                <FieldErrorAlert name={`${PHASE_TAP_CHANGER}.${STEPS}`} />
            </Grid>
            <CreateRuleDialog
                ruleType={PHASE_TAP}
                openCreateRuleDialog={openCreateRuleDialog}
                setOpenCreateRuleDialog={setOpenCreateRuleDialog}
                handleCreateTapRule={handleCreateAlphaTapRule}
                allowNegativeValues={true}
            />

            <ImportRuleDialog
                ruleType={PHASE_TAP}
                openImportRuleDialog={openImportRuleDialog}
                setOpenImportRuleDialog={setOpenImportRuleDialog}
                csvColumns={csvColumns}
                handleImportTapRule={handleImportTapRule}
            />
        </>
    );
};

export default PhaseTapChangerPaneTaps;
