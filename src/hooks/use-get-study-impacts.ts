/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DeletedEquipment, NetworkImpactsInfos, AppState, NotificationType } from '../redux/reducer';
import { UUID } from 'crypto';
import { setLogsFilter } from 'redux/actions';
import { COMPUTING_AND_NETWORK_MODIFICATION_TYPE } from '../utils/report/report.constant';

interface StudyImpactsWithReset extends NetworkImpactsInfos {
    resetImpactedSubstationsIds: () => void;
    resetDeletedEquipments: () => void;
    resetImpactedElementTypes: () => void;
}

/**
 * Custom hook that consume the update notification 'study' and return the impacts of the study
 */
export const useGetStudyImpacts = (): StudyImpactsWithReset => {
    const studyUpdatedForce = useSelector((state: AppState) => state.studyUpdated);
    const dispatch = useDispatch();

    const [impactedSubstationsIds, setImpactedSubstationsIds] = useState<UUID[]>([]);
    const [deletedEquipments, setDeletedEquipments] = useState<DeletedEquipment[]>([]);
    const [impactedElementTypes, setImpactedElementTypes] = useState<string[]>([]);

    const resetImpactedSubstationsIds = useCallback(() => {
        setImpactedSubstationsIds([]);
    }, []);

    const resetDeletedEquipments = useCallback(() => {
        setDeletedEquipments([]);
    }, []);

    const resetImpactedElementTypes = useCallback(() => {
        setImpactedElementTypes([]);
    }, []);

    useEffect(() => {
        if (studyUpdatedForce.type === NotificationType.STUDY) {
            const {
                impactedSubstationsIds: substationsIds,
                deletedEquipments,
                impactedElementTypes,
            } = JSON.parse(
                // @ts-ignore
                studyUpdatedForce.eventData.payload
            ) as NetworkImpactsInfos;

            if (impactedElementTypes?.length > 0) {
                setImpactedElementTypes(impactedElementTypes);
            }
            if (deletedEquipments?.length > 0) {
                setDeletedEquipments(deletedEquipments);
            }
            if (substationsIds?.length > 0) {
                setImpactedSubstationsIds(substationsIds);
            }
            // we reset the network modification logs filter when a modification is applied
            dispatch(setLogsFilter(COMPUTING_AND_NETWORK_MODIFICATION_TYPE.NETWORK_MODIFICATION, []));
        }
    }, [dispatch, studyUpdatedForce]);

    return {
        impactedSubstationsIds,
        deletedEquipments,
        impactedElementTypes,
        resetImpactedSubstationsIds,
        resetDeletedEquipments,
        resetImpactedElementTypes,
    };
};
