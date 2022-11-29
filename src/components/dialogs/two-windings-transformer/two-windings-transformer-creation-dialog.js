/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Box,
    Tab,
    Tabs,
    Grid,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Alert,
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { createTwoWindingsTransformer } from '../../../utils/rest-api';
import {
    useButtonWithTooltip,
    useDoubleValue,
    useEnumValue,
    useIntegerValue,
    useRegulatingTerminalValue,
    useTextValue,
} from '../inputs/input-hooks';
import EquipmentSearchDialog from '../equipment-search-dialog';
import { useFormSearchCopy } from '../form-search-copy-hook';
import TwoWindingsTransformerPane from './two-windings-transformer-pane';
import { useInputForm } from '../inputs/input-hooks';
import RatioTapChangerPane from './ratio-tap-changer-pane';
import PhaseTapChangerPane from './phase-tap-changer-pane';
import { useConnectivityValue } from '../connectivity-edition';
import {
    ActivePowerAdornment,
    AmpereAdornment,
    filledTextField,
    MVAPowerAdornment,
    OhmAdornment,
    MicroSusceptanceAdornment,
    VoltageAdornment,
    sanitizeString,
} from '../dialogUtils';
import {
    REGULATION_MODES,
    UNDEFINED_CONNECTION_DIRECTION,
} from '../../network/constants';
import { useBooleanValue } from '../inputs/boolean';
import { EQUIPMENT_TYPE } from '@gridsuite/commons-ui';
import clsx from 'clsx';
import makeStyles from '@mui/styles/makeStyles';

export const PHASE_TAP = 'dephasing';
export const RATIO_TAP = 'ratio';

/**
 * Dialog to create a two windings transformer in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param voltageLevelOptionsPromise Promise handling list of voltage level options
 * @param currentNodeUuid the node we are currently working on
 * @param editData the data to edit
 */

const useStyles = makeStyles((theme) => ({
    tabWithError: {
        '&.Mui-selected': { color: theme.palette.error.main },
        color: theme.palette.error.main,
    },
    tabWithErrorIndicator: {
        backgroundColor: theme.palette.error.main,
    },
}));

const DialogTab = {
    CHARACTERISTICS_TAB: 0,
    RATIO_TAP_TAB: 1,
    PHASE_TAP_TAB: 2,
};

const TwoWindingsTransformerCreationDialog = ({
    editData,
    open,
    onClose,
    voltageLevelOptionsPromise,
    voltageLevelsEquipmentsOptionsPromise,
    currentNodeUuid,
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intl = useIntl();

    const classes = useStyles();

    const { snackError } = useSnackMessage();

    const characteristicsInputForm = useInputForm();
    const ratioTapInputForm = useInputForm();
    const phaseTapInputForm = useInputForm();

    const [formValues, setFormValues] = useState({});

    const [ratioTapRows, setRatioTapRows] = useState([]);

    const [phaseTapRows, setPhaseTapRows] = useState([]);

    const [dialogWidth, setDialogWidth] = useState('sm');

    const equipmentPath = '2-windings-transformers';

    const [tabIndex, setTabIndex] = useState(DialogTab.CHARACTERISTICS_TAB);

    const [tabIndexesWithError, setTabIndexesWithError] = useState([]);

    const clearValues = () => {
        setFormValues(null);
    };

    const [isCopy, setIsCopy] = useState(false);

    const [creationError, setCreationError] = useState(undefined);

    // CHARACTERISTICS TAP PANE

    const [twoWindingsTransformerId, twoWindingsTransformerIdField] =
        useTextValue({
            label: 'ID',
            validation: { isFieldRequired: true },
            inputForm: characteristicsInputForm,
            formProps: filledTextField,
            defaultValue: formValues?.equipmentId,
        });

    const [twoWindingsTransformerName, twoWindingsTransformerNameField] =
        useTextValue({
            label: 'Name',
            validation: { isFieldRequired: false },
            inputForm: characteristicsInputForm,
            formProps: filledTextField,
            defaultValue: formValues?.equipmentName,
        });

    const [seriesResistance, seriesResistanceField] = useDoubleValue({
        label: 'SeriesResistanceText',
        validation: { isFieldRequired: true },
        adornment: OhmAdornment,
        inputForm: characteristicsInputForm,
        defaultValue: formValues?.seriesResistance,
    });

    const [seriesReactance, seriesReactanceField] = useDoubleValue({
        label: 'SeriesReactanceText',
        validation: { isFieldRequired: true },
        adornment: OhmAdornment,
        inputForm: characteristicsInputForm,
        defaultValue: formValues?.seriesReactance,
    });

    const [magnetizingConductance, magnetizingConductanceField] =
        useDoubleValue({
            label: 'MagnetizingConductance',
            validation: { isFieldRequired: true },
            adornment: MicroSusceptanceAdornment,
            inputForm: characteristicsInputForm,
            defaultValue: formValues?.magnetizingConductance,
        });

    const [ratedS, ratedSField] = useDoubleValue({
        label: 'RatedNominalPowerText',
        validation: {
            isFieldRequired: false,
            isFieldNumeric: true,
            isValueGreaterThan: '0',
            errorMsgId: 'RatedNominalPowerGreaterThanZero',
        },
        adornment: MVAPowerAdornment,
        inputForm: characteristicsInputForm,
        defaultValue: formValues?.ratedS,
    });

    const [magnetizingSusceptance, magnetizingSusceptanceField] =
        useDoubleValue({
            label: 'MagnetizingSusceptance',
            validation: { isFieldRequired: true },
            adornment: MicroSusceptanceAdornment,
            inputForm: characteristicsInputForm,
            defaultValue: formValues?.magnetizingSusceptance,
        });

    const [ratedVoltage1, ratedVoltage1Field] = useDoubleValue({
        label: 'RatedVoltage',
        id: 'RatedVoltage1',
        validation: { isFieldRequired: true },
        adornment: VoltageAdornment,
        inputForm: characteristicsInputForm,
        defaultValue: formValues?.ratedVoltage1,
    });

    const [ratedVoltage2, ratedVoltage2Field] = useDoubleValue({
        label: 'RatedVoltage',
        id: 'RatedVoltage2',
        validation: { isFieldRequired: true },
        adornment: VoltageAdornment,
        inputForm: characteristicsInputForm,
        defaultValue: formValues?.ratedVoltage2,
    });

    const [permanentCurrentLimit1, permanentCurrentLimit1Field] =
        useDoubleValue({
            label: 'PermanentCurrentLimitText1',
            validation: {
                isFieldRequired: false,
                isValueGreaterThan: '0',
                errorMsgId: 'permanentCurrentLimitGreaterThanZero',
            },
            adornment: AmpereAdornment,
            inputForm: characteristicsInputForm,
            defaultValue: formValues?.currentLimits1?.permanentLimit,
        });

    const [permanentCurrentLimit2, permanentCurrentLimit2Field] =
        useDoubleValue({
            label: 'PermanentCurrentLimitText2',
            validation: {
                isFieldRequired: false,
                isValueGreaterThan: '0',
                errorMsgId: 'permanentCurrentLimitGreaterThanZero',
            },
            adornment: AmpereAdornment,
            inputForm: characteristicsInputForm,
            defaultValue: formValues?.currentLimits2?.permanentLimit,
        });

    const [connectivity1, connectivity1Field] = useConnectivityValue({
        label: 'Connectivity',
        id: 'Connectivity1',
        inputForm: characteristicsInputForm,
        voltageLevelOptionsPromise: voltageLevelOptionsPromise,
        currentNodeUuid: currentNodeUuid,
        direction: 'column',
        voltageLevelIdDefaultValue: formValues?.voltageLevelId1 || null,
        busOrBusbarSectionIdDefaultValue:
            formValues?.busOrBusbarSectionId1 || null,
        connectionDirectionValue: formValues?.connectionDirection1 ?? '',
        connectionNameValue: formValues?.connectionName1,
        withPosition: true,
    });

    const [connectivity2, connectivity2Field] = useConnectivityValue({
        label: 'Connectivity',
        id: 'Connectivity2',
        inputForm: characteristicsInputForm,
        voltageLevelOptionsPromise: voltageLevelOptionsPromise,
        currentNodeUuid: currentNodeUuid,
        direction: 'column',
        voltageLevelIdDefaultValue: formValues?.voltageLevelId2 || null,
        busOrBusbarSectionIdDefaultValue:
            formValues?.busOrBusbarSectionId2 || null,
        connectionDirectionValue: formValues?.connectionDirection2 ?? '',
        connectionNameValue: formValues?.connectionName2,
        withPosition: true,
    });

    // RATIO TAP PANE

    const [ratioTapChangerEnabled, ratioTapChangerEnabledField] =
        useBooleanValue({
            label: 'ConfigureRatioTapChanger',
            validation: { isFieldRequired: true },
            inputForm: ratioTapInputForm,
            defaultValue:
                formValues?.ratioTapChanger?.tapPosition !== undefined
                    ? true
                    : false,
        });

    const [ratioTapRegulating, ratioTapRegulatingField] = useBooleanValue({
        label: 'VoltageRegulation',
        formProps: {
            disabled: !ratioTapChangerEnabled,
        },
        validation: { isFieldRequired: true },
        inputForm: ratioTapInputForm,
        defaultValue: formValues?.ratioTapChanger?.regulating ?? false,
    });

    const [
        ratioTapLoadTapChangingCapabilities,
        ratioTapLoadTapChangingCapabilitiesField,
    ] = useBooleanValue({
        label: 'OnLoad',
        formProps: {
            disabled: !ratioTapChangerEnabled,
        },
        validation: { isFieldRequired: true },
        inputForm: ratioTapInputForm,
        defaultValue:
            formValues?.ratioTapChanger?.loadTapChangingCapabilities ?? false,
    });

    const [targetVoltage, targetVoltage1Field] = useDoubleValue({
        label: 'TargetVoltage',
        id: 'TargetVoltage',
        formProps: {
            disabled: !ratioTapRegulating || !ratioTapChangerEnabled,
        },
        validation: {
            isFieldRequired: ratioTapRegulating && ratioTapChangerEnabled,
            isValueGreaterThan: '0',
            errorMsgId: 'TargetVoltageGreaterThanZero',
        },
        adornment: VoltageAdornment,
        inputForm: ratioTapInputForm,
        defaultValue: formValues?.ratioTapChanger?.targetV,
    });

    const [ratioTapTargetDeadband, ratioTapTargetDeadbandField] =
        useDoubleValue({
            label: 'Deadband',
            id: 'TargetDeadband',
            formProps: {
                disabled: !ratioTapRegulating || !ratioTapChangerEnabled,
            },
            validation: {
                isFieldRequired: false,
                isValueGreaterThan: '-1',
                errorMsgId: 'TargetDeadbandGreaterEqualThanZero',
            },
            adornment: VoltageAdornment,
            inputForm: ratioTapInputForm,
            defaultValue: formValues?.ratioTapChanger?.targetDeadband,
        });

    const [ratioTapRegulatingTerminal, ratioTapRegulatingTerminalField] =
        useRegulatingTerminalValue({
            label: 'RegulatingTerminalGenerator',
            inputForm: ratioTapInputForm,
            disabled: !ratioTapRegulating || !ratioTapChangerEnabled,
            voltageLevelOptionsPromise: voltageLevelsEquipmentsOptionsPromise,
            voltageLevelIdDefaultValue:
                formValues?.ratioTapChanger?.regulatingTerminalVlId ?? '',
            equipmentSectionTypeDefaultValue:
                formValues?.ratioTapChanger?.regulatingTerminalType ??
                EQUIPMENT_TYPE.TWO_WINDINGS_TRANSFORMER.name,
            equipmentSectionIdDefaultValue:
                formValues?.ratioTapChanger?.regulatingTerminalId ?? '',
        });

    const [ratioLowTapPosition, ratioLowTapPositionField] = useDoubleValue({
        label: 'LowTapPosition',
        validation: {
            isFieldRequired: ratioTapChangerEnabled,
        },
        inputForm: ratioTapInputForm,
        defaultValue: formValues?.ratioTapChanger?.lowTapPosition,
        formProps: {
            disabled: !ratioTapChangerEnabled,
        },
    });

    const [ratioHighTapPosition, ratioHighTapPositionField] = useDoubleValue({
        label: 'HighTapPosition',
        validation: {
            isFieldRequired: ratioTapChangerEnabled && !editData && !isCopy,
        },
        inputForm: ratioTapInputForm,
        formProps: {
            disabled: !ratioTapChangerEnabled,
        },
    });

    const [ratioTapPosition, ratioTapPositionField] = useIntegerValue({
        label: 'TapPosition',
        validation: {
            isFieldRequired: ratioTapChangerEnabled,
            isValueGreaterThan: ratioLowTapPosition - 1,
            isValueLessOrEqualTo: ratioHighTapPosition,
            errorMsgId: 'TapPositionBetweenLowAndHighTapPositionValue',
        },
        inputForm: ratioTapInputForm,
        defaultValue: formValues?.ratioTapChanger?.tapPosition,
        formProps: {
            disabled: !ratioTapChangerEnabled,
        },
    });

    // PHASE TAP PANE

    const [phaseTapChangerEnabled, phaseTapChangerEnabledField] =
        useBooleanValue({
            label: 'ConfigurePhaseTapChanger',
            validation: { isFieldRequired: true },
            inputForm: phaseTapInputForm,
            defaultValue:
                formValues?.phaseTapChanger?.tapPosition !== undefined
                    ? true
                    : false,
        });

    const [regulationMode, regulationModeField] = useEnumValue({
        label: 'RegulationMode',
        validation: { isFieldRequired: true },
        inputForm: phaseTapInputForm,
        formProps: { ...filledTextField, disabled: !phaseTapChangerEnabled },
        enumValues: Object.values(REGULATION_MODES),
        defaultValue: formValues?.phaseTapChanger?.regulationMode,
        clearable: true,
    });

    const [phaseTapRegulating, phaseTapRegulatingField] = useBooleanValue({
        label: 'Regulating',
        validation: { isFieldRequired: true },
        inputForm: phaseTapInputForm,
        formProps: {
            disabled:
                !(
                    regulationMode === REGULATION_MODES.CURRENT_LIMITER.id ||
                    regulationMode === REGULATION_MODES.ACTIVE_POWER_CONTROL.id
                ) || !phaseTapChangerEnabled,
        },
        defaultValue: formValues?.phaseTapChanger?.regulating ?? false,
    });

    const [currentLimiterRegulatingValue, currentLimiterRegulatingValueField] =
        useDoubleValue({
            label: 'RegulatingValueCurrentLimiter',
            id: 'RegulatingValueCurrentLimiter',
            formProps: {
                disabled: !phaseTapRegulating || !phaseTapChangerEnabled,
            },
            validation: {
                isFieldRequired:
                    regulationMode === REGULATION_MODES.CURRENT_LIMITER.id &&
                    phaseTapRegulating,
                isValueGreaterThan: '0',
                errorMsgId: 'TargetDeadbandGreaterEqualThanZero',
            },
            adornment: AmpereAdornment,
            inputForm: phaseTapInputForm,
            defaultValue: formValues?.phaseTapChanger?.regulationValue,
        });

    const [flowSetPointRegulatingValue, flowSetPointRegulatingValueField] =
        useDoubleValue({
            label: 'RegulatingValueActivePowerControl',
            id: 'RegulatingValueActivePowerControl',
            formProps: {
                disabled: !phaseTapRegulating || !phaseTapChangerEnabled,
            },
            validation: {
                isFieldRequired:
                    regulationMode ===
                        REGULATION_MODES.ACTIVE_POWER_CONTROL.id &&
                    phaseTapRegulating,
                isValueGreaterThan: '0',
                errorMsgId: 'TargetDeadbandGreaterEqualThanZero',
            },
            adornment: ActivePowerAdornment,
            inputForm: phaseTapInputForm,
            defaultValue: formValues?.phaseTapChanger?.regulationValue,
        });

    const [phaseTapTargetDeadband, phaseTapTargetDeadbandField] =
        useDoubleValue({
            label: 'Deadband',
            id: 'TargetDeadband',
            formProps: {
                disabled: !phaseTapRegulating || !phaseTapChangerEnabled,
            },
            validation: {
                isFieldRequired: false,
                isValueGreaterThan: '-1',
                errorMsgId: 'TargetDeadbandGreaterEqualThanZero',
            },
            adornment: ActivePowerAdornment,
            inputForm: phaseTapInputForm,
            defaultValue: formValues?.phaseTapChanger?.targetDeadband,
        });

    const [phaseTapRegulatingTerminal, phaseTapRegulatingTerminalField] =
        useRegulatingTerminalValue({
            label: 'RegulatingTerminalGenerator',
            inputForm: phaseTapInputForm,
            disabled: !phaseTapRegulating || !phaseTapChangerEnabled,
            voltageLevelOptionsPromise: voltageLevelsEquipmentsOptionsPromise,
            voltageLevelIdDefaultValue:
                formValues?.phaseTapChanger?.regulatingTerminalVlId ?? '',
            equipmentSectionTypeDefaultValue:
                formValues?.phaseTapChanger?.regulatingTerminalType ??
                EQUIPMENT_TYPE.TWO_WINDINGS_TRANSFORMER.name,
            equipmentSectionIdDefaultValue:
                formValues?.phaseTapChanger?.regulatingTerminalId ?? '',
        });

    const [phaseLowTapPosition, phaseLowTapPositionField] = useDoubleValue({
        label: 'LowTapPosition',
        validation: {
            isFieldRequired: phaseTapChangerEnabled,
        },
        inputForm: phaseTapInputForm,
        defaultValue: formValues?.phaseTapChanger?.lowTapPosition,
        formProps: { disabled: !phaseTapChangerEnabled },
    });

    const [phaseHighTapPosition, phaseHighTapPositionField] = useDoubleValue({
        label: 'HighTapPosition',
        validation: {
            isFieldRequired: phaseTapChangerEnabled && !editData && !isCopy,
        },
        inputForm: phaseTapInputForm,
        formProps: { disabled: !phaseTapChangerEnabled },
    });

    const [phaseTapPosition, phaseTapPositionField] = useDoubleValue({
        label: 'TapPosition',
        validation: {
            isFieldRequired: phaseTapChangerEnabled,
            isValueGreaterThan: phaseLowTapPosition - 1,
            isValueLessOrEqualTo: phaseHighTapPosition,
            errorMsgId: 'TapPositionBetweenLowAndHighTapPositionValue',
        },
        inputForm: phaseTapInputForm,
        defaultValue: formValues?.phaseTapChanger?.tapPosition,
        formProps: { disabled: !phaseTapChangerEnabled },
    });

    //Copy data from existing equipment to form fields
    const toFormValues = (twt) => {
        if (twt.ratioTapChanger?.steps) {
            setRatioTapRows(
                Object.values(twt.ratioTapChanger?.steps).map((step) => {
                    return {
                        key: step.index,
                        tap: step.index,
                        resistance: step.r,
                        reactance: step.x,
                        conductance: step.g,
                        susceptance: step.b,
                        ratio: step.rho,
                    };
                })
            );
        }

        if (twt.phaseTapChanger?.steps) {
            setPhaseTapRows(
                Object.values(twt.phaseTapChanger?.steps).map((step) => {
                    return {
                        key: step.index,
                        tap: step.index,
                        resistance: step.r,
                        reactance: step.x,
                        conductance: step.g,
                        susceptance: step.b,
                        ratio: step.rho,
                        alpha: step.alpha,
                    };
                })
            );
        }

        setIsCopy(true);
        return {
            equipmentId: twt.id + '(1)',
            equipmentName: twt.name ?? '',
            seriesResistance: twt.r,
            seriesReactance: twt.x,
            magnetizingConductance: twt.g,
            magnetizingSusceptance: twt.b,
            ratedVoltage1: twt.ratedU1,
            ratedVoltage2: twt.ratedU2,
            ratedS: twt.ratedS,
            voltageLevelId1: twt.voltageLevelId1,
            busOrBusbarSectionId1: null,
            voltageLevelId2: twt.voltageLevelId2,
            busOrBusbarSectionId2: null,
            currentLimits1: {
                permanentLimit: twt.permanentLimit1,
            },
            currentLimits2: {
                permanentLimit: twt.permanentLimit2,
            },
            ratioTapChanger: {
                regulating: twt.ratioTapChanger?.regulating,
                loadTapChangingCapabilities:
                    twt.ratioTapChanger?.loadTapChangingCapabilities,
                targetV: twt.ratioTapChanger?.targetV,
                targetDeadband: isNaN(twt.ratioTapChanger?.targetDeadBand)
                    ? ''
                    : twt.ratioTapChanger?.targetDeadBand,
                regulatingTerminalVlId:
                    twt.ratioTapChanger?.regulatingTerminalVlId,
                regulatingTerminalType:
                    twt.ratioTapChanger?.regulatingTerminalConnectableType,
                regulatingTerminalId:
                    twt.ratioTapChanger?.regulatingTerminalConnectableId,
                lowTapPosition: twt.ratioTapChanger?.lowTapPosition,
                tapPosition: twt.ratioTapChanger?.tapPosition,
            },
            phaseTapChanger: {
                regulationMode: twt.phaseTapChanger?.regulationMode,
                regulating: twt.phaseTapChanger?.regulating,
                loadTapChangingCapabilities:
                    twt.phaseTapChanger?.loadTapChangingCapabilities,
                regulationValue: twt.phaseTapChanger?.regulationValue,
                targetDeadband: isNaN(twt.phaseTapChanger?.targetDeadBand)
                    ? ''
                    : twt.phaseTapChanger?.targetDeadBand,
                regulatingTerminalVlId:
                    twt.phaseTapChanger?.regulatingTerminalVlId,
                regulatingTerminalType:
                    twt.phaseTapChanger?.regulatingTerminalConnectableType,
                regulatingTerminalId:
                    twt.phaseTapChanger?.regulatingTerminalConnectableId,
                lowTapPosition: twt.phaseTapChanger?.lowTapPosition,
                tapPosition: twt.phaseTapChanger?.tapPosition,
            },
            connectionDirection1: twt.connectionDirection1,
            connectionName1: twt.connectionName1,
            connectionDirection2: twt.connectionDirection2,
            connectionName2: twt.connectionName2,
        };
    };

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath,
        toFormValues,
        setFormValues,
        clearValues,
    });

    const copyEquipmentButton = useButtonWithTooltip({
        label: 'CopyFromExisting',
        handleClick: searchCopy.handleOpenSearchDialog,
    });

    useEffect(() => {
        if (editData) {
            let editedRatioTapRows = editData.ratioTapChanger?.steps?.map(
                (step) => {
                    return {
                        tap: step.index,
                        resistance: step.r,
                        reactance: step.x,
                        conductance: step.g,
                        susceptance: step.b,
                        ratio: step.rho,
                    };
                }
            );
            if (editedRatioTapRows) {
                setRatioTapRows(editedRatioTapRows);
            }

            let editedPhaseTapRows = editData.phaseTapChanger?.steps?.map(
                (step) => {
                    return {
                        tap: step.index,
                        resistance: step.r,
                        reactance: step.x,
                        conductance: step.g,
                        susceptance: step.b,
                        ratio: step.rho,
                        alpha: step.alpha,
                    };
                }
            );
            if (editedPhaseTapRows) {
                setPhaseTapRows(editedPhaseTapRows);
            }

            setFormValues(editData);
        }
    }, [editData]);

    const validateTapRows = useCallback(() => {
        setCreationError();
        let creationError = '';

        if (ratioTapChangerEnabled) {
            if (ratioTapRows.length === 0) {
                creationError = intl.formatMessage({
                    id: 'GenerateRatioTapRowsError',
                });
            } else {
                let tapValues = ratioTapRows.map((row) => {
                    return parseInt(row.tap);
                });
                let minTap = Math.min(...tapValues);

                if (minTap !== parseInt(ratioLowTapPosition)) {
                    creationError = intl.formatMessage({
                        id: 'IncoherentRatioLowTapPositionError',
                    });
                }
                if (!tapValues.includes(ratioTapPosition)) {
                    creationError = intl.formatMessage({
                        id: 'IncoherentRatioTapPositionError',
                    });
                }
            }
        }

        if (phaseTapChangerEnabled) {
            if (phaseTapRows.length === 0) {
                creationError = intl.formatMessage({
                    id: 'GeneratePhaseTapRowsError',
                });
            } else {
                let tapValues = phaseTapRows.map((row) => {
                    return parseInt(row.tap);
                });
                let minTap = Math.min(...tapValues);

                if (minTap !== parseInt(phaseLowTapPosition)) {
                    creationError = intl.formatMessage({
                        id: 'IncoherentPhaseLowTapPositionError',
                    });
                }
                if (!tapValues.includes(phaseTapPosition)) {
                    creationError = intl.formatMessage({
                        id: 'IncoherentPhaseTapPositionError',
                    });
                }
            }
        }

        if (creationError !== '') {
            setCreationError(creationError);
            return false;
        }
        return true;
    }, [
        intl,
        phaseLowTapPosition,
        phaseTapChangerEnabled,
        phaseTapPosition,
        phaseTapRows,
        ratioLowTapPosition,
        ratioTapChangerEnabled,
        ratioTapPosition,
        ratioTapRows,
    ]);

    const handleSave = () => {
        setCreationError();
        let isFormValid = true;
        let tabWithErrorList = [];
        if (!characteristicsInputForm.validate()) {
            isFormValid = false;
            tabWithErrorList.push(DialogTab.CHARACTERISTICS_TAB);
        }

        let ratioTap = undefined;
        if (ratioTapChangerEnabled && !ratioTapInputForm.validate()) {
            isFormValid = false;
            tabWithErrorList.push(DialogTab.RATIO_TAP_TAB);
        } else if (ratioTapChangerEnabled && ratioTapInputForm.validate()) {
            if (
                ratioTapRegulating &&
                (!ratioTapRegulatingTerminal?.equipmentSection ||
                    !ratioTapRegulatingTerminal?.voltageLevel)
            ) {
                setCreationError(
                    intl.formatMessage({
                        id: 'IncoherentRatioRegulatingTerminalError',
                    })
                );
                isFormValid = false;
                tabWithErrorList.push(DialogTab.RATIO_TAP_TAB);
            }

            let formatedRatioTapSteps = ratioTapRows.map((row) => {
                return {
                    index: row.tap,
                    r: row.resistance,
                    x: row.reactance,
                    g: row.conductance,
                    b: row.susceptance,
                    rho: row.ratio,
                };
            });

            ratioTap = {
                loadTapChangingCapabilities:
                    ratioTapLoadTapChangingCapabilities,
                regulating: ratioTapRegulating,
                targetV: targetVoltage,
                targetDeadband: ratioTapTargetDeadband,
                regulatingTerminalId:
                    ratioTapRegulatingTerminal?.equipmentSection?.id,
                regulatingTerminalType:
                    ratioTapRegulatingTerminal?.equipmentSection?.type ??
                    (twoWindingsTransformerId ===
                    ratioTapRegulatingTerminal?.equipmentSection?.id
                        ? EQUIPMENT_TYPE.TWO_WINDINGS_TRANSFORMER.name
                        : undefined),
                regulatingTerminalVlId:
                    ratioTapRegulatingTerminal?.voltageLevel?.id,
                tapPosition: ratioTapPosition,
                lowTapPosition: ratioLowTapPosition,
                steps: formatedRatioTapSteps,
            };
        }

        let phaseTap = undefined;
        if (phaseTapChangerEnabled && !phaseTapInputForm.validate()) {
            isFormValid = false;
            tabWithErrorList.push(DialogTab.PHASE_TAP_TAB);
        } else if (phaseTapChangerEnabled && phaseTapInputForm.validate()) {
            if (
                phaseTapRegulating &&
                (!phaseTapRegulatingTerminal?.equipmentSection ||
                    !phaseTapRegulatingTerminal?.voltageLevel)
            ) {
                setCreationError(
                    intl.formatMessage({
                        id: 'IncoherentPhaseRegulatingTerminalError',
                    })
                );
                isFormValid = false;
                tabWithErrorList.push(DialogTab.PHASE_TAP_TAB);
            }

            let formatedPhaseTapSteps = phaseTapRows.map((row) => {
                return {
                    index: row.tap,
                    r: row.resistance,
                    x: row.reactance,
                    g: row.conductance,
                    b: row.susceptance,
                    rho: row.ratio,
                    alpha: row.alpha,
                };
            });

            phaseTap = {
                regulating: phaseTapRegulating,
                regulationMode: regulationMode,
                regulationValue:
                    regulationMode === REGULATION_MODES.ACTIVE_POWER_CONTROL.id
                        ? flowSetPointRegulatingValue
                        : regulationMode === REGULATION_MODES.CURRENT_LIMITER.id
                        ? currentLimiterRegulatingValue
                        : undefined,
                targetDeadband: phaseTapTargetDeadband,
                regulatingTerminalId:
                    phaseTapRegulatingTerminal?.equipmentSection?.id,
                regulatingTerminalType:
                    phaseTapRegulatingTerminal?.equipmentSection?.type ??
                    (twoWindingsTransformerId ===
                    phaseTapRegulatingTerminal?.equipmentSection?.id
                        ? EQUIPMENT_TYPE.TWO_WINDINGS_TRANSFORMER.name
                        : undefined),
                regulatingTerminalVlId:
                    phaseTapRegulatingTerminal?.voltageLevel?.id,
                tapPosition: phaseTapPosition,
                lowTapPosition: phaseLowTapPosition,
                steps: formatedPhaseTapSteps,
            };
        }

        if (isFormValid && validateTapRows()) {
            let currentLimits1 = {
                permanentLimit: permanentCurrentLimit1,
            };

            let currentLimits2 = {
                permanentLimit: permanentCurrentLimit2,
            };

            createTwoWindingsTransformer(
                studyUuid,
                currentNodeUuid,
                twoWindingsTransformerId,
                sanitizeString(twoWindingsTransformerName),
                seriesResistance,
                seriesReactance,
                magnetizingConductance,
                magnetizingSusceptance,
                ratedS,
                ratedVoltage1,
                ratedVoltage2,
                currentLimits1,
                currentLimits2,
                connectivity1.voltageLevel.id,
                connectivity1.busOrBusbarSection.id,
                connectivity2.voltageLevel.id,
                connectivity2.busOrBusbarSection.id,
                ratioTap,
                phaseTap,
                editData ? true : false,
                editData ? editData.uuid : undefined,
                connectivity1?.connectionName?.id ?? null,
                connectivity1?.connectionDirection?.id ??
                    UNDEFINED_CONNECTION_DIRECTION,
                connectivity2?.connectionName?.id ?? null,
                connectivity2?.connectionDirection?.id ??
                    UNDEFINED_CONNECTION_DIRECTION
            ).catch((errorMessage) => {
                snackError({
                    messageTxt: errorMessage,
                    headerId: 'TwoWindingsTransformerCreationError',
                });
            });
            handleCloseAndClear();
        }

        setTabIndexesWithError(tabWithErrorList);
    };

    const handleClose = useCallback(
        (event, reason) => {
            if (reason !== 'backdropClick') {
                characteristicsInputForm.reset();
                ratioTapInputForm.reset();
                phaseTapInputForm.reset();
                onClose();
            }
        },
        [
            characteristicsInputForm,
            phaseTapInputForm,
            ratioTapInputForm,
            onClose,
        ]
    );

    const handleCloseAndClear = () => {
        clearValues();
        handleClose();
    };

    const handleRatioTapRows = (rows) => {
        setRatioTapRows(rows);
    };

    const handlePhaseTapRows = (rows) => {
        setPhaseTapRows(rows);
    };

    const getTabIndicatorClass = (index) =>
        tabIndexesWithError.includes(index)
            ? {
                  indicator: classes.tabWithErrorIndicator,
              }
            : {};

    const getTabClass = (index) =>
        clsx({
            [classes.tabWithError]: tabIndexesWithError.includes(index),
        });

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-create-two-windings-transformer"
                fullWidth={true}
                maxWidth={dialogWidth}
            >
                <DialogTitle>
                    <Grid container justifyContent={'space-between'}>
                        <Grid item xs={11}>
                            <FormattedMessage id="CreateTwoWindingsTransformer" />
                        </Grid>
                        <Grid item> {copyEquipmentButton} </Grid>
                    </Grid>
                    <Grid container>
                        <Tabs
                            value={tabIndex}
                            variant="scrollable"
                            onChange={(event, newValue) =>
                                setTabIndex(newValue)
                            }
                            classes={getTabIndicatorClass(tabIndex)}
                        >
                            <Tab
                                label={
                                    <FormattedMessage id="TwoWindingsTransformerCharacteristicsTab" />
                                }
                                className={getTabClass(
                                    DialogTab.CHARACTERISTICS_TAB
                                )}
                                onClick={() => setDialogWidth('sm')}
                            />
                            <Tab
                                onClick={() => setDialogWidth('xl')}
                                label={
                                    <FormattedMessage id="TwoWindingsTransformerRatioTapChangerTab" />
                                }
                                className={getTabClass(DialogTab.RATIO_TAP_TAB)}
                            />
                            <Tab
                                onClick={() => setDialogWidth('xl')}
                                label={
                                    <FormattedMessage id="TwoWindingsTransformerPhaseTapChangerTab" />
                                }
                                className={getTabClass(DialogTab.PHASE_TAP_TAB)}
                            />
                        </Tabs>
                    </Grid>
                </DialogTitle>

                <DialogContent>
                    <Box
                        hidden={tabIndex !== DialogTab.CHARACTERISTICS_TAB}
                        p={1}
                    >
                        <TwoWindingsTransformerPane
                            twoWindingsTransformerIdField={
                                twoWindingsTransformerIdField
                            }
                            twoWindingsTransformerNameField={
                                twoWindingsTransformerNameField
                            }
                            seriesResistanceField={seriesResistanceField}
                            seriesReactanceField={seriesReactanceField}
                            magnetizingConductanceField={
                                magnetizingConductanceField
                            }
                            ratedSField={ratedSField}
                            magnetizingSusceptanceField={
                                magnetizingSusceptanceField
                            }
                            ratedVoltage1Field={ratedVoltage1Field}
                            ratedVoltage2Field={ratedVoltage2Field}
                            permanentCurrentLimit1Field={
                                permanentCurrentLimit1Field
                            }
                            permanentCurrentLimit2Field={
                                permanentCurrentLimit2Field
                            }
                            connectivity1Field={connectivity1Field}
                            connectivity2Field={connectivity2Field}
                        />
                    </Box>

                    <Box hidden={tabIndex !== DialogTab.RATIO_TAP_TAB} p={1}>
                        <RatioTapChangerPane
                            formValues={formValues}
                            setFormValues={setFormValues}
                            loadTapChangingCapabilitiesField={
                                ratioTapLoadTapChangingCapabilitiesField
                            }
                            regulatingField={ratioTapRegulatingField}
                            handleRatioTapRows={handleRatioTapRows}
                            ratioTapChangerEnabledField={
                                ratioTapChangerEnabledField
                            }
                            ratioTapChangerEnabled={ratioTapChangerEnabled}
                            targetVoltage1Field={targetVoltage1Field}
                            targetDeadbandField={ratioTapTargetDeadbandField}
                            regulatingTerminalField={
                                ratioTapRegulatingTerminalField
                            }
                            lowTapPositionField={ratioLowTapPositionField}
                            lowTapPosition={ratioLowTapPosition}
                            highTapPositionField={ratioHighTapPositionField}
                            highTapPosition={ratioHighTapPosition}
                            tapPositionField={ratioTapPositionField}
                            ratioTapRows={ratioTapRows}
                        />
                    </Box>

                    <Box hidden={tabIndex !== DialogTab.PHASE_TAP_TAB} p={1}>
                        <PhaseTapChangerPane
                            formValues={formValues}
                            setFormValues={setFormValues}
                            phaseTapRows={phaseTapRows}
                            handlePhaseTapRows={handlePhaseTapRows}
                            phaseTapChangerEnabled={phaseTapChangerEnabled}
                            phaseTapChangerEnabledField={
                                phaseTapChangerEnabledField
                            }
                            regulationModeField={regulationModeField}
                            regulationMode={regulationMode}
                            currentLimiterRegulatingValueField={
                                currentLimiterRegulatingValueField
                            }
                            flowSetPointRegulatingValueField={
                                flowSetPointRegulatingValueField
                            }
                            targetDeadbandField={phaseTapTargetDeadbandField}
                            regulatingTerminalField={
                                phaseTapRegulatingTerminalField
                            }
                            lowTapPositionField={phaseLowTapPositionField}
                            lowTapPosition={phaseLowTapPosition}
                            highTapPositionField={phaseHighTapPositionField}
                            highTapPosition={phaseHighTapPosition}
                            tapPositionField={phaseTapPositionField}
                            regulatingField={phaseTapRegulatingField}
                        />
                    </Box>
                    {creationError && (
                        <Grid item>
                            <Alert severity="error">{creationError}</Alert>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAndClear}>
                        <FormattedMessage id="cancel" />
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={
                            !characteristicsInputForm.hasChanged &&
                            !ratioTapInputForm.hasChanged &&
                            !phaseTapInputForm.hasChanged
                        }
                    >
                        <FormattedMessage id="validate" />
                    </Button>
                </DialogActions>
            </Dialog>
            <EquipmentSearchDialog
                open={searchCopy.isDialogSearchOpen}
                onClose={searchCopy.handleCloseSearchDialog}
                equipmentType={EQUIPMENT_TYPE.TWO_WINDINGS_TRANSFORMER.name}
                onSelectionChange={searchCopy.handleSelectionChange}
                currentNodeUuid={currentNodeUuid}
            />
        </>
    );
};

TwoWindingsTransformerCreationDialog.propTypes = {
    editData: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    currentNodeUuid: PropTypes.string,
};

export default TwoWindingsTransformerCreationDialog;
