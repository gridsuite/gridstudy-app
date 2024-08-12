import { useSpreadsheetEquipments } from '../network/use-spreadsheet-equipments';
import { useEffect, useState } from 'react';

export const useSpreadsheetEquipmentsWrapper = (
    equipmentDefinition: any,
    formatFetchedEquipmentsHandler: any,
    selectedCompareNodeId: any
) => {
    const { equipments } = useSpreadsheetEquipments(
        equipmentDefinition,
        formatFetchedEquipmentsHandler,
        selectedCompareNodeId
    );

    const [equipmentsToCompare, setEquipmentsToCompare] = useState();

    useEffect(() => {
        setEquipmentsToCompare(equipments);
    }, [equipments]);

    return { equipmentsToCompare };
};
