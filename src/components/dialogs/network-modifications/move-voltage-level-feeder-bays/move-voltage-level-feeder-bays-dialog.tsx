/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, EquipmentType, useSnackMessage } from '@gridsuite/commons-ui';
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
import { TOPOLOGY_MODIFICATION_TABLE } from '../../../utils/field-constants';
import { MoveVoltageLevelFeederBaysForm } from './move-voltage-level-feeder-bays-form';
import { TopologyVoltageLevelModificationInfos } from '../../../../services/network-modification-types';
import { fetchNetworkElementInfos } from '../../../../services/study/network';
import { EquipmentModificationDialogProps } from '../../../graph/menus/network-modifications/network-modification-menu.type';
import { SwitchInfos } from '../../../../services/study/network-map.type';
import { useIntl } from 'react-intl';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from '../../../utils/equipment-types';

const formSchema = yup.object().shape({
    [TOPOLOGY_MODIFICATION_TABLE]: yup.array().of(yup.object().shape({})).required(),
});

const emptyFormData = {
    [TOPOLOGY_MODIFICATION_TABLE]: [{}],
};

export type MoveVoltageLevelFeederBaysDialogProps = EquipmentModificationDialogProps & {
    editData: TopologyVoltageLevelModificationInfos;
};
export type MoveVoltageLevelFeederBaysFormSchemaType = yup.InferType<typeof formSchema>;

export type FeederBayData = {
    equipmentId: string;
    busbarId: string;
    connectionDirection: string;
    connectionName: string;
    connectionPosition: number;
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
    const [moveVoltageLevelFeederBaysInfos, setMoveVoltageLevelFeederBaysInfos] = useState<FeederBayData[]>(null);
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
        (equipmentId) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    EQUIPMENT_TYPES.VOLTAGE_LEVEL,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((voltageLevel) => {
                        const finalFeederBaysData: FeederBayData[] = [];
                        if (voltageLevel) {
                            Object.keys(voltageLevel.feederBaysInfos).forEach((equipmentId) => {
                                voltageLevel.feederBaysInfos[equipmentId].forEach((connectionPositionInfo) => {
                                    finalFeederBaysData.push({
                                        equipmentId: equipmentId,
                                        busbarId: connectionPositionInfo.busbarId,
                                        connectionDirection:
                                            connectionPositionInfo.connectablePositionInfos.connectionDirection,
                                        connectionName: connectionPositionInfo.connectablePositionInfos.connectionName,
                                        connectionPosition:
                                            connectionPositionInfo.connectablePositionInfos.connectionPosition,
                                    });
                                });
                            });
                            setMoveVoltageLevelFeederBaysInfos(finalFeederBaysData);
                            setDataFetchStatus(FetchStatus.SUCCEED);
                        }
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            reset(emptyFormData);
                        }
                    });
            }
        },
        [studyUuid, currentNodeUuid, currentRootNetworkUuid, setMoveVoltageLevelFeederBaysInfos, setDataFetchStatus]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(() => {}, []);

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
                        moveVoltageLevelFeederBaysData={moveVoltageLevelFeederBaysInfos}
                        currentNode={currentNode}
                        selectedId={selectedId}
                        isUpdate={isUpdate}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
