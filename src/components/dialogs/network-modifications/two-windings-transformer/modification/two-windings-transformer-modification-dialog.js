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
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FLOW_SET_POINT_REGULATING_VALUE,
    ID,
    LOW_TAP_POSITION,
    MAGNETIZING_CONDUCTANCE,
    MAGNETIZING_SUSCEPTANCE,
    PHASE_TAP_CHANGER,
    RATED_S,
    RATED_VOLTAGE_1,
    RATED_VOLTAGE_2,
    REGULATING,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
    STEPS,
    STEPS_TAP,
    TAP_POSITION,
    TARGET_DEADBAND,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    fetchNetworkElementInfos,
    FetchStatus,
    fetchVoltageLevelsListInfos,
    modifyTwoWindingsTransformer,
} from 'utils/rest-api';
import { microUnitToUnit, unitToMicroUnit } from 'utils/rounding.js';
import { sanitizeString } from '../../../dialogUtils';
import {
    FORM_LOADING_DELAY,
    PHASE_REGULATION_MODES,
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
    formatPhaseTapSteps,
    formatTemporaryLimits,
    toModificationOperation,
} from '../../../../utils/utils';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from '../../../../utils/equipment-types';
import PhaseTapChangerPane from '../tap-changer-pane/phase-tap-changer-pane/phase-tap-changer-pane';
import {
    getPhaseTapChangerEmptyFormData,
    getPhaseTapChangerFormData,
    getPhaseTapChangerValidationSchema,
} from '../tap-changer-pane/phase-tap-changer-pane/phase-tap-changer-pane-utils';
import { EquipmentIdSelector } from 'components/dialogs/equipment-id/equipment-id-selector';

export const TwoWindingsTransformerModificationDialogTab = {
    CHARACTERISTICS_TAB: 0,
    LIMITS_TAB: 1,
    PHASE_TAP_TAB: 2,
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

    const emptyFormData = useMemo(() => {
        return {
            [EQUIPMENT_NAME]: '',
            ...getCharacteristicsEmptyFormData(),
            ...getLimitsEmptyFormData(),
            ...getPhaseTapChangerEmptyFormData(),
        };
    }, []);

    const formSchema = yup
        .object()
        .shape({
            [EQUIPMENT_NAME]: yup.string(),
            ...getCharacteristicsValidationSchema(true),
            ...getLimitsValidationSchema(),
            ...getPhaseTapChangerValidationSchema(true),
        })
        .required();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const { reset } = formMethods;

    const [dialogWidth, setDialogWidth] = useState('xl');
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);

    const getRegulationTypeForEdit = (twt, tap) => {
        return tap?.regulatingTerminalId != null
            ? tap?.regulatingTerminalId === twt.equipmentId
                ? REGULATION_TYPES.LOCAL.id
                : REGULATION_TYPES.DISTANT.id
            : null;
    };

    const getTapSideForEdit = (twt, tap) => {
        return tap?.regulatingTerminalId === twt.equipmentId
            ? tap?.regulatingTerminalVlId === twt?.voltageLevelId1
                ? SIDE.SIDE1.id
                : SIDE.SIDE2.id
            : null;
    };

    const computeHighTapPosition = (steps) => {
        const values = steps?.map((step) => step[STEPS_TAP]);
        return Array.isArray(values) && values.length > 0
            ? Math.max(...values)
            : null;
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
                ...getPhaseTapChangerFormData({
                    enabled: twt?.[PHASE_TAP_CHANGER]?.[STEPS] !== undefined,
                    regulationMode:
                        twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE]?.value,
                    regulationType: getRegulationTypeForEdit(
                        twt,
                        twt?.[PHASE_TAP_CHANGER]
                    ),
                    regulationSide: getTapSideForEdit(
                        twt,
                        twt?.[PHASE_TAP_CHANGER]
                    ),
                    currentLimiterRegulatingValue:
                        twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE] ===
                        PHASE_REGULATION_MODES.CURRENT_LIMITER.id
                            ? twt?.[PHASE_TAP_CHANGER]?.regulationValue?.value
                            : undefined,
                    flowSetpointRegulatingValue:
                        twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE] ===
                        PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id
                            ? twt?.[PHASE_TAP_CHANGER]?.regulationValue?.value
                            : undefined,
                    targetDeadband: twt?.[PHASE_TAP_CHANGER]?.[TARGET_DEADBAND],
                    lowTapPosition:
                        twt?.[PHASE_TAP_CHANGER]?.[LOW_TAP_POSITION]?.value,
                    highTapPosition: computeHighTapPosition(
                        twt?.[PHASE_TAP_CHANGER]?.[STEPS]
                    ),
                    tapPosition:
                        twt?.[PHASE_TAP_CHANGER]?.[TAP_POSITION]?.value,
                    steps: addSelectedFieldToRows(
                        twt?.[PHASE_TAP_CHANGER]?.[STEPS]
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
        [reset]
    );

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

    const computePhaseTapChangerRegulating = (
        phaseTapChangerFormValues,
        currentRegulating
    ) => {
        if (
            phaseTapChangerFormValues?.[REGULATION_MODE] ===
                PHASE_REGULATION_MODES.CURRENT_LIMITER.id ||
            phaseTapChangerFormValues?.[REGULATION_MODE] ===
                PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id
        ) {
            if (currentRegulating === true) {
                return undefined;
            }
            return true;
        } else {
            if (currentRegulating === false) {
                return undefined;
            }
            return false;
        }
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

    const computeRegulatingTerminalId = (tapChangerValue, currentTwtId) => {
        if (tapChangerValue?.[REGULATION_TYPE] === REGULATION_TYPES.LOCAL.id) {
            return currentTwtId;
        } else {
            return tapChangerValue?.[EQUIPMENT]?.id;
        }
    };

    const computeTapTerminalVlId = (tapChangerValue, vlId1, vlId2) => {
        if (tapChangerValue?.[REGULATION_TYPE] === REGULATION_TYPES.LOCAL.id) {
            if (tapChangerValue?.[REGULATION_SIDE] === SIDE.SIDE1.id) {
                return vlId1;
            } else {
                return vlId2;
            }
        } else {
            return tapChangerValue?.[VOLTAGE_LEVEL]?.[ID];
        }
    };

    const computeRegulatingTerminalType = (tapChangerValue) => {
        if (tapChangerValue?.[EQUIPMENT]?.type) {
            return tapChangerValue?.[EQUIPMENT]?.type;
        }

        if (tapChangerValue?.[REGULATION_TYPE] === REGULATION_TYPES.LOCAL.id) {
            return EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type;
        }

        return undefined;
    };

    const onSubmit = useCallback(
        (twt) => {
            const characteristics = twt[CHARACTERISTICS];
            const limits = twt[LIMITS];

            const currentLimits1 = {
                permanentLimit: limits[CURRENT_LIMITS_1]?.[PERMANENT_LIMIT],
                temporaryLimits: addModificationTypeToTemporaryLimits(
                    sanitizeLimitNames(
                        limits[CURRENT_LIMITS_1]?.[TEMPORARY_LIMITS]
                    ),
                    twtToModify?.currentLimits1?.temporaryLimits,
                    editData?.currentLimits1?.temporaryLimits,
                    currentNode
                ),
            };

            const currentLimits2 = {
                permanentLimit: limits[CURRENT_LIMITS_2]?.[PERMANENT_LIMIT],
                temporaryLimits: addModificationTypeToTemporaryLimits(
                    sanitizeLimitNames(
                        limits[CURRENT_LIMITS_2]?.[TEMPORARY_LIMITS]
                    ),
                    twtToModify?.currentLimits2?.temporaryLimits,
                    editData?.currentLimits2?.temporaryLimits,
                    currentNode
                ),
            };

            const enablePhaseTapChanger = twt[PHASE_TAP_CHANGER]?.[ENABLED];

            let phaseTapChanger = undefined;
            if (enablePhaseTapChanger) {
                const phaseTapChangerFormValues = twt[PHASE_TAP_CHANGER];
                phaseTapChanger = {
                    regulating: toModificationOperation(
                        computePhaseTapChangerRegulating(
                            phaseTapChangerFormValues,
                            twtToModify?.[PHASE_TAP_CHANGER]?.[REGULATING]
                        )
                    ),
                    regulationValue: toModificationOperation(
                        computePhaseTapChangerRegulationValue(
                            phaseTapChangerFormValues,
                            twtToModify?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE]
                        )
                    ),
                    regulatingTerminalId: toModificationOperation(
                        computeRegulatingTerminalId(
                            phaseTapChangerFormValues,
                            twt[EQUIPMENT_ID]
                        )
                    ),
                    regulatingTerminalType: toModificationOperation(
                        computeRegulatingTerminalType(phaseTapChangerFormValues)
                    ),
                    regulatingTerminalVlId: toModificationOperation(
                        computeTapTerminalVlId(
                            phaseTapChangerFormValues,
                            twt.voltageLevelId1,
                            twt.voltageLevelId2
                        )
                    ),
                    [REGULATION_MODE]: toModificationOperation(
                        phaseTapChangerFormValues[REGULATION_MODE]
                    ),
                    [TAP_POSITION]: toModificationOperation(
                        phaseTapChangerFormValues[TAP_POSITION]
                    ),
                    [LOW_TAP_POSITION]: toModificationOperation(
                        phaseTapChangerFormValues[LOW_TAP_POSITION]
                    ),
                    [TARGET_DEADBAND]: toModificationOperation(
                        phaseTapChangerFormValues[TARGET_DEADBAND]
                    ),
                    [STEPS]: phaseTapChangerFormValues[STEPS],
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
                phaseTapChanger,
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
            studyUuid,
            currentNode,
            currentNodeUuid,
            selectedId,
            snackError,
            editData,
            twtToModify,
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
        if (errors?.[PHASE_TAP_CHANGER] !== undefined) {
            tabsInError.push(
                TwoWindingsTransformerModificationDialogTab.PHASE_TAP_TAB
            );
        }
        setTabIndexesWithError(tabsInError);
    };

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [emptyFormData, reset]);

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
                            console.log(twt);
                            setTwtToModify(twt);
                            if (editData?.equipmentId !== selectedId) {
                                reset(
                                    (formValues) => ({
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
                                        ...getPhaseTapChangerFormData({
                                            ...formValues.phaseTapChanger,
                                            enabled: !!twt.phaseTapChanger,
                                            steps: addSelectedFieldToRows(
                                                formatPhaseTapSteps(
                                                    twt?.[PHASE_TAP_CHANGER]?.[
                                                        STEPS
                                                    ]
                                                )
                                            ),
                                        }),
                                    }),
                                    { keepDefaultValues: true }
                                );
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
        [
            studyUuid,
            currentNodeUuid,
            editData?.equipmentId,
            selectedId,
            reset,
            emptyFormData,
        ]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

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
                setDialogWidth={setDialogWidth}
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
                maxWidth={dialogWidth}
                titleId="ModifyTwoWindingsTransformer"
                aria-labelledby="dialog-modify-two-windings-transformer"
                subtitle={selectedId != null ? headerAndTabs : undefined}
                onClear={clear}
                onSave={onSubmit}
                onValidationError={onValidationError}
                open={open}
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
                                modification
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
                                TwoWindingsTransformerModificationDialogTab.PHASE_TAP_TAB
                            }
                            p={1}
                        >
                            <PhaseTapChangerPane
                                modification
                                studyUuid={studyUuid}
                                currentNodeUuid={currentNodeUuid}
                                voltageLevelOptions={voltageLevelOptions}
                                twtToModify={twtToModify}
                                modifiedEquipment={editData}
                                clearableFields
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
