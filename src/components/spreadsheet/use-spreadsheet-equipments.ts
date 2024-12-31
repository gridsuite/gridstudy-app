/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Identifiable } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { UUID } from 'crypto';
import { useGetStudyImpacts } from 'hooks/use-get-study-impacts';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addAdditionalEquipmentsByNodesForCustomColumns,
    deleteEquipments,
    EquipmentToDelete,
    loadEquipments,
    resetEquipments,
    resetEquipmentsByTypes,
    updateEquipments,
} from 'redux/actions';
import type { AppState } from 'redux/reducer';
import type { SpreadsheetEquipmentType } from './config/spreadsheet.type';
import { fetchAllEquipments } from 'services/study/network-map';
import { TABLES_DEFINITIONS } from './config/config-tables';
import { getFetchers } from './config/equipment/common-config';

export type EquipmentProps = {
    type: SpreadsheetEquipmentType;
    fetchers: Array<(studyUuid: UUID, currentNodeId: UUID) => Promise<Identifiable>>;
};

type FormatFetchedEquipments = (equipments: Identifiable[]) => Identifiable[];

export const useSpreadsheetEquipments = (
    equipment: EquipmentProps,
    formatFetchedEquipments: FormatFetchedEquipments
) => {
    const dispatch = useDispatch();
    const allEquipments = useSelector((state: AppState) => state.spreadsheetNetwork);
    const equipments = allEquipments[equipment.type];
    const customColumnsDefinitions = useSelector((state: AppState) => state.tables.allCustomColumnsDefinitions);

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const treeModel = useSelector((state: AppState) => state.networkModificationTreeModel);
    const [errorMessage, setErrorMessage] = useState<string | null>();
    const [isFetching, setIsFetching] = useState(false);

    const {
        impactedSubstationsIds,
        deletedEquipments,
        impactedElementTypes,
        resetImpactedSubstationsIds,
        resetDeletedEquipments,
        resetImpactedElementTypes,
    } = useGetStudyImpacts();

    const shouldFetchEquipments = !equipments;

    useEffect(() => {
        // updating data related to impacted elements

        // If we dont have any data in the spreadsheet, we don't need to update the equipments
        const hasSpreadsheedData = () => {
            return Object.values(allEquipments).some((value) => Array.isArray(value) && value.length > 0);
        };
        if (!hasSpreadsheedData()) {
            resetImpactedSubstationsIds();
            resetDeletedEquipments();
            resetImpactedElementTypes();
            return;
        }
        // Handle updates and resets based on impacted element types
        if (impactedElementTypes.length > 0) {
            if (impactedElementTypes.includes(EQUIPMENT_TYPES.SUBSTATION)) {
                dispatch(resetEquipments());
                resetImpactedElementTypes();
                return;
            }
            const impactedSpreadsheetEquipmentsTypes = impactedElementTypes.filter((type) =>
                Object.keys(allEquipments).includes(type)
            );
            if (impactedSpreadsheetEquipmentsTypes.length > 0) {
                dispatch(resetEquipmentsByTypes(impactedSpreadsheetEquipmentsTypes as SpreadsheetEquipmentType[]));
            }
            resetImpactedElementTypes();
        }
        if (impactedSubstationsIds.length > 0 && studyUuid && currentNode?.id) {
            // The formatting of the fetched equipments is done in the reducer
            fetchAllEquipments(studyUuid, currentNode.id, impactedSubstationsIds).then((values) => {
                dispatch(updateEquipments(values));
            });
            resetImpactedSubstationsIds();
        }
        if (deletedEquipments.length > 0) {
            const equipmentsToDelete = deletedEquipments
                .filter(({ equipmentType, equipmentId }) => equipmentType && equipmentId)
                .map(({ equipmentType, equipmentId }) => {
                    console.info(
                        'removing equipment with id=',
                        equipmentId,
                        ' and type=',
                        equipmentType,
                        ' from the network'
                    );
                    return { equipmentType, equipmentId };
                });

            if (equipmentsToDelete.length > 0) {
                const equipmentsToDeleteArray: EquipmentToDelete[] = equipmentsToDelete.map((equipment) => ({
                    equipmentType: equipment.equipmentType as SpreadsheetEquipmentType,
                    equipmentId: equipment.equipmentId,
                }));
                dispatch(deleteEquipments(equipmentsToDeleteArray));
            }

            resetDeletedEquipments();
        }
    }, [
        impactedSubstationsIds,
        deletedEquipments,
        impactedElementTypes,
        studyUuid,
        currentNode?.id,
        dispatch,
        allEquipments,
        resetImpactedSubstationsIds,
        resetDeletedEquipments,
        resetImpactedElementTypes,
    ]);

    function toEquipmentType(tableName: string): SpreadsheetEquipmentType {
        return TABLES_DEFINITIONS.filter((value) => value.name === tableName)[0].type;
    }

    useEffect(() => {
        if (shouldFetchEquipments && studyUuid && currentNode?.id) {
            setErrorMessage(null);
            setIsFetching(true);
            Promise.all(equipment.fetchers.map((fetcher) => fetcher(studyUuid, currentNode?.id)))
                .then((results) => {
                    let fetchedEquipments = results.flat();
                    if (formatFetchedEquipments) {
                        fetchedEquipments = formatFetchedEquipments(fetchedEquipments);
                    }
                    dispatch(loadEquipments(equipment.type, fetchedEquipments));
                })
                .catch((err) => {
                    setErrorMessage(err);
                    setIsFetching(false);
                });
        }
    }, [
        equipment,
        shouldFetchEquipments,
        studyUuid,
        currentNode?.id,
        dispatch,
        formatFetchedEquipments,
        customColumnsDefinitions,
    ]);

    useEffect(() => {
        if (equipments != null && Object.keys(customColumnsDefinitions).length > 0) {
            let nodeIdByEquipmentTypeToFetch: Record<SpreadsheetEquipmentType, string[]> = [] as Record<
                SpreadsheetEquipmentType,
                string[]
            >;
            //TODO: this could be improved by fetching only the additional equipments of the tab we are currently on
            Object.entries(customColumnsDefinitions).forEach((customColumnDefinition) => {
                let equipmentType = customColumnDefinition[0];
                let equipmentTypeForFetch: SpreadsheetEquipmentType = toEquipmentType(equipmentType);
                let customColumns = customColumnDefinition[1];
                const nodeLabels = treeModel ? treeModel.treeNodes.map((node) => node.data.label) : [];
                customColumns.columns.forEach((column) => {
                    const pattern: string = nodeLabels.map((nodeLabel) => `\\b${nodeLabel}\\b\\.`).join('|'); // pattern to find the nodes in the expression
                    const regex = new RegExp(pattern, 'g');
                    const nodesFoundInFormula = column.formulaForEval?.match(regex); // contains all the nodes that were found in the expression
                    nodesFoundInFormula?.forEach((node) => {
                        let nodeName = node.slice(0, -1);
                        let treeNodeIndex = treeModel?.treeNodes.findIndex(
                            (treeNode) => treeNode.data.label === nodeName
                        );
                        let nodeId = treeModel?.treeNodes[treeNodeIndex].id;
                        if (
                            nodeIdByEquipmentTypeToFetch[equipmentTypeForFetch] === undefined ||
                            !nodeIdByEquipmentTypeToFetch[equipmentTypeForFetch].includes(nodeId)
                        ) {
                            if (nodeIdByEquipmentTypeToFetch[equipmentTypeForFetch] === undefined) {
                                nodeIdByEquipmentTypeToFetch[equipmentTypeForFetch] = [nodeId];
                            } else {
                                nodeIdByEquipmentTypeToFetch[equipmentTypeForFetch].push(nodeId);
                            }
                        }
                    });
                });
            });

            let fetchers: Promise<any>[] = [];
            let additionalEquipmentsByNodes: Record<string, Record<SpreadsheetEquipmentType, Identifiable[]>> = {};
            Object.keys(nodeIdByEquipmentTypeToFetch).forEach((equipmentType: SpreadsheetEquipmentType) => {
                nodeIdByEquipmentTypeToFetch[equipmentType]?.forEach((nodeId) => {
                    //save the fetchers to be sure all fetch are complete before dispatching the data
                    const fetcherPromises = getFetchers(equipmentType).map((fetcher) => fetcher(studyUuid, nodeId));
                    fetchers.push(fetcherPromises[0]);

                    fetcherPromises[0].then((res) => {
                        let fetchedEquipments = res.flat();
                        if (formatFetchedEquipments) {
                            fetchedEquipments = formatFetchedEquipments(fetchedEquipments);
                            let fetchedEquipmentByType: Record<SpreadsheetEquipmentType, Identifiable[]> = {} as Record<
                                SpreadsheetEquipmentType,
                                Identifiable[]
                            >;
                            fetchedEquipmentByType[equipmentType] = fetchedEquipments;
                            let nodeName: string = treeModel?.treeNodes.find((node) => node.id === nodeId).data.label;
                            //Todo remove this (why is the object not extensible ?)
                            additionalEquipmentsByNodes = { ...additionalEquipmentsByNodes };
                            additionalEquipmentsByNodes[nodeName] = fetchedEquipmentByType;
                        }
                    });
                });
            });
            Promise.all(fetchers).then(() => {
                dispatch(addAdditionalEquipmentsByNodesForCustomColumns(additionalEquipmentsByNodes));
            });
        }
    }, [dispatch, equipments, studyUuid, formatFetchedEquipments, treeModel, customColumnsDefinitions]);

    return { equipments, errorMessage, isFetching };
};
