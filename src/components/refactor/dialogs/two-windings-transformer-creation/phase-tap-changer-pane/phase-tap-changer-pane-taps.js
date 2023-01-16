import { Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useCallback, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useIntl } from 'react-intl';
import VirtualizedTable from '../../../../util/virtualized-table';
import IntegerInput from '../../../rhf-inputs/integer-input';
import { TableNumericalInput } from '../../../rhf-inputs/table-inputs/table-numerical-input';
import { CreateRuleDialog } from '../../../../dialogs/two-windings-transformer/create-rule-dialog';
import { ImportRuleDialog } from '../../../../dialogs/two-windings-transformer/import-rule-dialog';
import {
    HIGH_TAP_POSITION,
    LOW_TAP_POSITION,
    STEPS,
    STEPS_ALPHA,
    STEPS_CONDUCTANCE,
    STEPS_RATIO,
    STEPS_REACTANCE,
    STEPS_RESISTANCE,
    STEPS_SUSCEPTANCE,
    STEPS_TAP,
    TAP_POSITION,
} from '../two-windings-transformer-creation-dialog-utils';
import {
    MAX_TAP_NUMBER,
    PHASE_TAP,
} from '../../../../dialogs/two-windings-transformer/two-windings-transformer-creation-dialog';
import PhaseTapChangerPaneButtons from './phase-tap-changer-pane-buttons';
import { PHASE_TAP_CHANGER } from './phase-tap-changer-pane-utils';

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
    const { trigger, getValues, setValue } = useFormContext();

    const [openCreateRuleDialog, setOpenCreateRuleDialog] = useState(false);
    const [openImportRuleDialog, setOpenImportRuleDialog] = useState(false);

    const { fields: phaseTapFields, replace } = useFieldArray({
        name: `${PHASE_TAP_CHANGER}.${STEPS}`,
    });

    const COLUMNS_DEFINITIONS = useMemo(() => {
        return [
            {
                label: intl.formatMessage({ id: 'Tap' }).toUpperCase(),
                id: 'tap',
                dataKey: STEPS_TAP,
                maxWidth: 200,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaResistance' })
                    .toUpperCase(),
                id: 'resistance',
                dataKey: STEPS_RESISTANCE,
                editor: TableNumericalInput,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaReactance' })
                    .toUpperCase(),
                id: 'reactance',
                dataKey: STEPS_REACTANCE,
                editor: TableNumericalInput,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaConductance' })
                    .toUpperCase(),
                id: 'conductance',
                dataKey: STEPS_CONDUCTANCE,
                editor: TableNumericalInput,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaSusceptance' })
                    .toUpperCase(),
                id: 'susceptance',
                dataKey: STEPS_SUSCEPTANCE,
                editor: TableNumericalInput,
            },
            {
                label: intl.formatMessage({ id: 'Ratio' }).toUpperCase(),
                id: 'ratio',
                dataKey: STEPS_RATIO,
                editor: TableNumericalInput,
            },
            {
                label: intl.formatMessage({ id: 'Alpha' }).toUpperCase(),
                id: 'alpha',
                dataKey: STEPS_ALPHA,
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
            console.log('DATA');
            if (Editor) {
                return (
                    <div className={classes.tableCell}>
                        <Editor
                            key={row.dataKey + row.rowData.id}
                            name={`${PHASE_TAP_CHANGER}.${STEPS}[${row.rowIndex}].${row.dataKey}`}
                            columnDefinition={COLUMNS_DEFINITIONS[index]}
                        />
                    </div>
                );
            }
            return defaultCellRender(row);
        },
        [COLUMNS_DEFINITIONS, classes.tableCell, defaultCellRender]
    );

    const generateTableColumns = () => {
        let tableColumns = Object.values(COLUMNS_DEFINITIONS).map((c) => {
            if (c.editor) {
                c.cellRenderer = editableCellRender;
            }
            return c;
        });
        return tableColumns;
    };

    const handleCreateAlphaTapRule = (lowTapAlpha, highTapAlpha) => {
        const currentTapRows = getValues(`${PHASE_TAP_CHANGER}.${STEPS}`);

        if (currentTapRows.length > 1) {
            let alphaInterval =
                (highTapAlpha - lowTapAlpha) / (currentTapRows.length - 1);
            let currentAlpha = lowTapAlpha;

            currentTapRows.forEach((row, index) => {
                currentTapRows[index].alpha = currentAlpha;

                currentAlpha += alphaInterval;
            });
            replace(currentTapRows);
        }
    };

    const arrayFromNToM = (n, m) =>
        [...Array(m - n + 1).keys()].map((i) => i + n);

    const generateTapRows = useCallback(() => {
        // triggering validation on low/high tap rows before generating rows
        Promise.all([
            trigger(`${PHASE_TAP_CHANGER}.${LOW_TAP_POSITION}`),
            trigger(`${PHASE_TAP_CHANGER}.${HIGH_TAP_POSITION}`),
        ]).then((results) => {
            //if any of the trigger returns false, it means one of the field validation didn't pass -> we don't generate rows
            if (results.some((result) => !result)) {
                return;
            }
            const currentLowTapPosition = getValues(
                `${PHASE_TAP_CHANGER}.${LOW_TAP_POSITION}`
            );
            const currentHighTapPosition = getValues(
                `${PHASE_TAP_CHANGER}.${HIGH_TAP_POSITION}`
            );
            const currentTapRows = getValues(`${PHASE_TAP_CHANGER}.${STEPS}`);

            //removing all steps not within the min/max values
            const newSteps = currentTapRows.filter(
                (tapRow) =>
                    tapRow.tap >= currentLowTapPosition &&
                    tapRow.tap <= currentHighTapPosition
            );

            // if newSteps is empty, we fill it with empty rows
            if (newSteps.length === 0) {
                replace(
                    arrayFromNToM(
                        currentLowTapPosition,
                        currentHighTapPosition
                    ).map((i) => ({
                        tap: i,
                        resistance: 0,
                        reactance: 0,
                        conductance: 0,
                        susceptance: 0,
                        ratio: 0,
                        alpha: 0,
                    }))
                );
                return;
            }

            // if newSteps is not empty, we fill the gaps
            const lowestTapRowIndex = newSteps?.[0].tap;
            const highestTapRowIndex = lowestTapRowIndex + newSteps.length - 1;

            //adding steps from lowTap to lowest current index
            for (
                let i = lowestTapRowIndex - 1;
                i >= currentLowTapPosition;
                i--
            ) {
                newSteps.unshift({
                    tap: i,
                    resistance: 0,
                    reactance: 0,
                    conductance: 0,
                    susceptance: 0,
                    ratio: 0,
                    alpha: 0,
                });
            }

            //adding steps from highest current index to highTap
            for (
                let i = highestTapRowIndex + 1;
                i <= currentHighTapPosition;
                i++
            ) {
                newSteps.push({
                    tap: i,
                    resistance: 0,
                    reactance: 0,
                    conductance: 0,
                    susceptance: 0,
                    ratio: 0,
                    alpha: 0,
                });
            }

            console.log('NEWSTEPS', currentTapRows);
            replace(newSteps);
        });
    }, [getValues, replace, trigger]);

    const getCSVColumns = () => {
        return [
            intl.formatMessage({ id: 'Tap' }),
            intl.formatMessage({ id: 'ImportFileResistance' }),
            intl.formatMessage({ id: 'ImportFileReactance' }),
            intl.formatMessage({ id: 'ImportFileConductance' }),
            intl.formatMessage({ id: 'ImportFileSusceptance' }),
            intl.formatMessage({ id: 'Ratio' }),
            intl.formatMessage({ id: 'ImportFileAlpha' }),
        ];
    };

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
                        tap: val[intl.formatMessage({ id: 'Tap' })],
                        resistance: parseIntData(
                            val[
                                intl.formatMessage({
                                    id: 'ImportFileResistance',
                                })
                            ],
                            0
                        ),
                        reactance: parseIntData(
                            val[
                                intl.formatMessage({
                                    id: 'ImportFileReactance',
                                })
                            ],
                            0
                        ),
                        conductance: parseIntData(
                            val[
                                intl.formatMessage({
                                    id: 'ImportFileConductance',
                                })
                            ],
                            0
                        ),
                        susceptance: parseIntData(
                            val[
                                intl.formatMessage({
                                    id: 'ImportFileSusceptance',
                                })
                            ],
                            0
                        ),
                        ratio: isNaN(
                            parseFloat(val[intl.formatMessage({ id: 'Ratio' })])
                        )
                            ? 1
                            : parseFloat(
                                  val[intl.formatMessage({ id: 'Ratio' })]
                              ),
                        alpha: isNaN(
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
                        return parseInt(row.tap);
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
                    <VirtualizedTable
                        rows={phaseTapFields}
                        columns={generateTableColumns()}
                    />
                </Grid>
                <PhaseTapChangerPaneButtons
                    disabled={disabled}
                    isCreateRuleButtonDisabled={phaseTapFields.length === 0}
                    generateTapRows={generateTapRows}
                    setOpenCreateRuleDialog={setOpenCreateRuleDialog}
                    setOpenImportRuleDialog={setOpenImportRuleDialog}
                />
            </Grid>
            <CreateRuleDialog
                ruleType={PHASE_TAP}
                openCreateRuleDialog={openCreateRuleDialog}
                setOpenCreateRuleDialog={setOpenCreateRuleDialog}
                handleCreateTapRule={handleCreateAlphaTapRule}
                allowNegativeValues={false}
            />

            <ImportRuleDialog
                ruleType={PHASE_TAP}
                openImportRuleDialog={openImportRuleDialog}
                setOpenImportRuleDialog={setOpenImportRuleDialog}
                csvColumns={getCSVColumns()}
                handleImportTapRule={handleImportTapRule}
            />
        </>
    );
};

export default PhaseTapChangerPaneTaps;
