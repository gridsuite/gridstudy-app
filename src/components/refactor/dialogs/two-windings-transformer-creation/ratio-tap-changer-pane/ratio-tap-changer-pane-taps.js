import { Button, Grid, useScrollTrigger } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useCallback, useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import VirtualizedTable from '../../../../util/virtualized-table';
import IntegerInput from '../../../rhf-inputs/integer-input';
import { TableNumericalInput } from '../../../rhf-inputs/table-inputs/table-numerical-input';
import {
    HIGH_TAP_POSITION,
    LOW_TAP_POSITION,
    RATIO_TAP_CHANGER,
    STEPS,
    TAP_POSITION,
} from '../two-windings-transformer-creation-dialog';

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
    const { trigger, getFieldState } = useFormContext();
    const {
        fields: ratioTapFields,
        append,
        prepend,
        remove,
    } = useFieldArray({
        name: `${RATIO_TAP_CHANGER}.${STEPS}`,
    });

    const lowTapPositionWatcher = useWatch({
        name: `${RATIO_TAP_CHANGER}.${LOW_TAP_POSITION}`,
    });

    const highTapPositionWatcher = useWatch({
        name: `${RATIO_TAP_CHANGER}.${HIGH_TAP_POSITION}`,
    });

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
                editor: TableNumericalInput,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaReactance' })
                    .toUpperCase(),
                id: 'reactance',
                dataKey: 'reactance',
                numeric: true,
                editor: TableNumericalInput,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaConductance' })
                    .toUpperCase(),
                id: 'conductance',
                dataKey: 'conductance',
                numeric: true,
                editor: TableNumericalInput,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaSusceptance' })
                    .toUpperCase(),
                id: 'susceptance',
                dataKey: 'susceptance',
                numeric: true,
                editor: TableNumericalInput,
            },
            {
                label: intl.formatMessage({ id: 'Ratio' }).toUpperCase(),
                id: 'ratio',
                dataKey: 'ratio',
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
        (rowData) => {
            const index = rowData.columnIndex;
            const Editor = COLUMNS_DEFINITIONS[index].editor;
            if (Editor) {
                let style;
                // if (
                //     ratioCellIndexError === rowData.rowIndex &&
                //     COLUMNS_DEFINITIONS[index].id === 'ratio'
                // ) {
                //     style = {
                //         color: 'red',
                //     };
                // }
                return (
                    <div className={classes.tableCell}>
                        <Editor
                            key={rowData.dataKey + index}
                            name={`${RATIO_TAP_CHANGER}.${STEPS}[${rowData.rowIndex}].${rowData.dataKey}`}
                            columnDefinition={COLUMNS_DEFINITIONS[index]}
                            defaultValue={rowData.cellData}
                            // setColumnError={(k) => setColumnInError(k)}
                            // resetColumnError={(k) => resetColumnInError(k)}
                            // setter={(val) => handleEditCell(rowData, val)}
                            inputProps={{ style }}
                        />
                    </div>
                );
            }
            return defaultCellRender(rowData);
        },
        [
            COLUMNS_DEFINITIONS,
            classes.tableCell,
            defaultCellRender,
            //handleEditCell,
            //resetColumnInError,
            // setColumnInError,
            // ratioCellIndexError,
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

    // const generateNewTapData = (index) => {
    //     return {
    //         key: index,
    //         tap: index,
    //         resistance: 0,
    //         reactance: 0,
    //         conductance: 0,
    //         susceptance: 0,
    //         ratio: 1,
    //         isEdited: false,
    //     };
    // };

    const generateTapRows = () => {
        trigger(`${RATIO_TAP_CHANGER}.${LOW_TAP_POSITION}`);
        trigger(`${RATIO_TAP_CHANGER}.${HIGH_TAP_POSITION}`);

        const { error: lowTapPositionError } = getFieldState(
            `${RATIO_TAP_CHANGER}.${LOW_TAP_POSITION}`
        );
        const { error: highTapPositionError } = getFieldState(
            `${RATIO_TAP_CHANGER}.${HIGH_TAP_POSITION}`
        );

        if (!lowTapPositionError && !highTapPositionError) {
            console.log('FIELDS', ratioTapFields);
        }
    };

    // const generateTapRows = () => {
    //     if (highTapPosition - lowTapPosition + 1 > MAX_TAP_NUMBER) {
    //         setRatioError(
    //             intl.formatMessage(
    //                 { id: 'TapPositionValueError' },
    //                 { value: MAX_TAP_NUMBER }
    //             )
    //         );
    //         return;
    //     }
    //     let tempRows = [];
    //     const rowNumber =
    //         highTapPosition - lowTapPosition > 0
    //             ? highTapPosition - lowTapPosition + 1
    //             : 0;

    //     if (
    //         ratioTapRows.length !== rowNumber &&
    //         !isNaN(parseInt(lowTapPosition)) &&
    //         !isNaN(parseInt(highTapPosition))
    //     ) {
    //         for (let i = lowTapPosition; i <= highTapPosition; i++) {
    //             tempRows.push(generateNewTapData(i));
    //         }
    //         let editedRows = Array.from(
    //             ratioTapRows.filter((row) => row.isEdited)
    //         );

    //         editedRows.forEach((row) => {
    //             let editedRowIndex = ratioTapRows.indexOf(row);
    //             if (
    //                 tempRows.length > editedRowIndex &&
    //                 parseInt(row.tap) === tempRows[editedRowIndex].tap
    //             ) {
    //                 tempRows[editedRowIndex] = row;
    //             }
    //         });
    //         handleRatioTapRows(tempRows);
    //         setLineEdit();
    //     }
    // };

    // const generateTableKey = () => {
    //     // We generate a unique key for the table because when we change alpha value by creating a new rule for example,
    //     // the table does not update only by scrolling. With this key we make sure it is updated when creating a new rule
    //     return (
    //         '' +
    //         ratioTapRows[0]?.ratio +
    //         ratioTapRows[ratioTapRows.length - 1]?.ratio
    //     );
    // };

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
                    <VirtualizedTable
                        rows={ratioTapFields}
                        columns={generateTableColumns()}
                        //key={generateTableKey()}
                    />
                </Grid>
                <Grid container item spacing={2} xs direction={'column'}>
                    <Grid item className={classes.center}>
                        <Button
                            variant="contained"
                            onClick={() => generateTapRows()}
                            disabled={
                                disabled ||
                                //!ratioTapChangerEnabled ||
                                lowTapPositionWatcher === '' ||
                                highTapPositionWatcher === ''
                            }
                        >
                            <FormattedMessage id="GenerateTapRows" />
                        </Button>
                    </Grid>
                    <Grid item className={classes.center}>
                        {/* <Button
                                variant="contained"
                                onClick={() => setOpenCreateRuleDialog(true)}
                                disabled={
                                    !ratioTapChangerEnabled ||
                                    ratioTapRows.length === 0
                                }
                            >
                                <FormattedMessage id="CreateRegulationRule" />
                            </Button> */}
                    </Grid>
                    <Grid item className={classes.center}>
                        {/* <Button
                                variant="contained"
                                onClick={() => setOpenImportRuleDialog(true)}
                                disabled={!ratioTapChangerEnabled}
                            >
                                <FormattedMessage id="ImportRegulationRule" />
                            </Button> */}
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
};

export default RatioTapChangerPaneTaps;
