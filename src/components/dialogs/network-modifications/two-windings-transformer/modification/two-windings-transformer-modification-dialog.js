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
    EQUIPMENT_ID,
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
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
    STEPS,
    STEPS_TAP,
    TAP_POSITION,
    TARGET_DEADBAND,
    TARGET_V,
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
} from '../../../limits/limits-pane-utils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import TwoWindingsTransformerModificationDialogHeader from './two-windings-transformer-modification-dialog-header';
import {
    formatTemporaryLimits,
    toModificationOperation,
} from '../../../../utils/utils';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from '../../../../utils/equipment-types';
import RatioTapChangerPane from '../creation/tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane';
import {
    getRatioTapChangerEmptyFormData,
    getRatioTapChangerFormData,
    getRatioTapChangerValidationSchema,
} from '../creation/tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane-utils';

export const TwoWindingsTransformerModificationDialogTab = {
    CHARACTERISTICS_TAB: 0,
    LIMITS_TAB: 1,
    RATIO_TAP_TAB: 2,
};

/**
 * Dialog to modify a two windings transformer in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode The node we are currently working on
 * @param isUpdate check if edition form
 * @param editData the data to edit
 * @param editDataFetchStatus indicates the status of fetching EditData
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const TwoWindingsTransformerModificationDialog = ({
    studyUuid,
    defaultIdValue,
    currentNode,
    isUpdate,
    editData,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [tabIndex, setTabIndex] = useState(
        TwoWindingsTransformerModificationDialogTab.CHARACTERISTICS_TAB
    );
    const [tabIndexesWithError, setTabIndexesWithError] = useState([]);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const [twtToModify, setTwtToModify] = useState(null);
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);

    const emptyFormData = useMemo(() => {
        return {
            [EQUIPMENT_ID]: defaultIdValue ?? null,
            [EQUIPMENT_NAME]: '',
            ...getCharacteristicsEmptyFormData(),
            ...getLimitsEmptyFormData(),
            ...getRatioTapChangerEmptyFormData(),
        };
    }, [defaultIdValue]);

    const formSchema = yup
        .object()
        .shape({
            [EQUIPMENT_ID]: yup.string().required(),
            [EQUIPMENT_NAME]: yup.string(),
            ...getCharacteristicsValidationSchema(true),
            ...getLimitsValidationSchema(),
            ...getRatioTapChangerValidationSchema(true),
        })
        .required();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const { reset, getValues } = formMethods;

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
        (twt) => {
            reset({
                [EQUIPMENT_ID]: twt.equipmentId,
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
                        formatTemporaryLimits(
                            twt.currentLimits1?.temporaryLimits
                        )
                    ),
                    temporaryLimits2: addSelectedFieldToRows(
                        formatTemporaryLimits(
                            twt.currentLimits2?.temporaryLimits
                        )
                    ),
                }),
                ...getRatioTapChangerFormData({
                    enabled:
                        twt?.[RATIO_TAP_CHANGER]?.[TAP_POSITION] !== undefined,
                    loadTapChangingCapabilities:
                        twt?.[RATIO_TAP_CHANGER]?.[
                            LOAD_TAP_CHANGING_CAPABILITIES
                        ] ?? null,
                    regulationMode: twt?.[RATIO_TAP_CHANGER]?.[REGULATION_MODE],
                    regulationType: getRegulationTypeForEdit(
                        twt,
                        twt?.[RATIO_TAP_CHANGER]
                    ),
                    regulationSide: getTapSideForEdit(
                        twt,
                        twt?.[RATIO_TAP_CHANGER]
                    ),
                    targetV: twt?.[RATIO_TAP_CHANGER]?.[TARGET_V],
                    targetDeadband: twt?.[RATIO_TAP_CHANGER]?.[TARGET_DEADBAND],
                    lowTapPosition:
                        twt?.[RATIO_TAP_CHANGER]?.[LOW_TAP_POSITION],
                    highTapPosition: computeHighTapPosition(
                        twt?.[RATIO_TAP_CHANGER]?.[STEPS]
                    ),
                    tapPosition: twt?.[RATIO_TAP_CHANGER]?.[TAP_POSITION],
                    steps: addSelectedFieldToRows(
                        twt?.[RATIO_TAP_CHANGER]?.[STEPS]
                    ),
                    equipmentId: twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalId,
                    equipmentType:
                        twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalType,
                    voltageLevelId:
                        twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalVlId,
                }),
            });
        },
        [reset]
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
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const computeRatioTapChangerRegulating = (ratioTapChangerFormValues) => {
        return (
            ratioTapChangerFormValues?.[REGULATION_MODE] ===
            RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id
        );
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

            const enableRatioTapChanger = twt[RATIO_TAP_CHANGER]?.[ENABLED];

            let ratioTap = undefined;
            if (enableRatioTapChanger) {
                const ratioTapChangerFormValues = twt[RATIO_TAP_CHANGER];
                ratioTap = {
                    regulating: ratioTapChangerFormValues?.[REGULATION_MODE]
                        ? computeRatioTapChangerRegulating(
                              ratioTapChangerFormValues
                          )
                        : null,
                    regulatingTerminalId: computeRegulatingTerminalId(
                        ratioTapChangerFormValues,
                        twt[EQUIPMENT_ID]
                    ),
                    regulatingTerminalType: computeRegulatingTerminalType(
                        ratioTapChangerFormValues
                    ),
                    regulatingTerminalVlId: computeTapTerminalVlId(
                        ratioTapChangerFormValues,
                        twt.voltageLevelId1,
                        twt.voltageLevelId2
                    ),
                    ...ratioTapChangerFormValues,
                };
            }

            modifyTwoWindingsTransformer(
                studyUuid,
                currentNodeUuid,
                twt[EQUIPMENT_ID],
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
            studyUuid,
            currentNode,
            currentNodeUuid,
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
        if (errors?.[RATIO_TAP_CHANGER] !== undefined) {
            tabsInError.push(
                TwoWindingsTransformerModificationDialogTab.RATIO_TAP_TAB
            );
        }
        setTabIndexesWithError(tabsInError);
    };

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset, emptyFormData]);

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
                            if (
                                editData?.equipmentId !==
                                getValues(`${EQUIPMENT_ID}`)
                            ) {
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
                                        ...getRatioTapChangerFormData({
                                            enabled:
                                                twt?.[RATIO_TAP_CHANGER]?.[
                                                    TAP_POSITION
                                                ] !== undefined,
                                            loadTapChangingCapabilities: null,
                                            regulationSide: null,
                                            steps: addSelectedFieldToRows(
                                                twt?.[RATIO_TAP_CHANGER]?.[
                                                    STEPS
                                                ]
                                            ),
                                        }),
                                    }),
                                    { keepDefaultValues: true }
                                );
                            } else {
                                fromEditDataToFormValues(editData);
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
                emptyFormData[EQUIPMENT_ID] = null; // force it to null when reset because of defaultIdValue
                reset(emptyFormData, { keepDefaultValues: true });
            }
        },
        [
            studyUuid,
            currentNodeUuid,
            editData,
            getValues,
            reset,
            emptyFormData,
            fromEditDataToFormValues,
        ]
    );

    const headerAndTabs = (
        <Grid container spacing={2}>
            <TwoWindingsTransformerModificationDialogHeader
                studyUuid={studyUuid}
                currentNode={currentNode}
                onEquipmentIdChange={onEquipmentIdChange}
                equipmentToModify={twtToModify}
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
                subtitle={headerAndTabs}
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
                        modifiedEquipment={editData}
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
                        currentNodeUuid={currentNodeUuid}
                        voltageLevelOptions={voltageLevelOptions}
                        previousValues={twtToModify}
                        isModification={true}
                    />
                </Box>
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
