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
    BUS_OR_BUSBAR_SECTION,
    CHARACTERISTICS,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    EQUIPMENT_NAME,
    G1,
    G2,
    LIMITS,
    MEASUREMENT_P1,
    MEASUREMENT_P2,
    MEASUREMENT_Q1,
    MEASUREMENT_Q2,
    PERMANENT_LIMIT,
    R,
    STATE_ESTIMATION,
    TEMPORARY_LIMITS,
    TOTAL_REACTANCE,
    TOTAL_RESISTANCE,
    TOTAL_SUSCEPTANCE,
    VALIDITY,
    VALUE,
    VOLTAGE_LEVEL,
    X,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
    OPERATIONAL_LIMITS_GROUPS,
    CURRENT_LIMITS,
} from 'components/utils/field-constants';
import { FieldErrors, useForm } from 'react-hook-form';
import { sanitizeString } from 'components/dialogs/dialog-utils';
import yup from 'components/utils/yup-config';
import { ModificationDialog } from '../../../commons/modificationDialog';
import {
    getLimitsEmptyFormData,
    getLimitsValidationSchema,
    updateTemporaryLimits,
    addModificationTypeToOpLimitsGroups,
    getAllLimitsFormData,
    formatOpLimitGroups,
} from '../../../limits/limits-pane-utils';
import {
    getCharacteristicsEmptyFormData,
    getCharacteristicsValidationSchema,
    getCharacteristicsWithOutConnectivityFormData,
} from '../characteristics-pane/line-characteristics-pane-utils';
import { addSelectedFieldToRows, formatTemporaryLimits, toModificationOperation } from 'components/utils/utils';
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
} from '../../common/measurements/branch-active-reactive-power-form-utils';
import { LineModificationDialogTab } from '../line-utils';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { UUID } from 'crypto';
import {
    AttributeModification,
    CurrentLimits,
    OperationalLimitsGroup,
    OperationType,
} from '../../../../../services/network-modification-types';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import { LineInfos, LineModificationEditData } from '../../../../../services/study/network-map.type';
import { useIntl } from 'react-intl';

export interface LineModificationDialogProps {
    // contains data when we try to edit an existing hypothesis from the current node's list
    editData: LineModificationEditData | null | undefined;
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
    const [lineToModify, setLineToModify] = useState<LineInfos | null>(null);
    const [tabIndex, setTabIndex] = useState<number | null>(LineModificationDialogTab.CONNECTIVITY_TAB);
    const [isOpenLineTypesCatalogDialog, setOpenLineTypesCatalogDialog] = useState(false);
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
        (lineModification: LineModificationEditData) => {
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
                    formatOpLimitGroups(lineModification.operationalLimitsGroups),
                    lineModification.selectedOperationalLimitsGroup1?.value ?? null,
                    lineModification.selectedOperationalLimitsGroup2?.value ?? null
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
        (line: LineModificationEditData) => {
            function addOperationType(selectedOpLG: string): AttributeModification<string> | null {
                return selectedOpLG ===
                    intl.formatMessage({
                        id: 'NoOperationalLimitGroup',
                    })
                    ? {
                          value: selectedOpLG,
                          op: OperationType.UNSET,
                      }
                    : toModificationOperation(selectedOpLG);
            }
            const connectivity1 = line[CONNECTIVITY]?.[CONNECTIVITY_1];
            const connectivity2 = line[CONNECTIVITY]?.[CONNECTIVITY_2];
            const characteristics = line[CHARACTERISTICS];
            const stateEstimationData = line[STATE_ESTIMATION];
            const limits = line[LIMITS];

            modifyLine({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid ?? '',
                lineId: selectedId,
                lineName: sanitizeString(line[EQUIPMENT_NAME]?.value) ?? '',
                r: characteristics[R],
                x: characteristics[X],
                g1: convertOutputValue(FieldType.G1, characteristics[G1]),
                b1: convertOutputValue(FieldType.B1, characteristics[B1]),
                g2: convertOutputValue(FieldType.G2, characteristics[G2]),
                b2: convertOutputValue(FieldType.B2, characteristics[B2]),
                operationalLimitsGroups: addModificationTypeToOpLimitsGroups(
                    limits[OPERATIONAL_LIMITS_GROUPS],
                    lineToModify,
                    editData,
                    currentNode
                ),
                selectedLimitsGroup1: addOperationType(limits[SELECTED_LIMITS_GROUP_1]),
                selectedLimitsGroup2: addOperationType(limits[SELECTED_LIMITS_GROUP_2]),
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
        [studyUuid, currentNodeUuid, editData, selectedId, lineToModify, currentNode, intl, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [emptyFormData, reset]);

    /**
     * extract data loaded from the map server and merge it with local data in order to fill the line modification interface
     */
    const updateOpLimitsGroups = useCallback(
        (line: LineInfos): OperationalLimitsGroup[] => {
            return line.currentLimits.map((currentLimit: CurrentLimits, index: number): OperationalLimitsGroup => {
                return {
                    id: currentLimit.id + currentLimit.applicability,
                    name: currentLimit.id,
                    applicability: currentLimit.applicability,
                    currentLimits: {
                        id: currentLimit.id,
                        applicability: currentLimit.applicability,
                        permanentLimit: getValues(
                            `${LIMITS}.${OPERATIONAL_LIMITS_GROUPS}[${index}].${CURRENT_LIMITS}${PERMANENT_LIMIT}`
                        ),
                        temporaryLimits: addSelectedFieldToRows(
                            updateTemporaryLimits(
                                formatTemporaryLimits(
                                    getValues(
                                        `${LIMITS}.${OPERATIONAL_LIMITS_GROUPS}[${index}].${CURRENT_LIMITS}.${TEMPORARY_LIMITS}`
                                    )
                                ),
                                formatTemporaryLimits(currentLimit.temporaryLimits)
                            )
                        ),
                    },
                };
            });
        },
        [getValues]
    );

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
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
                    .then((line: LineInfos) => {
                        if (line) {
                            setLineToModify(line);
                            reset((formValues: LineModificationEditData) => ({
                                ...formValues,
                                ...{
                                    [LIMITS]: {
                                        [OPERATIONAL_LIMITS_GROUPS]: updateOpLimitsGroups(line),
                                    },
                                },
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
            reset,
            updateOpLimitsGroups,
            getValues,
            editData?.equipmentId,
            emptyFormData,
        ]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onValidationError = (errors: FieldErrors<LineModificationEditData>) => {
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

    const handleLineSegmentsBuildSubmit = (data: any) => {
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
                maxWidth={'md'}
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
