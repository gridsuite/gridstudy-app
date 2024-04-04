/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    DeletedEquipment,
    NetworkImpactsInfos,
    ReduxState,
    UpdateTypes,
} from '../redux/reducer.type';
import { UUID } from 'crypto';

interface StudyImpactsWithReset extends NetworkImpactsInfos {
    resetImpactedSubstationsIds: () => void;
    resetDeletedEquipments: () => void;
    resetImpactedElementTypes: () => void;
}

/**
 * Custom hook that consume the update notification 'study' and return the impacts of the study
 */
export const useUpdateStudyImpacts = (): StudyImpactsWithReset => {
    const studyUpdatedForce = useSelector(
        (state: ReduxState) => state.studyUpdated
    );

    const [impactedSubstationsIds, setImpactedSubstationsIds] = useState<
        UUID[]
    >([]);
    const [deletedEquipments, setDeletedEquipments] = useState<
        DeletedEquipment[]
    >([]);
    const [impactedElementTypes, setImpactedElementTypes] = useState<string[]>(
        []
    );

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
        if (studyUpdatedForce.type === UpdateTypes.STUDY) {
            const {
                impactedSubstationsIds: substationsIds,
                deletedEquipments,
                impactedElementTypes,
            } = studyUpdatedForce.eventData.payload;

            if (impactedElementTypes?.length > 0) {
                setImpactedElementTypes(impactedElementTypes);
            }
            if (deletedEquipments?.length > 0) {
                setDeletedEquipments(deletedEquipments);
            }
            if (substationsIds?.length > 0) {
                setImpactedSubstationsIds(substationsIds);
            }
        }
    }, [studyUpdatedForce]);

    return {
        impactedSubstationsIds,
        deletedEquipments,
        impactedElementTypes,
        resetImpactedSubstationsIds,
        resetDeletedEquipments,
        resetImpactedElementTypes,
    };
};
