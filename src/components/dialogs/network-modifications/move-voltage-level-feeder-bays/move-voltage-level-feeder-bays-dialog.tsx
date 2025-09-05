/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, EquipmentType, MODIFICATION_TYPES, useSnackMessage } from '@gridsuite/commons-ui';
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
} from '../../../../services/network-modification-types';
import { fetchNetworkElementInfos } from '../../../../services/study/network';
import { EquipmentModificationDialogProps } from '../../../graph/menus/network-modifications/network-modification-menu.type';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { DeepNullable } from '../../../utils/ts-utils';
import { FeederBayInfos, FeederBaysInfos } from './move-voltage-level-feeder-bays.type';
import { moveVoltageLevelFeederBays } from '../../../../services/study/network-modifications';
import { AnyObject, TestFunction } from 'yup';
import { toModificationOperation } from '../../../utils/utils';

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
    editData: MoveVoltageLevelFeederBaysInfos;
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
        if (editData?.voltageLevelId) {
            setSelectedId(editData.voltageLevelId);
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
                          connectableId: toModificationOperation(row?.voltageLevelId!),
                          busbarSectionId: toModificationOperation(row?.busbarSectionId!),
                          connectionPosition: toModificationOperation(
                              row?.connectionPosition != null ? String(row.connectionPosition) : '0'
                          ),
                          connectionName: toModificationOperation(row?.connectionName!),
                          connectionDirection: toModificationOperation(row?.connectionDirection!),
                      }))
                : [];
        const moveVoltageLevelFeederBaysInfos = {
            voltageLevelId: selectedId,
            ...feederBaysAttributeList,
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

    const mergedRowData = useMemo((): {
        voltageLevelId: string;
        busbarId: string | null;
        connectionName: string | null;
        connectionDirection: string | null;
        connectionPosition: string | null;
        type: string;
    }[] => {
        const SEPARATOR_TYPE = 'SEPARATOR';
        const FEEDER_BAY_TYPE = 'FEEDER_BAY';
        const FEEDER_BAY_REMOVED_TYPE = 'FEEDER_BAY';
        const result = [];

        if (!editData?.uuid && feederBaysInfos && feederBaysInfos?.length > 0) {
            return feederBaysInfos
                .filter((bay) => bay != null)
                .map((bay) => ({
                    voltageLevelId: bay.voltageLevelId || '',
                    busbarId: bay.busbarId || null,
                    connectionName: bay.connectablePositionInfos.connectionName || null,
                    connectionDirection: bay.connectablePositionInfos.connectionDirection || null,
                    connectionPosition: bay.connectablePositionInfos.connectionPosition || null,
                    type: FEEDER_BAY_TYPE,
                }));
        }

        if (editData?.uuid) {
            const feederBaysEditData = editData?.feederBaysAttributeList;
            if (
                feederBaysEditData &&
                feederBaysEditData?.length > 0 &&
                feederBaysInfos &&
                feederBaysInfos?.length > 0
            ) {
                const deletedFeederBays = feederBaysEditData.filter(
                    (bay) =>
                        bay &&
                        bay.connectableId &&
                        !feederBaysInfos.some((formBay) => {
                            const formBayId = formBay?.[VOLTAGE_LEVEL_ID];
                            const bayId = bay.connectableId?.value || bay.connectableId;
                            return formBayId === bayId;
                        })
                );
                feederBaysInfos
                    .filter((bay) => bay != null)
                    .forEach((bay) => {
                        result.push({
                            voltageLevelId: bay.voltageLevelId,
                            busbarId: bay.busbarId,
                            connectionName: bay.connectablePositionInfos.connectionName,
                            connectionDirection: bay.connectablePositionInfos.connectionDirection,
                            connectionPosition: bay.connectablePositionInfos.connectionPosition,
                            type: FEEDER_BAY_TYPE,
                        });
                    });
                if (deletedFeederBays.length > 0) {
                    result.push({
                        type: SEPARATOR_TYPE,
                        voltageLevelId: '',
                        busbarId: '',
                        connectionName: '',
                        connectionDirection: '',
                        connectionPosition: '',
                    });

                    deletedFeederBays.forEach((bay) => {
                        result.push({
                            voltageLevelId: bay.connectableId,
                            busbarId: bay.busbarSectionId,
                            connectionName: bay.connectionName,
                            connectionDirection: bay.connectionDirection,
                            connectionPosition: bay.connectionPosition,
                            type: FEEDER_BAY_REMOVED_TYPE,
                        });
                    });
                }
                return result;
            }
        }

        return [];
    }, [editData?.feederBaysAttributeList, editData?.uuid, feederBaysInfos]);

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
                        feederBaysInfos={mergedRowData}
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
