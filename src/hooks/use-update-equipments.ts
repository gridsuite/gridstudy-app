/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState, StudyUpdated } from '../redux/reducer.type';
import { UPDATE_TYPE_HEADER } from 'components/study-container';
import {
    deleteEquipment,
    resetEquipments,
    setDeletedEquipments,
    setUpdatedSubstationsIds,
    updateEquipments,
} from 'redux/actions';
import { fetchAllEquipments } from 'services/study/network-map';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { UUID } from 'crypto';

function parseStudyNotification(studyUpdatedForce: StudyUpdated) {
    const payload = studyUpdatedForce.eventData.payload;
    const substationsIds = payload?.impactedSubstationsIds;
    const deletedEquipments = payload?.deletedEquipments;
    const collectionElementImpacts = payload?.collectionElementImpacts;

    return [substationsIds, deletedEquipments, collectionElementImpacts];
}

type FetchEquipmentsPropsType = {
    studyUuid: UUID;
    currentNodeUuid: UUID;
};

type DeletedEquipmentType = {
    equipmentId: string;
    equipmentType: string;
};

/**
 * Custom hook that consume a notification, analyze impacts and update equipments in store.
 */
export const useUpdateEquipments = (props: FetchEquipmentsPropsType): void => {
    const { studyUuid, currentNodeUuid } = props;
    const dispatch = useDispatch();
    const studyUpdatedForce = useSelector(
        (state: ReduxState) => state.studyUpdated
    );

    useEffect(() => {
        if (
            studyUpdatedForce.eventData.headers?.[UPDATE_TYPE_HEADER] ===
            'study'
        ) {
            // study partial update :
            // loading equipments involved in the study modification and updating the network
            const [
                substationsIds,
                deletedEquipments,
                collectionElementImpacts,
            ] = parseStudyNotification(studyUpdatedForce);

            if (
                collectionElementImpacts?.includes(EQUIPMENT_TYPES.SUBSTATION)
            ) {
                // We need to reload all the network
                fetchAllEquipments(studyUuid, currentNodeUuid, undefined).then(
                    (values) => {
                        // TODO instead of those two calls, add a way to reloadEquipments
                        // dispatch(reloadEquipments(values))
                        // or call the existing API by equipmentType
                        dispatch(resetEquipments());
                        dispatch(updateEquipments(values));
                    }
                );
                dispatch(setUpdatedSubstationsIds(undefined));
            } else {
                // partial update
                if (deletedEquipments?.length > 0) {
                    // removing deleted equipment from the network
                    deletedEquipments.forEach(
                        (deletedEquipment: DeletedEquipmentType) => {
                            if (
                                deletedEquipment?.equipmentId &&
                                deletedEquipment?.equipmentType
                            ) {
                                console.info(
                                    'removing equipment with id=',
                                    deletedEquipment?.equipmentId,
                                    ' and type=',
                                    deletedEquipment?.equipmentType,
                                    ' from the network'
                                );
                                // TODO For every deletedEquipment we do a dispatch... eurk
                                dispatch(
                                    deleteEquipment(
                                        deletedEquipment?.equipmentType,
                                        deletedEquipment?.equipmentId
                                    )
                                );
                            }
                        }
                    );
                    dispatch(setDeletedEquipments(deletedEquipments));
                }
                // updating data related to impacted substations
                fetchAllEquipments(
                    studyUuid,
                    currentNodeUuid,
                    substationsIds
                ).then((values) => {
                    dispatch(updateEquipments(values));
                });
                dispatch(setUpdatedSubstationsIds(substationsIds));
            }
        }
    }, [studyUpdatedForce, currentNodeUuid, studyUuid, dispatch]);
};
