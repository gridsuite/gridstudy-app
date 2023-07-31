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
    ENABLED,
    EQUIPMENT,
    EQUIPMENT_NAME,
    ID,
    LOAD_TAP_CHANGING_CAPABILITIES,
    LOW_TAP_POSITION,
    MAGNETIZING_CONDUCTANCE,
    MAGNETIZING_SUSCEPTANCE,
    RATED_S,
    RATED_VOLTAGE_1,
    RATED_VOLTAGE_2,
    RATIO_TAP_CHANGER,
    REGULATING,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
    STEPS,
    TAP_POSITION,
    TARGET_DEADBAND,
    TARGET_V,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    fetchNetworkElementInfos,
    FetchStatus,
    fetchVoltageLevelsListInfos,
} from 'utils/rest-api';
import { microUnitToUnit, unitToMicroUnit } from 'utils/rounding.js';
import { sanitizeString } from '../../../dialogUtils';
import {
    FORM_LOADING_DELAY,
    RATIO_REGULATION_MODES,
    REGULATION_TYPES,
    SIDE,
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
import { modifyTwoWindingsTransformer } from '../../../../../services/study/network-modifications';
import RatioTapChangerPane, {
    previousRegulationType,
} from '../tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane';
import {
    getRatioTapChangerEmptyFormData,
    getRatioTapChangerFormData,
    getRatioTapChangerModificationValidationSchema,
} from '../tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane-utils';
import { isNodeBuilt } from 'components/graph/util/model-functions';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    ...getCharacteristicsEmptyFormData(),
    ...getLimitsEmptyFormData(),
    ...getRatioTapChangerEmptyFormData(),
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_NAME]: yup.string(),
        ...getCharacteristicsValidationSchema(true),
        ...getLimitsValidationSchema(),
        ...getRatioTapChangerModificationValidationSchema(),
    })
    .required();

export const TwoWindingsTransformerModificationDialogTab = {
    CHARACTERISTICS_TAB: 0,
    LIMITS_TAB: 1,
    RATIO_TAP_TAB: 2,
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

    const getRegulationTypeForEdit = (twt, tap) => {
        return tap?.regulatingTerminalId?.value != null
            ? tap?.regulatingTerminalId?.value === twt?.id
                ? REGULATION_TYPES.LOCAL.id
                : REGULATION_TYPES.DISTANT.id
            : null;
    };

    const getTapSideForEdit = (twt, tap) => {
        if (tap?.regulatingTerminalVlId?.value == null) {
            return null;
        }
        return tap?.regulatingTerminalId?.value === twt?.id
            ? tap?.regulatingTerminalVlId?.value === twt?.voltageLevelId1
                ? SIDE.SIDE1.id
                : SIDE.SIDE2.id
            : null;
    };

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

    const fromEditDataToFormValues = useCallback(
        (twt, updatedTemporaryLimits1, updatedTemporaryLimits2) => {
            if (twt?.equipmentId) {
                setSelectedId(twt.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: twt.equipmentName?.value,
                ...getCharacteristicsFormData({
                    seriesResistance: twt.seriesResistance?.value,
                    seriesReactance: twt.seriesReactance?.value,
                    magnetizingConductance: unitToMicroUnit(
                        twt.magnetizingConductance?.value
                    ),
                    magnetizingSusceptance: unitToMicroUnit(
                        twt.magnetizingSusceptance?.value
                    ),
                    ratedVoltage1: twt.ratedVoltage1?.value,
                    ratedVoltage2: twt.ratedVoltage2?.value,
                    ratedS: twt.ratedS?.value,
                }),
                ...getLimitsFormData({
                    permanentLimit1: twt.currentLimits1?.permanentLimit,
                    permanentLimit2: twt.currentLimits2?.permanentLimit,
                    temporaryLimits1: addSelectedFieldToRows(
                        updatedTemporaryLimits1
                            ? updatedTemporaryLimits1
                            : formatTemporaryLimits(
                                  twt.currentLimits1?.temporaryLimits
                              )
                    ),
                    temporaryLimits2: addSelectedFieldToRows(
                        updatedTemporaryLimits2
                            ? updatedTemporaryLimits2
                            : formatTemporaryLimits(
                                  twt.currentLimits2?.temporaryLimits
                              )
                    ),
                }),
                ...getRatioTapChangerFormData({
                    enabled: twt?.[RATIO_TAP_CHANGER]?.[ENABLED]?.value,
                    loadTapChangingCapabilities:
                        twt?.[RATIO_TAP_CHANGER]?.[
                            LOAD_TAP_CHANGING_CAPABILITIES
                        ]?.value ?? null,
                    regulationMode: computeRatioTapChangerRegulationMode(
                        twt?.[RATIO_TAP_CHANGER]
                    ),
                    regulationType: getRegulationTypeForEdit(
                        twtToModify,
                        twt?.[RATIO_TAP_CHANGER]
                    ),
                    regulationSide: getTapSideForEdit(
                        twtToModify,
                        twt?.[RATIO_TAP_CHANGER]
                    ),
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
            });
        },
        [reset, twtToModify]
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

    const computeRegulatingTerminalId = useCallback(
        (tapChangerValue, currentTwtId) => {
            const regulationType =
                tapChangerValue?.[REGULATION_TYPE] ??
                previousRegulationType(twtToModify);
            if (regulationType === REGULATION_TYPES.LOCAL.id) {
                return currentTwtId;
            } else {
                return tapChangerValue?.[EQUIPMENT]?.id;
            }
        },
        [twtToModify]
    );

    const computeTapTerminalVlId = useCallback(
        (tapChangerValue, vlId1, vlId2) => {
            const regulationType =
                tapChangerValue?.[REGULATION_TYPE] ??
                previousRegulationType(twtToModify);
            if (regulationType === REGULATION_TYPES.LOCAL.id) {
                if (!tapChangerValue?.[REGULATION_SIDE]) {
                    return undefined;
                }
                if (tapChangerValue?.[REGULATION_SIDE] === SIDE.SIDE1.id) {
                    return vlId1;
                } else {
                    return vlId2;
                }
            } else {
                return tapChangerValue?.[VOLTAGE_LEVEL]?.[ID];
            }
        },
        [twtToModify]
    );

    const computeRegulatingTerminalType = useCallback(
        (tapChangerValue) => {
            if (tapChangerValue?.[EQUIPMENT]?.type) {
                return tapChangerValue?.[EQUIPMENT]?.type;
            }

            const regulationType =
                tapChangerValue?.[REGULATION_TYPE] ??
                previousRegulationType(twtToModify);
            if (regulationType === REGULATION_TYPES.LOCAL.id) {
                return EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type;
            }

            return undefined;
        },
        [twtToModify]
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

            let ratioTap = undefined;
            const ratioTapChangerFormValues = twt[RATIO_TAP_CHANGER];
            const enableRatioTapChanger = ratioTapChangerFormValues?.[ENABLED];
            const areStepsModified =
                isNodeBuilt(currentNode) &&
                editData?.[RATIO_TAP_CHANGER]?.[STEPS]
                    ? true
                    : !compareStepsWithPreviousValues(
                          ratioTapChangerFormValues[STEPS],
                          twtToModify?.[RATIO_TAP_CHANGER]?.[STEPS]
                      );
            let ratioTapChangerSteps = !areStepsModified
                ? null
                : ratioTapChangerFormValues[STEPS];
            if (enableRatioTapChanger) {
                ratioTap = {
                    enabled: toModificationOperation(true),
                    lowTapPosition: toModificationOperation(
                        ratioTapChangerFormValues?.[LOW_TAP_POSITION]
                    ),
                    tapPosition: toModificationOperation(
                        ratioTapChangerFormValues?.[TAP_POSITION]
                    ),
                    targetDeadband: toModificationOperation(
                        ratioTapChangerFormValues?.[TARGET_DEADBAND]
                    ),
                    targetV: toModificationOperation(
                        ratioTapChangerFormValues?.[TARGET_V]
                    ),
                    loadTapChangingCapabilities: toModificationOperation(
                        ratioTapChangerFormValues?.[
                            LOAD_TAP_CHANGING_CAPABILITIES
                        ]
                    ),
                    regulating: toModificationOperation(
                        ratioTapChangerFormValues?.[REGULATION_MODE]
                            ? computeRatioTapChangerRegulating(
                                  ratioTapChangerFormValues
                              )
                            : null
                    ),
                    regulatingTerminalId: toModificationOperation(
                        computeRegulatingTerminalId(
                            ratioTapChangerFormValues,
                            selectedId
                        )
                    ),
                    regulatingTerminalType: toModificationOperation(
                        computeRegulatingTerminalType(ratioTapChangerFormValues)
                    ),
                    regulatingTerminalVlId: toModificationOperation(
                        computeTapTerminalVlId(
                            ratioTapChangerFormValues,
                            twtToModify?.voltageLevelId1,
                            twtToModify?.voltageLevelId2
                        )
                    ),
                    steps: ratioTapChangerSteps,
                };
            } else {
                ratioTap = {
                    enabled: toModificationOperation(false),
                };
            }

            modifyTwoWindingsTransformer(
                studyUuid,
                currentNodeUuid,
                selectedId,
                toModificationOperation(sanitizeString(twt[EQUIPMENT_NAME])),
                toModificationOperation(characteristics[SERIES_RESISTANCE]),
                toModificationOperation(characteristics[SERIES_REACTANCE]),
                toModificationOperation(
                    microUnitToUnit(characteristics[MAGNETIZING_CONDUCTANCE])
                ),
                toModificationOperation(
                    microUnitToUnit(characteristics[MAGNETIZING_SUSCEPTANCE])
                ),
                toModificationOperation(characteristics[RATED_S]),
                toModificationOperation(characteristics[RATED_VOLTAGE_1]),
                toModificationOperation(characteristics[RATED_VOLTAGE_2]),
                currentLimits1,
                currentLimits2,
                ratioTap,
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
            computeRegulatingTerminalId,
            computeTapTerminalVlId,
            computeRegulatingTerminalType,
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
                    EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type,
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
                                        enabled:
                                            twt?.[RATIO_TAP_CHANGER]?.[
                                                TAP_POSITION
                                            ] !== undefined,
                                        loadTapChangingCapabilities: null,
                                        regulationSide: null,
                                        steps: addSelectedFieldToRows(
                                            twt?.[RATIO_TAP_CHANGER]?.[STEPS]
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
                        equipmentType={
                            EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type
                        }
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
