/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'crypto';
import { useSearchMatchingEquipments } from './use-search-matching-equipments';
import { useMemo } from 'react';
import { getLocalStorageSearchEquipmentHistory } from 'redux/session-storage/search-equipment-history';
import { EquipmentType } from '@gridsuite/commons-ui';

interface UseTopBarSearchMatchingEquipmentProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    equipmentType?: EquipmentType;
}

export const useTopBarSearchMatchingEquipment = (props: UseTopBarSearchMatchingEquipmentProps) => {
    const { nodeUuid, studyUuid, currentRootNetworkUuid, equipmentType } = props;
    const { equipmentsFound, searchTerm, ...otherStates } = useSearchMatchingEquipments({
        studyUuid: studyUuid,
        nodeUuid: nodeUuid,
        currentRootNetworkUuid: currentRootNetworkUuid,
        equipmentType: equipmentType ?? undefined,
    });

    // when searching from topbar, if user input is empty, display last clicked element from localstorage
    const equipmentsToReturn = useMemo(() => {
        if (searchTerm.length > 0 || equipmentType !== undefined) {
            return equipmentsFound;
        } else {
            return getLocalStorageSearchEquipmentHistory(studyUuid); //elements from localstorage
        }
    }, [searchTerm, equipmentType, equipmentsFound, studyUuid]);

    return {
        ...otherStates,
        equipmentsFound: equipmentsToReturn,
        searchTerm,
    };
};
