/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, EquipmentType, MODIFICATION_TYPES, useSnackMessage } from '@gridsuite/commons-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FetchStatus } from '../../../../../services/utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import yup from '../../../../utils/yup-config';
import {
    BUSBAR_SECTION_ID,
    BUSBAR_SECTION_IDS,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTION_SIDE,
    EQUIPMENT_ID,
    MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE,
} from '../../../../utils/field-constants';
import { MoveVoltageLevelFeederBaysForm } from './move-voltage-level-feeder-bays-form';
import {
    ConnectablePositionModificationInfos,
    MoveVoltageLevelFeederBaysInfos,
} from '../../../../../services/network-modification-types';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from '../../../../utils/equipment-types';
import { DeepNullable } from '../../../../utils/ts-utils';
import { FeederBayInfos, FeederBaysInfos } from './move-voltage-level-feeder-bays.type';
import { moveVoltageLevelFeederBays } from '../../../../../services/study/network-modifications';
import { AnyObject, TestFunction } from 'yup';
import { useIntl } from 'react-intl';

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
            [EQUIPMENT_ID]: yup.string().required(),
            [BUSBAR_SECTION_ID]: yup.string().required(),
            [CONNECTION_SIDE]: yup.string().nullable(),
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
            [EQUIPMENT_ID]: null,
            [BUSBAR_SECTION_ID]: null,
            [CONNECTION_SIDE]: null,
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
    const intl = useIntl();
    const [selectedId, setSelectedId] = useState<string>(defaultIdValue ?? null);
    const [dataFetchStatus, setDataFetchStatus] = useState<string>(FetchStatus.IDLE);
    const [feederBaysInfos, setFeederBaysInfos] = useState<FeederBaysInfos[]>([]);

    const formMethods = useForm<DeepNullable<MoveVoltageLevelFeederBaysFormSchemaType>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<MoveVoltageLevelFeederBaysFormSchemaType>>(formSchema),
    });

    const { reset, getValues } = formMethods;
    const isNodeBuiltValue = useMemo(() => isNodeBuilt(currentNode), [currentNode]);

    useEffect(() => {
        if (editData?.voltageLevelId) {
            setSelectedId(editData.voltageLevelId);
        }
    }, [editData?.voltageLevelId]);

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
                            )
                                .flatMap(([equipmentId, feederBayInfos]) =>
                                    feederBayInfos.map((feederBay) => ({
                                        equipmentId,
                                        ...feederBay,
                                    }))
                                )
                                .filter(
                                    (item, index, arr) =>
                                        arr.findIndex((x) => x.equipmentId === item.equipmentId) === index
                                );
                            setFeederBaysInfos(feederBaysInfos);
                            setDataFetchStatus(FetchStatus.SUCCEED);
                        }
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                    });
            }
        },
        [studyUuid, currentNodeUuid, currentRootNetworkUuid]
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
                              row?.equipmentId &&
                              row?.busbarSectionId &&
                              row?.connectionSide &&
                              row?.connectionName &&
                              row?.connectionDirection
                      )
                      .map((row) => ({
                          equipmentId: row?.equipmentId!,
                          busbarSectionId: row?.busbarSectionId!,
                          connectionSide: row?.connectionSide!,
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

    const mergedRowData = useMemo((): {
        equipmentId: string;
        busbarSectionId: string | null;
        connectionSide: string | null;
        connectionName: string | null;
        connectionDirection: string | null;
        connectionPosition: string | null;
        type: string;
    }[] => {
        const SEPARATOR_TYPE = 'SEPARATOR';
        const FEEDER_BAY_TYPE = 'FEEDER_BAY';
        const FEEDER_BAY_REMOVED_TYPE = 'FEEDER_BAY_REMOVED';
        if (!editData?.uuid && feederBaysInfos?.length > 0) {
            return feederBaysInfos.filter(Boolean).map((bay) => ({
                equipmentId: bay.equipmentId || '',
                busbarSectionId: bay.busbarSectionId || null,
                connectionSide: bay.connectionSide || null,
                connectionName: bay.connectablePositionInfos.connectionName || null,
                connectionDirection: bay.connectablePositionInfos.connectionDirection || null,
                connectionPosition: bay.connectablePositionInfos.connectionPosition || null,
                type: FEEDER_BAY_TYPE,
            }));
        }

        if (
            editData &&
            editData?.uuid &&
            isNodeBuiltValue &&
            editData?.feederBaysAttributeList &&
            editData.feederBaysAttributeList?.length > 0 &&
            dataFetchStatus === FetchStatus.SUCCEED
        ) {
            const feederBaysEditData = editData.feederBaysAttributeList;
            if (feederBaysInfos?.length > 0) {
                const result: any[] = [];
                feederBaysInfos.filter(Boolean).forEach((bay) => {
                    result.push({
                        equipmentId: bay.equipmentId,
                        busbarSectionId: bay.busbarSectionId,
                        connectionSide: bay.connectionSide || null,
                        connectionName: bay.connectablePositionInfos.connectionName,
                        connectionDirection: bay.connectablePositionInfos.connectionDirection,
                        connectionPosition: bay.connectablePositionInfos.connectionPosition,
                        type: FEEDER_BAY_TYPE,
                    });
                });
                const deletedFeederBays = feederBaysEditData.filter(
                    (bay) =>
                        bay?.equipmentId && !feederBaysInfos.some((formBay) => formBay?.equipmentId === bay.equipmentId)
                );
                if (deletedFeederBays.length > 0) {
                    result.push({
                        type: SEPARATOR_TYPE,
                        equipmentId: '',
                        busbarSectionId: '',
                        connectionSide: '',
                        connectionName: '',
                        connectionDirection: '',
                        connectionPosition: '',
                        title: intl.formatMessage({ id: 'MissingConnectionsInVoltageLevel' }),
                        helperMessage: intl.formatMessage({ id: 'ConnectionsRemovedFromList' }),
                    });

                    deletedFeederBays.forEach((bay) => {
                        result.push({
                            equipmentId: bay.equipmentId,
                            busbarSectionId: bay.busbarSectionId,
                            connectionSide: bay.connectionSide,
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

        if (
            editData &&
            editData?.uuid &&
            !isNodeBuiltValue &&
            editData?.feederBaysAttributeList &&
            editData.feederBaysAttributeList?.length > 0 &&
            dataFetchStatus === FetchStatus.SUCCEED
        ) {
            return editData.feederBaysAttributeList.filter(Boolean).map((bay) => ({
                equipmentId: bay.equipmentId || '',
                busbarSectionId: bay.busbarSectionId || null,
                connectionSide: bay.connectionSide || null,
                connectionName: bay.connectionName || null,
                connectionDirection: bay.connectionDirection || null,
                connectionPosition: bay.connectionPosition || null,
                type: FEEDER_BAY_TYPE,
            }));
        }

        return [];
    }, [dataFetchStatus, editData, feederBaysInfos, intl, isNodeBuiltValue]);

    useEffect(() => {
        if (mergedRowData.length > 0) {
            const feederBayRows = mergedRowData.filter((row) => row.type === 'FEEDER_BAY');
            if (feederBayRows.length > 0) {
                const formData = {
                    [MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE]: feederBayRows.map((row) => ({
                        [EQUIPMENT_ID]: row.equipmentId,
                        [BUSBAR_SECTION_ID]: row.busbarSectionId,
                        [CONNECTION_SIDE]: row.connectionSide,
                        [BUSBAR_SECTION_IDS]: feederBaysInfos.map((bay) => bay?.busbarSectionId).filter(Boolean),
                        [CONNECTION_NAME]: row.connectionName,
                        [CONNECTION_DIRECTION]: row.connectionDirection,
                        [CONNECTION_POSITION]: row.connectionPosition,
                    })),
                };
                reset(formData, { keepDirty: true });
            }
        }
    }, [mergedRowData, reset, feederBaysInfos]);

    return (
        <CustomFormProvider
            validationSchema={formSchema}
            removeOptional={true}
            {...formMethods}
            isNodeBuilt={isNodeBuiltValue}
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
