/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Grid } from '@mui/material';
import {
    CHARACTERISTICS,
    CURRENT_LIMITER_REGULATING_VALUE,
    ENABLED,
    EQUIPMENT,
    EQUIPMENT_NAME,
    FLOW_SET_POINT_REGULATING_VALUE,
    ID,
    LOAD_TAP_CHANGING_CAPABILITIES,
    LOW_TAP_POSITION,
    G,
    B,
    PHASE_TAP_CHANGER,
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
    VOLTAGE_LEVEL,
    X,
    R,
} from 'components/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { microUnitToUnit, unitToMicroUnit } from 'utils/unit-converter';
import { sanitizeString } from '../../../dialogUtils';
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
import {
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    LIMITS,
    PERMANENT_LIMIT,
    TEMPORARY_LIMITS,
} from 'components/utils/field-constants.js';
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
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from 'components/utils/equipment-types';
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
import {
    fetchNetworkElementInfos,
    fetchVoltageLevelsListInfos,
} from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    ...getCharacteristicsEmptyFormData(),
    ...getLimitsEmptyFormData(),
    ...getRatioTapChangerEmptyFormData(),
    ...getPhaseTapChangerEmptyFormData(),
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_NAME]: yup.string(),
        ...getCharacteristicsValidationSchema(true),
        ...getLimitsValidationSchema(),
        ...getRatioTapChangerModificationValidationSchema(),
        ...getPhaseTapChangerModificationValidationSchema(),
    })
    .required();

export const TwoWindingsTransformerModificationDialogTab = {
    CHARACTERISTICS_TAB: 0,
    LIMITS_TAB: 1,
    RATIO_TAP_TAB: 2,
    PHASE_TAP_TAB: 3,
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
    const [tabIndex, setTabIndex] = useState(
        TwoWindingsTransformerModificationDialogTab.CHARACTERISTICS_TAB
    );
    const [tabIndexesWithError, setTabIndexesWithError] = useState([]);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const [twtToModify, setTwtToModify] = useState(null);
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const { reset } = formMethods;

    const computeRatioTapChangerRegulationMode = (
        ratioTapChangerFormValues
    ) => {
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
            const ratioTapEnabledInEditData =
                twtEditData?.[RATIO_TAP_CHANGER]?.[ENABLED]?.value;
            const ratioTapFormHasBeenEdited =
                Object.keys(twtEditData?.[RATIO_TAP_CHANGER] ?? {}).length > 0; // to check if the form has been edited (to solve problem when unbuilt node)
            const ratioTapEnabledInTwtToModify = !!twtToModify?.ratioTapChanger; // used when we have twt element (built node)
            return (
                ratioTapEnabledInEditData ??
                (ratioTapFormHasBeenEdited || ratioTapEnabledInTwtToModify)
            );
        },
        [twtToModify]
    );

    const isPhaseTapChangerEnabled = useCallback(
        (twtEditData) => {
            const phaseTapEnabledInEditData =
                twtEditData?.[PHASE_TAP_CHANGER]?.[ENABLED]?.value;
            const phaseTapFormHasBeenEdited =
                Object.keys(twtEditData?.[PHASE_TAP_CHANGER] ?? {}).length > 0; // to check if the form has been edited (to solve problem when unbuilt node)
            const phaseTapEnabledInTwtToModify = !!twtToModify?.phaseTapChanger; // used when we have twt element (built node)
            return (
                phaseTapEnabledInEditData ??
                (phaseTapFormHasBeenEdited || phaseTapEnabledInTwtToModify)
            );
        },
        [twtToModify]
    );

    const fromEditDataToFormValues = useCallback(
        (twt, updatedTemporaryLimits1, updatedTemporaryLimits2) => {
            if (twt?.equipmentId) {
                setSelectedId(twt.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: twt.equipmentName?.value,
                ...getCharacteristicsFormData({
                    r: twt.r?.value,
                    x: twt.x?.value,
                    g: unitToMicroUnit(twt.g?.value),
                    b: unitToMicroUnit(twt.b?.value),
                    ratedU1: twt.ratedU1?.value,
                    ratedU2: twt.ratedU2?.value,
                    ratedS: twt.ratedS?.value,
                }),
                ...getLimitsFormData({
                    permanentLimit1: twt.currentLimits1?.permanentLimit,
                    permanentLimit2: twt.currentLimits2?.permanentLimit,
                    temporaryLimits1: addSelectedFieldToRows(
                        updatedTemporaryLimits1 ||
                            formatTemporaryLimits(
                                twt.currentLimits1?.temporaryLimits
                            )
                    ),
                    temporaryLimits2: addSelectedFieldToRows(
                        updatedTemporaryLimits2 ||
                            formatTemporaryLimits(
                                twt.currentLimits2?.temporaryLimits
                            )
                    ),
                }),
                ...getRatioTapChangerFormData({
                    enabled: isRatioTapChangerEnabled(twt),
                    loadTapChangingCapabilities:
                        twt?.[RATIO_TAP_CHANGER]?.[
                            LOAD_TAP_CHANGING_CAPABILITIES
                        ]?.value ?? null,
                    regulationMode: computeRatioTapChangerRegulationMode(
                        twt?.[RATIO_TAP_CHANGER]
                    ),
                    regulationType:
                        twt?.[RATIO_TAP_CHANGER]?.[REGULATION_TYPE]?.value,
                    regulationSide:
                        twt?.[RATIO_TAP_CHANGER]?.[REGULATION_SIDE]?.value ??
                        null,
                    targetV: twt?.[RATIO_TAP_CHANGER]?.[TARGET_V]?.value,
                    targetDeadband:
                        twt?.[RATIO_TAP_CHANGER]?.[TARGET_DEADBAND]?.value,
                    lowTapPosition:
                        twt?.[RATIO_TAP_CHANGER]?.[LOW_TAP_POSITION]?.value,
                    highTapPosition: computeHighTapPosition(
                        twt?.[RATIO_TAP_CHANGER]?.[STEPS]
                    ),
                    tapPosition:
                        twt?.[RATIO_TAP_CHANGER]?.[TAP_POSITION]?.value,
                    steps: addSelectedFieldToRows(
                        twt?.[RATIO_TAP_CHANGER]?.[STEPS] ??
                            twtToModify?.[RATIO_TAP_CHANGER]?.[STEPS]
                    ),
                    equipmentId:
                        twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalId?.value,
                    equipmentType:
                        twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalType?.value,
                    voltageLevelId:
                        twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalVlId?.value,
                }),
                ...getPhaseTapChangerFormData({
                    enabled: isPhaseTapChangerEnabled(twt),
                    regulationMode:
                        twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE]?.value,
                    regulationType:
                        twt?.[PHASE_TAP_CHANGER]?.[REGULATION_TYPE]?.value,
                    regulationSide:
                        twt?.[PHASE_TAP_CHANGER]?.[REGULATION_SIDE]?.value ??
                        null,
                    currentLimiterRegulatingValue:
                        twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE]?.value ===
                        PHASE_REGULATION_MODES.CURRENT_LIMITER.id
                            ? twt?.[PHASE_TAP_CHANGER]?.regulationValue?.value
                            : undefined,
                    flowSetpointRegulatingValue:
                        twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE]?.value ===
                        PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id
                            ? twt?.[PHASE_TAP_CHANGER]?.regulationValue?.value
                            : undefined,
                    targetDeadband:
                        twt?.[PHASE_TAP_CHANGER]?.[TARGET_DEADBAND]?.value,
                    lowTapPosition:
                        twt?.[PHASE_TAP_CHANGER]?.[LOW_TAP_POSITION]?.value,
                    highTapPosition: computeHighTapPosition(
                        twt?.[PHASE_TAP_CHANGER]?.[STEPS]
                    ),
                    tapPosition:
                        twt?.[PHASE_TAP_CHANGER]?.[TAP_POSITION]?.value,
                    steps: addSelectedFieldToRows(
                        twt?.[PHASE_TAP_CHANGER]?.[STEPS] ??
                            twtToModify?.[PHASE_TAP_CHANGER]?.[STEPS]
                    ),
                    equipmentId:
                        twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalId?.value,
                    equipmentType:
                        twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalType?.value,
                    voltageLevelId:
                        twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalVlId?.value,
                }),
            });
        },
        [reset, twtToModify, isRatioTapChangerEnabled, isPhaseTapChangerEnabled]
    );

    useEffect(() => {
        if (studyUuid && currentNodeUuid) {
            fetchVoltageLevelsListInfos(studyUuid, currentNodeUuid).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a, b) => a.id.localeCompare(b.id))
                    );
                }
            );
        }
    }, [studyUuid, currentNodeUuid]);

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(
                editData,
                updateTemporaryLimits(
                    formatTemporaryLimits(
                        editData.currentLimits1?.temporaryLimits
                    ),
                    formatTemporaryLimits(
                        twtToModify?.currentLimits1?.temporaryLimits
                    )
                ),
                updateTemporaryLimits(
                    formatTemporaryLimits(
                        editData.currentLimits2?.temporaryLimits
                    ),
                    formatTemporaryLimits(
                        twtToModify?.currentLimits2?.temporaryLimits
                    )
                )
            );
        }
    }, [fromEditDataToFormValues, editData, twtToModify]);

    const computeRatioTapChangerRegulating = (ratioTapChangerFormValues) => {
        return (
            ratioTapChangerFormValues?.[REGULATION_MODE] ===
            RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id
        );
    };

    const computePhaseTapChangerRegulationValue = (
        phaseTapChangerFormValues,
        currentRegulationMode
    ) => {
        const regulationMode =
            phaseTapChangerFormValues?.[REGULATION_MODE] ||
            currentRegulationMode;

        switch (regulationMode) {
            case PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id:
                return phaseTapChangerFormValues?.[
                    FLOW_SET_POINT_REGULATING_VALUE
                ];
            case PHASE_REGULATION_MODES.CURRENT_LIMITER.id:
                return phaseTapChangerFormValues?.[
                    CURRENT_LIMITER_REGULATING_VALUE
                ];
            default:
                return undefined;
        }
    };

    const fillPhaseTapChangerRegulationAttributes = useCallback(
        (phaseTap, phaseTapChangerFormValues, twtToModify) => {
            const regulationMode =
                phaseTapChangerFormValues?.[REGULATION_MODE] ??
                getComputedPhaseTapChangerRegulationMode(
                    twtToModify?.[PHASE_TAP_CHANGER]
                )?.id;
            const regulationType =
                phaseTapChangerFormValues?.[REGULATION_TYPE] ??
                getComputedPreviousPhaseRegulationType(twtToModify);
            if (regulationMode) {
                phaseTap.regulationType = toModificationOperation(
                    phaseTapChangerFormValues?.[REGULATION_TYPE]
                );
                if (regulationType === REGULATION_TYPES.LOCAL.id) {
                    phaseTap.regulationSide = toModificationOperation(
                        phaseTapChangerFormValues?.[REGULATION_SIDE]
                    );
                } else if (regulationType === REGULATION_TYPES.DISTANT.id) {
                    phaseTap.regulatingTerminalId = toModificationOperation(
                        phaseTapChangerFormValues?.[EQUIPMENT]?.id
                    );
                    phaseTap.regulatingTerminalType = toModificationOperation(
                        phaseTapChangerFormValues?.[EQUIPMENT]?.type
                    );
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
                phaseTap.targetDeadband = toModificationOperation(
                    phaseTapChangerFormValues[TARGET_DEADBAND]
                );
            }
        },
        []
    );

    const fillRatioTapChangerRegulationAttributes = useCallback(
        (ratioTap, ratioTapChangerFormValues, twtToModify) => {
            const loadTapChangingCapabilities =
                ratioTapChangerFormValues?.[LOAD_TAP_CHANGING_CAPABILITIES] ??
                twtToModify?.[RATIO_TAP_CHANGER]?.[
                    LOAD_TAP_CHANGING_CAPABILITIES
                ];
            const regulationType =
                ratioTapChangerFormValues?.[REGULATION_TYPE] ??
                getComputedPreviousRatioRegulationType(twtToModify);
            if (loadTapChangingCapabilities) {
                ratioTap.regulationType = toModificationOperation(
                    ratioTapChangerFormValues?.[REGULATION_TYPE]
                );
                ratioTap.regulating = toModificationOperation(
                    ratioTapChangerFormValues?.[REGULATION_MODE]
                        ? computeRatioTapChangerRegulating(
                              ratioTapChangerFormValues
                          )
                        : null
                );
                if (regulationType === REGULATION_TYPES.LOCAL.id) {
                    ratioTap.regulationSide = toModificationOperation(
                        ratioTapChangerFormValues?.[REGULATION_SIDE]
                    );
                } else if (regulationType === REGULATION_TYPES.DISTANT.id) {
                    ratioTap.regulatingTerminalId = toModificationOperation(
                        ratioTapChangerFormValues?.[EQUIPMENT]?.id
                    );
                    ratioTap.regulatingTerminalType = toModificationOperation(
                        ratioTapChangerFormValues?.[EQUIPMENT]?.type
                    );
                    ratioTap.regulatingTerminalVlId = toModificationOperation(
                        ratioTapChangerFormValues?.[VOLTAGE_LEVEL]?.[ID]
                    );
                }
                ratioTap.targetV = toModificationOperation(
                    ratioTapChangerFormValues?.[TARGET_V]
                );
                ratioTap.targetDeadband = toModificationOperation(
                    ratioTapChangerFormValues?.[TARGET_DEADBAND]
                );
            }
        },
        []
    );

    const onSubmit = useCallback(
        (twt) => {
            const characteristics = twt[CHARACTERISTICS];
            const limits = twt[LIMITS];
            const temporaryLimits1 = addModificationTypeToTemporaryLimits(
                sanitizeLimitNames(
                    limits[CURRENT_LIMITS_1]?.[TEMPORARY_LIMITS]
                ),
                twtToModify?.currentLimits1?.temporaryLimits,
                editData?.currentLimits1?.temporaryLimits,
                currentNode
            );
            let currentLimits1 = null;
            if (
                limits[CURRENT_LIMITS_1]?.[PERMANENT_LIMIT] ||
                temporaryLimits1.length > 0
            ) {
                currentLimits1 = {
                    permanentLimit: limits[CURRENT_LIMITS_1]?.[PERMANENT_LIMIT],
                    temporaryLimits: temporaryLimits1,
                };
            }
            const temporaryLimits2 = addModificationTypeToTemporaryLimits(
                sanitizeLimitNames(
                    limits[CURRENT_LIMITS_2]?.[TEMPORARY_LIMITS]
                ),
                twtToModify?.currentLimits2?.temporaryLimits,
                editData?.currentLimits2?.temporaryLimits,
                currentNode
            );
            let currentLimits2 = null;
            if (
                limits[CURRENT_LIMITS_2]?.[PERMANENT_LIMIT] ||
                temporaryLimits2.length > 0
            ) {
                currentLimits2 = {
                    permanentLimit: limits[CURRENT_LIMITS_2]?.[PERMANENT_LIMIT],
                    temporaryLimits: temporaryLimits2,
                };
            }

            let ratioTap;
            const ratioTapChangerFormValues = twt[RATIO_TAP_CHANGER];
            const enableRatioTapChanger =
                ratioTapChangerFormValues?.[ENABLED] !==
                !!twtToModify?.ratioTapChanger
                    ? ratioTapChangerFormValues?.[ENABLED]
                    : null;
            const areRatioStepsModified =
                isNodeBuilt(currentNode) &&
                editData?.[RATIO_TAP_CHANGER]?.[STEPS]
                    ? true
                    : !compareStepsWithPreviousValues(
                          ratioTapChangerFormValues[STEPS],
                          twtToModify?.[RATIO_TAP_CHANGER]?.[STEPS]
                      );
            let ratioTapChangerSteps = !areRatioStepsModified
                ? null
                : ratioTapChangerFormValues[STEPS];
            if (ratioTapChangerFormValues?.[ENABLED]) {
                ratioTap = {
                    [ENABLED]: toModificationOperation(enableRatioTapChanger),
                    [LOAD_TAP_CHANGING_CAPABILITIES]: toModificationOperation(
                        ratioTapChangerFormValues?.[
                            LOAD_TAP_CHANGING_CAPABILITIES
                        ]
                    ),
                    [TAP_POSITION]: toModificationOperation(
                        ratioTapChangerFormValues?.[TAP_POSITION]
                    ),
                    [LOW_TAP_POSITION]: toModificationOperation(
                        ratioTapChangerFormValues?.[LOW_TAP_POSITION]
                    ),
                    [STEPS]: ratioTapChangerSteps,
                };
                fillRatioTapChangerRegulationAttributes(
                    ratioTap,
                    ratioTapChangerFormValues,
                    twtToModify
                );
            } else {
                ratioTap = {
                    enabled: toModificationOperation(enableRatioTapChanger),
                };
            }

            let phaseTap;
            const phaseTapChangerFormValues = twt[PHASE_TAP_CHANGER];
            const enablePhaseTapChanger =
                phaseTapChangerFormValues?.[ENABLED] !==
                !!twtToModify?.phaseTapChanger
                    ? phaseTapChangerFormValues?.[ENABLED]
                    : null;
            const arePhaseStepsModified =
                isNodeBuilt(currentNode) &&
                editData?.[PHASE_TAP_CHANGER]?.[STEPS]
                    ? true
                    : !compareStepsWithPreviousValues(
                          phaseTapChangerFormValues[STEPS],
                          twtToModify?.[PHASE_TAP_CHANGER]?.[STEPS]
                      );
            let phaseTapChangerSteps = !arePhaseStepsModified
                ? null
                : phaseTapChangerFormValues[STEPS];
            if (phaseTapChangerFormValues?.[ENABLED]) {
                phaseTap = {
                    [ENABLED]: toModificationOperation(enablePhaseTapChanger),
                    [REGULATION_MODE]: toModificationOperation(
                        phaseTapChangerFormValues[REGULATION_MODE]
                    ),
                    [TAP_POSITION]: toModificationOperation(
                        phaseTapChangerFormValues[TAP_POSITION]
                    ),
                    [LOW_TAP_POSITION]: toModificationOperation(
                        phaseTapChangerFormValues[LOW_TAP_POSITION]
                    ),
                    [STEPS]: phaseTapChangerSteps,
                };
                fillPhaseTapChangerRegulationAttributes(
                    phaseTap,
                    phaseTapChangerFormValues,
                    twtToModify
                );
            } else {
                phaseTap = {
                    enabled: toModificationOperation(enablePhaseTapChanger),
                };
            }

            modifyTwoWindingsTransformer(
                studyUuid,
                currentNodeUuid,
                selectedId,
                toModificationOperation(sanitizeString(twt[EQUIPMENT_NAME])),
                toModificationOperation(characteristics[R]),
                toModificationOperation(characteristics[X]),
                toModificationOperation(microUnitToUnit(characteristics[G])),
                toModificationOperation(microUnitToUnit(characteristics[B])),
                toModificationOperation(characteristics[RATED_S]),
                toModificationOperation(characteristics[RATED_U1]),
                toModificationOperation(characteristics[RATED_U2]),
                currentLimits1,
                currentLimits2,
                ratioTap,
                phaseTap,
                !!editData,
                editData?.uuid
            ).catch((error) => {
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
        if (errors?.[CHARACTERISTICS] !== undefined) {
            tabsInError.push(
                TwoWindingsTransformerModificationDialogTab.CHARACTERISTICS_TAB
            );
        }
        if (errors?.[LIMITS] !== undefined) {
            tabsInError.push(
                TwoWindingsTransformerModificationDialogTab.LIMITS_TAB
            );
        }
        if (errors?.[RATIO_TAP_CHANGER] !== undefined) {
            tabsInError.push(
                TwoWindingsTransformerModificationDialogTab.RATIO_TAP_TAB
            );
        }
        if (errors?.[PHASE_TAP_CHANGER] !== undefined) {
            tabsInError.push(
                TwoWindingsTransformerModificationDialogTab.PHASE_TAP_TAB
            );
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
            !isUpdate ||
            editDataFetchStatus === FetchStatus.SUCCEED ||
            editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (equipmentId) {
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
                            if (editData?.equipmentId !== selectedId) {
                                reset((formValues) => ({
                                    ...formValues,
                                    ...getLimitsFormData({
                                        temporaryLimits1:
                                            addSelectedFieldToRows(
                                                formatTemporaryLimits(
                                                    twt.currentLimits1
                                                        ?.temporaryLimits
                                                )
                                            ),
                                        temporaryLimits2:
                                            addSelectedFieldToRows(
                                                formatTemporaryLimits(
                                                    twt.currentLimits2
                                                        ?.temporaryLimits
                                                )
                                            ),
                                    }),
                                    ...getRatioTapChangerFormData({
                                        enabled: !!twt.ratioTapChanger,
                                        loadTapChangingCapabilities: null,
                                        regulationSide: null,
                                        steps: addSelectedFieldToRows(
                                            twt?.[RATIO_TAP_CHANGER]?.[STEPS]
                                        ),
                                    }),
                                    ...getPhaseTapChangerFormData({
                                        enabled: !!twt.phaseTapChanger,
                                        regulationSide: null,
                                        steps: addSelectedFieldToRows(
                                            twt?.[PHASE_TAP_CHANGER]?.[STEPS]
                                        ),
                                    }),
                                }));
                            }
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setTwtToModify(null);
                        setDataFetchStatus(FetchStatus.FAILED);
                    });
            } else {
                setTwtToModify(null);
                reset(emptyFormData, { keepDefaultValues: true });
            }
        },
        [studyUuid, currentNodeUuid, selectedId, editData, reset]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const headerAndTabs = (
        <Grid container spacing={2}>
            <TwoWindingsTransformerModificationDialogHeader
                equipmentToModify={twtToModify}
                equipmentId={selectedId}
            />
            <TwoWindingsTransformerModificationDialogTabs
                tabIndex={tabIndex}
                tabIndexesWithError={tabIndexesWithError}
                setTabIndex={setTabIndex}
            />
        </Grid>
    );

    return (
        <FormProvider
            removeOptional={true}
            validationSchema={formSchema}
            {...formMethods}
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
                    isUpdate &&
                    (editDataFetchStatus === FetchStatus.RUNNING ||
                        dataFetchStatus === FetchStatus.RUNNING)
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
                        <Box
                            hidden={
                                tabIndex !==
                                TwoWindingsTransformerModificationDialogTab.CHARACTERISTICS_TAB
                            }
                            p={1}
                            sx={{
                                'h3:first-of-type': {
                                    marginTop: 0,
                                },
                            }}
                        >
                            <TwoWindingsTransformerCharacteristicsPane
                                twtToModify={twtToModify}
                                isModification
                            />
                        </Box>

                        <Box
                            hidden={
                                tabIndex !==
                                TwoWindingsTransformerModificationDialogTab.LIMITS_TAB
                            }
                            p={1}
                        >
                            <LimitsPane
                                currentNode={currentNode}
                                equipmentToModify={twtToModify}
                                clearableFields
                            />
                        </Box>
                        <Box
                            hidden={
                                tabIndex !==
                                TwoWindingsTransformerModificationDialogTab.RATIO_TAP_TAB
                            }
                            p={1}
                        >
                            <RatioTapChangerPane
                                studyUuid={studyUuid}
                                currentNode={currentNode}
                                voltageLevelOptions={voltageLevelOptions}
                                previousValues={twtToModify}
                                editData={editData}
                                isModification={true}
                            />
                        </Box>
                        <Box
                            hidden={
                                tabIndex !==
                                TwoWindingsTransformerModificationDialogTab.PHASE_TAP_TAB
                            }
                            p={1}
                        >
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
        </FormProvider>
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
