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
    IS_REMOVED,
    IS_SEPARATOR,
    MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE,
} from '../../../../utils/field-constants';
import { MoveVoltageLevelFeederBaysForm } from './move-voltage-level-feeder-bays-form';
import {
    MoveFeederBayInfos,
    MoveVoltageLevelFeederBaysInfos,
} from '../../../../../services/network-modification-types';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { DeepNullable } from '../../../../utils/ts-utils';
import { FeederBaysFormInfos, FeederBaysInfos } from './move-voltage-level-feeder-bays.type';
import { moveVoltageLevelFeederBays } from '../../../../../services/study/network-modifications';
import { fetchVoltageLevelFeederBaysBusBarSectionsInfos } from '../../../../../services/study/network';
import { FeederBaysBusBarSectionsInfos } from '../../../../../services/study/network-map.type';
import { isNumber } from 'mathjs';

function requiredWhenActive<T extends yup.Schema>(schema: T) {
    return schema.when([IS_REMOVED, IS_SEPARATOR], ([isRemoved, isSeparator], schema) => {
        return !isRemoved && !isSeparator ? schema.nullable().required() : schema.nullable();
    });
}

const formSchema = yup.object().shape({
    [MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE]: yup.array().of(
        yup.object().shape({
            [EQUIPMENT_ID]: requiredWhenActive(yup.string()),
            [BUSBAR_SECTION_ID]: requiredWhenActive(yup.string()),
            [BUSBAR_SECTION_IDS]: requiredWhenActive(yup.array().of(yup.string())),
            [CONNECTION_SIDE]: yup.string().nullable(),
            [CONNECTION_NAME]: yup.string().nullable(),
            [CONNECTION_DIRECTION]: yup.string().nullable(),
            [CONNECTION_POSITION]: yup.number().nullable().positive(),
            [IS_REMOVED]: yup.boolean(),
            [IS_SEPARATOR]: yup.boolean(),
        })
    ),
});

const emptyFormData = {
    [MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE]: [
        {
            [EQUIPMENT_ID]: null,
            [BUSBAR_SECTION_ID]: null,
            [BUSBAR_SECTION_IDS]: [],
            [CONNECTION_SIDE]: null,
            [CONNECTION_NAME]: null,
            [CONNECTION_DIRECTION]: null,
            [CONNECTION_POSITION]: null,
            [IS_REMOVED]: false,
            [IS_SEPARATOR]: false,
        },
    ],
};

export type MoveVoltageLevelFeederBaysDialogProps = EquipmentModificationDialogProps & {
    editData: MoveVoltageLevelFeederBaysInfos;
};
export type MoveVoltageLevelFeederBaysFormSchemaType = yup.InferType<typeof formSchema>;

/**
 * Dialog to move voltage level feeder bays.
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

    const mergeRowData = useCallback(
        (feederBaysInfos: FeederBaysInfos, busBarSectionInfos: string[]) => {
            let mergedRowData: FeederBaysFormInfos[] = [];
            if (!editData?.uuid && feederBaysInfos.length > 0) {
                mergedRowData = feederBaysInfos.filter(Boolean).map((bay) => ({
                    equipmentId: bay.equipmentId,
                    busbarSectionId: bay.busbarSectionId || null,
                    busbarSectionIds: busBarSectionInfos,
                    connectionSide: bay.connectionSide || null,
                    connectionName: bay.connectablePositionInfos.connectionName || null,
                    connectionDirection: bay.connectablePositionInfos.connectionDirection || null,
                    connectionPosition: isNumber(bay.connectablePositionInfos.connectionPosition)
                        ? Number.parseInt(bay.connectablePositionInfos.connectionPosition)
                        : null,
                    isRemoved: false,
                    rowId: null,
                }));
            } else if (editData?.uuid && isNodeBuiltValue && editData?.feederBays && editData?.feederBays?.length > 0) {
                const feederBaysEditData = editData.feederBays;
                if (feederBaysInfos.length > 0) {
                    feederBaysInfos.filter(Boolean).forEach((bay) => {
                        mergedRowData.push({
                            equipmentId: bay.equipmentId,
                            busbarSectionId: bay.busbarSectionId,
                            busbarSectionIds: busBarSectionInfos,
                            connectionSide: bay.connectionSide,
                            connectionName: bay.connectablePositionInfos.connectionName || null,
                            connectionDirection: bay.connectablePositionInfos.connectionDirection,
                            connectionPosition: isNumber(bay.connectablePositionInfos.connectionPosition)
                                ? Number.parseInt(bay.connectablePositionInfos.connectionPosition)
                                : null,
                            isRemoved: false,
                            rowId: null,
                        });
                    });
                    const deletedFeederBays = feederBaysEditData.filter(
                        (bay) =>
                            bay?.equipmentId &&
                            !feederBaysInfos.some((formBay) => formBay?.equipmentId === bay.equipmentId)
                    );
                    if (deletedFeederBays.length > 0) {
                        deletedFeederBays.forEach((bay) => {
                            mergedRowData.push({
                                equipmentId: bay.equipmentId,
                                busbarSectionId: bay.busbarSectionId,
                                busbarSectionIds: busBarSectionInfos,
                                connectionSide: bay.connectionSide,
                                connectionName: bay.connectionName,
                                connectionDirection: bay.connectionDirection,
                                connectionPosition: isNumber(bay.connectionPosition)
                                    ? Number.parseInt(bay.connectionPosition)
                                    : null,
                                isRemoved: true,
                                rowId: null,
                            });
                        });
                    }
                }
            } else if (
                editData?.uuid &&
                !isNodeBuiltValue &&
                editData?.feederBays &&
                editData?.feederBays?.length > 0
            ) {
                mergedRowData = editData.feederBays.filter(Boolean).map((bay) => ({
                    equipmentId: bay.equipmentId,
                    busbarSectionId: bay.busbarSectionId,
                    busbarSectionIds: busBarSectionInfos,
                    connectionSide: bay.connectionSide,
                    connectionName: bay.connectionName,
                    connectionDirection: bay.connectionDirection,
                    connectionPosition: isNumber(bay.connectionPosition)
                        ? Number.parseInt(bay.connectionPosition)
                        : null,
                    isRemoved: false,
                    rowId: null,
                }));
            }
            return mergedRowData;
        },
        [editData, isNodeBuiltValue]
    );

    const handleVoltageLevelDataFetch = useCallback(
        (feederBaysBusBarSectionsInfo: FeederBaysBusBarSectionsInfos) => {
            const busBarSectionInfos: string[] = Object.values(
                feederBaysBusBarSectionsInfo?.busBarSectionsInfos.busBarSections || {}
            ).flat();
            const feederBaysInfos: FeederBaysInfos = Object.entries(
                feederBaysBusBarSectionsInfo?.feederBaysInfos || {}
            ).flatMap(([equipmentId, feederBayInfos]) =>
                feederBayInfos.map((feederBay) => ({
                    equipmentId,
                    ...feederBay,
                }))
            );
            // merge row data between actual values in network and user's modification infos
            const mergedRowData = mergeRowData(feederBaysInfos, busBarSectionInfos);
            // Enrich rows with unique identifiers to track form rows
            const mergedRowDataWithKeys = mergedRowData.map((item, index) => ({
                ...item,
                rowId: `${item.equipmentId}-${index}`,
            }));
            // reset default values for RHF state
            reset(
                {
                    [MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE]: mergedRowDataWithKeys,
                },
                { keepDirty: true }
            );

            setDataFetchStatus(FetchStatus.SUCCEED);
        },
        [mergeRowData, reset, setDataFetchStatus]
    );

    const onEquipmentIdChange = useCallback(
        (voltageLevelId: string) => {
            if (voltageLevelId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchVoltageLevelFeederBaysBusBarSectionsInfos(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    voltageLevelId
                )
                    .then((feederBaysBusBarSectionInfo) => {
                        if (feederBaysBusBarSectionInfo) {
                            handleVoltageLevelDataFetch(feederBaysBusBarSectionInfo);
                        }
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                    });
            }
        },
        [studyUuid, currentNodeUuid, currentRootNetworkUuid, handleVoltageLevelDataFetch]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(() => {
        const tableData = getValues(MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE);
        const feederBays: MoveFeederBayInfos[] =
            tableData && Array.isArray(tableData)
                ? tableData
                      .filter((row): row is NonNullable<typeof row> => row != null)
                      .map((row) => ({
                          equipmentId: row.equipmentId ?? '',
                          busbarSectionId: row.busbarSectionId ?? '',
                          connectionSide: row.connectionSide ?? null,
                          connectionPosition: isNumber(row.connectionPosition)
                              ? row.connectionPosition.toString()
                              : null,
                          connectionName: row.connectionName ?? null,
                          connectionDirection: row.connectionDirection ?? null,
                      }))
                : [];
        const moveVoltageLevelFeederBaysInfos = {
            voltageLevelId: selectedId,
            feederBays: feederBays,
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
            isNodeBuilt={isNodeBuiltValue}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                onClear={clear}
                fullWidth
                onSave={onSubmit}
                maxWidth={'lg'}
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
                        currentNode={currentNode}
                        selectedId={selectedId}
                        isUpdate={isUpdate}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        studyUuid={studyUuid}
                        isReady={dataFetchStatus === FetchStatus.SUCCEED}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
