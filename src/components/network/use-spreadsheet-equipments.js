import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadEquipments } from 'redux/actions';

export const useSpreadsheetEquipments = (equipment) => {
    const dispatch = useDispatch();
    const equipments = useSelector(
        (state) => state.spreadsheetNetwork[equipment.type]
    );
    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const [errorMessage, setErrorMessage] = useState();
    const [isFetching, setIsFetching] = useState(false);

    const shouldFetchEquipments = !equipments;

    useEffect(() => {
        if (shouldFetchEquipments) {
            setErrorMessage();
            setIsFetching(true);
            Promise.all(
                equipment.fetchers.map((fetcher) =>
                    fetcher(studyUuid, currentNode.id)
                )
            )
                .then((results) => {
                    const fetchedEquipments = results.flat();
                    dispatch(loadEquipments(equipment.type, fetchedEquipments));
                    setIsFetching(false);
                })
                .catch((err) => {
                    setErrorMessage(err);
                    setIsFetching(false);
                });
        }
    }, [equipment, shouldFetchEquipments, studyUuid, currentNode.id, dispatch]);

    return { equipments, errorMessage, isFetching };
};
