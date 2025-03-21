/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    convertInputValue,
    convertOutputValue,
    CustomFormProvider,
    FieldType,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Grid } from '@mui/material';
import {
    ADDITIONAL_PROPERTIES,
    B,
    STATE_ESTIMATION,
    BUS_OR_BUSBAR_SECTION,
    CHARACTERISTICS,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    CURRENT_LIMITER_REGULATING_VALUE,
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    ENABLED,
    EQUIPMENT,
    EQUIPMENT_NAME,
    FLOW_SET_POINT_REGULATING_VALUE,
    G,
    HIGH_TAP_POSITION,
    ID,
    LIMITS,
    LOAD_TAP_CHANGING_CAPABILITIES,
    LOW_TAP_POSITION,
    MEASUREMENT_P1,
    MEASUREMENT_P2,
    MEASUREMENT_Q1,
    MEASUREMENT_Q2,
    PERMANENT_LIMIT,
    PHASE_TAP_CHANGER,
    PHASE_TAP_CHANGER_STATUS,
    R,
    RATED_S,
    RATED_U1,
    RATED_U2,
    RATIO_TAP_CHANGER,
    RATIO_TAP_CHANGER_STATUS,
    REGULATING,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    STEPS,
    TAP_POSITION,
    TARGET_DEADBAND,
    TARGET_V,
    TEMPORARY_LIMITS,
    TO_BE_ESTIMATED,
    TYPE,
    VALIDITY,
    VALUE,
    VOLTAGE_LEVEL,
    X,
} from 'components/utils/field-constants';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { sanitizeString } from '../../../dialog-utils';
import {
    FORM_LOADING_DELAY,
    PHASE_REGULATION_MODES,
    RATIO_REGULATION_MODES,
    REGULATION_TYPES,
} from 'components/network/constants';
import yup from 'components/utils/yup-config';
import ModificationDialog from '../../../commons/modificationDialog';
import TwoWindingsTransformerModificationDialogTabs from './two-windings-transformer-modification-dialog-tabs';
import TwoWindingsTransformerCharacteristicsPane from '../characteristics-pane/two-windings-transformer-characteristics-pane';
import {
    getCharacteristicsEmptyFormData,
    getCharacteristicsFormData,
    getCharacteristicsValidationSchema,
} from '../characteristics-pane/two-windings-transformer-characteristics-pane-utils';
import { LimitsPane } from '../../../limits/limits-pane';
import {
    addModificationTypeToTemporaryLimits,
    getLimitsEmptyFormData,
    getSelectedLimitsFormData,
    getLimitsValidationSchema,
    sanitizeLimitNames,
    updateTemporaryLimits,
    completeCurrentLimitsGroupsToOnlySelected,
} from '../../../limits/limits-pane-utils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import TwoWindingsTransformerModificationDialogHeader from './two-windings-transformer-modification-dialog-header';
import {
    addSelectedFieldToRows,
    compareStepsWithPreviousValues,
    computeHighTapPosition,
    formatTemporaryLimits,
    toModificationOperation,
} from '../../../../utils/utils';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import {
    getComputedPhaseTapChangerRegulationMode,
    getComputedPreviousPhaseRegulationType,
    getPhaseTapChangerEmptyFormData,
    getPhaseTapChangerFormData,
    getPhaseTapChangerModificationValidationSchema,
} from '../tap-changer-pane/phase-tap-changer-pane/phase-tap-changer-pane-utils';
import { modifyTwoWindingsTransformer } from '../../../../../services/study/network-modifications';
import {
    getComputedPreviousRatioRegulationType,
    getRatioTapChangerEmptyFormData,
    getRatioTapChangerFormData,
    getRatioTapChangerModificationValidationSchema,
} from '../tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane-utils';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import RatioTapChangerPane from '../tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane';
import PhaseTapChangerPane from '../tap-changer-pane/phase-tap-changer-pane/phase-tap-changer-pane';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils';
import {
    emptyProperties,
    getConcatenatedProperties,
    getPropertiesFromModification,
    modificationPropertiesSchema,
    toModificationProperties,
} from '../../common/properties/property-utils';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import { BranchConnectivityForm } from '../../../connectivity/branch-connectivity-form';
import {
    createConnectivityData,
    getCon1andCon2WithPositionValidationSchema,
    getConnectivityFormData,
    getCont1Cont2WithPositionEmptyFormData,
} from '../../../connectivity/connectivity-form-utils';
import BranchActiveReactivePowerMeasurementsForm from '../../common/measurements/branch-active-reactive-power-form.tsx';
import { TwoWindingsTransformerModificationDialogTab } from '../two-windings-transformer-utils';
import { ToBeEstimatedForm } from './2wt-to-be-estimated/to-be-estimated-form.tsx';
import {
    getStateEstimationEditData,
    getStateEstimationEmptyFormData,
    getStateEstimationValidationSchema,
} from './state-estimation-form-utils';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    ...getCont1Cont2WithPositionEmptyFormData(true),
    ...getCharacteristicsEmptyFormData(),
    ...getLimitsEmptyFormData(),
    ...getStateEstimationEmptyFormData(STATE_ESTIMATION),
    ...getRatioTapChangerEmptyFormData(true),
    ...getPhaseTapChangerEmptyFormData(true),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_NAME]: yup.string(),
        ...getCon1andCon2WithPositionValidationSchema(true),
        ...getCharacteristicsValidationSchema(true),
        ...getLimitsValidationSchema(true),
        ...getStateEstimationValidationSchema(STATE_ESTIMATION),
        ...getRatioTapChangerModificationValidationSchema(),
        ...getPhaseTapChangerModificationValidationSchema(),
    })
    .concat(modificationPropertiesSchema)
    .required();

/**
 * Dialog to modify a two windings transformer in the network
 * @param studyUuid the study we are currently working on
 * @param defaultIdValue the default two windings transformer id
 * @param currentNode The node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param isUpdate check if edition form
 * @param editData the data to edit
 * @param editDataFetchStatus indicates the status of fetching EditData
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const TwoWindingsTransformerModificationDialog = ({
    studyUuid,
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the SLD
    currentNode,
    currentRootNetworkUuid,
    isUpdate,
    editData, // contains data when we try to edit an existing hypothesis from the current node's list
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState(defaultIdValue ?? null);
    const [tabIndex, setTabIndex] = useState(TwoWindingsTransformerModificationDialogTab.CONNECTIVITY_TAB);
    const [tabIndexesWithError, setTabIndexesWithError] = useState([]);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const [twtToModify, setTwtToModify] = useState(null);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const { reset, getValues, setValue } = formMethods;
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNodeUuid, currentRootNetworkUuid);

    const computeRatioTapChangerRegulationMode = (ratioTapChangerFormValues) => {
        if (ratioTapChangerFormValues?.[REGULATING]?.value == null) {
            return null;
        }
        if (ratioTapChangerFormValues?.[REGULATING]?.value) {
            return RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id;
        } else {
            return RATIO_REGULATION_MODES.FIXED_RATIO.id;
        }
    };

    const fromEditDataToFormValues = useCallback(
        (twtModification) => {
            if (twtModification?.equipmentId) {
                setSelectedId(twtModification.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: twtModification.equipmentName?.value,
                [CONNECTIVITY]: {
                    ...getConnectivityFormData(createConnectivityData(twtModification, 1), CONNECTIVITY_1),
                    ...getConnectivityFormData(createConnectivityData(twtModification, 2), CONNECTIVITY_2),
                },
                ...getCharacteristicsFormData({
                    r: twtModification.r?.value,
                    x: twtModification.x?.value,
                    g: convertInputValue(FieldType.G, twtModification.g?.value),
                    b: convertInputValue(FieldType.B, twtModification.b?.value),
                    ratedU1: twtModification.ratedU1?.value,
                    ratedU2: twtModification.ratedU2?.value,
                    ratedS: twtModification.ratedS?.value,
                }),
                ...getStateEstimationEditData(STATE_ESTIMATION, twtModification),
                ...getSelectedLimitsFormData({
                    permanentLimit1: twtModification.currentLimits1?.permanentLimit,
                    permanentLimit2: twtModification.currentLimits2?.permanentLimit,
                    temporaryLimits1: addSelectedFieldToRows(
                        formatTemporaryLimits(twtModification.currentLimits1?.temporaryLimits)
                    ),
                    temporaryLimits2: addSelectedFieldToRows(
                        formatTemporaryLimits(twtModification.currentLimits2?.temporaryLimits)
                    ),
                }),
                ...getRatioTapChangerFormData({
                    enabled: twtModification?.[RATIO_TAP_CHANGER]?.[ENABLED]?.value,
                    hasLoadTapChangingCapabilities:
                        twtModification?.[RATIO_TAP_CHANGER]?.[LOAD_TAP_CHANGING_CAPABILITIES]?.value ?? null,
                    regulationMode: computeRatioTapChangerRegulationMode(twtModification?.[RATIO_TAP_CHANGER]),
                    regulationType: twtModification?.[RATIO_TAP_CHANGER]?.[REGULATION_TYPE]?.value,
                    regulationSide: twtModification?.[RATIO_TAP_CHANGER]?.[REGULATION_SIDE]?.value ?? null,
                    targetV: twtModification?.[RATIO_TAP_CHANGER]?.[TARGET_V]?.value,
                    targetDeadband: twtModification?.[RATIO_TAP_CHANGER]?.[TARGET_DEADBAND]?.value,
                    lowTapPosition: twtModification?.[RATIO_TAP_CHANGER]?.[LOW_TAP_POSITION]?.value,
                    highTapPosition: computeHighTapPosition(twtModification?.[RATIO_TAP_CHANGER]?.[STEPS]),
                    tapPosition: twtModification?.[RATIO_TAP_CHANGER]?.[TAP_POSITION]?.value,
                    steps: addSelectedFieldToRows(twtModification?.[RATIO_TAP_CHANGER]?.[STEPS]),
                    equipmentId: twtModification?.[RATIO_TAP_CHANGER]?.regulatingTerminalId?.value,
                    equipmentType: twtModification?.[RATIO_TAP_CHANGER]?.regulatingTerminalType?.value,
                    voltageLevelId: twtModification?.[RATIO_TAP_CHANGER]?.regulatingTerminalVlId?.value,
                }),
                ...getPhaseTapChangerFormData({
                    enabled: twtModification?.[PHASE_TAP_CHANGER]?.[ENABLED]?.value,
                    regulationMode: twtModification?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE]?.value,
                    regulationType: twtModification?.[PHASE_TAP_CHANGER]?.[REGULATION_TYPE]?.value,
                    regulationSide: twtModification?.[PHASE_TAP_CHANGER]?.[REGULATION_SIDE]?.value ?? null,
                    currentLimiterRegulatingValue:
                        twtModification?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE]?.value ===
                        PHASE_REGULATION_MODES.CURRENT_LIMITER.id
                            ? twtModification?.[PHASE_TAP_CHANGER]?.regulationValue?.value
                            : undefined,
                    flowSetpointRegulatingValue:
                        twtModification?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE]?.value ===
                        PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id
                            ? twtModification?.[PHASE_TAP_CHANGER]?.regulationValue?.value
                            : undefined,
                    targetDeadband: twtModification?.[PHASE_TAP_CHANGER]?.[TARGET_DEADBAND]?.value,
                    lowTapPosition: twtModification?.[PHASE_TAP_CHANGER]?.[LOW_TAP_POSITION]?.value,
                    highTapPosition: computeHighTapPosition(twtModification?.[PHASE_TAP_CHANGER]?.[STEPS]),
                    tapPosition: twtModification?.[PHASE_TAP_CHANGER]?.[TAP_POSITION]?.value,
                    steps: addSelectedFieldToRows(twtModification?.[PHASE_TAP_CHANGER]?.[STEPS]),
                    equipmentId: twtModification?.[PHASE_TAP_CHANGER]?.regulatingTerminalId?.value,
                    equipmentType: twtModification?.[PHASE_TAP_CHANGER]?.regulatingTerminalType?.value,
                    voltageLevelId: twtModification?.[PHASE_TAP_CHANGER]?.regulatingTerminalVlId?.value,
                }),
                ...getPropertiesFromModification(twtModification.properties),
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const computeRatioTapChangerRegulating = (ratioTapChangerFormValues) => {
        return ratioTapChangerFormValues?.[REGULATION_MODE] === RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id;
    };

    const computePhaseTapChangerRegulationValue = (phaseTapChangerFormValues, currentRegulationMode) => {
        const regulationMode = phaseTapChangerFormValues?.[REGULATION_MODE] || currentRegulationMode;

        switch (regulationMode) {
            case PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id:
                return phaseTapChangerFormValues?.[FLOW_SET_POINT_REGULATING_VALUE];
            case PHASE_REGULATION_MODES.CURRENT_LIMITER.id:
                return phaseTapChangerFormValues?.[CURRENT_LIMITER_REGULATING_VALUE];
            default:
                return undefined;
        }
    };

    const fillPhaseTapChangerRegulationAttributes = useCallback((phaseTap, phaseTapChangerFormValues, twtToModify) => {
        const regulationMode =
            phaseTapChangerFormValues?.[REGULATION_MODE] ??
            getComputedPhaseTapChangerRegulationMode(twtToModify?.[PHASE_TAP_CHANGER])?.id;
        const regulationType =
            phaseTapChangerFormValues?.[REGULATION_TYPE] ?? getComputedPreviousPhaseRegulationType(twtToModify);
        if (regulationMode) {
            phaseTap.regulationType = toModificationOperation(phaseTapChangerFormValues?.[REGULATION_TYPE]);
            if (regulationType === REGULATION_TYPES.LOCAL.id) {
                phaseTap.regulationSide = toModificationOperation(phaseTapChangerFormValues?.[REGULATION_SIDE]);
            } else if (regulationType === REGULATION_TYPES.DISTANT.id) {
                phaseTap.regulatingTerminalId = toModificationOperation(phaseTapChangerFormValues?.[EQUIPMENT]?.id);
                phaseTap.regulatingTerminalType = toModificationOperation(phaseTapChangerFormValues?.[EQUIPMENT]?.type);
                phaseTap.regulatingTerminalVlId = toModificationOperation(
                    phaseTapChangerFormValues?.[VOLTAGE_LEVEL]?.[ID]
                );
            }
            phaseTap.regulationValue = toModificationOperation(
                computePhaseTapChangerRegulationValue(
                    phaseTapChangerFormValues,
                    twtToModify?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE]
                )
            );
            phaseTap.targetDeadband = toModificationOperation(phaseTapChangerFormValues[TARGET_DEADBAND]);
        }
    }, []);

    const fillRatioTapChangerRegulationAttributes = useCallback((ratioTap, ratioTapChangerFormValues, twtToModify) => {
        const hasLoadTapChangingCapabilities =
            ratioTapChangerFormValues?.[LOAD_TAP_CHANGING_CAPABILITIES] ??
            twtToModify?.[RATIO_TAP_CHANGER]?.[LOAD_TAP_CHANGING_CAPABILITIES];
        const regulationType =
            ratioTapChangerFormValues?.[REGULATION_TYPE] ?? getComputedPreviousRatioRegulationType(twtToModify);
        if (hasLoadTapChangingCapabilities) {
            ratioTap.regulationType = toModificationOperation(ratioTapChangerFormValues?.[REGULATION_TYPE]);
            ratioTap.isRegulating = toModificationOperation(
                ratioTapChangerFormValues?.[REGULATION_MODE]
                    ? computeRatioTapChangerRegulating(ratioTapChangerFormValues)
                    : null
            );
            if (regulationType === REGULATION_TYPES.LOCAL.id) {
                ratioTap.regulationSide = toModificationOperation(ratioTapChangerFormValues?.[REGULATION_SIDE]);
            } else if (regulationType === REGULATION_TYPES.DISTANT.id) {
                ratioTap.regulatingTerminalId = toModificationOperation(ratioTapChangerFormValues?.[EQUIPMENT]?.id);
                ratioTap.regulatingTerminalType = toModificationOperation(ratioTapChangerFormValues?.[EQUIPMENT]?.type);
                ratioTap.regulatingTerminalVlId = toModificationOperation(
                    ratioTapChangerFormValues?.[VOLTAGE_LEVEL]?.[ID]
                );
            }
            ratioTap.targetV = toModificationOperation(ratioTapChangerFormValues?.[TARGET_V]);
            ratioTap.targetDeadband = toModificationOperation(ratioTapChangerFormValues?.[TARGET_DEADBAND]);
        }
    }, []);

    const onSubmit = useCallback(
        (twt) => {
            const connectivity1 = twt[CONNECTIVITY]?.[CONNECTIVITY_1];
            const connectivity2 = twt[CONNECTIVITY]?.[CONNECTIVITY_2];
            const characteristics = twt[CHARACTERISTICS];
            const limits = twt[LIMITS];
            const stateEstimationData = twt[STATE_ESTIMATION];
            const temporaryLimits1 = addModificationTypeToTemporaryLimits(
                sanitizeLimitNames(limits[CURRENT_LIMITS_1]?.[TEMPORARY_LIMITS]),
                completeCurrentLimitsGroupsToOnlySelected(
                    twtToModify?.currentLimits1,
                    twtToModify?.selectedOperationalLimitsGroup1
                )?.temporaryLimits,
                completeCurrentLimitsGroupsToOnlySelected(
                    editData?.currentLimits1,
                    editData?.selectedOperationalLimitsGroup1
                )?.temporaryLimits,
                currentNode
            );
            let currentLimits1 = null;
            if (limits[CURRENT_LIMITS_1]?.[PERMANENT_LIMIT] || temporaryLimits1.length > 0) {
                currentLimits1 = {
                    permanentLimit: limits[CURRENT_LIMITS_1]?.[PERMANENT_LIMIT],
                    temporaryLimits: temporaryLimits1,
                };
            }
            const temporaryLimits2 = addModificationTypeToTemporaryLimits(
                sanitizeLimitNames(limits[CURRENT_LIMITS_2]?.[TEMPORARY_LIMITS]),
                completeCurrentLimitsGroupsToOnlySelected(
                    twtToModify?.currentLimits2,
                    twtToModify?.selectedOperationalLimitsGroup2
                )?.temporaryLimits,
                completeCurrentLimitsGroupsToOnlySelected(
                    editData?.currentLimits2,
                    editData?.selectedOperationalLimitsGroup2
                )?.temporaryLimits,
                currentNode
            );
            let currentLimits2 = null;
            if (limits[CURRENT_LIMITS_2]?.[PERMANENT_LIMIT] || temporaryLimits2.length > 0) {
                currentLimits2 = {
                    permanentLimit: limits[CURRENT_LIMITS_2]?.[PERMANENT_LIMIT],
                    temporaryLimits: temporaryLimits2,
                };
            }

            let ratioTap;
            const ratioTapChangerFormValues = twt[RATIO_TAP_CHANGER];
            const enableRatioTapChanger =
                ratioTapChangerFormValues?.[ENABLED] !== !!twtToModify?.ratioTapChanger
                    ? ratioTapChangerFormValues?.[ENABLED]
                    : null;
            const areRatioStepsModified =
                isNodeBuilt(currentNode) && editData?.[RATIO_TAP_CHANGER]?.[STEPS]
                    ? true
                    : !compareStepsWithPreviousValues(
                          ratioTapChangerFormValues[STEPS],
                          twtToModify?.[RATIO_TAP_CHANGER]?.[STEPS]
                      );
            let ratioTapChangerSteps = !areRatioStepsModified ? null : ratioTapChangerFormValues[STEPS];
            if (ratioTapChangerFormValues?.[ENABLED]) {
                ratioTap = {
                    [ENABLED]: toModificationOperation(enableRatioTapChanger),
                    [LOAD_TAP_CHANGING_CAPABILITIES]: toModificationOperation(
                        ratioTapChangerFormValues?.[LOAD_TAP_CHANGING_CAPABILITIES]
                    ),
                    [TAP_POSITION]: toModificationOperation(ratioTapChangerFormValues?.[TAP_POSITION]),
                    [LOW_TAP_POSITION]: toModificationOperation(ratioTapChangerFormValues?.[LOW_TAP_POSITION]),
                    [STEPS]: ratioTapChangerSteps,
                };
                fillRatioTapChangerRegulationAttributes(ratioTap, ratioTapChangerFormValues, twtToModify);
            } else {
                ratioTap = {
                    enabled: toModificationOperation(enableRatioTapChanger),
                };
            }

            let phaseTap;
            const phaseTapChangerFormValues = twt[PHASE_TAP_CHANGER];
            const enablePhaseTapChanger =
                phaseTapChangerFormValues?.[ENABLED] !== !!twtToModify?.phaseTapChanger
                    ? phaseTapChangerFormValues?.[ENABLED]
                    : null;
            const arePhaseStepsModified =
                isNodeBuilt(currentNode) && editData?.[PHASE_TAP_CHANGER]?.[STEPS]
                    ? true
                    : !compareStepsWithPreviousValues(
                          phaseTapChangerFormValues[STEPS],
                          twtToModify?.[PHASE_TAP_CHANGER]?.[STEPS]
                      );
            let phaseTapChangerSteps = !arePhaseStepsModified ? null : phaseTapChangerFormValues[STEPS];
            if (phaseTapChangerFormValues?.[ENABLED]) {
                phaseTap = {
                    [ENABLED]: toModificationOperation(enablePhaseTapChanger),
                    [REGULATION_MODE]: toModificationOperation(phaseTapChangerFormValues[REGULATION_MODE]),
                    [TAP_POSITION]: toModificationOperation(phaseTapChangerFormValues[TAP_POSITION]),
                    [LOW_TAP_POSITION]: toModificationOperation(phaseTapChangerFormValues[LOW_TAP_POSITION]),
                    [STEPS]: phaseTapChangerSteps,
                };
                fillPhaseTapChangerRegulationAttributes(phaseTap, phaseTapChangerFormValues, twtToModify);
            } else {
                phaseTap = {
                    enabled: toModificationOperation(enablePhaseTapChanger),
                };
            }

            modifyTwoWindingsTransformer({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                twoWindingsTransformerId: selectedId,
                twoWindingsTransformerName: toModificationOperation(sanitizeString(twt[EQUIPMENT_NAME])),
                r: toModificationOperation(characteristics[R]),
                x: toModificationOperation(characteristics[X]),
                g: toModificationOperation(convertOutputValue(FieldType.G, characteristics[G])),
                b: toModificationOperation(convertOutputValue(FieldType.B, characteristics[B])),
                ratedS: toModificationOperation(characteristics[RATED_S]),
                ratedU1: toModificationOperation(characteristics[RATED_U1]),
                ratedU2: toModificationOperation(characteristics[RATED_U2]),
                currentLimit1: currentLimits1,
                currentLimit2: currentLimits2,
                ratioTapChanger: ratioTap,
                phaseTapChanger: phaseTap,
                voltageLevelId1: connectivity1[VOLTAGE_LEVEL]?.id,
                busOrBusbarSectionId1: connectivity1[BUS_OR_BUSBAR_SECTION]?.id,
                voltageLevelId2: connectivity2[VOLTAGE_LEVEL]?.id,
                busOrBusbarSectionId2: connectivity2[BUS_OR_BUSBAR_SECTION]?.id,
                connectionName1: sanitizeString(connectivity1[CONNECTION_NAME]),
                connectionName2: sanitizeString(connectivity2[CONNECTION_NAME]),
                connectionDirection1: connectivity1[CONNECTION_DIRECTION],
                connectionDirection2: connectivity2[CONNECTION_DIRECTION],
                connectionPosition1: connectivity1[CONNECTION_POSITION],
                connectionPosition2: connectivity2[CONNECTION_POSITION],
                connected1: connectivity1[CONNECTED],
                connected2: connectivity2[CONNECTED],
                properties: toModificationProperties(twt),
                p1MeasurementValue: stateEstimationData[MEASUREMENT_P1][VALUE],
                p1MeasurementValidity: stateEstimationData[MEASUREMENT_P1][VALIDITY],
                q1MeasurementValue: stateEstimationData[MEASUREMENT_Q1][VALUE],
                q1MeasurementValidity: stateEstimationData[MEASUREMENT_Q1][VALIDITY],
                p2MeasurementValue: stateEstimationData[MEASUREMENT_P2][VALUE],
                p2MeasurementValidity: stateEstimationData[MEASUREMENT_P2][VALIDITY],
                q2MeasurementValue: stateEstimationData[MEASUREMENT_Q2][VALUE],
                q2MeasurementValidity: stateEstimationData[MEASUREMENT_Q2][VALIDITY],
                ratioTapChangerToBeEstimated: stateEstimationData[TO_BE_ESTIMATED][RATIO_TAP_CHANGER_STATUS],
                phaseTapChangerToBeEstimated: stateEstimationData[TO_BE_ESTIMATED][PHASE_TAP_CHANGER_STATUS],
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'TwoWindingsTransformerModificationError',
                });
            });
        },
        [
            twtToModify,
            editData,
            currentNode,
            studyUuid,
            currentNodeUuid,
            selectedId,
            fillRatioTapChangerRegulationAttributes,
            fillPhaseTapChangerRegulationAttributes,
            snackError,
        ]
    );

    const onValidationError = (errors) => {
        let tabsInError = [];
        if (errors?.[CONNECTIVITY] !== undefined) {
            tabsInError.push(TwoWindingsTransformerModificationDialogTab.CONNECTIVITY_TAB);
        }
        if (errors?.[CHARACTERISTICS] !== undefined) {
            tabsInError.push(TwoWindingsTransformerModificationDialogTab.CHARACTERISTICS_TAB);
        }
        if (errors?.[LIMITS] !== undefined) {
            tabsInError.push(TwoWindingsTransformerModificationDialogTab.LIMITS_TAB);
        }
        if (errors?.[STATE_ESTIMATION] !== undefined) {
            tabsInError.push(TwoWindingsTransformerModificationDialogTab.STATE_ESTIMATION_TAB);
        }
        if (errors?.[RATIO_TAP_CHANGER] !== undefined) {
            tabsInError.push(TwoWindingsTransformerModificationDialogTab.RATIO_TAP_TAB);
        }
        if (errors?.[PHASE_TAP_CHANGER] !== undefined) {
            tabsInError.push(TwoWindingsTransformerModificationDialogTab.PHASE_TAP_TAB);
        }

        if (tabsInError.length > 0) {
            setTabIndex(tabsInError[0]);
        }

        setTabIndexesWithError(tabsInError);
    };

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const setConnectivityValue = useCallback(
        (index, field, value) => {
            setValue(`${CONNECTIVITY}.${index}.${field}.${ID}`, value);
        },
        [setValue]
    );

    const isRatioTapChangerEnabled = useCallback(
        (twt) => {
            if (editData?.ratioTapChanger?.enabled === undefined) {
                return !!twt.ratioTapChanger;
            }
            return editData?.ratioTapChanger?.enabled?.value;
        },
        [editData]
    );

    const isPhaseTapChangerEnabled = useCallback(
        (twt) => {
            if (editData?.phaseTapChanger?.enabled === undefined) {
                return !!twt.phaseTapChanger;
            }
            return editData?.phaseTapChanger?.enabled?.value;
        },
        [editData?.phaseTapChanger?.enabled]
    );

    const getPhaseTapChangerSteps = useCallback(
        (twt) => {
            if (editData === undefined) {
                return twt?.[PHASE_TAP_CHANGER]?.[STEPS];
            }
            if (
                editData?.phaseTapChanger?.steps === null ||
                editData?.phaseTapChanger?.steps === undefined ||
                editData?.phaseTapChanger?.enabled?.value === false
            ) {
                return twt?.[PHASE_TAP_CHANGER]?.[STEPS];
            }
            return editData?.phaseTapChanger?.steps;
        },
        [editData]
    );

    const getRatioTapChangerSteps = useCallback(
        (twt) => {
            if (editData === undefined) {
                return twt?.[RATIO_TAP_CHANGER]?.[STEPS];
            }
            if (
                editData?.ratioTapChanger?.steps === null ||
                editData?.ratioTapChanger?.steps === undefined ||
                editData?.ratioTapChanger?.enabled?.value === false
            ) {
                return twt?.[RATIO_TAP_CHANGER]?.[STEPS];
            }
            return editData?.ratioTapChanger?.steps;
        },
        [editData]
    );

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((twt) => {
                        if (twt) {
                            setTwtToModify(twt);
                            setConnectivityValue(CONNECTIVITY_1, VOLTAGE_LEVEL, twt?.voltageLevelId1);
                            setConnectivityValue(CONNECTIVITY_2, VOLTAGE_LEVEL, twt?.voltageLevelId2);
                            setConnectivityValue(CONNECTIVITY_1, BUS_OR_BUSBAR_SECTION, twt?.busOrBusbarSectionId1);
                            setConnectivityValue(CONNECTIVITY_2, BUS_OR_BUSBAR_SECTION, twt?.busOrBusbarSectionId2);
                            const selectedCurrentLimits1 = completeCurrentLimitsGroupsToOnlySelected(
                                twt?.currentLimits1,
                                twt?.selectedOperationalLimitsGroup1
                            );
                            const selectedCurrentLimits2 = completeCurrentLimitsGroupsToOnlySelected(
                                twt?.currentLimits2,
                                twt?.selectedOperationalLimitsGroup2
                            );
                            const updatedTemporaryLimits1 = updateTemporaryLimits(
                                formatTemporaryLimits(getValues(`${LIMITS}.${CURRENT_LIMITS_1}.${TEMPORARY_LIMITS}`)),
                                formatTemporaryLimits(selectedCurrentLimits1?.temporaryLimits)
                            );
                            const updatedTemporaryLimits2 = updateTemporaryLimits(
                                formatTemporaryLimits(getValues(`${LIMITS}.${CURRENT_LIMITS_2}.${TEMPORARY_LIMITS}`)),
                                formatTemporaryLimits(selectedCurrentLimits2?.temporaryLimits)
                            );
                            reset((formValues) => ({
                                ...formValues,
                                ...getSelectedLimitsFormData({
                                    permanentLimit1: getValues(`${LIMITS}.${CURRENT_LIMITS_1}.${PERMANENT_LIMIT}`),
                                    permanentLimit2: getValues(`${LIMITS}.${CURRENT_LIMITS_2}.${PERMANENT_LIMIT}`),
                                    temporaryLimits1: addSelectedFieldToRows(updatedTemporaryLimits1),
                                    temporaryLimits2: addSelectedFieldToRows(updatedTemporaryLimits2),
                                }),
                                ...getRatioTapChangerFormData({
                                    enabled: isRatioTapChangerEnabled(twt),
                                    hasLoadTapChangingCapabilities: getValues(
                                        `${RATIO_TAP_CHANGER}.${LOAD_TAP_CHANGING_CAPABILITIES}`
                                    ),
                                    regulationMode: getValues(`${RATIO_TAP_CHANGER}.${REGULATION_MODE}`),
                                    regulationType: getValues(`${RATIO_TAP_CHANGER}.${REGULATION_TYPE}`),
                                    regulationSide: getValues(`${RATIO_TAP_CHANGER}.${REGULATION_SIDE}`),
                                    targetV: getValues(`${RATIO_TAP_CHANGER}.${TARGET_V}`),
                                    targetDeadband: getValues(`${RATIO_TAP_CHANGER}.${TARGET_DEADBAND}`),
                                    lowTapPosition: getValues(`${RATIO_TAP_CHANGER}.${LOW_TAP_POSITION}`),
                                    highTapPosition: getValues(`${RATIO_TAP_CHANGER}.${HIGH_TAP_POSITION}`),
                                    tapPosition: getValues(`${RATIO_TAP_CHANGER}.${TAP_POSITION}`),
                                    steps: addSelectedFieldToRows(getRatioTapChangerSteps(twt)),
                                    equipmentId: getValues(`${RATIO_TAP_CHANGER}.${EQUIPMENT}.${ID}`),
                                    equipmentType: getValues(`${RATIO_TAP_CHANGER}.${EQUIPMENT}.${TYPE}`),
                                    voltageLevelId: getValues(`${RATIO_TAP_CHANGER}.${VOLTAGE_LEVEL}.${ID}`),
                                }),
                                ...getPhaseTapChangerFormData({
                                    enabled: isPhaseTapChangerEnabled(twt),
                                    regulationMode: getValues(`${PHASE_TAP_CHANGER}.${REGULATION_MODE}`),
                                    regulationType: getValues(`${PHASE_TAP_CHANGER}.${REGULATION_TYPE}`),
                                    regulationSide: getValues(`${PHASE_TAP_CHANGER}.${REGULATION_SIDE}`),
                                    currentLimiterRegulatingValue: getValues(
                                        `${PHASE_TAP_CHANGER}.${CURRENT_LIMITER_REGULATING_VALUE}`
                                    ),
                                    flowSetpointRegulatingValue: getValues(
                                        `${PHASE_TAP_CHANGER}.${FLOW_SET_POINT_REGULATING_VALUE}`
                                    ),
                                    targetDeadband: getValues(`${PHASE_TAP_CHANGER}.${TARGET_DEADBAND}`),
                                    lowTapPosition: getValues(`${PHASE_TAP_CHANGER}.${LOW_TAP_POSITION}`),
                                    highTapPosition: getValues(`${PHASE_TAP_CHANGER}.${HIGH_TAP_POSITION}`),
                                    tapPosition: getValues(`${PHASE_TAP_CHANGER}.${TAP_POSITION}`),
                                    steps: addSelectedFieldToRows(getPhaseTapChangerSteps(twt)),
                                    equipmentId: getValues(`${PHASE_TAP_CHANGER}.${EQUIPMENT}.${ID}`),
                                    equipmentType: getValues(`${PHASE_TAP_CHANGER}.${EQUIPMENT}.${TYPE}`),
                                    voltageLevelId: getValues(`${PHASE_TAP_CHANGER}.${VOLTAGE_LEVEL}.${ID}`),
                                }),
                                [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(twt, getValues),
                            }));
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setTwtToModify(null);
                            reset(emptyFormData);
                        }
                    });
            } else {
                setTwtToModify(null);
                reset(emptyFormData, { keepDefaultValues: true });
            }
        },
        [
            studyUuid,
            currentNodeUuid,
            currentRootNetworkUuid,
            setConnectivityValue,
            getValues,
            reset,
            isRatioTapChangerEnabled,
            getRatioTapChangerSteps,
            isPhaseTapChangerEnabled,
            getPhaseTapChangerSteps,
            editData?.equipmentId,
        ]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const headerAndTabs = (
        <Grid container spacing={2}>
            <TwoWindingsTransformerModificationDialogHeader equipmentToModify={twtToModify} equipmentId={selectedId} />
            <TwoWindingsTransformerModificationDialogTabs
                tabIndex={tabIndex}
                tabIndexesWithError={tabIndexesWithError}
                setTabIndex={setTabIndex}
            />
        </Grid>
    );

    return (
        <CustomFormProvider
            removeOptional={true}
            validationSchema={formSchema}
            {...formMethods}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                fullWidth
                maxWidth="xl"
                titleId="ModifyTwoWindingsTransformer"
                aria-labelledby="dialog-modify-two-windings-transformer"
                subtitle={selectedId != null ? headerAndTabs : undefined}
                onClear={clear}
                onSave={onSubmit}
                onValidationError={onValidationError}
                open={open}
                showNodeNotBuiltWarning={selectedId != null}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                PaperProps={{
                    sx: {
                        height: '95vh', // we want the dialog height to be fixed even when switching tabs
                    },
                }}
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER}
                    />
                )}
                {selectedId != null && (
                    <>
                        <Box hidden={tabIndex !== TwoWindingsTransformerModificationDialogTab.CONNECTIVITY_TAB} p={1}>
                            <BranchConnectivityForm
                                studyUuid={studyUuid}
                                currentNode={currentNode}
                                currentRootNetworkUuid={currentRootNetworkUuid}
                                withPosition={true}
                                isModification={true}
                                previousValues={twtToModify}
                            />
                        </Box>
                        <Box
                            hidden={tabIndex !== TwoWindingsTransformerModificationDialogTab.CHARACTERISTICS_TAB}
                            p={1}
                            sx={{
                                'h3:first-of-type': {
                                    marginTop: 0,
                                },
                            }}
                        >
                            <TwoWindingsTransformerCharacteristicsPane twtToModify={twtToModify} isModification />
                        </Box>
                        <Box hidden={tabIndex !== TwoWindingsTransformerModificationDialogTab.LIMITS_TAB} p={1}>
                            <LimitsPane
                                currentNode={currentNode}
                                equipmentToModify={twtToModify}
                                clearableFields
                                onlySelectedLimitsGroup
                            />
                        </Box>
                        <Box
                            hidden={tabIndex !== TwoWindingsTransformerModificationDialogTab.STATE_ESTIMATION_TAB}
                            p={1}
                        >
                            <Grid container spacing={2}>
                                <BranchActiveReactivePowerMeasurementsForm equipmentToModify={twtToModify} />
                                <ToBeEstimatedForm toBeEstimated={twtToModify?.toBeEstimated} />
                            </Grid>
                        </Box>
                        <Box hidden={tabIndex !== TwoWindingsTransformerModificationDialogTab.RATIO_TAP_TAB} p={1}>
                            <RatioTapChangerPane
                                studyUuid={studyUuid}
                                currentNode={currentNode}
                                currentRootNetworkUuid={currentRootNetworkUuid}
                                voltageLevelOptions={voltageLevelOptions}
                                previousValues={twtToModify}
                                editData={editData}
                                isModification={true}
                            />
                        </Box>
                        <Box hidden={tabIndex !== TwoWindingsTransformerModificationDialogTab.PHASE_TAP_TAB} p={1}>
                            <PhaseTapChangerPane
                                studyUuid={studyUuid}
                                currentNode={currentNode}
                                currentRootNetworkUuid={currentRootNetworkUuid}
                                voltageLevelOptions={voltageLevelOptions}
                                previousValues={twtToModify}
                                editData={editData}
                                isModification={true}
                            />
                        </Box>
                    </>
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
};

TwoWindingsTransformerModificationDialog.propTypes = {
    studyUuid: PropTypes.string,
    defaultIdValue: PropTypes.string,
    currentNode: PropTypes.object,
    currentRootNetworkUuid: PropTypes.string,
    isUpdate: PropTypes.bool,
    editData: PropTypes.object,
    editDataFetchStatus: PropTypes.string,
};

export default TwoWindingsTransformerModificationDialog;
