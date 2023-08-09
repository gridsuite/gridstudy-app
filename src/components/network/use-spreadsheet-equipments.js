import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadEquipments } from 'redux/actions';

export const useSpreadsheetEquipments = (equipmentType) => {
    const dispatch = useDispatch();
    const equipments = useSelector(
        (state) => state.spreadsheetNetwork[equipmentType.type]
    );
    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const [errorMessage, setErrorMessage] = useState();

    const shouldFetchEquipments = !equipments;

    useEffect(() => {
        if (shouldFetchEquipments) {
            setErrorMessage();
            Promise.all(
                equipmentType.fetchers.map((fetcher) =>
                    fetcher(studyUuid, currentNode.id)
                )
            )
                .then((results) => {
                    const fetchedEquipments = results.flat();
                    dispatch(
                        loadEquipments(equipmentType.type, fetchedEquipments)
                    );
                })
                .catch((err) => {
                    setErrorMessage(err);
                });
        }
    }, [
        equipmentType,
        shouldFetchEquipments,
        studyUuid,
        currentNode.id,
        dispatch,
    ]);

    return { equipments, errorMessage };
};
