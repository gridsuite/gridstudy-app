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
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../network/constants';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { ModificationDialog } from '../../commons/modificationDialog';
import { EquipmentIdSelector } from '../../equipment-id/equipment-id-selector';
import yup from '../../../utils/yup-config';
import {
    BUSBAR_SECTION_ID,
    BUSBAR_SECTION_IDS,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE,
    VOLTAGE_LEVEL_ID,
} from '../../../utils/field-constants';
import { MoveVoltageLevelFeederBaysForm } from './move-voltage-level-feeder-bays-form';
import {
    ConnectablePositionModificationInfos,
    MoveVoltageLevelFeederBaysInfos,
    TopologyVoltageLevelModificationInfos,
} from '../../../../services/network-modification-types';
import { fetchNetworkElementInfos } from '../../../../services/study/network';
import { EquipmentModificationDialogProps } from '../../../graph/menus/network-modifications/network-modification-menu.type';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { DeepNullable } from '../../../utils/ts-utils';
import { FeederBayInfos, FeederBaysInfos } from './move-voltage-level-feeder-bays.type';
import { moveVoltageLevelFeederBays } from '../../../../services/study/network-modifications';
import { AnyObject, TestFunction } from 'yup';

const checkConnectionPositionField: TestFunction<any, AnyObject> = (value, context) => {
    if (!value) {
        return true;
    }
    const array = context.from?.[1]?.value?.[MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE];
    if (!array) {
        return true;
    }
    const duplicateExists = array.some((item: { [x: string]: any }, index: number) => {
        return (
            index !== parseInt(context.path.match(/\[(\d+)\]/)?.[1] || '-1') &&
            String(item[CONNECTION_POSITION]) === String(value)
        );
    });
    return !duplicateExists;
};

const formSchema = yup.object().shape({
    [MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE]: yup.array().of(
        yup.object().shape({
            [VOLTAGE_LEVEL_ID]: yup.string().required(),
            [BUSBAR_SECTION_ID]: yup.string().required(),
            [BUSBAR_SECTION_IDS]: yup.array().of(yup.string()).required(),
            [CONNECTION_NAME]: yup.string().required(),
            [CONNECTION_DIRECTION]: yup.string().required(),
            [CONNECTION_POSITION]: yup
                .string()
                .test('checkUniquePositions', 'DuplicatedPositionsError', checkConnectionPositionField),
        })
    ),
});

const emptyFormData = {
    [MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE]: [
        {
            [VOLTAGE_LEVEL_ID]: null,
            [BUSBAR_SECTION_ID]: null,
            [BUSBAR_SECTION_IDS]: [],
            [CONNECTION_NAME]: null,
            [CONNECTION_DIRECTION]: null,
            [CONNECTION_POSITION]: null,
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
    const [dataFetchStatus, setDataFetchStatus] = useState<string>(FetchStatus.IDLE);
    const [feederBaysInfos, setFeederBaysInfos] = useState<FeederBaysInfos[]>([]);

    const formMethods = useForm<DeepNullable<MoveVoltageLevelFeederBaysFormSchemaType>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<MoveVoltageLevelFeederBaysFormSchemaType>>(formSchema),
    });

    const { reset, getValues } = formMethods;

    useEffect(() => {
        if (editData?.equipmentId) {
            setSelectedId(editData.equipmentId);
        }
    }, [editData]);

    const onEquipmentIdChange = useCallback(
        (equipmentId: any) => {
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
                        if (voltageLevel) {
                            const feederBaysInfos = (
                                Object.entries(voltageLevel?.feederBaysInfos || {}) as [string, FeederBayInfos[]][]
                            ).flatMap(([voltageLevelId, feederBayInfos]) =>
                                feederBayInfos.map((feederBay) => ({
                                    voltageLevelId,
                                    ...feederBay,
                                }))
                            );
                            setFeederBaysInfos(feederBaysInfos);
                            reset(
                                {
                                    [MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE]: feederBaysInfos?.map((row) => ({
                                        [VOLTAGE_LEVEL_ID]: row.voltageLevelId,
                                        [BUSBAR_SECTION_ID]: row.busbarId,
                                        [BUSBAR_SECTION_IDS]: Object.values(
                                            voltageLevel?.busBarSectionInfos || {}
                                        ).flat() as string[],
                                        [CONNECTION_NAME]: row?.connectablePositionInfos?.connectionName,
                                        [CONNECTION_DIRECTION]: row?.connectablePositionInfos?.connectionDirection,
                                        [CONNECTION_POSITION]: row?.connectablePositionInfos?.connectionPosition,
                                    })),
                                },
                                { keepDirty: true }
                            );
                            setDataFetchStatus(FetchStatus.SUCCEED);
                        }
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
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

    const onSubmit = useCallback(() => {
        const tableData = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE);
        const feederBaysAttributeList: ConnectablePositionModificationInfos[] =
            tableData && Array.isArray(tableData)
                ? tableData
                      .filter(
                          (row) =>
                              row?.voltageLevelId &&
                              row?.busbarSectionId &&
                              row?.connectionName &&
                              row?.connectionDirection
                      )
                      .map((row) => ({
                          connectableId: row?.voltageLevelId!,
                          busbarSectionId: row?.busbarSectionId!,
                          connectionPosition: row?.connectionPosition != null ? String(row.connectionPosition) : '0',
                          connectionName: row?.connectionName!,
                          connectionDirection: row?.connectionDirection!,
                      }))
                : [];
        const moveVoltageLevelFeederBaysInfos = {
            voltageLevelId: selectedId,
            feederBaysAttributeList,
            type: MODIFICATION_TYPES.MOVE_VOLTAGE_LEVEL_FEEDER_BAYS.type,
            uuid: editData?.uuid,
        } satisfies MoveVoltageLevelFeederBaysInfos;
        moveVoltageLevelFeederBays({
            moveVoltageLevelFeederBaysInfos: moveVoltageLevelFeederBaysInfos,
            studyUuid: studyUuid,
            nodeUuid: currentNodeUuid,
            modificationUuid: editData?.uuid,
            isUpdate: !!editData,
        }).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'MoveVoltageLevelFeederBaysError',
            });
        });
    }, [currentNodeUuid, editData, getValues, selectedId, snackError, studyUuid]);

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
                titleId="MOVE_VOLTAGE_LEVEL_FEEDER_BAYS"
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
                        feederBaysInfos={feederBaysInfos}
                        currentNode={currentNode}
                        selectedId={selectedId}
                        isUpdate={isUpdate}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        studyUuid={studyUuid}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
