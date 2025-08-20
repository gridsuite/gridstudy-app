/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    EquipmentType,
    MODIFICATION_TYPES,
    ModificationType,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FetchStatus } from '../../../../services/utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../network/constants';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { ModificationDialog } from '../../commons/modificationDialog';
import { EquipmentIdSelector } from '../../equipment-id/equipment-id-selector';
import yup from '../../../utils/yup-config';
import {
    CURRENT_CONNECTION_STATUS,
    PREV_CONNECTION_STATUS,
    SWITCH_ID,
    TOPOLOGY_MODIFICATION_TABLE,
} from '../../../utils/field-constants';
import { MoveVoltageLevelFeederBaysForm } from './move-voltage-level-feeder-bays-form';
import { modifyVoltageLevelTopology } from '../../../../services/study/network-modifications';
import { TopologyVoltageLevelModificationInfos } from '../../../../services/network-modification-types';
import { fetchSwitchesOfVoltageLevel } from '../../../../services/study/network';
import { EquipmentModificationDialogProps } from '../../../graph/menus/network-modifications/network-modification-menu.type';
import { SwitchInfos } from '../../../../services/study/network-map.type';
import { useIntl } from 'react-intl';

const formSchema = yup.object().shape({
    [TOPOLOGY_MODIFICATION_TABLE]: yup
        .array()
        .of(
            yup.object().shape({
            })
        )
        .required(),
});

const emptyFormData = {
    [TOPOLOGY_MODIFICATION_TABLE]: [
        {
        },
    ],
};

export type MoveVoltageLevelFeederBaysDialogProps = EquipmentModificationDialogProps & {
    editData: TopologyVoltageLevelModificationInfos;
};
export type MoveVoltageLevelFeederBaysFormSchemaType = yup.InferType<typeof formSchema>;

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
export default function MoveVoltageLevelFeederBaysDialog({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    defaultIdValue,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<MoveVoltageLevelFeederBaysDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState<string>(defaultIdValue ?? null);
    const [switchesToModify, setSwitchesToModify] = useState<SwitchInfos[]>([]);
    const [dataFetchStatus, setDataFetchStatus] = useState<string>(FetchStatus.IDLE);
    const intl = useIntl();

    const formMethods = useForm<MoveVoltageLevelFeederBaysFormSchemaType>({
        defaultValues: emptyFormData,
        resolver: yupResolver<MoveVoltageLevelFeederBaysFormSchemaType>(formSchema),
    });

    const { reset, getValues, setValue } = formMethods;

    useEffect(() => {
        if (editData?.equipmentId) {
            setSelectedId(editData.equipmentId);
        }
    }, [editData]);

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
            if (!equipmentId) {
                setSwitchesToModify([]);
            } else {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchSwitchesOfVoltageLevel(studyUuid, currentNodeUuid, currentRootNetworkUuid, equipmentId)
                    .then((switchesInfos) => {
                        if (switchesInfos.length) {
                            setSwitchesToModify(switchesInfos);
                            reset(
                                {
                                    [TOPOLOGY_MODIFICATION_TABLE]: switchesInfos?.map((row) => ({
                                        [SWITCH_ID]: row.id,
                                        [PREV_CONNECTION_STATUS]: row.open,
                                        [CURRENT_CONNECTION_STATUS]: null,
                                    })),
                                },
                                { keepDirty: true }
                            );
                            setDataFetchStatus(FetchStatus.SUCCEED);
                        } else {
                            setSwitchesToModify([]);
                            setDataFetchStatus(FetchStatus.SUCCEED);
                        }
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        setSwitchesToModify([]);
                    });
            }
        },
        [studyUuid, currentNodeUuid, currentRootNetworkUuid, reset]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (topologyVLModificationInfos: MoveVoltageLevelFeederBaysFormSchemaType) => {
            let equipmentAttributeModificationInfos: {
                type: ModificationType;
                equipmentId: string;
                equipmentAttributeName: string;
                equipmentAttributeValue: boolean;
                equipmentType: EquipmentType;
            }[] = [];
            if (topologyVLModificationInfos[TOPOLOGY_MODIFICATION_TABLE]?.length > 0) {
                equipmentAttributeModificationInfos = topologyVLModificationInfos[TOPOLOGY_MODIFICATION_TABLE].filter(
                    (item) => {
                        return !(
                            item === null ||
                            item.currentConnectionStatus === null ||
                            item.currentConnectionStatus === undefined
                        );
                    }
                ).map((item) => ({
                    type: MODIFICATION_TYPES.EQUIPMENT_ATTRIBUTE_MODIFICATION.type,
                    equipmentId: item.switchId ?? '',
                    equipmentAttributeName: 'open',
                    // Note that 'currentConnectionStatus' which presents 'close' should be inverted when submitting open attribute
                    equipmentAttributeValue: Boolean(!item.currentConnectionStatus),
                    equipmentType: EquipmentType.SWITCH,
                }));
            }
            const voltageLevelTopologyModificationInfos = {
                type: MODIFICATION_TYPES.VOLTAGE_LEVEL_TOPOLOGY_MODIFICATION.type,
                uuid: editData?.uuid,
                equipmentId: selectedId,
                equipmentAttributeModificationList: equipmentAttributeModificationInfos,
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
        reset(emptyFormData);
    }, [reset]);

    return (
        <CustomFormProvider
            validationSchema={formSchema}
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
                titleId="MoveVoltageLevelFeederBays"
                open={open}
                keepMounted={true}
                PaperProps={{
                    sx: {
                        height: '95vh',
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
                    <MoveVoltageLevelFeederBaysForm
                        currentNode={currentNode}
                        selectedId={selectedId}
                        isUpdate={isUpdate}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
