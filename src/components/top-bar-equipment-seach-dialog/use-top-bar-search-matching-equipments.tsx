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
