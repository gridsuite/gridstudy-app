/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'crypto';
import { useSearchMatchingEquipments } from './use-search-matching-equipments';
import { useMemo } from 'react';
import { getLocalStorageSearchEquipmentHistory } from 'redux/local-storage/search-equipment-history';

interface UseTopBarSearchMatchingEquipmentProps {
    studyUuid: UUID;
    nodeUuid: UUID;
}

export const useTopBarSearchMatchingEquipment = (
    props: UseTopBarSearchMatchingEquipmentProps
) => {
    const { nodeUuid, studyUuid } = props;
    const { updateSearchTerm, equipmentsFound, isLoading, searchTerm } =
        useSearchMatchingEquipments({
            studyUuid: studyUuid,
            nodeUuid: nodeUuid,
        });

    // when searching from topbar, if user input is empty, display last clicked element from localstorage
    const equipmentsToReturn = useMemo(() => {
        if (searchTerm) {
            return equipmentsFound;
        } else {
            return getLocalStorageSearchEquipmentHistory(studyUuid); //elements from localstorage
        }
    }, [searchTerm, equipmentsFound, studyUuid]);

    return { updateSearchTerm, equipmentsToReturn, isLoading, searchTerm };
};
