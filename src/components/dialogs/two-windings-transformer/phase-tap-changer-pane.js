import VirtualizedTable from '../../util/virtualized-table';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { gridItem } from '../dialogUtils';
import { useCSVReader } from '../inputs/input-hooks';
import EditIcon from '@mui/icons-material/Edit';
import { NumericalField } from '../../network/equipment-table-editors';
import { REGULATION_MODES } from '../../network/constants';
import CsvDownloader from 'react-csv-downloader';
import Papa from 'papaparse';
import makeStyles from '@mui/styles/makeStyles';
import { PHASE_TAP } from './two-windings-transformer-creation-dialog';
import { CreateRuleDialog } from './create-rule-dialog';

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

const ImportDephasingRuleDialog = (props) => {
    const intl = useIntl();

    const handleCloseDialog = () => {
        props.setOpenImportDephasingRule(false);
    };

    const getCSVColumnNames = () => {
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

    const [
        selectedFile,
        setSelectedFile,
        FileField,
        selectedFileError,
        isSelectedFileOk,
    ] = useCSVReader({
        label: 'ImportDephasingRule',
        header: getCSVColumnNames(),
    });

    const parseIntData = (data, defaultValue) => {
        return isNaN(parseInt(data), 10) ? defaultValue : parseInt(data);
    };

    const handleSave = () => {
        if (isSelectedFileOk) {
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
                                parseFloat(
                                    val[intl.formatMessage({ id: 'Ratio' })]
                                )
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
                    props.handleImportPhaseTapRows(rows);
                    handleCloseDialog();
                },
            });
        }
    };

    useEffect(() => {
        if (props.openImportDephasingRule) {
            setSelectedFile();
        }
    }, [props.openImportDephasingRule, setSelectedFile]);

    return (
        <Dialog open={props.openImportDephasingRule} fullWidth={true}>
            <DialogTitle>
                <FormattedMessage id="ImportDephasingRule" />
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} direction={'column'}>
                    <Grid item>
                        <CsvDownloader
                            columns={getCSVColumnNames()}
                            filename={'tap-dephasing-rule'}
                        >
                            <Button variant="contained">
                                <FormattedMessage id="GenerateSkeleton" />
                            </Button>
                        </CsvDownloader>
                    </Grid>
                    <Grid item>{FileField}</Grid>
                    {selectedFileError && (
                        <Grid item>
                            <Alert severity="error">{selectedFileError}</Alert>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog}>
                    <FormattedMessage id="cancel" />
                </Button>
                <Button
                    disabled={
                        selectedFileError && selectedFileError.length !== 0
                    }
                    onClick={handleSave}
                >
                    <FormattedMessage id="validate" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

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
    } = props;

    const classes = useStyles();

    const intl = useIntl();

    const [lineEdit, setLineEdit] = useState(undefined);

    const [openCreateDephasingRule, setOpenCreateDephasingRule] =
        useState(false);

    const [openImportDephasingRule, setOpenImportDephasingRule] =
        useState(false);

    const isLineOnEditMode = useCallback(
        (rowData) => {
            return lineEdit && rowData.rowIndex === lineEdit.id;
        },
        [lineEdit]
    );

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
        let tempRows = [];
        const rowNumber =
            highTapPosition - lowTapPosition > 0
                ? highTapPosition - lowTapPosition + 1
                : 0;

        if (
            phaseTapRows.length !== rowNumber &&
            parseInt(lowTapPosition, 10) >= 0 &&
            parseInt(highTapPosition, 10) >= 0 &&
            !isNaN(parseInt(lowTapPosition, 10)) &&
            !isNaN(parseInt(highTapPosition, 10))
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
            },
            {
                label: intl.formatMessage({ id: 'Alpha' }).toUpperCase(),
                id: 'alpha',
                dataKey: 'alpha',
            },
        ];
    }, [intl]);

    const setColumnInError = useCallback(
        (dataKey) => {
            if (!lineEdit.errors.has(dataKey)) {
                let newLineEdit = { ...lineEdit };
                newLineEdit.errors.set(dataKey, true);
                setLineEdit(newLineEdit);
            }
        },
        [lineEdit]
    );

    const resetColumnInError = useCallback(
        (dataKey) => {
            if (lineEdit.errors.has(dataKey)) {
                let newLineEdit = { ...lineEdit };
                newLineEdit.errors.delete(dataKey);
                setLineEdit(newLineEdit);
            }
        },
        [lineEdit]
    );

    const editCellRender = useCallback(
        (rowData) => {
            return (
                <div className={classes.tableCell}>
                    <IconButton
                        size={'small'}
                        onClick={() => {
                            setLineEdit({
                                oldValues: {},
                                newValues: {},
                                id: rowData.rowIndex,
                                errors: new Map(),
                            });
                        }}
                    >
                        <EditIcon />
                    </IconButton>
                </div>
            );
        },
        [classes.tableCell]
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
            const parsedVal = parseInt(newVal, 10);

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
            if (isLineOnEditMode(rowData)) {
                const index = rowData.columnIndex - 1;
                const Editor = COLUMNS_DEFINITIONS[index].editor;
                if (Editor) {
                    return (
                        <>
                            <div className={classes.tableCell}>
                                <Editor
                                    key={rowData.dataKey + index}
                                    columnDefinition={
                                        COLUMNS_DEFINITIONS[index]
                                    }
                                    defaultValue={rowData.cellData}
                                    setColumnError={(k) => setColumnInError(k)}
                                    resetColumnError={(k) =>
                                        resetColumnInError(k)
                                    }
                                    setter={(val) =>
                                        handleEditCell(rowData, val)
                                    }
                                />
                            </div>
                        </>
                    );
                }
            }
            return defaultCellRender(rowData);
        },
        [
            COLUMNS_DEFINITIONS,
            classes.tableCell,
            defaultCellRender,
            handleEditCell,
            isLineOnEditMode,
            resetColumnInError,
            setColumnInError,
        ]
    );

    const generateTableColumns = () => {
        let tableColumns = Object.values(COLUMNS_DEFINITIONS).map((c) => {
            if (c.editor) {
                c.cellRenderer = editableCellRender;
            }
            return c;
        });

        tableColumns.unshift({
            id: 'edit',
            dataKey: 'edit',
            label: '',
            minWidth: 75,
            locked: true,
            editColumn: true,
            cellRenderer: (rowData, rowIndex) =>
                editCellRender(rowData, rowIndex),
        });

        return tableColumns;
    };

    const handleImportPhaseTapRows = (rows) => {
        let tapValues = Object.values(
            rows.map((row) => {
                return parseInt(row.tap, 10);
            })
        );
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

                    <Grid item xs={4}>
                        {regulationMode !== REGULATION_MODES[2].id &&
                            currentLimiterRegulatingValueField}
                        {regulationMode === REGULATION_MODES[2].id &&
                            flowSetPointRegulatingValueField}
                    </Grid>
                    <Grid item xs={4}>
                        {targetDeadbandField}
                    </Grid>
                </Grid>

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
                                onClick={() => setOpenCreateDephasingRule(true)}
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
                                onClick={() => setOpenImportDephasingRule(true)}
                                disabled={!phaseTapChangerEnabled}
                            >
                                <FormattedMessage id="ImportDephasingRule" />
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <CreateRuleDialog
                ruleType={PHASE_TAP}
                setOpenCreateRuleDialog={setOpenCreateDephasingRule}
                openCreateRuleDialog={openCreateDephasingRule}
                handleCreateTapRule={handleCreateAlphaTapRule}
            />

            <ImportDephasingRuleDialog
                setOpenImportDephasingRule={setOpenImportDephasingRule}
                openImportDephasingRule={openImportDephasingRule}
                handleImportPhaseTapRows={handleImportPhaseTapRows}
            />
        </>
    );
};

export default PhaseTapChangerPane;
