/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    ExtendedEquipmentType,
    getConcatenatedProperties,
    snackWithFallback,
    useSnackMessage,
    DeepNullable,
    FieldConstants,
    LccHvdcLineFormInfos,
    lccHvdcLineModificationEmptyFormData,
    lccHvdcLineModificationFormSchema,
    lccHvdcLineModificationDtoToForm,
    lccHvdcLineModificationFormToDto,
    LccHvdcLineModificationFormData,
    LccShuntCompensatorModificationInfos,
    LccShuntCompensatorInfos,
    useTabs,
    LccHvdcLineDialogTab,
    HVDC_LCC_LINE_TAB_FIELDS,
    LccModificationDto,
    LccHvdcLineForm,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useState } from 'react';
import { useOpenShortWaitFetching } from '../../../../commons/handle-modification-form';
import { FetchStatus } from 'services/utils.type';
import { modifyLccHvdcLine } from 'services/study/network-modifications';
import { EquipmentModificationDialogProps } from '../../../../../graph/menus/network-modifications/network-modification-menu.type';
import { isNodeBuilt } from '../../../../../graph/util/model-functions';
import { EquipmentIdSelector } from '../../../../equipment-id/equipment-id-selector';
import {
    fetchBusesOrBusbarSectionsForVoltageLevel,
    fetchNetworkElementInfos,
} from '../../../../../../services/study/network';
import { EQUIPMENT_INFOS_TYPES } from '../../../../../utils/equipment-types';
import { FORM_LOADING_DELAY } from '../../../../../network/constants';
import { ModificationDialog } from '../../../../commons/modificationDialog';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';
import useVoltageLevelsListInfos from 'hooks/use-voltage-levels-list-infos';
import PositionDiagramPane from '../../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';

const getConcatenatedShuntCompensatorOnSideInfos = (
    infosModification?: LccShuntCompensatorModificationInfos[],
    infosMap?: LccShuntCompensatorInfos[]
) => {
    const mergeResult: LccShuntCompensatorModificationInfos[] | null =
        mergeModificationAndEquipmentShuntCompensatorInfos(infosModification, infosMap);
    return (
        mergeResult?.map((shuntCp) => ({
            [FieldConstants.SHUNT_COMPENSATOR_ID]: shuntCp.id ?? null,
            [FieldConstants.SHUNT_COMPENSATOR_NAME]: shuntCp.name ?? '',
            [FieldConstants.MAX_Q_AT_NOMINAL_V]: shuntCp.maxQAtNominalV ?? null,
            [FieldConstants.SHUNT_COMPENSATOR_SELECTED]:
                shuntCp.connectedToHvdc === undefined ? null : shuntCp.connectedToHvdc,
            [FieldConstants.DELETION_MARK]: shuntCp?.deletionMark ?? false,
        })) ?? []
    );
};

const mergeModificationAndEquipmentShuntCompensatorInfos = (
    infosModification?: LccShuntCompensatorModificationInfos[],
    infosMap?: LccShuntCompensatorInfos[]
): LccShuntCompensatorModificationInfos[] => {
    let result = new Map<string, LccShuntCompensatorModificationInfos>();

    if (!infosModification) {
        if (infosMap) {
            //we only consider infosMap
            for (const info of infosMap) {
                result.set(info.id, {
                    ...info,
                    connectedToHvdc: null,
                    deletionMark: false,
                    type: 'LCC_SHUNT_MODIFICATION',
                });
            }
            return Array.from(result.values());
        }
        // nothing to be merged
        return [];
    }

    //initialize with network modification infos
    for (const info of infosModification) {
        if (info.id) {
            result.set(info.id, info);
        }
    }

    // Add map server infos
    if (infosMap) {
        infosMap.forEach((value: LccShuntCompensatorInfos) => {
            if (value.id !== null) {
                // If the property is present in the modification and in the equipment
                if (!result.has(value.id)) {
                    result.set(value.id, { ...value, connectedToHvdc: null, deletionMark: false });
                }
            }
        });
    }
    return Array.from(result.values());
};

export type LccModificationDialogProps = EquipmentModificationDialogProps & {
    editData?: LccModificationDto;
};

export const LccModificationDialog = ({
    editData,
    defaultIdValue,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<LccModificationDialogProps>) => {
    const [lccToModify, setLccToModify] = useState<LccHvdcLineFormInfos | null>(null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const [equipmentId, setEquipmentId] = useState<string | null>(defaultIdValue ?? null);

    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const formMethods = useFormWithDirtyTracking<DeepNullable<LccHvdcLineModificationFormData>>({
        defaultValues: lccHvdcLineModificationEmptyFormData,
        resolver: yupResolver<DeepNullable<LccHvdcLineModificationFormData>>(lccHvdcLineModificationFormSchema),
    });
    const { reset, getValues } = formMethods;
    const { errors } = formMethods.formState;

    const useTabsReturn = useTabs<LccHvdcLineDialogTab>({
        defaultTab: LccHvdcLineDialogTab.HVDC_LINE_TAB,
        errors,
        tabFields: HVDC_LCC_LINE_TAB_FIELDS,
    });
    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    useEffect(() => {
        if (editData) {
            if (editData?.equipmentId) {
                setEquipmentId(editData.equipmentId);
            }
            reset(lccHvdcLineModificationDtoToForm(editData));
        }
    }, [reset, editData]);

    const onSubmit = useCallback(
        (lccHvdcLine: LccHvdcLineModificationFormData) => {
            const dto = lccHvdcLineModificationFormToDto(lccHvdcLine);
            modifyLccHvdcLine(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'HvdcLccModificationError' });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(
        (customData = {}, keepDefaultValues = false) => {
            reset({ ...lccHvdcLineModificationEmptyFormData, ...customData }, { keepDefaultValues: keepDefaultValues });
        },
        [reset]
    );

    const onEquipmentIdChange = useCallback(
        (equipmentId: string | null) => {
            if (!equipmentId) {
                clear();
                setLccToModify(null);
                reset(lccHvdcLineModificationEmptyFormData, { keepDefaultValues: true });
            } else {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode.id,
                    currentRootNetworkUuid,
                    ExtendedEquipmentType.HVDC_LINE_LCC,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((value: LccHvdcLineFormInfos | null) => {
                        if (value) {
                            setLccToModify({ ...value });
                            reset(
                                (formValues) => ({
                                    ...formValues,
                                    [FieldConstants.EQUIPMENT_ID]: value.id,
                                    [FieldConstants.HVDC_LINE_TAB]: {
                                        [FieldConstants.ADDITIONAL_PROPERTIES]: getConcatenatedProperties(
                                            value,
                                            getValues,
                                            FieldConstants.HVDC_LINE_TAB
                                        ),
                                    },

                                    [FieldConstants.CONVERTER_STATION_1]: {
                                        [FieldConstants.CONVERTER_STATION_ID]: value.lccConverterStation1.id,
                                        [FieldConstants.FILTERS_SHUNT_COMPENSATOR_TABLE]:
                                            getConcatenatedShuntCompensatorOnSideInfos(
                                                editData?.converterStation1.shuntCompensatorsOnSide,
                                                value.lccConverterStation1.shuntCompensatorsOnSide
                                            ),
                                    },
                                    [FieldConstants.CONVERTER_STATION_2]: {
                                        [FieldConstants.CONVERTER_STATION_ID]: value.lccConverterStation2.id,
                                        [FieldConstants.FILTERS_SHUNT_COMPENSATOR_TABLE]:
                                            getConcatenatedShuntCompensatorOnSideInfos(
                                                editData?.converterStation2.shuntCompensatorsOnSide,
                                                value.lccConverterStation2.shuntCompensatorsOnSide
                                            ),
                                    },
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
                            setLccToModify(null);
                        }
                    });
            }
        },
        [clear, currentNode.id, currentRootNetworkUuid, editData, getValues, reset, studyUuid]
    );

    useEffect(() => {
        if (equipmentId) {
            onEquipmentIdChange(equipmentId);
        }
    }, [equipmentId, onEquipmentIdChange]);

    const fetchBusesOrBusbarSections = useCallback(
        (voltageLevelId: string) =>
            fetchBusesOrBusbarSectionsForVoltageLevel(
                studyUuid,
                currentNode.id,
                currentRootNetworkUuid,
                voltageLevelId
            ),
        [studyUuid, currentNode.id, currentRootNetworkUuid]
    );

    return (
        <CustomFormProvider
            validationSchema={lccHvdcLineModificationFormSchema}
            {...formMethods}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                onValidationError={useTabsReturn.onError}
                titleId="ModifyLcc"
                slotProps={{
                    paper: {
                        sx: {
                            height: '95vh', // we want the dialog height to be fixed even when switching tabs
                            maxWidth: '75%',
                        },
                    },
                }}
                open={open}
                keepMounted={true}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {equipmentId === null && (
                    <EquipmentIdSelector
                        defaultValue={equipmentId}
                        setSelectedId={setEquipmentId}
                        equipmentType={ExtendedEquipmentType.HVDC_LINE_LCC}
                        fillerHeight={17}
                    />
                )}
                {equipmentId !== null && (
                    <LccHvdcLineForm
                        voltageLevelOptions={voltageLevelOptions}
                        PositionDiagramPane={PositionDiagramPane}
                        fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                        useTabsReturn={useTabsReturn}
                        lccHvdcLineToModify={lccToModify}
                        isModification
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
};
