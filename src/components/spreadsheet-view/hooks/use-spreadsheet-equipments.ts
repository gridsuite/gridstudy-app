/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addSpreadsheetLoadedNodesIds,
    cleanEquipments,
    removeNodeData,
    removeSpreadsheetLoadedNodesIds,
} from 'redux/actions';
import { type AppState } from 'redux/reducer';
import { useOptionalLoadingParametersForEquipments } from '../spreadsheet/spreadsheet-content/hooks/use-optional-loading-parameters-for-equipments';
import { useFetchEquipment } from 'components/spreadsheet-view/hooks/use-fetch-equipment';
import { useBuiltNodesIds } from './use-built-nodes-ids';
import { useStableComputedSet } from '../../../hooks/use-stable-computed-set';
import type { UUID } from 'crypto';
import { useNodeAliases } from './use-node-aliases';
import { SpreadsheetEquipmentType } from '../types/spreadsheet.type';

export const useSpreadsheetEquipments = () => {
    const dispatch = useDispatch();
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    const loadedNodesIds = useSelector((state: AppState) => state.spreadsheetNetwork.nodesIds);
    const equipments = useSelector((state: AppState) => state.spreadsheetNetwork.equipments);
    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const { nodeAliases } = useNodeAliases();
    const { fetchNodesEquipmentData } = useFetchEquipment();

    const { loadOptional, equipmentsWithLoadingOptionsLoaded, cleanOptional, equipmentsWithLoadingOptionsCleaned } =
        useOptionalLoadingParametersForEquipments();

    const applyToAllTypes = useCallback(
        (callback: (type: SpreadsheetEquipmentType) => void) => {
            tablesDefinitions.map((tableDefinition) => tableDefinition.type).forEach((type) => callback(type));
        },
        [tablesDefinitions]
    );

    useEffect(() => {
        applyToAllTypes((type) => {
            if (cleanOptional[type] && Object.keys(equipments[type].equipmentsByNodeId).length !== 0) {
                dispatch(cleanEquipments(type));
                equipmentsWithLoadingOptionsCleaned(type);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cleanOptional, dispatch, equipmentsWithLoadingOptionsCleaned]);

    const builtNodesIds = useBuiltNodesIds();

    const nodesIdsToRemove = useStableComputedSet(() => {
        const unwantedFetchedNodes = new Set(loadedNodesIds);
        for (const nodeId of builtNodesIds) {
            unwantedFetchedNodes.delete(nodeId);
        }
        return unwantedFetchedNodes;
    }, [builtNodesIds]);

    const nodesIdsToFetch = useStableComputedSet(() => {
        const nodesIdToFetch = new Set<UUID>(builtNodesIds);
        for (const nodeId of loadedNodesIds) {
            nodesIdToFetch.delete(nodeId);
        }
        return nodesIdToFetch;
    }, [currentNode?.id, loadedNodesIds, nodeAliases, treeNodes]);

    // effect to unload equipment data when we remove an alias or unbuild an aliased node
    useEffect(() => {
        if (nodesIdsToRemove.size > 0) {
            dispatch(removeSpreadsheetLoadedNodesIds([...nodesIdsToRemove]));
            applyToAllTypes((type) => {
                if (Object.keys(equipments[type].equipmentsByNodeId).length !== 0) {
                    dispatch(removeNodeData(type, [...nodesIdsToRemove]));
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, nodesIdsToRemove]);

    // Note: take care about the dependencies because any execution here implies equipment loading (large fetches).
    // For example, we have 3 currentNode properties in deps rather than currentNode object itself.
    useEffect(() => {
        if (nodesIdsToFetch.size > 0) {
            dispatch(addSpreadsheetLoadedNodesIds([...nodesIdsToFetch]));
            applyToAllTypes((type) => {
                if (Object.keys(equipments[type].equipmentsByNodeId).length !== 0) {
                    fetchNodesEquipmentData(type, nodesIdsToFetch);
                }
            });
        } else {
            applyToAllTypes((type) => {
                if (loadOptional[type] && Object.keys(equipments[type].equipmentsByNodeId).length !== 0) {
                    fetchNodesEquipmentData(type, builtNodesIds);
                    equipmentsWithLoadingOptionsLoaded(type);
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, equipmentsWithLoadingOptionsLoaded, fetchNodesEquipmentData, nodesIdsToFetch, loadOptional]);
};
