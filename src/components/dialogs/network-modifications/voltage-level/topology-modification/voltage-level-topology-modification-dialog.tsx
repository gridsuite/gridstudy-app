/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CURRENT_CONNECTION_STATUS,
    CustomFormProvider,
    EquipmentType,
    FieldConstants,
    PREV_CONNECTION_STATUS,
    snackWithFallback,
    SWITCH_ID,
    TOPOLOGY_MODIFICATION_TABLE,
    TopologyVoltageLevelModificationDto,
    useSnackMessage,
    voltageLevelTopologyModificationDtoToForm,
    voltageLevelTopologyModificationEmptyFormData,
    VoltageLevelTopologyModificationForm,
    voltageLevelTopologyModificationFormSchema,
    VoltageLevelTopologyModificationFormSchemaType,
    voltageLevelTopologyModificationFormToDto,
} from '@gridsuite/commons-ui';
import { useCallback, useEffect, useState } from 'react';
import { FetchStatus } from '../../../../../services/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyVoltageLevelTopology } from '../../../../../services/study/network-modifications';
import { fetchSwitchesOfVoltageLevel } from '../../../../../services/study/network';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { SwitchInfos } from '../../../../../services/study/network-map.type';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';

export type VoltageLevelTopologyModificationDialogProps = EquipmentModificationDialogProps & {
    editData?: TopologyVoltageLevelModificationDto;
};

// Computes the initial table state with voltageLevel switches, overridden by editData if defined.
const computeInitTableValues = (
    switchesInfos: SwitchInfos[],
    isNodeBuilt: boolean | undefined,
    editData: TopologyVoltageLevelModificationDto | undefined
) => {
    return switchesInfos?.map((switchInfo) => {
        const isModifiedSwitch =
            editData?.equipmentAttributeModificationList?.some((mod) => mod.equipmentId === switchInfo.id) ?? false;
        let open;
        if (isModifiedSwitch) {
            const matchingAttributeEditData = editData?.equipmentAttributeModificationList?.find(
                (attr) => attr.equipmentId === switchInfo.id
            );
            open = isNodeBuilt
                ? switchInfo?.open
                : (matchingAttributeEditData?.equipmentAttributeValue ?? switchInfo?.open);
        } else {
            open = switchInfo?.open;
        }
        return {
            [SWITCH_ID]: switchInfo.id,
            [PREV_CONNECTION_STATUS]: switchInfo.open,
            [CURRENT_CONNECTION_STATUS]: isModifiedSwitch ? !open : null,
        };
    });
};
/**
 * Dialog to delete a list of equipment by filter.
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param editData the data to edit
 * @param defaultIdValue the default line id
 * @param isUpdate check if edition form
 * @param editDataFetchStatus indicates the status of fetching EditData
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
export default function VoltageLevelTopologyModificationDialog({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    defaultIdValue,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<VoltageLevelTopologyModificationDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState<string>(defaultIdValue ?? null);
    const [switchesToModify, setSwitchesToModify] = useState<SwitchInfos[]>([]);
    const [dataFetchStatus, setDataFetchStatus] = useState<string>(FetchStatus.IDLE);

    const formMethods = useFormWithDirtyTracking<VoltageLevelTopologyModificationFormSchemaType>({
        defaultValues: voltageLevelTopologyModificationEmptyFormData,
        resolver: yupResolver<VoltageLevelTopologyModificationFormSchemaType>(
            voltageLevelTopologyModificationFormSchema
        ),
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            if (editData.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            const form = voltageLevelTopologyModificationDtoToForm(editData);
            reset(form);
        }
    }, [editData, reset]);

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
            if (!equipmentId) {
                setSwitchesToModify([]);
                reset((formValues) => ({ ...formValues, [FieldConstants.EQUIPMENT_ID]: equipmentId }), {
                    keepDirty: true,
                });
            } else {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchSwitchesOfVoltageLevel(studyUuid, currentNodeUuid, currentRootNetworkUuid, equipmentId)
                    .then((switchesInfos) => {
                        if (switchesInfos.length) {
                            setSwitchesToModify(switchesInfos);
                            reset(
                                {
                                    [FieldConstants.EQUIPMENT_ID]: equipmentId,
                                    [TOPOLOGY_MODIFICATION_TABLE]: computeInitTableValues(
                                        switchesInfos,
                                        isNodeBuilt(currentNode),
                                        editData
                                    ),
                                },
                                { keepDirty: true }
                            );
                            setDataFetchStatus(FetchStatus.SUCCEED);
                        } else {
                            setSwitchesToModify([]);
                            setDataFetchStatus(FetchStatus.SUCCEED);
                            reset((formValues) => ({ ...formValues, [FieldConstants.EQUIPMENT_ID]: equipmentId }), {
                                keepDirty: true,
                            });
                        }
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        setSwitchesToModify([]);
                        reset((formValues) => ({ ...formValues, [FieldConstants.EQUIPMENT_ID]: equipmentId }), {
                            keepDirty: true,
                        });
                    });
            }
        },
        [studyUuid, currentNodeUuid, currentRootNetworkUuid, editData, currentNode, reset]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (voltageLevelTopologyModificationFormData: VoltageLevelTopologyModificationFormSchemaType) => {
            const dto = voltageLevelTopologyModificationFormToDto(voltageLevelTopologyModificationFormData);
            modifyVoltageLevelTopology(dto, editData?.uuid, studyUuid, currentNodeUuid).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'VoltageLevelTopologyModificationError' });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    const clear = useCallback(() => {
        reset(voltageLevelTopologyModificationEmptyFormData);
    }, [reset]);

    return (
        <CustomFormProvider
            validationSchema={voltageLevelTopologyModificationFormSchema}
            removeOptional={true}
            {...formMethods}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                onClear={clear}
                fullWidth
                onSave={onSubmit}
                maxWidth={'md'}
                titleId="ModifyVoltageLevelTopology"
                open={open}
                keepMounted={true}
                slotProps={{
                    paper: {
                        sx: {
                            height: '95vh',
                        },
                    },
                }}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EquipmentType.VOLTAGE_LEVEL}
                        fillerHeight={17}
                        freeInputAllowed={false}
                        autoSelectEnabled={true}
                        autoHighlightEnabled={true}
                    />
                )}
                {selectedId != null && (
                    <VoltageLevelTopologyModificationForm
                        voltageLevelToModify={editData}
                        switchesToModify={switchesToModify}
                        isModification={isUpdate}
                        isPreviousStatusEnabled={true}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
