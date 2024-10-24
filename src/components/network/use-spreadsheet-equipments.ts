/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { useGetStudyImpacts } from 'hooks/use-get-study-impacts';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    deleteEquipments,
    EquipmentToDelete,
    loadEquipments,
    resetEquipments,
    resetEquipmentsByTypes,
    updateEquipments,
} from 'redux/actions';
import { AppState, SpreadsheetEquipmentType } from 'redux/reducer';
import { fetchAllEquipments } from 'services/study/network-map';

export type EquipmentProps = { type: SpreadsheetEquipmentType; fetchers: any[] };
type FormatFetchedEquipments = (equipments: any) => any;

export const useSpreadsheetEquipments = (
    equipment: EquipmentProps,
    formatFetchedEquipments: FormatFetchedEquipments
) => {
    const dispatch = useDispatch();
    const allEquipments = useSelector((state: AppState) => state.spreadsheetNetwork);
    const equipments = allEquipments[equipment.type];

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
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

    useEffect(() => {
        if (shouldFetchEquipments) {
            setErrorMessage(null);
            setIsFetching(true);
            Promise.all(equipment.fetchers.map((fetcher) => fetcher(studyUuid, currentNode?.id)))
                .then((results) => {
                    let fetchedEquipments = results.flat();
                    if (formatFetchedEquipments) {
                        fetchedEquipments = formatFetchedEquipments(fetchedEquipments);
                    }
                    dispatch(loadEquipments(equipment.type, fetchedEquipments));
                    setIsFetching(false);
                })
                .catch((err) => {
                    setErrorMessage(err);
                    setIsFetching(false);
                });
        }
    }, [equipment, shouldFetchEquipments, studyUuid, currentNode?.id, dispatch, formatFetchedEquipments]);

    return { equipments, errorMessage, isFetching };
};
