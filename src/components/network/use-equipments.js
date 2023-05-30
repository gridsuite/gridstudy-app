import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadEquipments } from 'redux/actions';

export const useEquipments = (equipmentType) => {
    const dispatch = useDispatch();
    const equipments = useSelector(
        (state) => state.spreadsheetNetwork[equipmentType.resource]
    );
    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);

    const isFetching = equipments == null;

    useEffect(() => {
        if (equipments == null) {
            equipmentType.type.fetchers[0](studyUuid, currentNode.id).then(
                (result) => {
                    dispatch(loadEquipments(equipmentType.resource, result));
                }
            );
        }
    }, [equipmentType, equipments, studyUuid, currentNode.id, dispatch]);

    return { equipments, isFetching };
};
