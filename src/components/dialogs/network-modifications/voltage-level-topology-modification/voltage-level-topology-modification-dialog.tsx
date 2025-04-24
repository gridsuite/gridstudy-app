/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, EquipmentType, MODIFICATION_TYPES, useSnackMessage } from '@gridsuite/commons-ui';
import { useCallback, useEffect, useState } from 'react';
import { FetchStatus } from '../../../../services/utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { fetchSwitchesOfVoltageLevel } from '../../../../services/study/network';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../network/constants';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { ModificationDialog } from '../../commons/modificationDialog';
import { EquipmentIdSelector } from '../../equipment-id/equipment-id-selector';
import yup from '../../../utils/yup-config';
import { SwitchInfos, VoltageLevelTopologyModificationDialogProps } from './voltage-level-topology.type';
import {
    CURRENT_CONNECTION_STATUS,
    PREV_CONNECTION_STATUS,
    SWITCH_ID,
    TOPOLOGY_MODIFICATION_TABLE,
} from '../../../utils/field-constants';
import { VoltageLevelTopologyModificationForm } from './voltage-level-topology-modification-form';
import { modifyVoltageLevelTopology } from '../../../../services/study/network-modifications';
import { DeepNullable } from '../../../utils/ts-utils';
import { TopologyVoltageLevelModificationInfos } from '../../../../services/network-modification-types';

const formSchema = yup.object().shape({
    [TOPOLOGY_MODIFICATION_TABLE]: yup
        .array()
        .of(
            yup.object().shape({
                [SWITCH_ID]: yup.string(),
                [PREV_CONNECTION_STATUS]: yup.string(),
                [CURRENT_CONNECTION_STATUS]: yup.boolean().nullable().defined(),
            })
        )
        .required(),
});

const emptyFormData = {
    [TOPOLOGY_MODIFICATION_TABLE]: [],
};

export type VoltageLevelTopologyModificationFormSchema = yup.InferType<typeof formSchema>;

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

    const formMethods = useForm<DeepNullable<VoltageLevelTopologyModificationFormSchema>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<VoltageLevelTopologyModificationFormSchema>>(formSchema),
    });

    const { reset } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (editData: TopologyVoltageLevelModificationInfos) => {
            if (editData?.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            const equipmentAttributeModificationEditData =
                editData?.equipmentAttributeModification?.map((item) => ({
                    [SWITCH_ID]: item.equipmentId,
                    [PREV_CONNECTION_STATUS]: item.equipmentAttributeValue ? 'Closed' : 'Open',
                    [CURRENT_CONNECTION_STATUS]: item.equipmentAttributeValue,
                })) || emptyFormData[TOPOLOGY_MODIFICATION_TABLE];
            reset({
                [TOPOLOGY_MODIFICATION_TABLE]: equipmentAttributeModificationEditData,
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
            if (!equipmentId) {
                setSwitchesToModify([]);
                reset(emptyFormData, { keepDefaultValues: true });
            } else {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchSwitchesOfVoltageLevel(studyUuid, currentNodeUuid, currentRootNetworkUuid, equipmentId)
                    .then((switchesInfos) => {
                        if (switchesInfos.length) {
                            setSwitchesToModify(switchesInfos);
                            reset((formValues) => ({
                                ...formValues,
                            }));
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setSwitchesToModify([]);
                            reset(emptyFormData);
                        }
                    });
            }
        },
        [reset, studyUuid, currentNodeUuid, currentRootNetworkUuid, editData?.equipmentId]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (topologyVLModificationInfos: VoltageLevelTopologyModificationFormSchema) => {
            const equipmentAttributeModificationInfos =
                topologyVLModificationInfos[TOPOLOGY_MODIFICATION_TABLE]?.length > 0
                    ? topologyVLModificationInfos[TOPOLOGY_MODIFICATION_TABLE].filter(
                          (item) =>
                              item.currentConnectionStatus !== null &&
                              item.prevConnectionStatus != null &&
                              // Convert string to boolean before comparison
                              item.currentConnectionStatus !== (item.prevConnectionStatus === 'Closed')
                      ).map((item) => ({
                          type: MODIFICATION_TYPES.EQUIPMENT_ATTRIBUTE_MODIFICATION.type,
                          equipmentId: item.switchId ?? '',
                          equipmentAttributeName: 'Open',
                          equipmentAttributeValue: item.currentConnectionStatus === true,
                          equipmentType: EquipmentType.SWITCH,
                      }))
                    : [];
            const voltageLevelTopologyModificationInfos = {
                type: MODIFICATION_TYPES.VOLTAGE_LEVEL_TOPOLOGY_MODIFICATION.type,
                uuid: editData?.uuid,
                equipmentId: selectedId,
                equipmentAttributeModification: equipmentAttributeModificationInfos,
            };
            modifyVoltageLevelTopology({
                topologyVoltageLevelModificationInfos: voltageLevelTopologyModificationInfos,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                isUpdate: !!editData,
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'VoltageLevelTopologyModificationError',
                });
            });
        },
        [editData, selectedId, studyUuid, currentNodeUuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    const clear = useCallback(() => {
        formMethods.reset(emptyFormData);
    }, [formMethods]);

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
                maxWidth={'md'}
                titleId="ModifyVoltageLevelTopology"
                open={open}
                keepMounted={true}
                showNodeNotBuiltWarning={selectedId != null}
                PaperProps={{
                    sx: {
                        height: '75vh',
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
                        allowFreeInput={false}
                        enableAutoSelect={true}
                        enableAutoHighlight={true}
                    />
                )}
                {selectedId != null && (
                    <VoltageLevelTopologyModificationForm
                        currentNode={currentNode}
                        equipmentId={selectedId}
                        switchesToModify={switchesToModify}
                        switchesEditData={editData?.equipmentAttributeModification}
                        isUpdate={isUpdate}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
