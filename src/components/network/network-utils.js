export function updateEquipments(
    currentEquipments,
    newEquipements,
    equipmentType
) {
    // replace current modified equipments
    currentEquipments.forEach((equipment1, index) => {
        const found = newEquipements.filter(
            (equipment2) => equipment2.id === equipment1.id
        );
        currentEquipments[index] = found.length > 0 ? found[0] : equipment1;
    });

    // add newly created equipments
    let equipmentsAdded = false;
    if (this.isResourceFetched(equipmentType)) {
        newEquipements.forEach((equipment1) => {
            const found = currentEquipments.find(
                (equipment2) => equipment2.id === equipment1.id
            );
            if (found === undefined) {
                currentEquipments.push(equipment1);
                equipmentsAdded = true;
            }
        });
    }

    return equipmentsAdded === true
        ? [...currentEquipments]
        : currentEquipments;
}
