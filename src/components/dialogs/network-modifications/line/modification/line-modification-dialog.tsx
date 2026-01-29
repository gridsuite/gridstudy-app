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
    emptyProperties,
    EquipmentInfosTypes,
    EquipmentType,
    fetchNetworkElementInfos,
    FetchStatus,
    FieldType,
    FORM_LOADING_DELAY,
    getConcatenatedProperties,
    getPropertiesFromModification,
    ModificationDialog,
    modificationPropertiesSchema,
    sanitizeString,
    snackWithFallback,
    toModificationProperties,
    useOpenShortWaitFetching,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    ADDITIONAL_PROPERTIES,
    B1,
    B2,
    BUS_OR_BUSBAR_SECTION,
    CHARACTERISTICS,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    ENABLE_OLG_MODIFICATION,
    EQUIPMENT_NAME,
    G1,
    G2,
    LIMITS,
    MEASUREMENT_P1,
    MEASUREMENT_P2,
    MEASUREMENT_Q1,
    MEASUREMENT_Q2,
    OPERATIONAL_LIMITS_GROUPS,
    R,
    SELECTED_OPERATIONAL_LIMITS_GROUP_ID1,
    SELECTED_OPERATIONAL_LIMITS_GROUP_ID2,
    STATE_ESTIMATION,
    TOTAL_REACTANCE,
    TOTAL_RESISTANCE,
    TOTAL_SUSCEPTANCE,
    VALIDITY,
    VALUE,
    VOLTAGE_LEVEL,
    X,
} from 'components/utils/field-constants';
import { FieldErrors } from 'react-hook-form';
import yup from 'components/utils/yup-config';
import {
    addModificationTypeToOpLimitsGroups,
    addOperationTypeToSelectedOpLG,
    convertToOperationalLimitsGroupFormSchema,
    formatOpLimitGroupsToFormInfos,
    getAllLimitsFormData,
    getLimitsEmptyFormData,
    getLimitsValidationSchema,
    getOpLimitsGroupInfosFromBranchModification,
} from '../../../limits/limits-pane-utils';
import {
    getCharacteristicsEmptyFormData,
    getCharacteristicsValidationSchema,
    getCharacteristicsWithOutConnectivityFormData,
} from '../characteristics-pane/line-characteristics-pane-utils';
import LineModificationDialogTabs from './line-modification-dialog-tabs';
import LineModificationDialogHeader from './line-modification-dialog-header';
import LineTypeSegmentDialog from '../../../line-types-catalog/line-type-segment-dialog';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyLine } from '../../../../../services/study/network-modifications';
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
} from '../../common/measurements/branch-active-reactive-power-form-utils';
import { LineModificationDialogTab } from '../line-utils';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import type { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import { BranchInfos } from '../../../../../services/study/network-map.type';
import { useIntl } from 'react-intl';
import { LineModificationFormSchema } from './line-modification-type';
import { LineModificationInfos } from '../../../../../services/network-modification-types';
import { toModificationOperation } from '../../../../utils/utils';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';
import { OperationalLimitsGroupsFormSchema } from '../../../limits/operational-limits-groups-types';
import { ComputedLineCharacteristics } from '../../../line-types-catalog/line-catalog.type';

export interface LineModificationDialogProps {
    // contains data when we try to edit an existing hypothesis from the current node's list
    editData: LineModificationInfos | null | undefined;
    // Used to pre-select an equipmentId when calling this dialog from the SLD or network map
    defaultIdValue: string;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    displayConnectivity?: boolean;
    isUpdate: boolean;
    editDataFetchStatus?: string;
    open?: boolean;
    onClose?: () => void;
    //...dialogProps
}

/**
 * Dialog to modify a line in the network
 * @param studyUuid
 * @param defaultIdValue the default line id, Used to pre-select an equipmentId when calling this dialog from the SLD or network map
 * @param currentNode
 * @param currentRootNetworkUuid
 * @param editData the data to edit, contains data when we try to edit an existing hypothesis from the current node's list
 * @param displayConnectivity to display connectivity section or not
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param isUpdate check if edition form
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const LineModificationDialog = ({
    editData,
    defaultIdValue,
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    displayConnectivity = false,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<LineModificationDialogProps>) => {
    const currentNodeUuid = currentNode?.id;
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState(defaultIdValue ?? null);
    const [tabIndexesWithError, setTabIndexesWithError] = useState<number[]>([]);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const [lineToModify, setLineToModify] = useState<BranchInfos | null>(null);
    const [tabIndex, setTabIndex] = useState<number>(LineModificationDialogTab.CONNECTIVITY_TAB);
    const [isOpenLineTypesCatalogDialog, setIsOpenLineTypesCatalogDialog] = useState(false);
    const emptyFormData: any = useMemo(
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
            [EQUIPMENT_NAME]: yup.string().nullable(),
            ...getCon1andCon2WithPositionValidationSchema(true),
            ...getCharacteristicsValidationSchema(CHARACTERISTICS, displayConnectivity, true),
            ...getLimitsValidationSchema(),
            ...getBranchActiveReactivePowerValidationSchema(STATE_ESTIMATION),
        })
        .concat(modificationPropertiesSchema)
        .required();

    const formMethods = useFormWithDirtyTracking({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, setValue, getValues } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (lineModification: LineModificationInfos) => {
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
                ...getAllLimitsFormData(
                    formatOpLimitGroupsToFormInfos(lineModification.operationalLimitsGroups),
                    lineModification.selectedOperationalLimitsGroupId1?.value ?? null,
                    lineModification.selectedOperationalLimitsGroupId2?.value ?? null,
                    lineModification[ENABLE_OLG_MODIFICATION]
                ),
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
        (line: LineModificationFormSchema) => {
            const connectivity1 = line[CONNECTIVITY]?.[CONNECTIVITY_1];
            const connectivity2 = line[CONNECTIVITY]?.[CONNECTIVITY_2];
            const characteristics = line[CHARACTERISTICS];
            const stateEstimationData = line[STATE_ESTIMATION];
            const limits: OperationalLimitsGroupsFormSchema = line[LIMITS];
            modifyLine({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid ?? '',
                lineId: selectedId,
                equipmentName: toModificationOperation(sanitizeString(line[EQUIPMENT_NAME]) ?? ''),
                r: characteristics[R],
                x: characteristics[X],
                g1: convertOutputValue(FieldType.G1, characteristics[G1]),
                b1: convertOutputValue(FieldType.B1, characteristics[B1]),
                g2: convertOutputValue(FieldType.G2, characteristics[G2]),
                b2: convertOutputValue(FieldType.B2, characteristics[B2]),
                operationalLimitsGroups: limits[ENABLE_OLG_MODIFICATION]
                    ? addModificationTypeToOpLimitsGroups(limits[OPERATIONAL_LIMITS_GROUPS])
                    : [],
                selectedOperationalLimitsGroupId1: addOperationTypeToSelectedOpLG(
                    limits[SELECTED_OPERATIONAL_LIMITS_GROUP_ID1],
                    intl.formatMessage({
                        id: 'None',
                    })
                ),
                selectedOperationalLimitsGroupId2: addOperationTypeToSelectedOpLG(
                    limits[SELECTED_OPERATIONAL_LIMITS_GROUP_ID2],
                    intl.formatMessage({
                        id: 'None',
                    })
                ),
                [ENABLE_OLG_MODIFICATION]: limits[ENABLE_OLG_MODIFICATION],
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
                snackWithFallback(snackError, error, { headerId: 'LineModificationError' });
            });
        },
        [studyUuid, currentNodeUuid, editData, selectedId, intl, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [emptyFormData, reset]);

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    EquipmentType.LINE,
                    EquipmentInfosTypes.FORM.type,
                    equipmentId as UUID,
                    true
                )
                    .then((line: BranchInfos) => {
                        if (line) {
                            setLineToModify(line);
                            reset(
                                (formValues: LineModificationFormSchema) => ({
                                    ...formValues,
                                    ...{
                                        [LIMITS]: formValues?.limits[ENABLE_OLG_MODIFICATION]
                                            ? {
                                                  [ENABLE_OLG_MODIFICATION]: formValues.limits[ENABLE_OLG_MODIFICATION],
                                                  [OPERATIONAL_LIMITS_GROUPS]:
                                                      getOpLimitsGroupInfosFromBranchModification(formValues),
                                              }
                                            : {
                                                  [ENABLE_OLG_MODIFICATION]: false,
                                                  [OPERATIONAL_LIMITS_GROUPS]:
                                                      convertToOperationalLimitsGroupFormSchema(
                                                          line?.currentLimits ?? []
                                                      ),
                                              },
                                    },
                                    [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(line, getValues),
                                }),
                                { keepDirty: true }
                            );
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setLineToModify(null);
                        }
                    });
            } else {
                setLineToModify(null);
                reset(emptyFormData, { keepDefaultValues: true });
            }
        },
        [studyUuid, currentNodeUuid, currentRootNetworkUuid, reset, getValues, editData?.equipmentId, emptyFormData]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onValidationError = (errors: FieldErrors<LineModificationFormSchema>) => {
        let tabsInError: number[] = [];
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

        if (tabsInError.includes(tabIndex)) {
            // error in current tab => do not change tab systematically but remove current tab in error list
            setTabIndexesWithError(tabsInError.filter((errorTabIndex) => errorTabIndex !== tabIndex));
        } else if (tabsInError.length > 0) {
            // switch to the first tab in the list then remove the tab in the error list
            setTabIndex(tabsInError[0]);
            setTabIndexesWithError(tabsInError.filter((errorTabIndex, index, arr) => errorTabIndex !== arr[0]));
        }
    };

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    const handleCloseLineTypesCatalogDialog = () => {
        setIsOpenLineTypesCatalogDialog(false);
    };

    const handleLineSegmentsBuildSubmit = (data: ComputedLineCharacteristics) => {
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
                maxWidth={'xl'}
                titleId="ModifyLine"
                subtitle={selectedId != null ? headerAndTabs : undefined}
                open={open}
                keepMounted={true}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                PaperProps={{
                    sx: {
                        height: '95vh', // we want the dialog height to be fixed even when switching tabs
                    },
                }}
                onOpenCatalogDialog={selectedId != null ? () => setIsOpenLineTypesCatalogDialog(true) : undefined}
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EquipmentType.LINE}
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
