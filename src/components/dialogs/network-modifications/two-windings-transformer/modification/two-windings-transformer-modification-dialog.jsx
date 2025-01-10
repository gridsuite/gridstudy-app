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
    ID,
    LIMITS,
    LOAD_TAP_CHANGING_CAPABILITIES,
    LOW_TAP_POSITION,
    PERMANENT_LIMIT,
    PHASE_TAP_CHANGER,
    R,
    RATED_S,
    RATED_U1,
    RATED_U2,
    RATIO_TAP_CHANGER,
    REGULATING,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    STEPS,
    TAP_POSITION,
    TARGET_DEADBAND,
    TARGET_V,
    TEMPORARY_LIMITS,
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
import { addSelectedFieldToRows } from 'components/utils/dnd-table/dnd-table';
import LimitsPane from '../../../limits/limits-pane';
import {
    addModificationTypeToTemporaryLimits,
    getLimitsEmptyFormData,
    getLimitsFormData,
    getLimitsValidationSchema,
    sanitizeLimitNames,
    updateTemporaryLimits,
} from '../../../limits/limits-pane-utils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import TwoWindingsTransformerModificationDialogHeader from './two-windings-transformer-modification-dialog-header';
import {
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
import BranchConnectivityForm from '../../../connectivity/branch-connectivity-form';
import {
    createConnectivityData,
    getCon1andCon2WithPositionValidationSchema,
    getConnectivityFormData,
    getCont1Cont2WithPositionEmptyFormData,
} from '../../../connectivity/connectivity-form-utils';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    ...getCont1Cont2WithPositionEmptyFormData(true),
    ...getCharacteristicsEmptyFormData(),
    ...getLimitsEmptyFormData(),
    ...getRatioTapChangerEmptyFormData(),
    ...getPhaseTapChangerEmptyFormData(),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_NAME]: yup.string(),
        ...getCon1andCon2WithPositionValidationSchema(true),
        ...getCharacteristicsValidationSchema(true),
        ...getLimitsValidationSchema(),
        ...getRatioTapChangerModificationValidationSchema(),
        ...getPhaseTapChangerModificationValidationSchema(),
    })
    .concat(modificationPropertiesSchema)
    .required();

export const TwoWindingsTransformerModificationDialogTab = {
    CONNECTIVITY_TAB: 0,
    CHARACTERISTICS_TAB: 1,
    LIMITS_TAB: 2,
    RATIO_TAP_TAB: 3,
    PHASE_TAP_TAB: 4,
};

/**
 * Dialog to modify a two windings transformer in the network
 * @param studyUuid the study we are currently working on
 * @param defaultIdValue the default two windings transformer id
 * @param currentNode The node we are currently working on
 * @param isUpdate check if edition form
 * @param editData the data to edit
 * @param editDataFetchStatus indicates the status of fetching EditData
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const TwoWindingsTransformerModificationDialog = ({
    studyUuid,
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the SLD
    currentNode,
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
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNodeUuid);

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

    const isRatioTapChangerEnabled = useCallback(
        (twtEditData) => {
            const ratioTapEnabledInEditData = twtEditData?.[RATIO_TAP_CHANGER]?.[ENABLED]?.value;
            const ratioTapFormHasBeenEdited = Object.keys(twtEditData?.[RATIO_TAP_CHANGER] ?? {}).length > 0; // to check if the form has been edited (to solve problem when unbuilt node)
            const ratioTapEnabledInTwtToModify = !!twtToModify?.ratioTapChanger; // used when we have twt element (built node)
            return ratioTapEnabledInEditData ?? (ratioTapFormHasBeenEdited || ratioTapEnabledInTwtToModify);
        },
        [twtToModify]
    );

    const isPhaseTapChangerEnabled = useCallback(
        (twtEditData) => {
            const phaseTapEnabledInEditData = twtEditData?.[PHASE_TAP_CHANGER]?.[ENABLED]?.value;
            const phaseTapFormHasBeenEdited = Object.keys(twtEditData?.[PHASE_TAP_CHANGER] ?? {}).length > 0; // to check if the form has been edited (to solve problem when unbuilt node)
            const phaseTapEnabledInTwtToModify = !!twtToModify?.phaseTapChanger; // used when we have twt element (built node)
            return phaseTapEnabledInEditData ?? (phaseTapFormHasBeenEdited || phaseTapEnabledInTwtToModify);
        },
        [twtToModify]
    );

    const fromEditDataToFormValues = useCallback(
        (twt) => {
            if (twt?.equipmentId) {
                setSelectedId(twt.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: twt.equipmentName?.value,
                [CONNECTIVITY]: {
                    ...getConnectivityFormData(createConnectivityData(twt, 1), CONNECTIVITY_1),
                    ...getConnectivityFormData(createConnectivityData(twt, 2), CONNECTIVITY_2),
                },
                ...getCharacteristicsFormData({
                    r: twt.r?.value,
                    x: twt.x?.value,
                    g: convertInputValue(FieldType.G, twt.g?.value),
                    b: convertInputValue(FieldType.B, twt.b?.value),
                    ratedU1: twt.ratedU1?.value,
                    ratedU2: twt.ratedU2?.value,
                    ratedS: twt.ratedS?.value,
                }),
                ...getLimitsFormData({
                    permanentLimit1: twt.currentLimits1?.permanentLimit,
                    permanentLimit2: twt.currentLimits2?.permanentLimit,
                    temporaryLimits1: addSelectedFieldToRows(
                        formatTemporaryLimits(twt.currentLimits1?.temporaryLimits)
                    ),
                    temporaryLimits2: addSelectedFieldToRows(
                        formatTemporaryLimits(twt.currentLimits2?.temporaryLimits)
                    ),
                }),
                ...getRatioTapChangerFormData({
                    enabled: isRatioTapChangerEnabled(twt),
                    hasLoadTapChangingCapabilities:
                        twt?.[RATIO_TAP_CHANGER]?.[LOAD_TAP_CHANGING_CAPABILITIES]?.value ?? null,
                    regulationMode: computeRatioTapChangerRegulationMode(twt?.[RATIO_TAP_CHANGER]),
                    regulationType: twt?.[RATIO_TAP_CHANGER]?.[REGULATION_TYPE]?.value,
                    regulationSide: twt?.[RATIO_TAP_CHANGER]?.[REGULATION_SIDE]?.value ?? null,
                    targetV: twt?.[RATIO_TAP_CHANGER]?.[TARGET_V]?.value,
                    targetDeadband: twt?.[RATIO_TAP_CHANGER]?.[TARGET_DEADBAND]?.value,
                    lowTapPosition: twt?.[RATIO_TAP_CHANGER]?.[LOW_TAP_POSITION]?.value,
                    highTapPosition: computeHighTapPosition(twt?.[RATIO_TAP_CHANGER]?.[STEPS]),
                    tapPosition: twt?.[RATIO_TAP_CHANGER]?.[TAP_POSITION]?.value,
                    steps: addSelectedFieldToRows(
                        twt?.[RATIO_TAP_CHANGER]?.[STEPS] ?? twtToModify?.[RATIO_TAP_CHANGER]?.[STEPS]
                    ),
                    equipmentId: twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalId?.value,
                    equipmentType: twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalType?.value,
                    voltageLevelId: twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalVlId?.value,
                }),
                ...getPhaseTapChangerFormData({
                    enabled: isPhaseTapChangerEnabled(twt),
                    regulationMode: twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE]?.value,
                    regulationType: twt?.[PHASE_TAP_CHANGER]?.[REGULATION_TYPE]?.value,
                    regulationSide: twt?.[PHASE_TAP_CHANGER]?.[REGULATION_SIDE]?.value ?? null,
                    currentLimiterRegulatingValue:
                        twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE]?.value === PHASE_REGULATION_MODES.CURRENT_LIMITER.id
                            ? twt?.[PHASE_TAP_CHANGER]?.regulationValue?.value
                            : undefined,
                    flowSetpointRegulatingValue:
                        twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE]?.value ===
                        PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id
                            ? twt?.[PHASE_TAP_CHANGER]?.regulationValue?.value
                            : undefined,
                    targetDeadband: twt?.[PHASE_TAP_CHANGER]?.[TARGET_DEADBAND]?.value,
                    lowTapPosition: twt?.[PHASE_TAP_CHANGER]?.[LOW_TAP_POSITION]?.value,
                    highTapPosition: computeHighTapPosition(twt?.[PHASE_TAP_CHANGER]?.[STEPS]),
                    tapPosition: twt?.[PHASE_TAP_CHANGER]?.[TAP_POSITION]?.value,
                    steps: addSelectedFieldToRows(
                        twt?.[PHASE_TAP_CHANGER]?.[STEPS] ?? twtToModify?.[PHASE_TAP_CHANGER]?.[STEPS]
                    ),
                    equipmentId: twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalId?.value,
                    equipmentType: twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalType?.value,
                    voltageLevelId: twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalVlId?.value,
                }),
                ...getPropertiesFromModification(twt.properties),
            });
        },
        [reset, twtToModify, isRatioTapChangerEnabled, isPhaseTapChangerEnabled]
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
            const temporaryLimits1 = addModificationTypeToTemporaryLimits(
                sanitizeLimitNames(limits[CURRENT_LIMITS_1]?.[TEMPORARY_LIMITS]),
                twtToModify?.currentLimits1?.temporaryLimits,
                editData?.currentLimits1?.temporaryLimits,
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
                twtToModify?.currentLimits2?.temporaryLimits,
                editData?.currentLimits2?.temporaryLimits,
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

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (!equipmentId) {
                setTwtToModify(null);
                reset(emptyFormData, { keepDefaultValues: true });
            } else {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
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
                            const updatedTemporaryLimits1 = updateTemporaryLimits(
                                formatTemporaryLimits(getValues(`${CURRENT_LIMITS_1}.${TEMPORARY_LIMITS}`)),
                                formatTemporaryLimits(twt?.currentLimits1?.temporaryLimits)
                            );
                            const updatedTemporaryLimits2 = updateTemporaryLimits(
                                formatTemporaryLimits(getValues(`${CURRENT_LIMITS_2}.${TEMPORARY_LIMITS}`)),
                                formatTemporaryLimits(twt?.currentLimits2?.temporaryLimits)
                            );
                            reset(
                                (formValues) => ({
                                    ...formValues,
                                    ...getLimitsFormData({
                                        temporaryLimits1: addSelectedFieldToRows(
                                            updatedTemporaryLimits1
                                                ? updatedTemporaryLimits1
                                                : formatTemporaryLimits(twt.currentLimits1?.temporaryLimits)
                                        ),
                                        temporaryLimits2: addSelectedFieldToRows(
                                            updatedTemporaryLimits2
                                                ? updatedTemporaryLimits2
                                                : formatTemporaryLimits(twt.currentLimits2?.temporaryLimits)
                                        ),
                                    }),
                                    ...getRatioTapChangerFormData({
                                        enabled: !!twt.ratioTapChanger,
                                        hasLoadTapChangingCapabilities: null,
                                        regulationSide: null,
                                        steps: addSelectedFieldToRows(twt?.[RATIO_TAP_CHANGER]?.[STEPS]),
                                    }),
                                    ...getPhaseTapChangerFormData({
                                        enabled: !!twt.phaseTapChanger,
                                        regulationSide: null,
                                        steps: addSelectedFieldToRows(twt?.[PHASE_TAP_CHANGER]?.[STEPS]),
                                    }),
                                    [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(twt, getValues),
                                }),
                                { keepDefaultValues: true }
                            );
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
            }
        },
        [studyUuid, currentNodeUuid, editData, reset, getValues, setConnectivityValue]
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
        <CustomFormProvider removeOptional={true} validationSchema={formSchema} {...formMethods}>
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
                        studyUuid={studyUuid}
                        currentNode={currentNode}
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
                            <LimitsPane currentNode={currentNode} equipmentToModify={twtToModify} clearableFields />
                        </Box>
                        <Box hidden={tabIndex !== TwoWindingsTransformerModificationDialogTab.RATIO_TAP_TAB} p={1}>
                            <RatioTapChangerPane
                                studyUuid={studyUuid}
                                currentNode={currentNode}
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
    currentNode: PropTypes.object,
    isUpdate: PropTypes.bool,
    editData: PropTypes.object,
    editDataFetchStatus: PropTypes.string,
};

export default TwoWindingsTransformerModificationDialog;
