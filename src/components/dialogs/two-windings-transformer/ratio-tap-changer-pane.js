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
import { filledTextField, gridItem } from '../dialogUtils';
import {
    useCSVReader,
    useInputForm,
    useTextValue,
} from '../inputs/input-hooks';
import EditIcon from '@mui/icons-material/Edit';
import { NumericalField } from '../../network/equipment-table-editors';
import CsvDownloader from 'react-csv-downloader';
import Papa from 'papaparse';
import makeStyles from '@mui/styles/makeStyles';
import {
    CreateRuleDialog,
    RATIO_TAP,
} from './two-windings-transformer-creation-dialog';

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

const ImportRegulationRuleDialog = (props) => {
    const handleCloseDialog = () => {
        props.setOpenImportRegulationRule(false);
    };

    const getCSVColumnNames = () => {
        return [
            'Tap',
            'Resistance',
            'Reactance',
            'Conductance',
            'Susceptance',
            'Ratio',
        ];
    };

    const [
        selectedFile,
        setSelectedFile,
        FileField,
        selectedFileError,
        isSelectedFileOk,
    ] = useCSVReader({
        label: 'ImportRegulationRule',
        header: getCSVColumnNames(),
    });

    const handleSave = () => {
        if (isSelectedFileOk) {
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    let rows = results.data.map((val) => {
                        return {
                            key: results.data.indexOf(val),
                            tap: val.Tap,
                            resistance: parseInt(val.Resistance, 10),
                            reactance: parseInt(val.Reactance, 10),
                            conductance: parseInt(val.Conductance, 10),
                            susceptance: parseInt(val.Susceptance, 10),
                            ratio: parseFloat(val.Ratio),
                            isEdited: true,
                        };
                    });
                    props.handleImportRatioTapRows(rows);
                    handleCloseDialog();
                },
            });
        }
    };

    useEffect(() => {
        if (props.openImportRegulationRule) {
            setSelectedFile();
        }
    }, [props.openImportRegulationRule, setSelectedFile]);

    return (
        <Dialog open={props.openImportRegulationRule} fullWidth={true}>
            <DialogTitle>
                <FormattedMessage id="ImportRegulationRule" />
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} direction={'column'}>
                    <Grid item>
                        <CsvDownloader
                            columns={getCSVColumnNames()}
                            filename={'tap-regulating-rule'}
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

const RatioTapChangerPane = (props) => {
    const {
        formValues,
        setFormValues,
        ratioTapRows,
        handleRatioTapRows,
        ratioTapChangerEnabled,
        ratioTapChangerEnabledField,
        targetVoltage1Field,
        targetDeadbandField,
        regulatingTerminalField,
        lowTapPositionField,
        lowTapPosition,
        highTapPositionField,
        highTapPosition,
        tapPositionField,
        loadTapChangingCapabilitiesField,
        regulatingField,
    } = props;

    const classes = useStyles();

    const intl = useIntl();

    const [lineEdit, setLineEdit] = useState(undefined);

    const [openCreateRegulationRule, setOpenCreateRegulationRule] =
        useState(false);

    const [openImportRegulationRule, setOpenImportRegulationRule] =
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
            ratioTapRows.length !== rowNumber &&
            parseInt(lowTapPosition, 10) >= 0 &&
            parseInt(highTapPosition, 10) >= 0 &&
            !isNaN(parseInt(lowTapPosition, 10)) &&
            !isNaN(parseInt(highTapPosition, 10))
        ) {
            for (let i = lowTapPosition; i <= highTapPosition; i++) {
                tempRows.push(generateNewTapData(i));
            }
            let editedRows = Array.from(
                ratioTapRows.filter((row) => row.isEdited)
            );

            editedRows.forEach((row) => {
                let editedRowIndex = ratioTapRows.indexOf(row);
                if (
                    tempRows.length > editedRowIndex &&
                    parseInt(row.tap, 10) === tempRows[editedRowIndex].tap
                ) {
                    tempRows[editedRowIndex] = row;
                }
            });
            handleRatioTapRows(tempRows);
            setLineEdit();
        }
    };

    const COLUMNS_DEFINITIONS = useMemo(() => {
        return [
            {
                label: intl.formatMessage({ id: 'Tap' }).toUpperCase(),
                id: 'tap',
                dataKey: 'tap',
                numeric: true,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaResistance' })
                    .toUpperCase(),
                id: 'resistance',
                dataKey: 'resistance',
                numeric: true,
                editor: NumericalField,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaReactance' })
                    .toUpperCase(),
                id: 'reactance',
                dataKey: 'reactance',
                numeric: true,
                editor: NumericalField,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaConductance' })
                    .toUpperCase(),
                id: 'conductance',
                dataKey: 'conductance',
                numeric: true,
                editor: NumericalField,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaSusceptance' })
                    .toUpperCase(),
                id: 'susceptance',
                dataKey: 'susceptance',
                numeric: true,
                editor: NumericalField,
            },
            {
                label: intl.formatMessage({ id: 'Ratio' }).toUpperCase(),
                id: 'ratio',
                dataKey: 'ratio',
                numeric: true,
                fractionDigits: 5,
            },
        ];
    });

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
                            console.log(rowData.rowIndex);
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

    const handleEditCell = useCallback(
        (rowData, newVal) => {
            const parsedVal = parseInt(newVal, 10);

            if (!isNaN(parsedVal) && parsedVal >= 0 && parsedVal <= 100) {
                let tempRows = ratioTapRows;
                const column = rowData.dataKey;
                tempRows[rowData.rowIndex][column] = parsedVal;
                tempRows[rowData.rowIndex].isEdited = true;
                handleRatioTapRows(tempRows);
            }
        },
        [handleRatioTapRows, ratioTapRows]
    );

    const editableCellRender = useCallback(
        (rowData) => {
            if (isLineOnEditMode(rowData)) {
                const index = rowData.columnIndex - 1;
                const Editor = COLUMNS_DEFINITIONS[index].editor;
                if (Editor) {
                    return (
                        <div className={classes.tableCell}>
                            <Editor
                                key={rowData.dataKey + index}
                                columnDefinition={COLUMNS_DEFINITIONS[index]}
                                defaultValue={rowData.cellData}
                                setColumnError={(k) => setColumnInError(k)}
                                resetColumnError={(k) => resetColumnInError(k)}
                                setter={(val) => handleEditCell(rowData, val)}
                            />
                        </div>
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

    const handleImportRatioTapRows = (rows) => {
        let tapValues = Object.values(
            rows.map((row) => {
                return parseInt(row.tap, 10);
            })
        );
        let tempLowTapPosition = Math.min(...tapValues);
        let tempHighTapPosition = Math.max(...tapValues);

        setFormValues({
            ...formValues,
            lowTapPosition: tempLowTapPosition,
            highTapPosition: tempHighTapPosition,
        });
        handleRatioTapRows(rows);
    };

    const handleCreateRatioTapRule = (lowTapRatio, highTapRatio) => {
        let tempRows = ratioTapRows;

        if (tempRows.length > 1) {
            let ratioInterval =
                (highTapRatio - lowTapRatio) / (tempRows.length - 1);
            let currentRatio = lowTapRatio;

            tempRows.forEach((row, index) => {
                tempRows[index].ratio = currentRatio;
                currentRatio += ratioInterval;
            });
            handleRatioTapRows(tempRows);
        }
    };

    return (
        <>
            <Grid container spacing={2}>
                <Grid item container spacing={2}>
                    <Grid item xs={4}>
                        {ratioTapChangerEnabledField}
                    </Grid>
                </Grid>
                <Grid item container spacing={2}>
                    <Grid item xs={4}>
                        {loadTapChangingCapabilitiesField}
                    </Grid>
                </Grid>

                <Grid item container spacing={2}>
                    <Grid item xs={4}>
                        {regulatingField}
                    </Grid>

                    <Grid item xs={4}>
                        {targetVoltage1Field}
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
                        <FormattedMessage id="TerminalRef" disabled={true} />
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
                            rows={ratioTapRows}
                            columns={generateTableColumns()}
                        />
                    </Grid>
                    <Grid container item spacing={2} xs direction={'column'}>
                        <Grid item className={classes.center}>
                            <Button
                                variant="contained"
                                onClick={() => generateTapRows()}
                                disabled={
                                    !ratioTapChangerEnabled ||
                                    !(lowTapPosition && highTapPosition)
                                }
                            >
                                <FormattedMessage id="GenerateTapRows" />
                            </Button>
                        </Grid>
                        <Grid item className={classes.center}>
                            <Button
                                variant="contained"
                                onClick={() =>
                                    setOpenCreateRegulationRule(true)
                                }
                                disabled={
                                    !ratioTapChangerEnabled ||
                                    ratioTapRows.length === 0
                                }
                            >
                                <FormattedMessage id="CreateRegulationRule" />
                            </Button>
                        </Grid>
                        <Grid item className={classes.center}>
                            <Button
                                variant="contained"
                                onClick={() =>
                                    setOpenImportRegulationRule(true)
                                }
                                disabled={!ratioTapChangerEnabled}
                            >
                                <FormattedMessage id="ImportRegulationRule" />
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <CreateRuleDialog
                ruleType={RATIO_TAP}
                setOpenCreateRuleDialog={setOpenCreateRegulationRule}
                openCreateRuleDialog={openCreateRegulationRule}
                handleCreateTapRule={handleCreateRatioTapRule}
            />

            <ImportRegulationRuleDialog
                setOpenImportRegulationRule={setOpenImportRegulationRule}
                openImportRegulationRule={openImportRegulationRule}
                handleImportRatioTapRows={handleImportRatioTapRows}
            />
        </>
    );
};

export default RatioTapChangerPane;
