/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    DeepNullable,
    emptyMoveVoltageLevelFeederBaysFormData,
    EquipmentType,
    FeederBays,
    FeederBaysFormInfos,
    Identifiable,
    MoveVoltageLevelFeederBaysForm,
    moveVoltageLevelFeederBaysFormSchema,
    moveVoltageLevelFeederBaysFormToDto,
    ProblemDetailError,
    snackWithFallback,
    useSnackMessage,
    MoveVoltageLevelFeederBaysFormSchemaType,
    FieldConstants,
    MoveVoltageLevelFeederBaysDto,
} from '@gridsuite/commons-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FetchStatus } from '../../../../../services/utils';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { moveVoltageLevelFeederBays } from '../../../../../services/study/network-modifications';
import {
    fetchBusesOrBusbarSectionsForVoltageLevel,
    fetchVoltageLevelFeederBaysInfos,
} from '../../../../../services/study/network';
import { isNumber } from 'mathjs';
import { FeederBaysInfos } from '../../../../../services/study/network-map.type';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';

export type MoveVoltageLevelFeederBaysDialogProps = EquipmentModificationDialogProps & {
    editData: MoveVoltageLevelFeederBaysDto;
};

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
    const [feederBaysPreviousValues, setFeederBaysPreviousValues] = useState<FeederBays>([]);

    const formMethods = useForm<DeepNullable<MoveVoltageLevelFeederBaysFormSchemaType>>({
        defaultValues: emptyMoveVoltageLevelFeederBaysFormData,
        resolver: yupResolver<DeepNullable<MoveVoltageLevelFeederBaysFormSchemaType>>(
            moveVoltageLevelFeederBaysFormSchema
        ),
    });

    const { reset, getValues } = formMethods;
    const isNodeBuiltValue = useMemo(() => isNodeBuilt(currentNode), [currentNode]);

    useEffect(() => {
        if (editData?.voltageLevelId) {
            setSelectedId(editData.voltageLevelId);
        }
    }, [editData?.voltageLevelId]);

    const mergeRowData = useCallback(
        (feederBaysInfos: FeederBays, busBarSectionInfos: string[]) => {
            let mergedRowData: FeederBaysFormInfos[] = [];
            if (!editData?.uuid && feederBaysInfos.length > 0) {
                mergedRowData = feederBaysInfos.filter(Boolean).map((bay) => ({
                    equipmentId: bay.equipmentId,
                    busbarSectionId: bay.busbarSectionId || null,
                    busbarSectionIds: busBarSectionInfos,
                    connectionSide: bay.connectionSide || null,
                    connectionName: bay.connectablePositionInfos.connectionName || null,
                    connectionDirection: bay.connectablePositionInfos.connectionDirection || null,
                    connectionPosition: bay.connectablePositionInfos.connectionPosition ?? null,
                    isRemoved: false,
                    rowId: bay.rowId,
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
                            connectionPosition: bay.connectablePositionInfos.connectionPosition ?? null,
                            isRemoved: false,
                            rowId: bay.rowId,
                        });
                    });
                    const deletedFeederBays = feederBaysEditData.filter(
                        (bay) =>
                            bay?.equipmentId &&
                            !feederBaysInfos.some((formBay) => formBay?.equipmentId === bay.equipmentId)
                    );
                    if (deletedFeederBays.length > 0) {
                        for (const [index, bay] of deletedFeederBays.entries()) {
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
                                rowId: `${bay.equipmentId}-${index}-deleted`,
                            });
                        }
                    }
                }
            } else if (
                editData?.uuid &&
                !isNodeBuiltValue &&
                editData?.feederBays &&
                editData?.feederBays?.length > 0
            ) {
                mergedRowData = editData.feederBays.filter(Boolean).map((bay, index) => {
                    const existingBay = feederBaysInfos?.find(
                        (info) =>
                            info.equipmentId === bay.equipmentId &&
                            (info.connectionSide ?? null) === (bay.connectionSide ?? null)
                    );
                    return {
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
                        rowId: existingBay?.rowId ?? `${bay.equipmentId}-${bay.connectionSide}-${index}`,
                    };
                });
            }
            return mergedRowData;
        },
        [editData, isNodeBuiltValue]
    );

    const handleVoltageLevelDataFetch = useCallback(
        (feederBaysInfos: FeederBaysInfos, busesOrbusbarSections: Identifiable[]) => {
            const busbarSectionIds = busesOrbusbarSections?.map((b) => b.id) ?? null;
            const feederBaysArray = Object.entries(feederBaysInfos || {}).flatMap(([equipmentId, feederBayInfos]) =>
                feederBayInfos.map((feederBay) => ({
                    equipmentId,
                    ...feederBay,
                }))
            );
            // Enrich rows with unique identifiers to track form rows
            const feederBaysWithRowIds = feederBaysArray.map((item, index) => ({
                ...item,
                rowId: `${item.equipmentId}-${item.connectionSide}-${index}`,
            }));
            setFeederBaysPreviousValues(feederBaysWithRowIds);
            // merge row data between actual values in network and user's modification infos
            const mergedRowDataWithKeys = mergeRowData(feederBaysWithRowIds, busbarSectionIds);
            const formRowData = mergedRowDataWithKeys.map((row) => ({
                ...row,
                [FieldConstants.EQUIPMENT_ID]: row.equipmentId,
            }));
            // reset default values for RHF state
            reset(
                {
                    [FieldConstants.EQUIPMENT_ID]: selectedId,
                    [FieldConstants.MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE]: formRowData,
                },
                { keepDirty: true }
            );

            setDataFetchStatus(FetchStatus.SUCCEED);
        },
        [mergeRowData, reset, selectedId, setDataFetchStatus]
    );

    const onEquipmentIdChange = useCallback(
        async (voltageLevelId: string) => {
            if (voltageLevelId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                try {
                    const [busesOrBusbarSections, feederBaysInfo] = await Promise.all([
                        fetchBusesOrBusbarSectionsForVoltageLevel(
                            studyUuid,
                            currentNodeUuid,
                            currentRootNetworkUuid,
                            voltageLevelId
                        ),
                        fetchVoltageLevelFeederBaysInfos(
                            studyUuid,
                            currentNodeUuid,
                            currentRootNetworkUuid,
                            voltageLevelId
                        ),
                    ]);

                    const busBarSectionInfos =
                        busesOrBusbarSections?.map((b) => ({
                            id: b.id,
                            label: b.name ?? '',
                        })) ?? [];
                    if (feederBaysInfo && busBarSectionInfos) {
                        handleVoltageLevelDataFetch(feederBaysInfo, busBarSectionInfos);
                    } else {
                        setDataFetchStatus(FetchStatus.FAILED);
                    }
                } catch (error) {
                    if (error instanceof ProblemDetailError && error.status === 404) {
                        // Voltage level does not exist yet in the built network
                        // (likely created by a pending modification on an unbuilt node).
                        setDataFetchStatus(FetchStatus.SUCCEED);
                        // Feed empty built network data to reach the unbuilt-node merge path.
                        handleVoltageLevelDataFetch({}, []);
                        return;
                    }
                    console.error(error);
                    setDataFetchStatus(FetchStatus.FAILED);
                }
            }
        },
        [studyUuid, currentNodeUuid, currentRootNetworkUuid, handleVoltageLevelDataFetch]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (formData: MoveVoltageLevelFeederBaysFormSchemaType) => {
            const moveVoltageLevelFeederBaysDto = {
                ...moveVoltageLevelFeederBaysFormToDto(formData),
                uuid: editData?.uuid,
            };
            moveVoltageLevelFeederBays({
                moveVoltageLevelFeederBaysDto: moveVoltageLevelFeederBaysDto,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                isUpdate: !!editData,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'MoveVoltageLevelFeederBaysError' });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    const clear = useCallback(() => {
        reset(emptyMoveVoltageLevelFeederBaysFormData);
    }, [reset]);

    return (
        <CustomFormProvider
            validationSchema={moveVoltageLevelFeederBaysFormSchema}
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
                    <MoveVoltageLevelFeederBaysForm
                        feederBaysPreviousValues={feederBaysPreviousValues}
                        isNodeBuilt={isNodeBuiltValue}
                        isUpdate={isUpdate}
                        isReady={dataFetchStatus === FetchStatus.SUCCEED}
                        PositionDiagramPane={PositionDiagramPane}
                        disableTooltip={false}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
