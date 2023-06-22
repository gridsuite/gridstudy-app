/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    CHARACTERISTICS,
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    EQUIPMENT_NAME,
    LIMITS,
    PERMANENT_LIMIT,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
    SHUNT_CONDUCTANCE_1,
    SHUNT_CONDUCTANCE_2,
    SHUNT_SUSCEPTANCE_1,
    SHUNT_SUSCEPTANCE_2,
    TEMPORARY_LIMITS,
    TOTAL_REACTANCE,
    TOTAL_RESISTANCE,
    TOTAL_SUSCEPTANCE,
} from 'components/utils/field-constants';
import { FormProvider, useForm } from 'react-hook-form';
import {
    fetchNetworkElementInfos,
    FetchStatus,
    modifyLine,
} from 'utils/rest-api';
import { sanitizeString } from 'components/dialogs/dialogUtils';
import { microUnitToUnit, unitToMicroUnit } from 'utils/rounding';
import yup from 'components/utils/yup-config';
import ModificationDialog from '../../../commons/modificationDialog';

import { addSelectedFieldToRows } from 'components/utils/dnd-table/dnd-table';
import {
    addModificationTypeToTemporaryLimits,
    getLimitsEmptyFormData,
    getLimitsFormData,
    getLimitsValidationSchema,
    sanitizeLimitNames,
} from '../../../limits/limits-pane-utils';
import {
    getCharacteristicsEmptyFormData,
    getCharacteristicsValidationSchema,
    getCharacteristicsWithOutConnectivityFormData,
} from '../characteristics-pane/line-characteristics-pane-utils';
import { formatTemporaryLimits } from 'components/utils/utils';
import LineModificationDialogTabs from './line-modification-dialog-tabs';
import LineModificationDialogHeader from './line-modification-dialog-header';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import LineTypeSegmentDialog from '../../../line-types-catalog/line-type-segment-dialog';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';

export const LineCreationDialogTab = {
    CHARACTERISTICS_TAB: 0,
    LIMITS_TAB: 1,
};

/**
 * Dialog to modify a line in the network
 * @param studyUuid the study we are currently working on
 * @param defaultIdValue the default line id
 * @param currentNode The node we are currently working on
 * @param editData the data to edit
 * @param displayConnectivity to display connectivity section or not
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param isUpdate check if edition form
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const LineModificationDialog = ({
    editData, // contains data when we try to edit an existing hypothesis from the current node's list
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the SLD or network map
    studyUuid,
    currentNode,
    displayConnectivity = false,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState(defaultIdValue ?? null);
    const [tabIndexesWithError, setTabIndexesWithError] = useState([]);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const [lineToModify, setLineToModify] = useState(null);
    const [tabIndex, setTabIndex] = useState(
        LineCreationDialogTab.CHARACTERISTICS_TAB
    );
    const [isOpenLineTypesCatalogDialog, setOpenLineTypesCatalogDialog] =
        useState(false);

    const emptyFormData = useMemo(
        () => ({
            [EQUIPMENT_NAME]: '',
            ...getCharacteristicsEmptyFormData(
                CHARACTERISTICS,
                displayConnectivity
            ),
            ...getLimitsEmptyFormData(),
        }),
        [displayConnectivity]
    );

    const formSchema = yup
        .object()
        .shape({
            [EQUIPMENT_NAME]: yup.string(),
            ...getCharacteristicsValidationSchema(
                CHARACTERISTICS,
                displayConnectivity,
                true
            ),
            ...getLimitsValidationSchema(),
        })
        .required();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, setValue } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (line) => {
            if (line?.equipmentId) {
                setSelectedId(line.equipmentId);
            }
            reset({
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

    const onSubmit = useCallback(
        (line) => {
            const characteristics = line[CHARACTERISTICS];
            const limits = line[LIMITS];
            modifyLine(
                studyUuid,
                currentNodeUuid,
                selectedId,
                sanitizeString(line[EQUIPMENT_NAME]),
                characteristics[SERIES_RESISTANCE],
                characteristics[SERIES_REACTANCE],
                microUnitToUnit(characteristics[SHUNT_CONDUCTANCE_1]),
                microUnitToUnit(characteristics[SHUNT_SUSCEPTANCE_1]),
                microUnitToUnit(characteristics[SHUNT_CONDUCTANCE_2]),
                microUnitToUnit(characteristics[SHUNT_SUSCEPTANCE_2]),
                limits[CURRENT_LIMITS_1]?.[PERMANENT_LIMIT],
                limits[CURRENT_LIMITS_2]?.[PERMANENT_LIMIT],
                addModificationTypeToTemporaryLimits(
                    sanitizeLimitNames(
                        limits[CURRENT_LIMITS_1]?.[TEMPORARY_LIMITS]
                    ),
                    lineToModify?.currentLimits1?.temporaryLimits,
                    editData?.currentLimits1?.temporaryLimits,
                    currentNode
                ),
                addModificationTypeToTemporaryLimits(
                    sanitizeLimitNames(
                        limits[CURRENT_LIMITS_2]?.[TEMPORARY_LIMITS]
                    ),
                    lineToModify?.currentLimits2?.temporaryLimits,
                    editData?.currentLimits2?.temporaryLimits,
                    currentNode
                ),
                !!editData,
                editData?.uuid
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LineModificationError',
                });
            });
        },
        [
            studyUuid,
            currentNodeUuid,
            selectedId,
            lineToModify,
            editData,
            currentNode,
            snackError,
        ]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [emptyFormData, reset]);

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
                            if (editData?.equipmentId !== selectedId) {
                                reset(
                                    (formValues) => ({
                                        ...formValues,
                                        ...getLimitsFormData({
                                            temporaryLimits1:
                                                addSelectedFieldToRows(
                                                    formatTemporaryLimits(
                                                        line.currentLimits1
                                                            ?.temporaryLimits
                                                    )
                                                ),
                                            temporaryLimits2:
                                                addSelectedFieldToRows(
                                                    formatTemporaryLimits(
                                                        line.currentLimits2
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
                        setLineToModify(null);
                        setDataFetchStatus(FetchStatus.FAILED);
                    });
            } else {
                setLineToModify(null);
                reset(emptyFormData, { keepDefaultValues: true });
            }
        },
        [
            studyUuid,
            currentNodeUuid,
            selectedId,
            editData,
            reset,
            fromEditDataToFormValues,
            emptyFormData,
        ]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

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

    const handleCloseLineTypesCatalogDialog = () => {
        setOpenLineTypesCatalogDialog(false);
    };

    const handleLineSegmentsBuildSubmit = (data) => {
        setValue(
            `${CHARACTERISTICS}.${SERIES_RESISTANCE}`,
            data[TOTAL_RESISTANCE],
            { shouldDirty: true }
        );
        setValue(
            `${CHARACTERISTICS}.${SERIES_REACTANCE}`,
            data[TOTAL_REACTANCE],
            { shouldDirty: true }
        );
        setValue(
            `${CHARACTERISTICS}.${SHUNT_SUSCEPTANCE_1}`,
            data[TOTAL_SUSCEPTANCE] / 2,
            { shouldDirty: true }
        );
        setValue(
            `${CHARACTERISTICS}.${SHUNT_SUSCEPTANCE_2}`,
            data[TOTAL_SUSCEPTANCE] / 2,
            { shouldDirty: true }
        );
    };

    const headerAndTabs = (
        <LineModificationDialogHeader
            lineToModify={lineToModify}
            tabIndexesWithError={tabIndexesWithError}
            tabIndex={tabIndex}
            setTabIndex={setTabIndex}
            equipmentId={selectedId}
        />
    );

    return (
        <FormProvider
            validationSchema={formSchema}
            removeOptional={true}
            {...formMethods}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                onValidationError={onValidationError}
                aria-labelledby="dialog-modify-line"
                maxWidth={'md'}
                titleId="ModifyLine"
                subtitle={selectedId != null ? headerAndTabs : undefined}
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
                onOpenCatalogDialog={
                    selectedId != null
                        ? () => setOpenLineTypesCatalogDialog(true)
                        : undefined
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EQUIPMENT_TYPES.LINE.type}
                    />
                )}
                {selectedId != null && (
                    <>
                        <LineModificationDialogTabs
                            studyUuid={studyUuid}
                            currentNode={currentNode}
                            lineToModify={lineToModify}
                            modifiedLine={editData}
                            tabIndex={tabIndex}
                        />
                        <LineTypeSegmentDialog
                            open={isOpenLineTypesCatalogDialog}
                            onClose={handleCloseLineTypesCatalogDialog}
                            onSave={handleLineSegmentsBuildSubmit}
                        />
                    </>
                )}
            </ModificationDialog>
        </FormProvider>
    );
};

export default LineModificationDialog;
