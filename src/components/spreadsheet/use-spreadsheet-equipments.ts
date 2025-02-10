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
    AdditionalNodeData,
    deleteEquipments,
    EquipmentToDelete,
    loadEquipments,
    removeNodeData,
    resetEquipments,
    resetEquipmentsByTypes,
    updateEquipments,
} from 'redux/actions';
import { AppState } from 'redux/reducer';
import type { SpreadsheetEquipmentType } from './config/spreadsheet.type';
import { fetchAllEquipments } from 'services/study/network-map';
import { getFetcher } from './config/equipment/common-config';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { SpreadsheetEquipmentsByNodes } from './config/spreadsheet.type';

export type EquipmentProps = {
    type: SpreadsheetEquipmentType;
    fetchers: Array<(studyUuid: UUID, currentNodeId: UUID, currentRootNetworkUuid: UUID) => Promise<Identifiable>>;
};

type FormatFetchedEquipments = (equipments: Identifiable[]) => Identifiable[];

const filterUndefined = (
    res: AdditionalNodeData | undefined
): res is {
    alias: string;
    identifiables: Identifiable[];
} => {
    return res !== undefined;
};

export const useSpreadsheetEquipments = (
    equipment: EquipmentProps,
    type: SpreadsheetEquipmentType,
    formatFetchedEquipments: FormatFetchedEquipments
) => {
    const dispatch = useDispatch();
    const allEquipments = useSelector((state: AppState) => state.spreadsheetNetwork);
    const equipments = allEquipments[type];
    const customColumnsDefinitions = useSelector((state: AppState) => state.tables.allCustomColumnsDefinitions);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const isNetworkModificationTreeModelUpToDate = useSelector(
        (state: AppState) => state.isNetworkModificationTreeModelUpToDate
    );
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetwork);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [errorMessage, setErrorMessage] = useState<string | null>();
    const [isFetching, setIsFetching] = useState(false);
    const [shouldFetchEquipments, setShouldFetchEquipments] = useState(false);
    const [nodesIdToFetch, setNodesIdToFetch] = useState<Set<UUID>>(new Set());
    const nodesAliases = useSelector((state: AppState) => state.customColumnsNodesAliases);

    const {
        impactedSubstationsIds,
        deletedEquipments,
        impactedElementTypes,
        resetImpactedSubstationsIds,
        resetDeletedEquipments,
        resetImpactedElementTypes,
    } = useGetStudyImpacts();

    useEffect(() => {
        const currentNodeId = currentNode?.id as UUID;
        let nodesIdToFetch = new Set();
        // We check if we have the data for the currentNode and if we don't we save the fact that we need to fetch it
        if (allEquipments[equipment.type].nodesId.find((nodeId) => nodeId === currentNodeId) === undefined) {
            nodesIdToFetch.add(currentNodeId);
        }

        //Then we do the same for the other nodes we need the data of (the ones defined in aliases)
        nodesAliases.forEach((nodeAlias) => {
            if (allEquipments[equipment.type].nodesId.find((nodeId) => nodeId === nodeAlias.id) === undefined) {
                nodesIdToFetch.add(nodeAlias.id);
            }
        });
        setNodesIdToFetch(nodesIdToFetch);
        if (nodesIdToFetch.size > 0) {
            setShouldFetchEquipments(true);
        }
    }, [nodesAliases, currentNode, allEquipments, equipment.type]);

    useEffect(() => {
        // updating data related to impacted elements
        const nodeId = currentNode?.id as UUID;

        // If we dont have any data in the spreadsheet, we don't need to update the equipments
        const hasSpreadsheetData = () => {
            return Object.values(allEquipments)
                .map((value) => value.equipmentsByNodeId[nodeId])
                .filter((value) => value !== undefined)
                .some((value) => value.length > 0);
        };
        if (!hasSpreadsheetData()) {
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
        if (impactedSubstationsIds.length > 0 && studyUuid && currentRootNetworkUuid && currentNode?.id) {
            // The formatting of the fetched equipments is done in the reducer
            fetchAllEquipments(studyUuid, nodeId, currentRootNetworkUuid, impactedSubstationsIds).then((values) => {
                dispatch(updateEquipments(values, nodeId));
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
                    nodeId: nodeId,
                }));
                dispatch(deleteEquipments(equipmentsToDeleteArray, nodeId));
            }

            resetDeletedEquipments();
        }
    }, [
        impactedSubstationsIds,
        deletedEquipments,
        impactedElementTypes,
        studyUuid,
        currentRootNetworkUuid,
        currentNode?.id,
        dispatch,
        allEquipments,
        resetImpactedSubstationsIds,
        resetDeletedEquipments,
        resetImpactedElementTypes,
    ]);

    useEffect(() => {
        if (
            shouldFetchEquipments &&
            studyUuid &&
            currentRootNetworkUuid &&
            currentNode?.id &&
            isNetworkModificationTreeModelUpToDate &&
            isNodeBuilt(currentNode)
        ) {
            setErrorMessage(null);
            setIsFetching(true);
            let fetchers: Promise<unknown>[] = [];
            let spreadsheetEquipmentsByNodes: SpreadsheetEquipmentsByNodes = {
                nodesId: [],
                equipmentsByNodeId: {},
            };

            nodesIdToFetch.forEach((nodeId) => {
                const fetcherPromises = getFetcher(equipment.type)(studyUuid, nodeId, currentRootNetworkUuid, []);
                fetchers.push(fetcherPromises);
                fetcherPromises.then((results) => {
                    let fetchedEquipments = results.flat();
                    spreadsheetEquipmentsByNodes.nodesId.push(nodeId);
                    if (formatFetchedEquipments) {
                        fetchedEquipments = formatFetchedEquipments(fetchedEquipments);
                        spreadsheetEquipmentsByNodes.equipmentsByNodeId[nodeId] = fetchedEquipments;
                    }
                });
            });

            Promise.all(fetchers).then(() => {
                dispatch(loadEquipments(equipment.type, spreadsheetEquipmentsByNodes));
                setIsFetching(false);
                setShouldFetchEquipments(false);
                setNodesIdToFetch(new Set());
            });
        }
    }, [
        shouldFetchEquipments,
        studyUuid,
        currentNode,
        currentRootNetworkUuid,
        isNetworkModificationTreeModelUpToDate,
        dispatch,
        formatFetchedEquipments,
        customColumnsDefinitions,
        nodesIdToFetch,
        type,
    ]);

    /*useEffect(() => {
        if (studyUuid && currentRootNetworkUuid) {
            // Clean nodes that are not loaded anymore
            const unwantedFetchedNodes = new Set(Object.keys(allAdditionalEquipments));
            const usedNodes = new Set(customColumnsNodesAliases);
            usedNodes.forEach((node) => unwantedFetchedNodes.delete(node.alias));
            if (unwantedFetchedNodes.size !== 0) {
                dispatch(removeNodeData(Array.from(unwantedFetchedNodes)));
            }

            // Fetch new nodes for the current type if required
            const fetchedEquipments = customColumnsNodesAliases.map(async (aliasInfo) => {
                if (allAdditionalEquipments[aliasInfo.alias]?.[type] !== undefined) {
                    return undefined;
                }
                const identifiableList = await getFetcher(type)(studyUuid, aliasInfo.id, currentRootNetworkUuid);
                return {
                    alias: aliasInfo.alias,
                    identifiables: formatFetchedEquipments(identifiableList.flat()),
                } satisfies AdditionalNodeData;
            });
            Promise.all(fetchedEquipments).then((results) => {
                const filteredResults = results.filter(filterUndefined);
                if (filteredResults.length !== 0) {
                    dispatch(addAdditionalEquipmentsByNodesForCustomColumns(type, filteredResults));
                }
            });
        }
    }, [
            dispatch,
            studyUuid,
            currentRootNetworkUuid,
            formatFetchedEquipments,
            customColumnsNodesAliases,
            type,
            allAdditionalEquipments,
]);*/

    return { equipments, errorMessage, isFetching };
};
