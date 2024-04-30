import { UUID } from 'crypto';
import { useSearchMatchingEquipments } from './use-search-matching-equipments';

interface UseTopBarSearchMatchingEquipmentProps {
    studyUuid: UUID;
    nodeUuid: UUID;
}

export const useTopBarSearchMatchingEquipment = (
    props: UseTopBarSearchMatchingEquipmentProps
) => {
    const { nodeUuid, studyUuid } = props;
    const { updateSearchTerm, equipmentsFound } = useSearchMatchingEquipments({
        studyUuid: studyUuid,
        nodeUuid: nodeUuid,
    });
};
