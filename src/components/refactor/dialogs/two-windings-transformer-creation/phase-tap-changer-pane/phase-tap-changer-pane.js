import { Grid } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import BooleanInput from '../../../rhf-inputs/boolean-input';
import {
    ENABLED,
    REGULATING,
    TARGET_DEADBAND,
} from '../two-windings-transformer-creation-dialog-utils';
import { useWatch } from 'react-hook-form';
import FloatInput from '../../../rhf-inputs/float-input';
import {
    ActivePowerAdornment,
    AmpereAdornment,
    gridItem,
} from '../../../../dialogs/dialogUtils';
import RegulatingTerminalForm from '../../regulating-terminal/regulating-terminal-form';
import { EQUIPMENT_TYPE } from '@gridsuite/commons-ui';
import SelectInput from '../../../rhf-inputs/select-input';
import { REGULATION_MODES } from '../../../../network/constants';
import PhaseTapChangerPaneTaps from './phase-tap-changer-pane-taps';
import {
    CURRENT_LIMITER_REGULATING_VALUE,
    FLOW_SET_POINT_REGULATING_VALUE,
    PHASE_TAP_CHANGER,
    REGULATION_MODE,
} from './phase-tap-changer-pane-utils';

const PhaseTapChangerPane = ({
    voltageLevelOptionsPromise,
    voltageLevelsEquipmentsOptionsPromise,
}) => {
    const phaseTapChangerEnabledWatch = useWatch({
        name: `${PHASE_TAP_CHANGER}.${ENABLED}`,
    });

    const regulationModeWatch = useWatch({
        name: `${PHASE_TAP_CHANGER}.${REGULATION_MODE}`,
    });

    const regulatingWatch = useWatch({
        name: `${PHASE_TAP_CHANGER}.${REGULATING}`,
    });

    const phaseTapChangerEnabledField = (
        <BooleanInput
            name={`${PHASE_TAP_CHANGER}.${ENABLED}`}
            label="ConfigurePhaseTapChanger"
        />
    );

    const regulationModeField = (
        <SelectInput
            name={`${PHASE_TAP_CHANGER}.${REGULATION_MODE}`}
            label={'RegulationMode'}
            options={Object.values(REGULATION_MODES)}
            disabled={!phaseTapChangerEnabledWatch}
        />
    );

    const regulatingField = (
        <BooleanInput
            name={`${PHASE_TAP_CHANGER}.${REGULATING}`}
            label="Regulating"
            formProps={{
                disabled:
                    !(
                        regulationModeWatch ===
                            REGULATION_MODES.CURRENT_LIMITER.id ||
                        regulationModeWatch ===
                            REGULATION_MODES.ACTIVE_POWER_CONTROL.id
                    ) || !phaseTapChangerEnabledWatch,
            }}
        />
    );

    const currentLimiterRegulatingValueField = (
        <FloatInput
            name={`${PHASE_TAP_CHANGER}.${CURRENT_LIMITER_REGULATING_VALUE}`}
            label="RegulatingValueCurrentLimiter"
            disabled={!regulatingWatch && !phaseTapChangerEnabledWatch}
            adornment={AmpereAdornment}
        />
    );

    const flowSetPointRegulatingValueField = (
        <FloatInput
            name={`${PHASE_TAP_CHANGER}.${FLOW_SET_POINT_REGULATING_VALUE}`}
            label="RegulatingValueActivePowerControl"
            adornment={ActivePowerAdornment}
        />
    );

    const targetDeadbandField = (
        <FloatInput
            name={`${PHASE_TAP_CHANGER}.${TARGET_DEADBAND}`}
            label="Deadband"
            adornment={ActivePowerAdornment}
            formProps={{
                disabled: !regulatingWatch || !phaseTapChangerEnabledWatch,
            }}
        />
    );

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={PHASE_TAP_CHANGER}
            voltageLevelOptionsPromise={voltageLevelOptionsPromise}
            voltageLevelsEquipmentsOptionsPromise={
                voltageLevelsEquipmentsOptionsPromise
            }
            equipmentSectionTypeDefaultValue={
                EQUIPMENT_TYPE.TWO_WINDINGS_TRANSFORMER.name
            }
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
                    {regulationModeWatch !== REGULATION_MODES.FIXED_TAP.id && (
                        <Grid item xs={4}>
                            {regulationModeWatch !==
                                REGULATION_MODES.ACTIVE_POWER_CONTROL.id &&
                                currentLimiterRegulatingValueField}
                            {regulationModeWatch ===
                                REGULATION_MODES.ACTIVE_POWER_CONTROL.id &&
                                flowSetPointRegulatingValueField}
                        </Grid>
                    )}

                    {regulationModeWatch !== REGULATION_MODES.FIXED_TAP.id && (
                        <Grid item xs={4}>
                            {targetDeadbandField}
                        </Grid>
                    )}
                </Grid>
                {regulationModeWatch !== REGULATION_MODES.FIXED_TAP.id && (
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
                <PhaseTapChangerPaneTaps />
                {/* {ratioError && (
                    <Grid item xs={12}>
                        <Alert severity="error">{ratioError}</Alert>
                    </Grid>
                )} */}
            </Grid>
        </>
    );
};

export default PhaseTapChangerPane;
