import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadEquipments } from 'redux/actions';

export const useSpreadsheetEquipments = (equipmentType) => {
    const dispatch = useDispatch();
    const equipments = useSelector(
        (state) => state.spreadsheetNetwork[equipmentType.resource]
    );
    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);

    const isFetching = !equipments;

    useEffect(() => {
        if (!equipments) {
            Promise.all(
                equipmentType.type.fetchers.map((fetcher) =>
                    fetcher(studyUuid, currentNode.id)
                )
            ).then((results) => {
                const equipments = results.flat();
                dispatch(loadEquipments(equipmentType.resource, equipments));
            });
        }
    }, [equipmentType, equipments, studyUuid, currentNode.id, dispatch]);

    return { equipments, isFetching };
};
