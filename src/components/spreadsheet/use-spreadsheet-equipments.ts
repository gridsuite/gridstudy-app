/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Identifiable } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { useGetStudyImpacts } from 'hooks/use-get-study-impacts';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addAdditionalEquipmentsByNodesForCustomColumns,
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
import type { EquipmentFetcher, SpreadsheetEquipmentType } from './config/spreadsheet.type';
import { fetchAllEquipments } from 'services/study/network-map';
import { getFetchers } from './config/equipment/common-config';
import { isNodeBuilt } from 'components/graph/util/model-functions';

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
    type: SpreadsheetEquipmentType,
    fetchers: EquipmentFetcher[],
    formatFetchedEquipments: FormatFetchedEquipments
) => {
    const dispatch = useDispatch();
    const allEquipments = useSelector((state: AppState) => state.spreadsheetNetwork);
    const equipments = allEquipments[type];
    const allAdditionalEquipments = useSelector((state: AppState) => state.additionalEquipmentsByNodesForCustomColumns);
    const customColumnsDefinitions = useSelector((state: AppState) => state.tables.allCustomColumnsDefinitions);
    const customColumnsNodesAliases = useSelector((state: AppState) => state.customColumnsNodesAliases);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const isNetworkModificationTreeModelUpToDate = useSelector(
        (state: AppState) => state.isNetworkModificationTreeModelUpToDate
    );
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetwork);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
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
        if (impactedSubstationsIds.length > 0 && studyUuid && currentRootNetworkUuid && currentNode?.id) {
            // The formatting of the fetched equipments is done in the reducer
            fetchAllEquipments(studyUuid, currentNode.id, currentRootNetworkUuid, impactedSubstationsIds).then(
                (values) => {
                    dispatch(updateEquipments(values));
                }
            );
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
            Promise.all(fetchers.map((fetcher) => fetcher(studyUuid, currentNode?.id, currentRootNetworkUuid)))
                .then((results) => {
                    let fetchedEquipments = results.flat();
                    if (formatFetchedEquipments) {
                        fetchedEquipments = formatFetchedEquipments(fetchedEquipments);
                    }
                    dispatch(loadEquipments(type, fetchedEquipments));
                    setIsFetching(false);
                })
                .catch((err) => {
                    setErrorMessage(err);
                    setIsFetching(false);
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
        fetchers,
        type,
    ]);

    useEffect(() => {
        console.log(`custom nodes ${JSON.stringify(allAdditionalEquipments)}`);
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
                // TODO: turn getFetchers into returning a single element
                const res = await getFetchers(type)[0](studyUuid, aliasInfo.id, currentRootNetworkUuid);
                return {
                    alias: aliasInfo.alias,
                    identifiables: formatFetchedEquipments(res.flat()),
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
    ]);

    return { equipments, errorMessage, isFetching };
};
