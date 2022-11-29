import VirtualizedTable from '../../util/virtualized-table';
import { Button, Grid } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { gridItem } from '../dialogUtils';
import { NumericalField } from '../../network/equipment-table-editors';
import { REGULATION_MODES } from '../../network/constants';
import Papa from 'papaparse';
import makeStyles from '@mui/styles/makeStyles';
import { PHASE_TAP } from './two-windings-transformer-creation-dialog';
import { CreateRuleDialog } from './create-rule-dialog';
import { ImportRuleDialog } from './import-rule-dialog';
import Alert from '@mui/material/Alert';

const useStyles = makeStyles((theme) => ({
    center: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
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

const PhaseTapChangerPane = (props) => {
    const {
        formValues,
        setFormValues,
        phaseTapRows,
        handlePhaseTapRows,
        phaseTapChangerEnabled,
        phaseTapChangerEnabledField,
        regulationModeField,
        regulationMode,
        currentLimiterRegulatingValueField,
        flowSetPointRegulatingValueField,
        targetDeadbandField,
        regulatingTerminalField,
        lowTapPositionField,
        lowTapPosition,
        highTapPositionField,
        highTapPosition,
        tapPositionField,
        regulatingField,
        phaseCellIndexError,
    } = props;

    const classes = useStyles();

    const intl = useIntl();

    const [lineEdit, setLineEdit] = useState(undefined);

    const [openCreateRuleDialog, setOpenCreateRuleDialog] = useState(false);

    const [openImportRuleDialog, setOpenImportRuleDialog] = useState(false);
    const [ratioError, setRatioError] = useState('');

    const generateNewTapData = (index) => {
        return {
            key: index,
            tap: index,
            resistance: 0,
            reactance: 0,
            conductance: 0,
            susceptance: 0,
            ratio: 1,
            alpha: 0,
            isEdited: false,
        };
    };

    const generateTapRows = () => {
        if (highTapPosition > 100) {
            setRatioError(
                intl.formatMessage(
                    { id: 'TapPositionValueError' },
                    { value: 100 }
                )
            );
            return;
        }
        let tempRows = [];
        const rowNumber =
            highTapPosition - lowTapPosition > 0
                ? highTapPosition - lowTapPosition + 1
                : 0;

        if (
            phaseTapRows.length !== rowNumber &&
            !isNaN(parseInt(lowTapPosition)) &&
            !isNaN(parseInt(highTapPosition))
        ) {
            for (let i = lowTapPosition; i <= highTapPosition; i++) {
                tempRows.push(generateNewTapData(i));
            }
            let editedRows = Array.from(
                phaseTapRows.filter((row) => row.isEdited)
            );
            editedRows.forEach((row) => {
                let editedRowIndex = phaseTapRows.indexOf(row);

                if (tempRows.length > editedRowIndex) {
                    tempRows[editedRowIndex] = row;
                }
            });
            handlePhaseTapRows(tempRows);
        }
    };

    const COLUMNS_DEFINITIONS = useMemo(() => {
        return [
            {
                label: intl.formatMessage({ id: 'Tap' }).toUpperCase(),
                id: 'tap',
                dataKey: 'tap',
                maxWidth: 200,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaResistance' })
                    .toUpperCase(),
                id: 'resistance',
                dataKey: 'resistance',
                editor: NumericalField,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaReactance' })
                    .toUpperCase(),
                id: 'reactance',
                dataKey: 'reactance',
                editor: NumericalField,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaConductance' })
                    .toUpperCase(),
                id: 'conductance',
                dataKey: 'conductance',
                editor: NumericalField,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaSusceptance' })
                    .toUpperCase(),
                id: 'susceptance',
                dataKey: 'susceptance',
                editor: NumericalField,
            },
            {
                label: intl.formatMessage({ id: 'Ratio' }).toUpperCase(),
                id: 'ratio',
                dataKey: 'ratio',
                editor: NumericalField,
            },
            {
                label: intl.formatMessage({ id: 'Alpha' }).toUpperCase(),
                id: 'alpha',
                dataKey: 'alpha',
                editor: NumericalField,
            },
        ];
    }, [intl]);

    const setColumnInError = useCallback(
        (dataKey) => {
            if (!lineEdit?.errors.has(dataKey)) {
                let newLineEdit = { ...lineEdit };
                newLineEdit.errors.set(dataKey, true);
                setLineEdit(newLineEdit);
            }
        },
        [lineEdit]
    );

    const resetColumnInError = useCallback(
        (dataKey) => {
            if (lineEdit?.errors.has(dataKey)) {
                let newLineEdit = { ...lineEdit };
                newLineEdit.errors.delete(dataKey);
                setLineEdit(newLineEdit);
            }
        },
        [lineEdit]
    );

    const defaultCellRender = useCallback(
        (rowData) => {
            return (
                <>
                    <div
                        component="span"
                        variant="body"
                        align={'right'}
                        className={classes.tableCell}
                    >
                        {rowData.cellData}
                    </div>
                </>
            );
        },
        [classes.tableCell]
    );

    const handleEditCell = useCallback(
        (rowData, newVal) => {
            setLineEdit({
                oldValues: {},
                newValues: {},
                id: rowData.rowIndex,
                errors: new Map(),
            });
            const parsedVal = parseFloat(newVal);

            if (!isNaN(parsedVal) && parsedVal >= 0 && parsedVal <= 100) {
                let tempRows = phaseTapRows;
                const column = rowData.dataKey;
                tempRows[rowData.rowIndex][column] = parsedVal;
                tempRows[rowData.rowIndex].isEdited = true;
                handlePhaseTapRows(tempRows);
            }
        },
        [handlePhaseTapRows, phaseTapRows]
    );

    const editableCellRender = useCallback(
        (rowData) => {
            const index = rowData.columnIndex;
            const Editor = COLUMNS_DEFINITIONS[index].editor;
            if (Editor) {
                let style;
                if (
                    phaseCellIndexError === rowData.rowIndex &&
                    COLUMNS_DEFINITIONS[index].id === 'ratio'
                ) {
                    style = {
                        color: 'red',
                    };
                }
                return (
                    <>
                        <div className={classes.tableCell}>
                            <Editor
                                key={rowData.dataKey + index}
                                columnDefinition={COLUMNS_DEFINITIONS[index]}
                                defaultValue={rowData.cellData}
                                setColumnError={(k) => setColumnInError(k)}
                                resetColumnError={(k) => resetColumnInError(k)}
                                setter={(val) => handleEditCell(rowData, val)}
                                inputProps={{ style }}
                            />
                        </div>
                    </>
                );
            }
            return defaultCellRender(rowData);
        },
        [
            COLUMNS_DEFINITIONS,
            classes.tableCell,
            defaultCellRender,
            handleEditCell,
            resetColumnInError,
            setColumnInError,
            phaseCellIndexError,
        ]
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
                let rows = results.data.map((val) => {
                    return {
                        key: results.data.indexOf(val),
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
                        isEdited: true,
                    };
                });

                if (rows && rows.length > 0) {
                    let tapValues = rows.map((row) => {
                        return parseInt(row.tap);
                    });
                    let tempLowTapPosition = Math.min(...tapValues);
                    let tempHighTapPosition = Math.max(...tapValues);

                    let tempFormValues = {
                        ...formValues,
                        phaseTapChanger: {
                            ...formValues.phaseTapChanger,
                            lowTapPosition: tempLowTapPosition,
                            highTapPosition: tempHighTapPosition,
                        },
                    };
                    setFormValues(tempFormValues);
                    handlePhaseTapRows(rows);
                }
            },
        });
    };

    const handleCreateAlphaTapRule = (lowTapAlpha, highTapAlpha) => {
        let tempRows = phaseTapRows;

        if (tempRows.length > 1) {
            let alphaInterval =
                (highTapAlpha - lowTapAlpha) / (tempRows.length - 1);
            let currentAlpha = lowTapAlpha;

            tempRows.forEach((row, index) => {
                tempRows[index].alpha = currentAlpha;
                currentAlpha += alphaInterval;
            });
            handlePhaseTapRows(tempRows);
        }
    };

    return (
        <>
            <Grid container spacing={2}>
                <Grid item container spacing={2}>
                    <Grid item xs={4}>
                        {phaseTapChangerEnabledField}
                    </Grid>
                </Grid>
                <Grid item xs={4}>
                    {gridItem(regulationModeField, 12)}
                </Grid>

                <Grid item container spacing={2}>
                    <Grid item xs={4}>
                        {regulatingField}
                    </Grid>

                    {regulationMode !== REGULATION_MODES.FIXED_TAP.id && (
                        <Grid item xs={4}>
                            {regulationMode !==
                                REGULATION_MODES.ACTIVE_POWER_CONTROL.id &&
                                currentLimiterRegulatingValueField}
                            {regulationMode ===
                                REGULATION_MODES.ACTIVE_POWER_CONTROL.id &&
                                flowSetPointRegulatingValueField}
                        </Grid>
                    )}
                    {regulationMode !== REGULATION_MODES.FIXED_TAP.id && (
                        <Grid item xs={4}>
                            {targetDeadbandField}
                        </Grid>
                    )}
                </Grid>

                {regulationMode !== REGULATION_MODES.FIXED_TAP.id && (
                    <Grid item container spacing={2}>
                        <Grid
                            item
                            xs={4}
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                            }}
                        >
                            <FormattedMessage id="TerminalRef" />
                        </Grid>

                        {gridItem(regulatingTerminalField, 8)}
                    </Grid>
                )}

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
                            rows={phaseTapRows}
                            columns={generateTableColumns()}
                        />
                    </Grid>
                    <Grid container item spacing={2} xs direction={'column'}>
                        <Grid item className={classes.center}>
                            <Button
                                variant="contained"
                                onClick={() => generateTapRows()}
                                disabled={
                                    !phaseTapChangerEnabled ||
                                    !(lowTapPosition && highTapPosition)
                                }
                            >
                                <FormattedMessage id="GenerateTapRows" />
                            </Button>
                        </Grid>
                        <Grid item className={classes.center}>
                            <Button
                                variant="contained"
                                onClick={() => setOpenCreateRuleDialog(true)}
                                disabled={
                                    !phaseTapChangerEnabled ||
                                    phaseTapRows.length === 0
                                }
                            >
                                <FormattedMessage id="CreateDephasingRule" />
                            </Button>
                        </Grid>
                        <Grid item className={classes.center}>
                            <Button
                                variant="contained"
                                onClick={() => setOpenImportRuleDialog(true)}
                                disabled={!phaseTapChangerEnabled}
                            >
                                <FormattedMessage id="ImportDephasingRule" />
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
                {ratioError && (
                    <Grid item xs={12}>
                        <Alert severity="error">{ratioError}</Alert>
                    </Grid>
                )}
            </Grid>

            <CreateRuleDialog
                ruleType={PHASE_TAP}
                allowNegativeValues={true}
                openCreateRuleDialog={openCreateRuleDialog}
                setOpenCreateRuleDialog={setOpenCreateRuleDialog}
                handleCreateTapRule={handleCreateAlphaTapRule}
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

export default PhaseTapChangerPane;
