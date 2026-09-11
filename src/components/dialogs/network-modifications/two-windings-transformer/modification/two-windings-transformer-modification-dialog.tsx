/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    addSelectedFieldToRows,
    convertToOperationalLimitsGroupFormSchema,
    CurrentLimitsData,
    CustomFormProvider,
    DeepNullable,
    EquipmentType,
    EquipmentWithProperties,
    FieldConstants,
    getConcatenatedProperties,
    getPhaseTapChangerFormData,
    getRatioTapChangerFormData,
    LimitsSchemaType,
    snackWithFallback,
    TapChangerStep,
    toTapChangerStepList,
    TwoWindingsTransformerDialogTab,
    TwoWindingsTransformerForm,
    TwoWindingsTransformerMapInfos,
    twoWindingsTransformerModificationDtoToForm,
    TwoWindingsTransformerModificationDtoWithId,
    twoWindingsTransformerModificationEmptyFormData,
    TwoWindingsTransformerModificationFormData,
    twoWindingsTransformerModificationFormSchema,
    twoWindingsTransformerModificationFormToDto,
    TWT_TAB_FIELDS,
    useSnackMessage,
    useTabs,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    CURRENT_LIMITER_REGULATING_VALUE,
    ENABLE_OLG_MODIFICATION,
    FLOW_SET_POINT_REGULATING_VALUE,
    HIGH_TAP_POSITION,
    ID,
    LIMITS,
    LOAD_TAP_CHANGING_CAPABILITIES,
    LOW_TAP_POSITION,
    OPERATIONAL_LIMITS_GROUPS,
    PHASE_TAP_CHANGER,
    RATIO_TAP_CHANGER,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    STEPS,
    TAP_POSITION,
    TARGET_DEADBAND,
    TARGET_V,
    TYPE,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyTwoWindingsTransformer } from '../../../../../services/study/network-modifications';
import {
    fetchBusesOrBusbarSectionsForVoltageLevel,
    fetchNetworkElementInfos,
} from '../../../../../services/study/network';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import { useIntl } from 'react-intl';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { FetchStatus } from 'services/utils.type';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { fetchVoltageLevelEquipments } from '../../../../../services/study/network-map';

export interface TwoWindingsTransformerModificationDialogProps {
    studyUuid: UUID;
    defaultIdValue?: string | null;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    isUpdate?: boolean;
    editData?: TwoWindingsTransformerModificationDtoWithId;
    editDataFetchStatus?: FetchStatus;
    onClose?: () => void;
    onValidated?: () => void;
}

/**
 * Dialog to modify a two windings transformer in the network
 * @param studyUuid the study we are currently working on
 * @param defaultIdValue the default two windings transformer id
 * @param currentNode The node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param isUpdate check if edition form
 * @param editData the data to edit
 * @param editDataFetchStatus indicates the status of fetching EditData
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const TwoWindingsTransformerModificationDialog = ({
    studyUuid,
    defaultIdValue,
    currentNode,
    currentRootNetworkUuid,
    isUpdate,
    editData,
    editDataFetchStatus,
    ...dialogProps
}: TwoWindingsTransformerModificationDialogProps) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState<string | null>(defaultIdValue ?? null);
    const [dataFetchStatus, setDataFetchStatus] = useState<FetchStatus>(FetchStatus.IDLE);
    const [twtToModify, setTwtToModify] = useState<TwoWindingsTransformerMapInfos | null>(null);
    const intl = useIntl();

    const formMethods = useForm<DeepNullable<TwoWindingsTransformerModificationFormData>>({
        defaultValues: twoWindingsTransformerModificationEmptyFormData,
        resolver: yupResolver<DeepNullable<TwoWindingsTransformerModificationFormData>>(
            twoWindingsTransformerModificationFormSchema
        ),
    });
    const { reset, getValues } = formMethods;

    const { errors } = formMethods.formState;
    const useTabsReturn = useTabs<TwoWindingsTransformerDialogTab>({
        defaultTab: TwoWindingsTransformerDialogTab.CONNECTIVITY_TAB,
        errors,
        tabFields: TWT_TAB_FIELDS,
    });

    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNodeUuid, currentRootNetworkUuid);

    const fetchBusesOrBusbarSections = useCallback(
        (voltageLevelId: string) =>
            fetchBusesOrBusbarSectionsForVoltageLevel(
                studyUuid,
                currentNodeUuid,
                currentRootNetworkUuid,
                voltageLevelId
            ),
        [studyUuid, currentNodeUuid, currentRootNetworkUuid]
    );

    useEffect(() => {
        if (editData) {
            if (editData?.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            reset(twoWindingsTransformerModificationDtoToForm(editData));
        }
    }, [reset, editData]);

    const onSubmit = useCallback(
        (twtForm: TwoWindingsTransformerModificationFormData) => {
            const dto = twoWindingsTransformerModificationFormToDto(
                twtForm,
                editData,
                intl,
                twtToModify,
                isNodeBuilt(currentNode)
            );
            modifyTwoWindingsTransformer(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error: Error) => {
                snackWithFallback(snackError, error, { headerId: 'TwoWindingsTransformerModificationError' });
            });
        },
        [intl, studyUuid, currentNode, currentNodeUuid, editData, snackError, twtToModify]
    );

    const clear = useCallback(() => {
        reset(twoWindingsTransformerModificationEmptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const isRatioTapChangerEnabled = useCallback(
        (twt: TwoWindingsTransformerMapInfos): boolean => {
            if (editData?.ratioTapChanger?.enabled === undefined) {
                return !!twt.ratioTapChanger;
            }
            return editData?.ratioTapChanger?.enabled?.value ?? false;
        },
        [editData]
    );

    const isPhaseTapChangerEnabled = useCallback(
        (twt: TwoWindingsTransformerMapInfos): boolean => {
            if (editData?.phaseTapChanger?.enabled === undefined) {
                return !!twt.phaseTapChanger;
            }
            return editData?.phaseTapChanger?.enabled?.value ?? false;
        },
        [editData?.phaseTapChanger?.enabled]
    );

    const getPhaseTapChangerSteps = useCallback(
        (twt: TwoWindingsTransformerMapInfos): TapChangerStep[] | undefined => {
            if (editData === undefined) {
                return toTapChangerStepList(twt?.[PHASE_TAP_CHANGER]?.[STEPS]);
            }
            if (
                editData?.phaseTapChanger?.steps === null ||
                editData?.phaseTapChanger?.steps === undefined ||
                editData?.phaseTapChanger?.enabled?.value === false
            ) {
                return toTapChangerStepList(twt?.[PHASE_TAP_CHANGER]?.[STEPS]);
            }
            return editData?.phaseTapChanger?.steps ?? undefined;
        },
        [editData]
    );

    const getRatioTapChangerSteps = useCallback(
        (twt: TwoWindingsTransformerMapInfos): TapChangerStep[] | undefined => {
            if (editData === undefined) {
                return toTapChangerStepList(twt?.[RATIO_TAP_CHANGER]?.[STEPS]);
            }
            if (
                editData?.ratioTapChanger?.steps === null ||
                editData?.ratioTapChanger?.steps === undefined ||
                editData?.ratioTapChanger?.enabled?.value === false
            ) {
                return toTapChangerStepList(twt?.[RATIO_TAP_CHANGER]?.[STEPS]);
            }
            return editData?.ratioTapChanger?.steps ?? undefined;
        },
        [editData]
    );

    const onEquipmentIdChange = useCallback(
        (equipmentId: string | null) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    EquipmentType.TWO_WINDINGS_TRANSFORMER,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((twt: TwoWindingsTransformerMapInfos) => {
                        if (twt) {
                            setTwtToModify(twt);
                            reset(
                                (formValues) => ({
                                    ...formValues,
                                    [LIMITS]: ((formValues?.limits as any)?.[ENABLE_OLG_MODIFICATION]
                                        ? {
                                              [ENABLE_OLG_MODIFICATION]: (formValues.limits as any)[
                                                  ENABLE_OLG_MODIFICATION
                                              ],
                                              [OPERATIONAL_LIMITS_GROUPS]:
                                                  formValues.limits?.operationalLimitsGroups ?? [],
                                          }
                                        : {
                                              [ENABLE_OLG_MODIFICATION]: false,
                                              [OPERATIONAL_LIMITS_GROUPS]: convertToOperationalLimitsGroupFormSchema(
                                                  (twt?.currentLimits ?? []) as CurrentLimitsData[]
                                              ),
                                          }) as LimitsSchemaType,
                                    ...getRatioTapChangerFormData({
                                        enabled: isRatioTapChangerEnabled(twt),
                                        hasLoadTapChangingCapabilities: getValues(
                                            `${RATIO_TAP_CHANGER}.${LOAD_TAP_CHANGING_CAPABILITIES}`
                                        ),
                                        regulationMode: getValues(`${RATIO_TAP_CHANGER}.${REGULATION_MODE}`),
                                        regulationType: getValues(`${RATIO_TAP_CHANGER}.${REGULATION_TYPE}`),
                                        regulationSide: getValues(`${RATIO_TAP_CHANGER}.${REGULATION_SIDE}`),
                                        targetV: getValues(`${RATIO_TAP_CHANGER}.${TARGET_V}`) as number,
                                        targetDeadband: getValues(`${RATIO_TAP_CHANGER}.${TARGET_DEADBAND}`) as number,
                                        lowTapPosition: getValues(`${RATIO_TAP_CHANGER}.${LOW_TAP_POSITION}`),
                                        highTapPosition: getValues(`${RATIO_TAP_CHANGER}.${HIGH_TAP_POSITION}`),
                                        tapPosition: getValues(`${RATIO_TAP_CHANGER}.${TAP_POSITION}`),
                                        steps: addSelectedFieldToRows(getRatioTapChangerSteps(twt)),
                                        equipmentId:
                                            getValues(`${RATIO_TAP_CHANGER}.${FieldConstants.EQUIPMENT}.${ID}`) ??
                                            undefined,
                                        equipmentType:
                                            getValues(`${RATIO_TAP_CHANGER}.${FieldConstants.EQUIPMENT}.${TYPE}`) ??
                                            undefined,
                                        voltageLevelId:
                                            getValues(`${RATIO_TAP_CHANGER}.${VOLTAGE_LEVEL}.${ID}`) ?? undefined,
                                    }),
                                    ...getPhaseTapChangerFormData({
                                        enabled: isPhaseTapChangerEnabled(twt),
                                        regulationMode: getValues(`${PHASE_TAP_CHANGER}.${REGULATION_MODE}`),
                                        regulationType: getValues(`${PHASE_TAP_CHANGER}.${REGULATION_TYPE}`),
                                        regulationSide: getValues(`${PHASE_TAP_CHANGER}.${REGULATION_SIDE}`),
                                        currentLimiterRegulatingValue: getValues(
                                            `${PHASE_TAP_CHANGER}.${CURRENT_LIMITER_REGULATING_VALUE}`
                                        ),
                                        flowSetpointRegulatingValue: getValues(
                                            `${PHASE_TAP_CHANGER}.${FLOW_SET_POINT_REGULATING_VALUE}`
                                        ),
                                        targetDeadband: getValues(`${PHASE_TAP_CHANGER}.${TARGET_DEADBAND}`),
                                        lowTapPosition: getValues(`${PHASE_TAP_CHANGER}.${LOW_TAP_POSITION}`),
                                        highTapPosition: getValues(`${PHASE_TAP_CHANGER}.${HIGH_TAP_POSITION}`),
                                        tapPosition: getValues(`${PHASE_TAP_CHANGER}.${TAP_POSITION}`),
                                        steps: addSelectedFieldToRows(getPhaseTapChangerSteps(twt)),
                                        equipmentID:
                                            getValues(`${PHASE_TAP_CHANGER}.${FieldConstants.EQUIPMENT}.${ID}`) ??
                                            undefined,
                                        equipmentType:
                                            getValues(`${PHASE_TAP_CHANGER}.${FieldConstants.EQUIPMENT}.${TYPE}`) ??
                                            undefined,
                                        voltageLevelId:
                                            getValues(`${PHASE_TAP_CHANGER}.${VOLTAGE_LEVEL}.${ID}`) ?? undefined,
                                    }),
                                    [FieldConstants.EQUIPMENT_ID]: equipmentId,
                                    [FieldConstants.ADDITIONAL_PROPERTIES]: getConcatenatedProperties(
                                        twt as EquipmentWithProperties,
                                        getValues
                                    ),
                                }),
                                { keepDirty: true }
                            );
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        reset((formValues) => ({ ...formValues, [FieldConstants.EQUIPMENT_ID]: equipmentId }), {
                            keepDirty: true,
                        });
                        if (editData?.equipmentId !== equipmentId) {
                            setTwtToModify(null);
                        }
                    });
            } else {
                setTwtToModify(null);
                reset(twoWindingsTransformerModificationEmptyFormData, { keepDefaultValues: true });
            }
        },
        [
            studyUuid,
            currentNodeUuid,
            currentRootNetworkUuid,
            reset,
            isRatioTapChangerEnabled,
            getValues,
            getRatioTapChangerSteps,
            isPhaseTapChangerEnabled,
            getPhaseTapChangerSteps,
            editData?.equipmentId,
        ]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const fetchVoltageLevelEquipmentsCallback = useCallback(
        (voltageLevelId: string) =>
            fetchVoltageLevelEquipments(studyUuid, currentNodeUuid, currentRootNetworkUuid, voltageLevelId, true),
        [studyUuid, currentNodeUuid, currentRootNetworkUuid]
    );

    return (
        <CustomFormProvider
            removeOptional={true}
            validationSchema={twoWindingsTransformerModificationFormSchema}
            {...formMethods}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                fullWidth
                maxWidth="xl"
                titleId="ModifyTwoWindingsTransformer"
                onClear={clear}
                onSave={onSubmit}
                onValidationError={useTabsReturn.onError}
                open={open}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                slotProps={{
                    paper: {
                        sx: {
                            height: '95vh',
                        },
                    },
                }}
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EquipmentType.TWO_WINDINGS_TRANSFORMER}
                    />
                )}
                {selectedId != null && (
                    <TwoWindingsTransformerForm
                        voltageLevelOptions={voltageLevelOptions}
                        PositionDiagramPane={PositionDiagramPane}
                        fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                        fetchVoltageLevelEquipments={fetchVoltageLevelEquipmentsCallback}
                        isModification
                        twtToModify={twtToModify}
                        editData={editData}
                        useTabsReturn={useTabsReturn}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default TwoWindingsTransformerModificationDialog;
