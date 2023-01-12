import VirtualizedTable from '../../../../util/virtualized-table';
import { Button, Grid } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
// import { gridItem } from '../dialogUtils';
// import { NumericalField } from '../../network/equipment-table-editors';
import Papa from 'papaparse';
import makeStyles from '@mui/styles/makeStyles';
// import {
//     MAX_TAP_NUMBER,
//     RATIO_TAP,
// } from './two-windings-transformer-creation-dialog';
// import { CreateRuleDialog } from './create-rule-dialog';
// import { ImportRuleDialog } from './import-rule-dialog';
import Alert from '@mui/material/Alert';
import BooleanInput from '../../../rhf-inputs/boolean-input';
import {
    HIGH_TAP_POSITION,
    LOW_TAP_POSITION,
    RATIO_TAP_CHANGER,
    RATIO_TAP_CHANGER_ENABLED,
    RATIO_TAP_LOAD_TAP_CHANGING_CAPABILITIES,
    REGULATING,
    STEPS,
    TAP_POSITION,
    TARGET_DEADBAND,
    TARGET_V,
} from '../two-windings-transformer-creation-dialog';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import FloatInput from '../../../rhf-inputs/float-input';
import { gridItem, VoltageAdornment } from '../../../../dialogs/dialogUtils';
import RegulatingTerminalForm from '../../regulating-terminal/regulating-terminal-form';
import { EQUIPMENT_TYPE } from '@gridsuite/commons-ui';
import IntegerInput from '../../../rhf-inputs/integer-input';
import { TableNumericalInput } from '../../../rhf-inputs/table-inputs/table-numerical-input';
import RatioTapChangerPaneTaps from './ratio-tap-changer-pane-taps';

const useStyles = makeStyles((theme) => ({
    center: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}));

const RatioTapChangerPane = (props) => {
    const {
        // formValues,
        // setFormValues,
        ratioTapRows = [],
        // handleRatioTapRows,
        // ratioTapChangerEnabled,
        // ratioTapChangerEnabledField,
        // targetVoltage1Field,
        // targetDeadbandField,
        // regulatingTerminalField,
        // lowTapPositionField,
        // lowTapPosition,
        // highTapPositionField,
        // highTapPosition,
        // tapPositionField,
        // loadTapChangingCapabilitiesField,
        // ratioTapLoadTapChangingCapabilities,
        // regulatingField,
        // ratioCellIndexError,
    } = props;

    const classes = useStyles();

    const ratioTapChangerEnabledWatcher = useWatch({
        name: `${RATIO_TAP_CHANGER}.${RATIO_TAP_CHANGER_ENABLED}`,
    });

    const ratioTapLoadTapChangingCapabilitiesWatcher = useWatch({
        name: `${RATIO_TAP_CHANGER}.${RATIO_TAP_LOAD_TAP_CHANGING_CAPABILITIES}`,
    });

    const regulatingWatch = useWatch({
        name: `${RATIO_TAP_CHANGER}.${REGULATING}`,
    });

    const intl = useIntl();

    const [lineEdit, setLineEdit] = useState(undefined);

    const [openCreateRuleDialog, setOpenCreateRuleDialog] = useState(false);

    const [openImportRuleDialog, setOpenImportRuleDialog] = useState(false);
    const [ratioError, setRatioError] = useState('');

    // const setColumnInError = useCallback(
    //     (dataKey) => {
    //         if (!lineEdit?.errors.has(dataKey)) {
    //             let newLineEdit = { ...lineEdit };
    //             newLineEdit.errors.set(dataKey, true);
    //             setLineEdit(newLineEdit);
    //         }
    //     },
    //     [lineEdit]
    // );

    // const resetColumnInError = useCallback(
    //     (dataKey) => {
    //         if (lineEdit?.errors.has(dataKey)) {
    //             let newLineEdit = { ...lineEdit };
    //             newLineEdit.errors.delete(dataKey);
    //             setLineEdit(newLineEdit);
    //         }
    //     },
    //     [lineEdit]
    // );

    // const handleEditCell = useCallback(
    //     (rowData, newVal) => {
    //         setLineEdit({
    //             oldValues: {},
    //             newValues: {},
    //             id: rowData.rowIndex,
    //             errors: new Map(),
    //         });
    //         const parsedVal = parseFloat(newVal);

    //         if (
    //             !isNaN(parsedVal) &&
    //             parsedVal >= 0 &&
    //             parsedVal <= MAX_TAP_NUMBER
    //         ) {
    //             let tempRows = ratioTapRows;
    //             const column = rowData.dataKey;
    //             tempRows[rowData.rowIndex][column] = parsedVal;
    //             tempRows[rowData.rowIndex].isEdited = true;
    //             handleRatioTapRows(tempRows);
    //         }
    //     },
    //     [handleRatioTapRows, ratioTapRows]
    // );

    // const getCSVColumns = () => {
    //     return [
    //         intl.formatMessage({ id: 'Tap' }),
    //         intl.formatMessage({ id: 'ImportFileResistance' }),
    //         intl.formatMessage({ id: 'ImportFileReactance' }),
    //         intl.formatMessage({ id: 'ImportFileConductance' }),
    //         intl.formatMessage({ id: 'ImportFileSusceptance' }),
    //         intl.formatMessage({ id: 'Ratio' }),
    //     ];
    // };

    // const parseIntData = (data, defaultValue) => {
    //     const intValue = parseInt(data);
    //     return isNaN(intValue) ? defaultValue : intValue;
    // };

    // const handleImportTapRule = (selectedFile, setFileParseError) => {
    //     Papa.parse(selectedFile, {
    //         header: true,
    //         skipEmptyLines: true,
    //         complete: function (results) {
    //             if (results.data.length > MAX_TAP_NUMBER) {
    //                 setFileParseError(
    //                     intl.formatMessage(
    //                         { id: 'TapPositionValueError' },
    //                         { value: MAX_TAP_NUMBER }
    //                     )
    //                 );
    //                 return;
    //             }
    //             let rows = results.data.map((val) => {
    //                 return {
    //                     key: results.data.indexOf(val),
    //                     tap: val[intl.formatMessage({ id: 'Tap' })],
    //                     resistance: parseIntData(
    //                         val[
    //                             intl.formatMessage({
    //                                 id: 'ImportFileResistance',
    //                             })
    //                         ],
    //                         0
    //                     ),
    //                     reactance: parseIntData(
    //                         val[
    //                             intl.formatMessage({
    //                                 id: 'ImportFileReactance',
    //                             })
    //                         ],
    //                         0
    //                     ),
    //                     conductance: parseIntData(
    //                         val[
    //                             intl.formatMessage({
    //                                 id: 'ImportFileConductance',
    //                             })
    //                         ],
    //                         0
    //                     ),
    //                     susceptance: parseIntData(
    //                         val[
    //                             intl.formatMessage({
    //                                 id: 'ImportFileSusceptance',
    //                             })
    //                         ],
    //                         0
    //                     ),
    //                     ratio: isNaN(
    //                         parseFloat(val[intl.formatMessage({ id: 'Ratio' })])
    //                     )
    //                         ? 1
    //                         : parseFloat(
    //                               val[intl.formatMessage({ id: 'Ratio' })]
    //                           ),
    //                     isEdited: true,
    //                 };
    //             });
    //             if (rows && rows.length > 0) {
    //                 let tapValues = rows.map((row) => {
    //                     return parseInt(row.tap);
    //                 });
    //                 let tempLowTapPosition = Math.min(...tapValues);
    //                 let tempHighTapPosition = Math.max(...tapValues);

    //                 setFormValues({
    //                     ...formValues,
    //                     ratioTapChanger: {
    //                         ...formValues.ratioTapChanger,
    //                         lowTapPosition: tempLowTapPosition,
    //                         highTapPosition: tempHighTapPosition,
    //                     },
    //                 });
    //                 handleRatioTapRows(rows);
    //             }
    //         },
    //     });
    // };

    // const handleCreateRatioTapRule = (lowTapRatio, highTapRatio) => {
    //     let tempRows = ratioTapRows;

    //     if (tempRows.length > 1) {
    //         let ratioInterval =
    //             (highTapRatio - lowTapRatio) / (tempRows.length - 1);
    //         let currentRatio = lowTapRatio;

    //         tempRows.forEach((row, index) => {
    //             tempRows[index].ratio = currentRatio;

    //             // When creating a new rule, the index does not change because we keep the same number of rows.
    //             // We set the key to currentRatio because it is unique, and we can't have duplicate
    //             tempRows[index].key = currentRatio;
    //             currentRatio += ratioInterval;
    //         });
    //         handleRatioTapRows(tempRows);
    //     }
    // };

    const ratioTapChangerEnabledField = (
        <BooleanInput
            name={`${RATIO_TAP_CHANGER}.${RATIO_TAP_CHANGER_ENABLED}`}
            label="ConfigureRatioTapChanger"
        />
    );

    const ratioTapLoadTapChangingCapabilitiesField = (
        <BooleanInput
            name={`${RATIO_TAP_CHANGER}.${RATIO_TAP_LOAD_TAP_CHANGING_CAPABILITIES}`}
            label="OnLoad"
            formProps={{
                disabled: !ratioTapChangerEnabledWatcher,
            }}
        />
    );

    const regulatingField = (
        <BooleanInput
            name={`${RATIO_TAP_CHANGER}.${REGULATING}`}
            label="VoltageRegulation"
            formProps={{
                disabled:
                    !ratioTapChangerEnabledWatcher ||
                    !ratioTapLoadTapChangingCapabilitiesWatcher,
            }}
        />
    );

    const targetVoltage1Field = (
        <FloatInput
            name={`${RATIO_TAP_CHANGER}.${TARGET_V}`}
            label="TargetVoltage"
            adornment={VoltageAdornment}
            formProps={{
                disabled: !regulatingWatch || !ratioTapChangerEnabledWatcher,
            }}
        />
    );

    const targetDeadbandField = (
        <FloatInput
            name={`${RATIO_TAP_CHANGER}.${TARGET_DEADBAND}`}
            label="Deadband"
            adornment={VoltageAdornment}
            formProps={{
                disabled: !regulatingWatch || !ratioTapChangerEnabledWatcher,
            }}
        />
    );

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            equipmentSectionTypeDefaultValue={
                EQUIPMENT_TYPE.TWO_WINDINGS_TRANSFORMER.name
            }
        />
    );

    const lowTapPositionField = (
        <IntegerInput
            name={`${RATIO_TAP_CHANGER}.${LOW_TAP_POSITION}`}
            label="LowTapPosition"
            formProps={{
                disabled: !ratioTapChangerEnabledWatcher,
            }}
        />
    );

    const highTapPositionField = (
        <IntegerInput
            name={`${RATIO_TAP_CHANGER}.${HIGH_TAP_POSITION}`}
            label="HighTapPosition"
            formProps={{
                disabled: !ratioTapChangerEnabledWatcher,
            }}
        />
    );

    const tapPositionField = (
        <IntegerInput
            name={`${RATIO_TAP_CHANGER}.${TAP_POSITION}`}
            label="TapPosition"
            formProps={{
                disabled: !ratioTapChangerEnabledWatcher,
            }}
        />
    );

    // const [ratioLowTapPosition, ratioLowTapPositionField] = useIntegerValue({
    //     validation: {
    //         isFieldRequired: ratioTapChangerEnabled,
    //     },
    // });

    // const [ratioHighTapPosition, ratioHighTapPositionField] = useIntegerValue({
    //     validation: {
    //         isFieldRequired: ratioTapChangerEnabled && !editData && !isCopy,
    //         valueLessThanOrEqualTo: MAX_TAP_NUMBER,
    //         valueGreaterThanOrEqualTo: ratioLowTapPosition,
    //         errorMsgId: 'HighTapPositionError',
    //     },
    //     defaultValue:
    //         (isCopy || editData) && computeHighTapPosition(ratioTapRows),
    // });

    // const [ratioTapPosition, ratioTapPositionField] = useIntegerValue({
    //     validation: {
    //         isFieldRequired: ratioTapChangerEnabled,
    //         valueGreaterThanOrEqualTo: ratioLowTapPosition,
    //         valueLessThanOrEqualTo: ratioHighTapPosition
    //             ? ratioHighTapPosition
    //             : computeHighTapPosition(ratioTapRows),
    //         errorMsgId: 'TapPositionBetweenLowAndHighTapPositionValue',
    //     },
    // });

    // const [targetVoltage, targetVoltage1Field] = useDoubleValue({
    //     label: 'TargetVoltage',
    //     id: 'TargetVoltage',
    //     formProps: {
    //         disabled: !ratioTapRegulating || !ratioTapChangerEnabled,
    //     },
    //     validation: {
    //         isFieldRequired: ratioTapRegulating && ratioTapChangerEnabled,
    //         valueGreaterThan: '0',
    //         errorMsgId: 'TargetVoltageGreaterThanZero',
    //     },
    //     adornment: VoltageAdornment,
    //     inputForm: ratioTapInputForm,
    //     defaultValue: formValues?.ratioTapChanger?.targetV,
    // });

    // const [ratioTapTargetDeadband, ratioTapTargetDeadbandField] =
    //     useDoubleValue({
    //         label: 'Deadband',
    //         id: 'TargetDeadband',
    //         formProps: {
    //             disabled: !ratioTapRegulating || !ratioTapChangerEnabled,
    //         },
    //         validation: {
    //             isFieldRequired: false,
    //             valueGreaterThan: '0',
    //             errorMsgId: 'TargetDeadbandGreaterThanZero',
    //         },
    //         adornment: VoltageAdornment,
    //         inputForm: ratioTapInputForm,
    //         defaultValue:
    //             formValues?.ratioTapChanger?.targetDeadband &&
    //             formValues.ratioTapChanger.targetDeadband !== '0'
    //                 ? formValues.ratioTapChanger.targetDeadband
    //                 : '',
    //     });

    // const [ratioTapRegulatingTerminal, ratioTapRegulatingTerminalField] =
    //     useRegulatingTerminalValue({
    //         label: 'RegulatingTerminalGenerator',
    //         inputForm: ratioTapInputForm,
    //         disabled: !ratioTapRegulating || !ratioTapChangerEnabled,
    //         voltageLevelOptionsPromise: voltageLevelsEquipmentsOptionsPromise,
    //         voltageLevelIdDefaultValue:
    //             formValues?.ratioTapChanger?.regulatingTerminalVlId ?? '',
    //         equipmentSectionTypeDefaultValue:
    //             formValues?.ratioTapChanger?.regulatingTerminalType ??
    //             EQUIPMENT_TYPE.TWO_WINDINGS_TRANSFORMER.name,
    //         equipmentSectionIdDefaultValue:
    //             formValues?.ratioTapChanger?.regulatingTerminalId ?? '',
    //     });

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
                        {ratioTapLoadTapChangingCapabilitiesField}
                    </Grid>
                </Grid>
                <Grid item container spacing={2}>
                    <Grid item xs={4}>
                        {regulatingField}
                    </Grid>

                    {ratioTapLoadTapChangingCapabilitiesWatcher && (
                        <Grid item xs={4}>
                            {targetVoltage1Field}
                        </Grid>
                    )}
                    {ratioTapLoadTapChangingCapabilitiesWatcher && (
                        <Grid item xs={4}>
                            {targetDeadbandField}
                        </Grid>
                    )}
                </Grid>
                {ratioTapLoadTapChangingCapabilitiesWatcher && (
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
                            <FormattedMessage
                                id="TerminalRef"
                                disabled={true}
                            />
                        </Grid>

                        {gridItem(regulatingTerminalField, 8)}
                    </Grid>
                )}

                <RatioTapChangerPaneTaps />
                {/* {ratioError && (
                    <Grid item xs={12}>
                        <Alert severity="error">{ratioError}</Alert>
                    </Grid>
                )} */}
            </Grid>

            {/* <CreateRuleDialog
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
                csvColumns={getCSVColumns()}
                handleImportTapRule={handleImportTapRule}
            /> */}
        </>
    );
};

export default RatioTapChangerPane;
