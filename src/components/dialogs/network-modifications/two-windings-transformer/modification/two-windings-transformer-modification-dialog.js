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
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    MAGNETIZING_CONDUCTANCE,
    MAGNETIZING_SUSCEPTANCE,
    RATED_S,
    RATED_VOLTAGE_1,
    RATED_VOLTAGE_2,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
} from 'components/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    fetchEquipmentInfos,
    FetchStatus,
    modifyTwoWindingsTransformer,
} from 'utils/rest-api';
import { microUnitToUnit, unitToMicroUnit } from 'utils/rounding.js';
import { sanitizeString } from '../../../dialogUtils';
import { FORM_LOADING_DELAY } from 'components/network/constants';
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
    getLimitsEmptyFormData,
    getLimitsFormData,
    getLimitsValidationSchema,
    sanitizeLimitNames,
} from '../../../limits/limits-pane-utils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import TwoWindingsTransformerModificationDialogHeader from './two-windings-transformer-modification-dialog-header';
import { formatTemporaryLimits } from '../../../../utils/utils';

export const TwoWindingsTransformerModificationDialogTab = {
    CHARACTERISTICS_TAB: 0,
    LIMITS_TAB: 1,
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

    const emptyFormData = useMemo(() => {
        return {
            [EQUIPMENT_ID]: '',
            [EQUIPMENT_NAME]: '',
            ...getCharacteristicsEmptyFormData(),
            ...getLimitsEmptyFormData(),
        };
    }, []);

    const formSchema = yup
        .object()
        .shape({
            [EQUIPMENT_ID]: yup.string().required(),
            [EQUIPMENT_NAME]: yup.string(),
            ...getCharacteristicsValidationSchema(true),
            ...getLimitsValidationSchema(),
        })
        .required();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const { reset, getValues } = formMethods;

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
                        twt.currentLimits1?.temporaryLimits
                    ),
                    temporaryLimits2: addSelectedFieldToRows(
                        twt.currentLimits2?.temporaryLimits
                    ),
                }),
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (twt) => {
            const characteristics = twt[CHARACTERISTICS];
            const limits = twt[LIMITS];

            const currentLimits1 = {
                permanentLimit: limits[CURRENT_LIMITS_1]?.[PERMANENT_LIMIT],
                temporaryLimits: sanitizeLimitNames(
                    limits[CURRENT_LIMITS_1]?.[TEMPORARY_LIMITS]
                ),
            };

            const currentLimits2 = {
                permanentLimit: limits[CURRENT_LIMITS_2]?.[PERMANENT_LIMIT],
                temporaryLimits: sanitizeLimitNames(
                    limits[CURRENT_LIMITS_2]?.[TEMPORARY_LIMITS]
                ),
            };

            modifyTwoWindingsTransformer(
                studyUuid,
                currentNodeUuid,
                twt[EQUIPMENT_ID],
                sanitizeString(twt[EQUIPMENT_NAME]),
                characteristics[SERIES_RESISTANCE],
                characteristics[SERIES_REACTANCE],
                microUnitToUnit(characteristics[MAGNETIZING_CONDUCTANCE]),
                microUnitToUnit(characteristics[MAGNETIZING_SUSCEPTANCE]),
                characteristics[RATED_S],
                characteristics[RATED_VOLTAGE_1],
                characteristics[RATED_VOLTAGE_2],
                currentLimits1,
                currentLimits2,
                editData ? true : false,
                editData?.uuid
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'TwoWindingsTransformerModificationError',
                });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
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
                fetchEquipmentInfos(
                    studyUuid,
                    currentNodeUuid,
                    '2-windings-transformers',
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
                maxWidth={'md'}
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
