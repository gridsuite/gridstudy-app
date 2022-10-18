import VirtualizedTable from '../../util/virtualized-table';
import { Button, Grid, IconButton } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { gridItem } from '../dialogUtils';
import EditIcon from '@mui/icons-material/Edit';
import { NumericalField } from '../../network/equipment-table-editors';
import Papa from 'papaparse';
import makeStyles from '@mui/styles/makeStyles';
import { RATIO_TAP } from './two-windings-transformer-creation-dialog';
import { CreateRuleDialog } from './create-rule-dialog';
import { ImportRuleDialog } from './import-rule-dialog';

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

    const [openCreateRuleDialog, setOpenCreateRuleDialog] = useState(false);

    const [openImportRuleDialog, setOpenImportRuleDialog] = useState(false);

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

    const getCSVColumns = () => {
        return [
            intl.formatMessage({ id: 'Tap' }),
            intl.formatMessage({ id: 'ImportFileResistance' }),
            intl.formatMessage({ id: 'ImportFileReactance' }),
            intl.formatMessage({ id: 'ImportFileConductance' }),
            intl.formatMessage({ id: 'ImportFileSusceptance' }),
            intl.formatMessage({ id: 'Ratio' }),
        ];
    };

    const parseIntData = (data, defaultValue) => {
        return isNaN(parseInt(data), 10) ? defaultValue : parseInt(data);
    };

    const handleImportTapRule = (selectedFile) => {
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
                        isEdited: true,
                    };
                });
                let tapValues = Object.values(
                    rows.map((row) => {
                        return parseInt(row.tap, 10);
                    })
                );
                let tempLowTapPosition = Math.min(...tapValues);
                let tempHighTapPosition = Math.max(...tapValues);

                setFormValues({
                    ...formValues,
                    ratioTapChanger: {
                        ...formValues.ratioTapChanger,
                        lowTapPosition: tempLowTapPosition,
                        highTapPosition: tempHighTapPosition,
                    },
                });
                handleRatioTapRows(rows);
            },
        });
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
                                onClick={() => setOpenCreateRuleDialog(true)}
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
                                onClick={() => setOpenImportRuleDialog(true)}
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
                openCreateRuleDialog={openCreateRuleDialog}
                setOpenCreateRuleDialog={setOpenCreateRuleDialog}
                handleCreateTapRule={handleCreateRatioTapRule}
            />

            <ImportRuleDialog
                ruleType={RATIO_TAP}
                openImportRuleDialog={openImportRuleDialog}
                setOpenImportRuleDialog={setOpenImportRuleDialog}
                csvColumns={getCSVColumns()}
                handleImportTapRule={handleImportTapRule}
            />
        </>
    );
};

export default RatioTapChangerPane;
