/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    PERMANENT_LIMIT,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
    SHUNT_CONDUCTANCE_1,
    SHUNT_CONDUCTANCE_2,
    SHUNT_SUSCEPTANCE_1,
    SHUNT_SUSCEPTANCE_2,
    CHARACTERISTICS,
    LIMITS,
    TEMPORARY_LIMITS,
} from 'components/utils/field-constants';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    fetchNetworkElementInfos,
    FetchStatus,
    modifyLine,
} from 'utils/rest-api';
import { sanitizeString } from 'components/dialogs/dialogUtils';
import { microUnitToUnit, unitToMicroUnit } from '../../../../utils/rounding';
import yup from '../../../utils/yup-config';
import ModificationDialog from '../../commons/modificationDialog';

import { addSelectedFieldToRows } from 'components/utils/dnd-table/dnd-table';
import {
    getLimitsEmptyFormData,
    getLimitsFormData,
    getLimitsValidationSchema,
} from '../../limits/limits-pane-utils';
import LineModificationForm from './line-modification-form';
import {
    getCharacteristicsEmptyFormData,
    getCharacteristicsValidationSchema,
    getCharacteristicsWithOutConnectivityFormData,
} from '../characteristics-pane/line-characteristics-pane-utils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from '../../../utils/equipment-types';

export const LineCreationDialogTab = {
    CHARACTERISTICS_TAB: 0,
    LIMITS_TAB: 1,
};

/**
 * Dialog to modify a line in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode The node we are currently working on
 * @param editData the data to edit
 * @param displayConnectivity to display connectivity section or not
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param isUpdate check if edition form
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const LineModificationDialog = ({
    editData,
    studyUuid,
    currentNode,
    displayConnectivity = false,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [tabIndexesWithError, setTabIndexesWithError] = useState([]);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const [lineToModify, setLineToModify] = useState(null);

    const sanitizeLimitNames = (temporaryLimitList) =>
        temporaryLimitList.map(({ name, ...temporaryLimit }) => ({
            ...temporaryLimit,
            name: sanitizeString(name),
        }));

    const formatTemporaryLimits = (temporaryLimits) =>
        temporaryLimits?.map((limit) => {
            return {
                name: limit?.name,
                value: limit?.value,
                acceptableDuration: limit?.acceptableDuration,
            };
        });

    const emptyFormData = useMemo(
        () => ({
            [EQUIPMENT_ID]: '',
            [EQUIPMENT_NAME]: '',
            ...getCharacteristicsEmptyFormData(
                CHARACTERISTICS,
                displayConnectivity
            ),
            ...getLimitsEmptyFormData(),
        }),
        [displayConnectivity]
    );

    const schema = yup
        .object()
        .shape({
            [EQUIPMENT_ID]: yup.string().required(),
            [EQUIPMENT_NAME]: yup.string(),
            ...getCharacteristicsValidationSchema(
                CHARACTERISTICS,
                displayConnectivity,
                true
            ),
            ...getLimitsValidationSchema(),
        })
        .required();

    const formDataFromEditData = useMemo(
        () =>
            editData
                ? {
                      [EQUIPMENT_ID]: editData.equipmentId,
                      [EQUIPMENT_NAME]: editData.equipmentName?.value ?? '',
                      ...getCharacteristicsWithOutConnectivityFormData({
                          seriesResistance:
                              editData.seriesResistance?.value ?? null,
                          seriesReactance:
                              editData.seriesReactance?.value ?? null,
                          shuntConductance1: unitToMicroUnit(
                              editData.shuntConductance1?.value ?? null
                          ),
                          shuntSusceptance1: unitToMicroUnit(
                              editData.shuntSusceptance1?.value ?? null
                          ),
                          shuntConductance2: unitToMicroUnit(
                              editData.shuntConductance2?.value ?? null
                          ),
                          shuntSusceptance2: unitToMicroUnit(
                              editData.shuntSusceptance2?.value ?? null
                          ),
                      }),
                      ...getLimitsFormData({
                          permanentLimit1:
                              editData.currentLimits1?.permanentLimit,
                          permanentLimit2:
                              editData.currentLimits2?.permanentLimit,
                          temporaryLimits1: addSelectedFieldToRows(
                              formatTemporaryLimits(
                                  editData.currentLimits1?.temporaryLimits
                              )
                          ),
                          temporaryLimits2: addSelectedFieldToRows(
                              formatTemporaryLimits(
                                  editData.currentLimits2?.temporaryLimits
                              )
                          ),
                      }),
                  }
                : null,
        [editData]
    );

    const defaultFormData = useMemo(() => {
        if (!editData) {
            return emptyFormData;
        } else {
            return formDataFromEditData;
        }
    }, [editData, emptyFormData, formDataFromEditData]);

    const methods = useForm({
        defaultValues: defaultFormData,
        resolver: yupResolver(schema),
    });

    const { reset, getValues, setValue } = methods;

    const onSubmit = useCallback(
        (line) => {
            const characteristics = line[CHARACTERISTICS];
            const limits = line[LIMITS];
            modifyLine(
                studyUuid,
                currentNodeUuid,
                line[EQUIPMENT_ID],
                sanitizeString(line[EQUIPMENT_NAME]),
                characteristics[SERIES_RESISTANCE],
                characteristics[SERIES_REACTANCE],
                microUnitToUnit(characteristics[SHUNT_CONDUCTANCE_1]),
                microUnitToUnit(characteristics[SHUNT_SUSCEPTANCE_1]),
                microUnitToUnit(characteristics[SHUNT_CONDUCTANCE_2]),
                microUnitToUnit(characteristics[SHUNT_SUSCEPTANCE_2]),
                limits[CURRENT_LIMITS_1]?.[PERMANENT_LIMIT],
                limits[CURRENT_LIMITS_2]?.[PERMANENT_LIMIT],
                sanitizeLimitNames(
                    limits[CURRENT_LIMITS_1]?.[TEMPORARY_LIMITS]
                ),
                sanitizeLimitNames(
                    limits[CURRENT_LIMITS_2]?.[TEMPORARY_LIMITS]
                ),
                editData ? true : false,
                editData ? editData.uuid : undefined
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LineModificationError',
                });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [emptyFormData, reset]);

    useEffect(() => {
        if (editData) {
            setValue(EQUIPMENT_ID, editData?.equipmentId);
        }
    }, [editData, setValue]);

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    EQUIPMENT_TYPES.LINE.type,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((line) => {
                        if (line) {
                            setLineToModify(line);
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
                                                    line.currentLimits1
                                                        ?.temporaryLimits
                                                ),
                                            temporaryLimits2:
                                                addSelectedFieldToRows(
                                                    line.currentLimits2
                                                        ?.temporaryLimits
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
                        setLineToModify(null);
                        setDataFetchStatus(FetchStatus.FAILED);
                    });
            } else {
                setLineToModify(null);

                reset(emptyFormData, { keepDefaultValues: true });
            }
        },
        [studyUuid, currentNodeUuid, editData, getValues, reset, emptyFormData]
    );

    const onValidationError = (errors) => {
        let tabsInError = [];
        if (errors?.[LIMITS] !== undefined) {
            tabsInError.push(LineCreationDialogTab.LIMITS_TAB);
        }
        if (errors?.[CHARACTERISTICS] !== undefined) {
            tabsInError.push(LineCreationDialogTab.CHARACTERISTICS_TAB);
        }
        setTabIndexesWithError(tabsInError);
    };

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED ||
                editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED ||
                    dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    return (
        <FormProvider
            validationSchema={schema}
            removeOptional={true}
            {...methods}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                onValidationError={onValidationError}
                aria-labelledby="dialog-modify-line"
                maxWidth={'md'}
                titleId="ModifyLine"
                open={open}
                keepMounted={true}
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
                <LineModificationForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    onEquipmentIdChange={onEquipmentIdChange}
                    lineToModify={lineToModify}
                    tabIndexesWithError={tabIndexesWithError}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

export default LineModificationDialog;
