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
import { fetchEquipmentInfos, modifyLine } from 'utils/rest-api';
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
 */
const LineModificationDialog = ({
    editData,
    studyUuid,
    currentNode,
    displayConnectivity = false,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [tabIndexesWithError, setTabIndexesWithError] = useState([]);

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

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset, getValues } = methods;

    const fromEditDataToFormValues = useCallback(
        (line) => {
            reset({
                [EQUIPMENT_ID]: line.equipmentId,
                [EQUIPMENT_NAME]: line.equipmentName?.value ?? '',
                ...getCharacteristicsWithOutConnectivityFormData({
                    seriesResistance: line.seriesResistance?.value ?? null,
                    seriesReactance: line.seriesReactance?.value ?? null,
                    shuntConductance1: unitToMicroUnit(
                        line.shuntConductance1?.value ?? null
                    ),
                    shuntSusceptance1: unitToMicroUnit(
                        line.shuntSusceptance1?.value ?? null
                    ),
                    shuntConductance2: unitToMicroUnit(
                        line.shuntConductance2?.value ?? null
                    ),
                    shuntSusceptance2: unitToMicroUnit(
                        line.shuntSusceptance2?.value ?? null
                    ),
                }),
                ...getLimitsFormData({
                    permanentLimit1: line.currentLimits1?.permanentLimit,
                    permanentLimit2: line.currentLimits2?.permanentLimit,
                    temporaryLimits1: addSelectedFieldToRows(
                        formatTemporaryLimits(
                            line.currentLimits1?.temporaryLimits
                        )
                    ),
                    temporaryLimits2: addSelectedFieldToRows(
                        formatTemporaryLimits(
                            line.currentLimits2?.temporaryLimits
                        )
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

    const [lineToModify, setLineToModify] = useState(null);

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (equipmentId) {
                fetchEquipmentInfos(
                    studyUuid,
                    currentNodeUuid,
                    'lines',
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
                    })
                    .catch(() => {
                        setLineToModify(null);
                    });
            } else {
                setLineToModify(null);
                //we set equipmentId to null to force the reset of the form when the user clears the equipmentId field
                if (editData) {
                    editData.equipmentId = null;
                }
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
