/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    convertInputValue,
    convertOutputValue,
    CustomFormProvider,
    FieldType,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    ADDITIONAL_PROPERTIES,
    B1,
    B2,
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
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    EQUIPMENT_NAME,
    G1,
    G2,
    ID,
    LIMITS,
    MEASUREMENT_P1,
    MEASUREMENT_P2,
    MEASUREMENT_Q1,
    MEASUREMENT_Q2,
    PERMANENT_LIMIT,
    R,
    TEMPORARY_LIMITS,
    TOTAL_REACTANCE,
    TOTAL_RESISTANCE,
    TOTAL_SUSCEPTANCE,
    VALUE,
    VALIDITY,
    VOLTAGE_LEVEL,
    X,
} from 'components/utils/field-constants';
import { useForm } from 'react-hook-form';
import { sanitizeString } from 'components/dialogs/dialog-utils';
import yup from 'components/utils/yup-config';
import ModificationDialog from '../../../commons/modificationDialog';

import {
    addModificationTypeToTemporaryLimits,
    getLimitsEmptyFormData,
    getSelectedLimitsFormData,
    getLimitsValidationSchema,
    sanitizeLimitNames,
    updateTemporaryLimits,
    completeCurrentLimitsGroupsToOnlySelected,
} from '../../../limits/limits-pane-utils';
import {
    getCharacteristicsEmptyFormData,
    getCharacteristicsValidationSchema,
    getCharacteristicsWithOutConnectivityFormData,
} from '../characteristics-pane/line-characteristics-pane-utils';
import { addSelectedFieldToRows, formatTemporaryLimits } from 'components/utils/utils';
import LineModificationDialogTabs from './line-modification-dialog-tabs';
import LineModificationDialogHeader from './line-modification-dialog-header';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import LineTypeSegmentDialog from '../../../line-types-catalog/line-type-segment-dialog';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyLine } from '../../../../../services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils';
import {
    emptyProperties,
    getConcatenatedProperties,
    getPropertiesFromModification,
    modificationPropertiesSchema,
    toModificationProperties,
} from '../../common/properties/property-utils';
import {
    createConnectivityData,
    getCon1andCon2WithPositionValidationSchema,
    getConnectivityFormData,
    getCont1Cont2WithPositionEmptyFormData,
} from '../../../connectivity/connectivity-form-utils';
import {
    getBranchActiveReactivePowerEditData,
    getBranchActiveReactivePowerEmptyFormData,
    getBranchActiveReactivePowerValidationSchema,
} from '../../common/measurements/branch-active-reactive-power-form-utils.ts';
import { LineModificationDialogTab } from '../line-utils';
import { isNodeBuilt } from '../../../../graph/util/model-functions.ts';

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
    currentRootNetworkUuid,
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
    const [tabIndex, setTabIndex] = useState(LineModificationDialogTab.CONNECTIVITY_TAB);
    const [isOpenLineTypesCatalogDialog, setOpenLineTypesCatalogDialog] = useState(false);
    const emptyFormData = useMemo(
        () => ({
            [EQUIPMENT_NAME]: '',
            ...getCont1Cont2WithPositionEmptyFormData(true),
            ...getCharacteristicsEmptyFormData(CHARACTERISTICS, displayConnectivity),
            ...getLimitsEmptyFormData(),
            ...getBranchActiveReactivePowerEmptyFormData(STATE_ESTIMATION),
            ...emptyProperties,
        }),
        [displayConnectivity]
    );

    const formSchema = yup
        .object()
        .shape({
            [EQUIPMENT_NAME]: yup.string(),
            ...getCon1andCon2WithPositionValidationSchema(true),
            ...getCharacteristicsValidationSchema(CHARACTERISTICS, displayConnectivity, true),
            ...getLimitsValidationSchema(true),
            ...getBranchActiveReactivePowerValidationSchema(STATE_ESTIMATION),
        })
        .concat(modificationPropertiesSchema)
        .required();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, setValue, getValues } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (lineModification) => {
            if (lineModification?.equipmentId) {
                setSelectedId(lineModification.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: lineModification.equipmentName?.value ?? '',
                [CONNECTIVITY]: {
                    ...getConnectivityFormData(createConnectivityData(lineModification, 1), CONNECTIVITY_1),
                    ...getConnectivityFormData(createConnectivityData(lineModification, 2), CONNECTIVITY_2),
                },
                ...getBranchActiveReactivePowerEditData(STATE_ESTIMATION, lineModification),
                ...getCharacteristicsWithOutConnectivityFormData({
                    r: lineModification.r?.value ?? null,
                    x: lineModification.x?.value ?? null,
                    g1: convertInputValue(FieldType.G1, lineModification.g1?.value ?? null),
                    b1: convertInputValue(FieldType.B1, lineModification.b1?.value ?? null),
                    g2: convertInputValue(FieldType.G2, lineModification.g2?.value ?? null),
                    b2: convertInputValue(FieldType.B2, lineModification.b2?.value ?? null),
                }),
                ...getSelectedLimitsFormData({
                    permanentLimit1: lineModification.currentLimits1?.permanentLimit,
                    permanentLimit2: lineModification.currentLimits2?.permanentLimit,
                    temporaryLimits1: addSelectedFieldToRows(
                        formatTemporaryLimits(lineModification.currentLimits1?.temporaryLimits)
                    ),
                    temporaryLimits2: addSelectedFieldToRows(
                        formatTemporaryLimits(lineModification.currentLimits2?.temporaryLimits)
                    ),
                }),
                ...getPropertiesFromModification(lineModification.properties),
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
            const connectivity1 = line[CONNECTIVITY]?.[CONNECTIVITY_1];
            const connectivity2 = line[CONNECTIVITY]?.[CONNECTIVITY_2];
            const characteristics = line[CHARACTERISTICS];
            const stateEstimationData = line[STATE_ESTIMATION];
            const limits = line[LIMITS];
            const temporaryLimits1 = addModificationTypeToTemporaryLimits(
                sanitizeLimitNames(limits[CURRENT_LIMITS_1]?.[TEMPORARY_LIMITS]),
                completeCurrentLimitsGroupsToOnlySelected(
                    lineToModify?.currentLimits1,
                    lineToModify?.selectedOperationalLimitsGroup1
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
                    lineToModify?.currentLimits2,
                    lineToModify?.selectedOperationalLimitsGroup2
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

            modifyLine({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                lineId: selectedId,
                lineName: sanitizeString(line[EQUIPMENT_NAME]),
                r: characteristics[R],
                x: characteristics[X],
                g1: convertOutputValue(FieldType.G1, characteristics[G1]),
                b1: convertOutputValue(FieldType.B1, characteristics[B1]),
                g2: convertOutputValue(FieldType.G2, characteristics[G2]),
                b2: convertOutputValue(FieldType.B2, characteristics[B2]),
                currentLimit1: currentLimits1,
                currentLimit2: currentLimits2,
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
                properties: toModificationProperties(line),
                p1MeasurementValue: stateEstimationData[MEASUREMENT_P1][VALUE],
                p1MeasurementValidity: stateEstimationData[MEASUREMENT_P1][VALIDITY],
                q1MeasurementValue: stateEstimationData[MEASUREMENT_Q1][VALUE],
                q1MeasurementValidity: stateEstimationData[MEASUREMENT_Q1][VALIDITY],
                p2MeasurementValue: stateEstimationData[MEASUREMENT_P2][VALUE],
                p2MeasurementValidity: stateEstimationData[MEASUREMENT_P2][VALIDITY],
                q2MeasurementValue: stateEstimationData[MEASUREMENT_Q2][VALUE],
                q2MeasurementValidity: stateEstimationData[MEASUREMENT_Q2][VALIDITY],
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LineModificationError',
                });
            });
        },
        [studyUuid, currentNodeUuid, selectedId, lineToModify, editData, currentNode, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [emptyFormData, reset]);

    const setConnectivityValue = useCallback(
        (index, field, value) => {
            setValue(`${CONNECTIVITY}.${index}.${field}.${ID}`, value);
        },
        [setValue]
    );

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    EQUIPMENT_TYPES.LINE,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((line) => {
                        if (line) {
                            setLineToModify(line);
                            setConnectivityValue(CONNECTIVITY_1, VOLTAGE_LEVEL, line?.voltageLevelId1);
                            setConnectivityValue(CONNECTIVITY_2, VOLTAGE_LEVEL, line?.voltageLevelId2);
                            setConnectivityValue(CONNECTIVITY_1, BUS_OR_BUSBAR_SECTION, line?.busOrBusbarSectionId1);
                            setConnectivityValue(CONNECTIVITY_2, BUS_OR_BUSBAR_SECTION, line?.busOrBusbarSectionId2);
                            const selectedCurrentLimits1 = completeCurrentLimitsGroupsToOnlySelected(
                                line?.currentLimits1,
                                line?.selectedOperationalLimitsGroup1
                            );
                            const selectedCurrentLimits2 = completeCurrentLimitsGroupsToOnlySelected(
                                line?.currentLimits2,
                                line?.selectedOperationalLimitsGroup2
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
                                [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(line, getValues),
                            }));
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setLineToModify(null);
                            reset(emptyFormData);
                        }
                    });
            } else {
                setLineToModify(null);
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
            editData?.equipmentId,
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
            tabsInError.push(LineModificationDialogTab.LIMITS_TAB);
        }
        if (errors?.[CHARACTERISTICS] !== undefined) {
            tabsInError.push(LineModificationDialogTab.CHARACTERISTICS_TAB);
        }
        if (errors?.[CONNECTIVITY] !== undefined) {
            tabsInError.push(LineModificationDialogTab.CONNECTIVITY_TAB);
        }
        if (errors?.[STATE_ESTIMATION] !== undefined) {
            tabsInError.push(LineModificationDialogTab.STATE_ESTIMATION_TAB);
        }
        if (tabsInError.length > 0) {
            setTabIndex(tabsInError[0]);
        }
        setTabIndexesWithError(tabsInError);
    };

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    const handleCloseLineTypesCatalogDialog = () => {
        setOpenLineTypesCatalogDialog(false);
    };

    const handleLineSegmentsBuildSubmit = (data) => {
        setValue(`${CHARACTERISTICS}.${R}`, data[TOTAL_RESISTANCE], {
            shouldDirty: true,
        });
        setValue(`${CHARACTERISTICS}.${X}`, data[TOTAL_REACTANCE], {
            shouldDirty: true,
        });
        setValue(`${CHARACTERISTICS}.${B1}`, data[TOTAL_SUSCEPTANCE] / 2, {
            shouldDirty: true,
        });
        setValue(`${CHARACTERISTICS}.${B2}`, data[TOTAL_SUSCEPTANCE] / 2, {
            shouldDirty: true,
        });
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
        <CustomFormProvider
            validationSchema={formSchema}
            removeOptional={true}
            {...formMethods}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
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
                showNodeNotBuiltWarning={selectedId != null}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                PaperProps={{
                    sx: {
                        height: '95vh', // we want the dialog height to be fixed even when switching tabs
                    },
                }}
                onOpenCatalogDialog={selectedId != null ? () => setOpenLineTypesCatalogDialog(true) : undefined}
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EQUIPMENT_TYPES.LINE}
                    />
                )}
                {selectedId != null && (
                    <>
                        <LineModificationDialogTabs
                            studyUuid={studyUuid}
                            currentNode={currentNode}
                            currentRootNetworkUuid={currentRootNetworkUuid}
                            lineToModify={lineToModify}
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
        </CustomFormProvider>
    );
};

export default LineModificationDialog;
