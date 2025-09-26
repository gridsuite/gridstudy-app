/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cleanEquipments, removeNodeData, resetEquipments } from 'redux/actions';
import { type AppState } from 'redux/reducer';
import type { NodeAlias } from '../../../types/node-alias.type';
import { useOptionalLoadingParametersForEquipments } from './use-optional-loading-parameters-for-equipments';
import { SpreadsheetEquipmentType } from '../../../types/spreadsheet.type';
import { useFetchEquipment } from 'components/spreadsheet-view/hooks/use-fetch-equipment';
import { useBuiltNodesIds } from '../../../hooks/use-built-nodes-ids';
import { useStableComputedSet } from '../../../../../hooks/use-stable-computed-set';
import type { UUID } from 'crypto';

export const useSpreadsheetEquipments = (
    type: SpreadsheetEquipmentType,
    nodeAliases: NodeAlias[],
    active: boolean = false
) => {
    const dispatch = useDispatch();
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    const equipments = useSelector((state: AppState) => state.spreadsheetNetwork[type]);
    const loadedNodesIdsForType = useSelector((state: AppState) => state.spreadsheetNetwork[type].nodesId);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const { fetchNodesEquipmentData } = useFetchEquipment(type);

    const prevCurrentRootNetworkUuidRef = useRef(currentRootNetworkUuid);

    const {
        shouldLoadOptionalLoadingParameters,
        equipmentsWithLoadingOptionsLoaded,
        shouldCleanOptionalLoadingParameters,
        equipmentsWithLoadingOptionsCleaned,
    } = useOptionalLoadingParametersForEquipments(type);

    useEffect(() => {
        if (shouldCleanOptionalLoadingParameters) {
            dispatch(cleanEquipments(type));
            equipmentsWithLoadingOptionsCleaned();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldCleanOptionalLoadingParameters, type]);

    const builtNodesIds = useBuiltNodesIds(nodeAliases);

    const nodesIdsToRemove = useStableComputedSet(() => {
        const unwantedFetchedNodes = new Set(loadedNodesIdsForType);
        for (const nodeId of builtNodesIds) {
            unwantedFetchedNodes.delete(nodeId);
        }
        return unwantedFetchedNodes;
    }, [builtNodesIds]);

    const nodesIdsToFetch = useStableComputedSet(() => {
        if (shouldLoadOptionalLoadingParameters) {
            return builtNodesIds;
        }
        const nodesIdToFetch = new Set<UUID>(builtNodesIds);
        for (const nodeId of loadedNodesIdsForType) {
            nodesIdToFetch.delete(nodeId);
        }
        return nodesIdToFetch;
    }, [currentNode?.id, loadedNodesIdsForType, nodeAliases, treeNodes]);

    // effect to unload equipment data when we remove an alias or unbuild an aliased node
    useEffect(() => {
        if (active && nodesIdsToRemove.size > 0) {
            dispatch(removeNodeData(Array.from(nodesIdsToRemove)));
        }
    }, [active, dispatch, nodesIdsToRemove]);

    // Reset equipment data on root network change
    useEffect(() => {
        if (prevCurrentRootNetworkUuidRef.current !== currentRootNetworkUuid) {
            dispatch(resetEquipments());
            prevCurrentRootNetworkUuidRef.current = currentRootNetworkUuid;
        }
    }, [dispatch, currentRootNetworkUuid]);

    // Note: take care about the dependencies because any execution here implies equipment loading (large fetches).
    // For example, we have 3 currentNode properties in deps rather than currentNode object itself.
    useEffect(() => {
        if (active && currentNode?.id && currentRootNetworkUuid && nodesIdsToFetch.size > 0) {
            setIsFetching(true);
            equipmentsWithLoadingOptionsLoaded();
            fetchNodesEquipmentData(nodesIdsToFetch, currentNode.id, currentRootNetworkUuid, () =>
                setIsFetching(false)
            );
        }
    }, [
        active,
        currentNode?.id,
        currentRootNetworkUuid,
        equipmentsWithLoadingOptionsLoaded,
        fetchNodesEquipmentData,
        nodesIdsToFetch,
    ]);

    return { equipments, isFetching };
};
