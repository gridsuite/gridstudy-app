export const NETWORK_TYPE = {
    MAP: 'MAP',
    ALL: 'ALL',
};

function checkAndGetValues(equipments) {
    return equipments ? equipments : [];
}

export function updateNetworkEquipments(network, equipments, networkType) {
    console.info('network partial update');
    network.updateSubstations(checkAndGetValues(equipments[0].substations));
    network.updateLines(checkAndGetValues(equipments[0].lines));

    if (networkType === NETWORK_TYPE.ALL) {
        network.updateTwoWindingsTransformers(
            checkAndGetValues(equipments[0].twoWindingsTransformers)
        );
        network.updateThreeWindingsTransformers(
            checkAndGetValues(equipments[0].threeWindingsTransformers)
        );
        network.updateGenerators(checkAndGetValues(equipments[0].generators));
        network.updateLoads(checkAndGetValues(equipments[0].loads));
        network.updateBatteries(checkAndGetValues(equipments[0].batteries));
        network.updateDanglingLines(
            checkAndGetValues(equipments[0].danglingLines)
        );
        network.updateLccConverterStations(
            checkAndGetValues(equipments[0].lccConverterStations)
        );
        network.updateVscConverterStations(
            checkAndGetValues(equipments[0].vscConverterStations)
        );
        network.updateHvdcLines(checkAndGetValues(equipments[0].hvdcLines));
        network.updateShuntCompensators(
            checkAndGetValues(equipments[0].shuntCompensators)
        );
        network.updateStaticVarCompensators(
            checkAndGetValues(equipments[0].staticVarCompensators)
        );
    }
    return network;
}
