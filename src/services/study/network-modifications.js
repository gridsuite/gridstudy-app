/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MODIFICATION_TYPES } from '../../components/utils/modification-type';
import { toModificationOperation, toModificationUnsetOperation } from '../../components/utils/utils';
import { backendFetch, backendFetchJson, backendFetchText } from '../utils';
import { getStudyUrlWithNodeUuid } from './index';
import { EQUIPMENT_TYPES } from '../../components/utils/equipment-types';
import { BRANCH_SIDE, OPERATING_STATUS_ACTION } from '../../components/network/constants';

function getNetworkModificationUrl(studyUuid, nodeUuid) {
    return getStudyUrlWithNodeUuid(studyUuid, nodeUuid) + '/network-modifications';
}

export function changeNetworkModificationOrder(studyUuid, nodeUuid, itemUuid, beforeUuid) {
    console.info('reorder node ' + nodeUuid + ' of study ' + studyUuid + ' ...');
    const url =
        getNetworkModificationUrl(studyUuid, nodeUuid) +
        `/${itemUuid}?` +
        new URLSearchParams({ beforeUuid: beforeUuid || '' }).toString();
    console.debug(url);
    return backendFetch(url, { method: 'put' });
}

export function stashModifications(studyUuid, nodeUuid, modificationUuids) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('stashed', true);
    urlSearchParams.append('uuids', modificationUuids);
    const modificationDeleteUrl = getNetworkModificationUrl(studyUuid, nodeUuid) + '?' + urlSearchParams.toString();
    console.debug(modificationDeleteUrl);
    return backendFetch(modificationDeleteUrl, {
        method: 'PUT',
    });
}

export function setModificationActivated(studyUuid, nodeUuid, modificationUuid, activated) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('activated', activated);
    urlSearchParams.append('uuids', [modificationUuid]);
    const modificationUpdateActiveUrl =
        getNetworkModificationUrl(studyUuid, nodeUuid) + '?' + urlSearchParams.toString();
    console.debug(modificationUpdateActiveUrl);
    return backendFetch(modificationUpdateActiveUrl, {
        method: 'PUT',
    });
}

export function restoreModifications(studyUuid, nodeUuid, modificationUuids) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('stashed', false);
    urlSearchParams.append('uuids', modificationUuids);
    const RestoreModificationsUrl = getNetworkModificationUrl(studyUuid, nodeUuid) + '?' + urlSearchParams.toString();

    console.debug(RestoreModificationsUrl);
    return backendFetch(RestoreModificationsUrl, {
        method: 'PUT',
    });
}

export function deleteModifications(studyUuid, nodeUuid, modificationUuids) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('uuids', modificationUuids);

    const modificationDeleteUrl = getNetworkModificationUrl(studyUuid, nodeUuid) + '?' + urlSearchParams.toString();

    console.debug(modificationDeleteUrl);
    return backendFetch(modificationDeleteUrl, {
        method: 'DELETE',
    });
}

export function requestNetworkChange(studyUuid, nodeUuid, groovyScript) {
    console.info('Creating groovy script (request network change)');
    const changeUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    console.debug(changeUrl);
    return backendFetchText(changeUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/text',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.GROOVY_SCRIPT.type,
            script: groovyScript,
        }),
    });
}

function changeOperatingStatus(studyUuid, nodeUuid, equipment, action) {
    const changeOperatingStatusUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    console.debug('%s with action: %s', changeOperatingStatusUrl, action);

    let energizedVoltageLevelId;
    switch (action) {
        case OPERATING_STATUS_ACTION.ENERGISE_END_ONE:
            energizedVoltageLevelId = equipment.voltageLevelId1;
            break;
        case OPERATING_STATUS_ACTION.ENERGISE_END_TWO:
            energizedVoltageLevelId = equipment.voltageLevelId2;
            break;
        default:
            energizedVoltageLevelId = undefined;
    }

    return backendFetch(changeOperatingStatusUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/text',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.OPERATING_STATUS_MODIFICATION.type,
            equipmentId: equipment.id,
            energizedVoltageLevelId: energizedVoltageLevelId,
            action: action,
        }),
    });
}

export function lockoutEquipment(studyUuid, nodeUuid, equipment) {
    console.info('locking out equipment ' + equipment.id + ' ...');
    return changeOperatingStatus(studyUuid, nodeUuid, equipment, OPERATING_STATUS_ACTION.LOCKOUT);
}

export function tripEquipment(studyUuid, nodeUuid, equipment) {
    console.info('tripping equipment ' + equipment.id + ' ...');
    return changeOperatingStatus(studyUuid, nodeUuid, equipment, OPERATING_STATUS_ACTION.TRIP);
}

export function energiseEquipmentEnd(studyUuid, nodeUuid, branch, branchSide) {
    console.info('energise branch ' + branch.id + ' on side ' + branchSide + ' ...');
    return changeOperatingStatus(
        studyUuid,
        nodeUuid,
        branch,
        branchSide === BRANCH_SIDE.ONE
            ? OPERATING_STATUS_ACTION.ENERGISE_END_ONE
            : OPERATING_STATUS_ACTION.ENERGISE_END_TWO
    );
}

export function switchOnEquipment(studyUuid, nodeUuid, branch) {
    console.info('switching on branch ' + branch.id + ' ...');
    return changeOperatingStatus(studyUuid, nodeUuid, branch, OPERATING_STATUS_ACTION.SWITCH_ON);
}

export function generationDispatch(
    studyUuid,
    nodeUuid,
    modificationUuid,
    lossCoefficient,
    defaultOutageRate,
    generatorsWithoutOutage,
    generatorsWithFixedActivePower,
    generatorsFrequencyReserve,
    substationsGeneratorsOrdering
) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPES.GENERATION_DISPATCH.type,
        lossCoefficient: lossCoefficient,
        defaultOutageRate: defaultOutageRate,
        generatorsWithoutOutage: generatorsWithoutOutage,
        generatorsWithFixedSupply: generatorsWithFixedActivePower,
        generatorsFrequencyReserve: generatorsFrequencyReserve,
        substationsGeneratorsOrdering: substationsGeneratorsOrdering,
    });

    let generationDispatchUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    if (modificationUuid) {
        console.info('Updating generation dispatch ', body);
        generationDispatchUrl = generationDispatchUrl + '/' + encodeURIComponent(modificationUuid);
    } else {
        console.info('Creating generation dispatch ', body);
    }

    return backendFetchText(generationDispatchUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

export function generatorScaling(studyUuid, nodeUuid, modificationUuid, variationType, variations) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPES.GENERATOR_SCALING.type,
        variationType,
        variations,
    });

    let generatorScalingUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    if (modificationUuid) {
        console.info('generator scaling update', body);
        generatorScalingUrl = generatorScalingUrl + '/' + encodeURIComponent(modificationUuid);
    }

    return backendFetch(generatorScalingUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    }).then((response) => (response.ok ? response.text() : response.text().then((text) => Promise.reject(text))));
}

export function createBattery(
    studyUuid,
    nodeUuid,
    id,
    name,
    voltageLevelId,
    busOrBusbarSectionId,
    connectionName,
    connectionDirection,
    connectionPosition,
    terminalConnected,
    minP,
    maxP,
    isReactiveCapabilityCurveOn,
    minQ,
    maxQ,
    reactiveCapabilityCurve,
    targetP,
    targetQ,
    participate,
    droop,
    isUpdate = false,
    modificationUuid,
    properties
) {
    let createBatteryUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        createBatteryUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating battery creation');
    } else {
        console.info('Creating battery creation');
    }

    return backendFetchText(createBatteryUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.BATTERY_CREATION.type,
            equipmentId: id,
            equipmentName: name,
            voltageLevelId,
            busOrBusbarSectionId,
            connectionName,
            connectionDirection,
            connectionPosition,
            terminalConnected,
            minP,
            maxP,
            reactiveCapabilityCurve: isReactiveCapabilityCurveOn,
            minQ,
            maxQ,
            reactiveCapabilityCurvePoints: reactiveCapabilityCurve,
            targetP,
            targetQ,
            participate,
            droop,
            properties,
        }),
    });
}

export function modifyBattery(
    studyUuid,
    nodeUuid,
    batteryId,
    name,
    minP,
    maxP,
    targetP,
    targetQ,
    voltageLevelId,
    busOrBusbarSectionId,
    connectionName,
    connectionDirection,
    connectionPosition,
    terminalConnected,
    modificationId,
    participate,
    droop,
    isReactiveCapabilityCurveOn,
    maxQ,
    minQ,
    reactiveCapabilityCurve,
    properties
) {
    let modificationUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (modificationId) {
        modificationUrl += '/' + encodeURIComponent(modificationId);
        console.info('Updating battery modification');
    } else {
        console.info('Creating battery modification');
    }

    const batteryModification = {
        type: MODIFICATION_TYPES.BATTERY_MODIFICATION.type,
        equipmentId: batteryId,
        equipmentName: toModificationOperation(name),
        voltageLevelId: toModificationOperation(voltageLevelId),
        busOrBusbarSectionId: toModificationOperation(busOrBusbarSectionId),
        connectionName: toModificationOperation(connectionName),
        connectionDirection: toModificationOperation(connectionDirection),
        connectionPosition: toModificationOperation(connectionPosition),
        terminalConnected: toModificationOperation(terminalConnected),
        minP: toModificationOperation(minP),
        maxP: toModificationOperation(maxP),
        targetP: toModificationOperation(targetP),
        targetQ: toModificationOperation(targetQ),
        reactiveCapabilityCurve: toModificationOperation(isReactiveCapabilityCurveOn),
        participate: toModificationOperation(participate),
        droop: toModificationOperation(droop),
        maxQ: toModificationOperation(maxQ),
        minQ: toModificationOperation(minQ),
        reactiveCapabilityCurvePoints: reactiveCapabilityCurve,
        properties,
    };
    return backendFetchText(modificationUrl, {
        method: modificationId ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(batteryModification),
    });
}

export function createLoad(
    studyUuid,
    nodeUuid,
    id,
    name,
    loadType,
    p0,
    q0,
    voltageLevelId,
    busOrBusbarSectionId,
    isUpdate = false,
    modificationUuid,
    connectionDirection,
    connectionName,
    connectionPosition,
    terminalConnected,
    properties
) {
    let createLoadUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        createLoadUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating load creation');
    } else {
        console.info('Creating load creation');
    }

    return backendFetchText(createLoadUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.LOAD_CREATION.type,
            equipmentId: id,
            equipmentName: name,
            loadType: loadType,
            p0: p0,
            q0: q0,
            voltageLevelId: voltageLevelId,
            busOrBusbarSectionId: busOrBusbarSectionId,
            connectionDirection: connectionDirection,
            connectionName: connectionName,
            connectionPosition: connectionPosition,
            terminalConnected: terminalConnected,
            properties,
        }),
    });
}

export function modifyLoad(
    studyUuid,
    nodeUuid,
    id,
    name,
    loadType,
    p0,
    q0,
    voltageLevelId,
    busOrBusbarSectionId,
    connectionName,
    connectionDirection,
    connectionPosition,
    terminalConnected,
    isUpdate = false,
    modificationUuid,
    properties
) {
    let modifyLoadUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        modifyLoadUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating load modification');
    } else {
        console.info('Creating load modification');
    }

    return backendFetchText(modifyLoadUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.LOAD_MODIFICATION.type,
            equipmentId: id,
            equipmentName: toModificationOperation(name),
            loadType: toModificationOperation(loadType),
            connectionName: toModificationOperation(connectionName),
            connectionDirection: toModificationOperation(connectionDirection),
            connectionPosition: toModificationOperation(connectionPosition),
            terminalConnected: toModificationOperation(terminalConnected),
            p0: toModificationOperation(p0),
            q0: toModificationOperation(q0),
            voltageLevelId: toModificationOperation(voltageLevelId),
            busOrBusbarSectionId: toModificationOperation(busOrBusbarSectionId),
            properties,
        }),
    });
}

export function modifyGenerator(
    studyUuid,
    nodeUuid,
    generatorId,
    name,
    energySource,
    minP,
    maxP,
    ratedS,
    targetP,
    targetQ,
    voltageRegulation,
    targetV,
    voltageLevelId,
    busOrBusbarSectionId,
    connectionName,
    connectionDirection,
    connectionPosition,
    terminalConnected,
    modificationId,
    qPercent,
    plannedActivePowerSetPoint,
    marginalCost,
    plannedOutageRate,
    forcedOutageRate,
    directTransX,
    stepUpTransformerX,
    voltageRegulationType,
    regulatingTerminalId,
    regulatingTerminalType,
    regulatingTerminalVlId,
    isReactiveCapabilityCurveOn,
    participate,
    droop,
    maxQ,
    minQ,
    reactiveCapabilityCurve,
    properties
) {
    let modificationUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (modificationId) {
        modificationUrl += '/' + encodeURIComponent(modificationId);
        console.info('Updating generator modification');
    } else {
        console.info('Creating generator modification');
    }

    const generatorModification = {
        type: MODIFICATION_TYPES.GENERATOR_MODIFICATION.type,
        equipmentId: generatorId,
        equipmentName: toModificationOperation(name),
        energySource: toModificationOperation(energySource),
        minP: toModificationOperation(minP),
        maxP: toModificationOperation(maxP),
        ratedS: toModificationOperation(ratedS),
        targetP: toModificationOperation(targetP),
        targetQ: toModificationUnsetOperation(targetQ),
        voltageRegulationOn: toModificationOperation(voltageRegulation),
        targetV: toModificationUnsetOperation(targetV),
        voltageLevelId: toModificationOperation(voltageLevelId),
        busOrBusbarSectionId: toModificationOperation(busOrBusbarSectionId),
        connectionName: toModificationOperation(connectionName),
        connectionDirection: toModificationOperation(connectionDirection),
        connectionPosition: toModificationOperation(connectionPosition),
        terminalConnected: toModificationOperation(terminalConnected),
        qPercent: toModificationOperation(qPercent),
        plannedActivePowerSetPoint: toModificationOperation(plannedActivePowerSetPoint),
        marginalCost: toModificationOperation(marginalCost),
        plannedOutageRate: toModificationOperation(plannedOutageRate),
        forcedOutageRate: toModificationOperation(forcedOutageRate),
        directTransX: toModificationOperation(directTransX),
        stepUpTransformerX: toModificationOperation(stepUpTransformerX),
        voltageRegulationType: toModificationOperation(voltageRegulationType),
        regulatingTerminalId: toModificationOperation(regulatingTerminalId),
        regulatingTerminalType: toModificationOperation(regulatingTerminalType),
        regulatingTerminalVlId: toModificationOperation(regulatingTerminalVlId),
        reactiveCapabilityCurve: toModificationOperation(isReactiveCapabilityCurveOn),
        participate: toModificationOperation(participate),
        droop: toModificationOperation(droop),
        maxQ: toModificationOperation(maxQ),
        minQ: toModificationOperation(minQ),
        reactiveCapabilityCurvePoints: reactiveCapabilityCurve,
        properties,
    };
    return backendFetchText(modificationUrl, {
        method: modificationId ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatorModification),
    });
}

export function createGenerator(
    studyUuid,
    nodeUuid,
    id,
    name,
    energySource,
    minP,
    maxP,
    ratedS,
    targetP,
    targetQ,
    voltageRegulationOn,
    targetV,
    qPercent,
    voltageLevelId,
    busOrBusbarSectionId,
    isUpdate = false,
    modificationUuid,
    plannedActivePowerSetPoint,
    marginalCost,
    plannedOutageRate,
    forcedOutageRate,
    directTransX,
    stepUpTransformerX,
    regulatingTerminalId,
    regulatingTerminalType,
    regulatingTerminalVlId,
    isReactiveCapabilityCurveOn,
    participate,
    droop,
    maxQ,
    minQ,
    reactiveCapabilityCurve,
    connectionDirection,
    connectionName,
    connectionPosition,
    terminalConnected,
    properties
) {
    let createGeneratorUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        createGeneratorUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating generator creation');
    } else {
        console.info('Creating generator creation');
    }

    return backendFetchText(createGeneratorUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.GENERATOR_CREATION.type,
            equipmentId: id,
            equipmentName: name,
            energySource: energySource,
            minP: minP,
            maxP: maxP,
            ratedS: ratedS,
            targetP: targetP,
            targetQ: targetQ,
            voltageRegulationOn: voltageRegulationOn,
            targetV: targetV,
            qPercent: qPercent,
            voltageLevelId: voltageLevelId,
            busOrBusbarSectionId: busOrBusbarSectionId,
            plannedActivePowerSetPoint: plannedActivePowerSetPoint,
            marginalCost: marginalCost,
            plannedOutageRate: plannedOutageRate,
            forcedOutageRate: forcedOutageRate,
            directTransX: directTransX,
            stepUpTransformerX: stepUpTransformerX,
            regulatingTerminalId: regulatingTerminalId,
            regulatingTerminalType: regulatingTerminalType,
            regulatingTerminalVlId: regulatingTerminalVlId,
            reactiveCapabilityCurve: isReactiveCapabilityCurveOn,
            participate: participate,
            droop: droop,
            maxQ: maxQ,
            minQ: minQ,
            connectionDirection: connectionDirection,
            connectionName: connectionName,
            reactiveCapabilityCurvePoints: reactiveCapabilityCurve,
            connectionPosition: connectionPosition,
            terminalConnected: terminalConnected,
            properties,
        }),
    });
}

export function createShuntCompensator(
    studyUuid,
    nodeUuid,
    shuntCompensatorId,
    shuntCompensatorName,
    maxSusceptance,
    maxQAtNominalV,
    shuntCompensatorType,
    sectionCount,
    maximumSectionCount,
    connectivity,
    isUpdate,
    modificationUuid,
    connectionDirection,
    connectionName,
    connectionPosition,
    terminalConnected,
    properties
) {
    let createShuntUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        createShuntUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating shunt compensator creation');
    } else {
        console.info('Creating shunt compensator creation');
    }

    return backendFetchText(createShuntUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.SHUNT_COMPENSATOR_CREATION.type,
            equipmentId: shuntCompensatorId,
            equipmentName: shuntCompensatorName,
            maxSusceptance: maxSusceptance,
            maxQAtNominalV: maxQAtNominalV,
            shuntCompensatorType: shuntCompensatorType,
            sectionCount: sectionCount,
            maximumSectionCount: maximumSectionCount,
            voltageLevelId: connectivity.voltageLevel.id,
            busOrBusbarSectionId: connectivity.busOrBusbarSection.id,
            connectionDirection: connectionDirection,
            connectionName: connectionName,
            connectionPosition: connectionPosition,
            terminalConnected: terminalConnected,
            properties,
        }),
    });
}

export function modifyShuntCompensator(
    studyUuid,
    nodeUuid,
    shuntCompensatorId,
    shuntCompensatorName,
    maximumSectionCount,
    sectionCount,
    maxSusceptance,
    maxQAtNominalV,
    shuntCompensatorType,
    voltageLevelId,
    busOrBusbarSectionId,
    connectionName,
    connectionDirection,
    connectionPosition,
    terminalConnected,
    isUpdate,
    modificationUuid,
    properties
) {
    let modificationUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        modificationUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating shunt compensator modification');
    } else {
        console.info('Creating shunt compensator modification');
    }

    return backendFetchText(modificationUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.SHUNT_COMPENSATOR_MODIFICATION.type,
            equipmentId: shuntCompensatorId,
            equipmentName: toModificationOperation(shuntCompensatorName),
            maximumSectionCount: toModificationOperation(maximumSectionCount),
            sectionCount: toModificationOperation(sectionCount),
            maxSusceptance: toModificationOperation(maxSusceptance),
            maxQAtNominalV: toModificationOperation(maxQAtNominalV),
            shuntCompensatorType: toModificationOperation(shuntCompensatorType),
            voltageLevelId: toModificationOperation(voltageLevelId),
            busOrBusbarSectionId: toModificationOperation(busOrBusbarSectionId),
            connectionDirection: toModificationOperation(connectionDirection),
            connectionName: toModificationOperation(connectionName),
            connectionPosition: toModificationOperation(connectionPosition),
            terminalConnected: toModificationOperation(terminalConnected),
            properties,
        }),
    });
}

export function createLine(
    studyUuid,
    nodeUuid,
    lineId,
    lineName,
    r,
    x,
    g1,
    b1,
    g2,
    b2,
    voltageLevelId1,
    busOrBusbarSectionId1,
    voltageLevelId2,
    busOrBusbarSectionId2,
    permanentCurrentLimit1,
    permanentCurrentLimit2,
    temporaryCurrentLimits1,
    temporaryCurrentLimits2,
    isUpdate,
    modificationUuid,
    connectionName1,
    connectionDirection1,
    connectionName2,
    connectionDirection2,
    connectionPosition1,
    connectionPosition2,
    connected1,
    connected2,
    properties
) {
    let createLineUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        createLineUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating line creation');
    } else {
        console.info('Creating line creation');
    }

    return backendFetchText(createLineUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.LINE_CREATION.type,
            equipmentId: lineId,
            equipmentName: lineName,
            r: r,
            x: x,
            g1: g1,
            b1: b1,
            g2: g2,
            b2: b2,
            voltageLevelId1: voltageLevelId1,
            busOrBusbarSectionId1: busOrBusbarSectionId1,
            voltageLevelId2: voltageLevelId2,
            busOrBusbarSectionId2: busOrBusbarSectionId2,
            currentLimits1: {
                permanentLimit: permanentCurrentLimit1,
                temporaryLimits: temporaryCurrentLimits1,
            },
            currentLimits2: {
                permanentLimit: permanentCurrentLimit2,
                temporaryLimits: temporaryCurrentLimits2,
            },
            connectionName1: connectionName1,
            connectionDirection1: connectionDirection1,
            connectionName2: connectionName2,
            connectionDirection2: connectionDirection2,
            connectionPosition1: connectionPosition1,
            connectionPosition2: connectionPosition2,
            connected1: connected1,
            connected2: connected2,
            properties,
        }),
    });
}

export function modifyLine(
    studyUuid,
    nodeUuid,
    lineId,
    lineName,
    r,
    x,
    g1,
    b1,
    g2,
    b2,
    currentLimit1,
    currentLimit2,
    voltageLevelId1,
    busOrBusbarSectionId1,
    voltageLevelId2,
    busOrBusbarSectionId2,
    connectionName1,
    connectionName2,
    connectionDirection1,
    connectionDirection2,
    connectionPosition1,
    connectionPosition2,
    connected1,
    connected2,
    isUpdate,
    modificationUuid,
    properties
) {
    let modifyLineUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        modifyLineUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating line modification');
    } else {
        console.info('Creating line modification');
    }

    return backendFetchText(modifyLineUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.LINE_MODIFICATION.type,
            equipmentId: lineId,
            equipmentName: toModificationOperation(lineName),
            r: toModificationOperation(r),
            x: toModificationOperation(x),
            g1: toModificationOperation(g1),
            b1: toModificationOperation(b1),
            g2: toModificationOperation(g2),
            b2: toModificationOperation(b2),
            currentLimits1: currentLimit1,
            currentLimits2: currentLimit2,
            voltageLevelId1: toModificationOperation(voltageLevelId1),
            busOrBusbarSectionId1: toModificationOperation(busOrBusbarSectionId1),
            voltageLevelId2: toModificationOperation(voltageLevelId2),
            busOrBusbarSectionId2: toModificationOperation(busOrBusbarSectionId2),
            connectionName1: toModificationOperation(connectionName1),
            connectionName2: toModificationOperation(connectionName2),
            connectionDirection1: toModificationOperation(connectionDirection1),
            connectionDirection2: toModificationOperation(connectionDirection2),
            connectionPosition1: toModificationOperation(connectionPosition1),
            connectionPosition2: toModificationOperation(connectionPosition2),
            terminal1Connected: toModificationOperation(connected1),
            terminal2Connected: toModificationOperation(connected2),
            properties,
        }),
    });
}

export function createTwoWindingsTransformer(
    studyUuid,
    nodeUuid,
    twoWindingsTransformerId,
    twoWindingsTransformerName,
    r,
    x,
    g,
    b,
    ratedS,
    ratedU1,
    ratedU2,
    currentLimit1,
    currentLimit2,
    voltageLevelId1,
    busOrBusbarSectionId1,
    voltageLevelId2,
    busOrBusbarSectionId2,
    ratioTapChanger,
    phaseTapChanger,
    isUpdate,
    modificationUuid,
    connectionName1,
    connectionDirection1,
    connectionName2,
    connectionDirection2,
    connectionPosition1,
    connectionPosition2,
    connected1,
    connected2,
    properties
) {
    let createTwoWindingsTransformerUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        createTwoWindingsTransformerUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating two windings transformer creation');
    } else {
        console.info('Creating two windings transformer creation');
    }

    return backendFetchText(createTwoWindingsTransformerUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.TWO_WINDINGS_TRANSFORMER_CREATION.type,
            equipmentId: twoWindingsTransformerId,
            equipmentName: twoWindingsTransformerName,
            r: r,
            x: x,
            g: g,
            b: b,
            ratedS: ratedS,
            ratedU1: ratedU1,
            ratedU2: ratedU2,
            currentLimits1: currentLimit1,
            currentLimits2: currentLimit2,
            voltageLevelId1: voltageLevelId1,
            busOrBusbarSectionId1: busOrBusbarSectionId1,
            voltageLevelId2: voltageLevelId2,
            busOrBusbarSectionId2: busOrBusbarSectionId2,
            ratioTapChanger: ratioTapChanger,
            phaseTapChanger: phaseTapChanger,
            connectionName1: connectionName1,
            connectionDirection1: connectionDirection1,
            connectionName2: connectionName2,
            connectionDirection2: connectionDirection2,
            connectionPosition1: connectionPosition1,
            connectionPosition2: connectionPosition2,
            connected1: connected1,
            connected2: connected2,
            properties,
        }),
    });
}

export function modifyTwoWindingsTransformer(
    studyUuid,
    nodeUuid,
    twoWindingsTransformerId,
    twoWindingsTransformerName,
    r,
    x,
    g,
    b,
    ratedS,
    ratedU1,
    ratedU2,
    currentLimit1,
    currentLimit2,
    ratioTapChanger,
    phaseTapChanger,
    voltageLevelId1,
    busOrBusbarSectionId1,
    voltageLevelId2,
    busOrBusbarSectionId2,
    connectionName1,
    connectionName2,
    connectionDirection1,
    connectionDirection2,
    connectionPosition1,
    connectionPosition2,
    connected1,
    connected2,
    isUpdate,
    modificationUuid,
    properties
) {
    let modifyTwoWindingsTransformerUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        modifyTwoWindingsTransformerUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating two windings transformer modification');
    } else {
        console.info('Creating two windings transformer modification');
    }

    return backendFetchText(modifyTwoWindingsTransformerUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.TWO_WINDINGS_TRANSFORMER_MODIFICATION.type,
            equipmentId: twoWindingsTransformerId,
            equipmentName: twoWindingsTransformerName,
            r: r,
            x: x,
            g: g,
            b: b,
            ratedS: ratedS,
            ratedU1: ratedU1,
            ratedU2: ratedU2,
            currentLimits1: currentLimit1,
            currentLimits2: currentLimit2,
            ratioTapChanger: ratioTapChanger,
            phaseTapChanger: phaseTapChanger,
            voltageLevelId1: toModificationOperation(voltageLevelId1),
            busOrBusbarSectionId1: toModificationOperation(busOrBusbarSectionId1),
            voltageLevelId2: toModificationOperation(voltageLevelId2),
            busOrBusbarSectionId2: toModificationOperation(busOrBusbarSectionId2),
            connectionName1: toModificationOperation(connectionName1),
            connectionName2: toModificationOperation(connectionName2),
            connectionDirection1: toModificationOperation(connectionDirection1),
            connectionDirection2: toModificationOperation(connectionDirection2),
            connectionPosition1: toModificationOperation(connectionPosition1),
            connectionPosition2: toModificationOperation(connectionPosition2),
            terminal1Connected: toModificationOperation(connected1),
            terminal2Connected: toModificationOperation(connected2),
            properties,
        }),
    });
}

export function createTabulareModification(
    studyUuid,
    nodeUuid,
    modificationType,
    modifications,
    isUpdate,
    modificationUuid
) {
    let createTabulareModificationUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        createTabulareModificationUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating tabular modification');
    } else {
        console.info('Creating tabular modification');
    }

    return backendFetchText(createTabulareModificationUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.TABULAR_MODIFICATION.type,
            modificationType: modificationType,
            modifications: modifications,
        }),
    });
}

export function createSubstation(
    studyUuid,
    nodeUuid,
    substationId,
    substationName,
    country,
    isUpdate = false,
    modificationUuid,
    properties
) {
    let url = getNetworkModificationUrl(studyUuid, nodeUuid);

    const body = JSON.stringify({
        type: MODIFICATION_TYPES.SUBSTATION_CREATION.type,
        equipmentId: substationId,
        equipmentName: substationName,
        country: country === '' ? null : country,
        properties,
    });

    if (isUpdate) {
        url += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating substation creation', { url, body });
    } else {
        console.info('Creating substation creation', { url, body });
    }

    return backendFetchText(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: body,
    });
}

/**
 * Formats the properties of an array of properties so it can be consumed by the backend.
 * @returns {Array<{name: string, value: string, previousValue: string, added: boolean, deletionMark: boolean} | null>} - The modified properties.
 */
export function formatPropertiesForBackend(previousProperties, newProperties) {
    if (JSON.stringify(previousProperties) === JSON.stringify(newProperties)) {
        // return null so the backend does not update the properties
        return null;
    }

    //take each attribute of previousProperties and convert it to and array of { 'name': aa, 'value': yy }
    const previousPropertiesArray = Object.entries(previousProperties).map(([name, value]) => ({ name, value }));
    const newPropertiesArray = Object.entries(newProperties).map(([name, value]) => ({ name, value }));

    const propertiesModifications = [];
    previousPropertiesArray.forEach((previousPropertiePair) => {
        const updatedProperty = newPropertiesArray.find((updatedObj) => updatedObj.name === previousPropertiePair.name);

        if (!updatedProperty) {
            // The property has been deleted (does not exist in the new properties array)
            propertiesModifications.push({
                ...previousPropertiePair,
                previousValue: previousPropertiePair.value,
                value: null,
                deletionMark: true,
            });
        } else if (updatedProperty.value !== previousPropertiePair.value) {
            // the property exist in both the previous and the new properties array but has been modified
            propertiesModifications.push({
                ...updatedProperty,
                added: false,
                deletionMark: false,
                previousValue: previousPropertiePair.value,
            });
        }
    });

    newPropertiesArray.forEach((newPropertie) => {
        // The property has been added
        const previousPropertie = previousPropertiesArray.find((oldObj) => oldObj.name === newPropertie.name);
        //the propertie is new ( does not exist in the previous properties array)
        if (!previousPropertie) {
            propertiesModifications.push({
                ...newPropertie,
                added: true,
                deletionMark: false,
            });
        }
    });
    return propertiesModifications;
}

export function modifySubstation(
    studyUuid,
    nodeUuid,
    id,
    name,
    country,
    isUpdate = false,
    modificationUuid,
    properties
) {
    let modifyUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        modifyUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating substation modification');
    } else {
        console.info('Creating substation modification');
    }

    return backendFetchText(modifyUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.SUBSTATION_MODIFICATION.type,
            equipmentId: id,
            equipmentName: toModificationOperation(name),
            country: toModificationOperation(country),
            properties: properties,
        }),
    });
}

export function createVoltageLevel({
    studyUuid,
    nodeUuid,
    voltageLevelId,
    voltageLevelName,
    substationId,
    nominalV,
    lowVoltageLimit,
    highVoltageLimit,
    ipMin,
    ipMax,
    busbarCount,
    sectionCount,
    switchKinds,
    couplingDevices,
    isUpdate,
    modificationUuid,
    properties,
}) {
    let createVoltageLevelUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        createVoltageLevelUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating voltage level creation');
    } else {
        console.info('Creating voltage level creation');
    }

    const body = JSON.stringify({
        type: MODIFICATION_TYPES.VOLTAGE_LEVEL_CREATION.type,
        equipmentId: voltageLevelId,
        equipmentName: voltageLevelName,
        substationId: substationId,
        nominalV: nominalV,
        lowVoltageLimit: lowVoltageLimit,
        highVoltageLimit: highVoltageLimit,
        ipMin: ipMin,
        ipMax: ipMax,
        busbarCount: busbarCount,
        sectionCount: sectionCount,
        switchKinds: switchKinds,
        couplingDevices: couplingDevices,
        properties,
    });

    return backendFetchText(createVoltageLevelUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: body,
    });
}

export function modifyVoltageLevel(
    studyUuid,
    nodeUuid,
    voltageLevelId,
    voltageLevelName,
    nominalV,
    lowVoltageLimit,
    highVoltageLimit,
    lowShortCircuitCurrentLimit,
    highShortCircuitCurrentLimit,
    isUpdate,
    modificationUuid,
    properties
) {
    let modificationUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        modificationUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating voltage level modification');
    } else {
        console.info('Creating voltage level modification');
    }

    return backendFetchText(modificationUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.VOLTAGE_LEVEL_MODIFICATION.type,
            equipmentId: voltageLevelId,
            equipmentName: toModificationOperation(voltageLevelName),
            nominalV: toModificationOperation(nominalV),
            lowVoltageLimit: toModificationOperation(lowVoltageLimit),
            highVoltageLimit: toModificationOperation(highVoltageLimit),
            ipMin: toModificationOperation(lowShortCircuitCurrentLimit),
            ipMax: toModificationOperation(highShortCircuitCurrentLimit),
            properties,
        }),
    });
}

export function divideLine(
    studyUuid,
    nodeUuid,
    modificationUuid,
    lineToSplitId,
    percent,
    mayNewVoltageLevelInfos,
    existingVoltageLevelId,
    bbsOrBusId,
    newLine1Id,
    newLine1Name,
    newLine2Id,
    newLine2Name
) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPES.LINE_SPLIT_WITH_VOLTAGE_LEVEL.type,
        lineToSplitId,
        percent,
        mayNewVoltageLevelInfos,
        existingVoltageLevelId,
        bbsOrBusId,
        newLine1Id,
        newLine1Name,
        newLine2Id,
        newLine2Name,
    });

    let lineSplitUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (modificationUuid) {
        lineSplitUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating line split with voltage level');
    } else {
        console.info('Creating line split with voltage level');
    }

    return backendFetchText(lineSplitUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

export function attachLine(
    studyUuid,
    nodeUuid,
    modificationUuid,
    lineToAttachToId,
    percent,
    attachmentPointId,
    attachmentPointName,
    mayNewVoltageLevelInfos,
    existingVoltageLevelId,
    bbsOrBusId,
    attachmentLine,
    newLine1Id,
    newLine1Name,
    newLine2Id,
    newLine2Name
) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPES.LINE_ATTACH_TO_VOLTAGE_LEVEL.type,
        lineToAttachToId,
        percent,
        attachmentPointId,
        attachmentPointName,
        mayNewVoltageLevelInfos,
        existingVoltageLevelId,
        bbsOrBusId,
        attachmentLine,
        newLine1Id,
        newLine1Name,
        newLine2Id,
        newLine2Name,
    });

    let lineAttachUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (modificationUuid) {
        lineAttachUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating line attach to voltage level');
    } else {
        console.info('Creating line attach to voltage level');
    }

    return backendFetchText(lineAttachUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

export function loadScaling(studyUuid, nodeUuid, modificationUuid, variationType, variations) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPES.LOAD_SCALING.type,
        variationType,
        variations,
    });

    let loadScalingUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    if (modificationUuid) {
        console.info('load scaling update', body);
        loadScalingUrl = loadScalingUrl + '/' + encodeURIComponent(modificationUuid);
    }

    return backendFetch(loadScalingUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    }).then((response) => (response.ok ? response.text() : response.text().then((text) => Promise.reject(text))));
}

export function linesAttachToSplitLines(
    studyUuid,
    nodeUuid,
    modificationUuid,
    lineToAttachTo1Id,
    lineToAttachTo2Id,
    attachedLineId,
    voltageLevelId,
    bbsBusId,
    replacingLine1Id,
    replacingLine1Name,
    replacingLine2Id,
    replacingLine2Name
) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPES.LINES_ATTACH_TO_SPLIT_LINES.type,
        lineToAttachTo1Id,
        lineToAttachTo2Id,
        attachedLineId,
        voltageLevelId,
        bbsBusId,
        replacingLine1Id,
        replacingLine1Name,
        replacingLine2Id,
        replacingLine2Name,
    });

    let lineAttachUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (modificationUuid) {
        lineAttachUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating attaching lines to splitting lines');
    } else {
        console.info('Creating attaching lines to splitting lines');
    }

    return backendFetchText(lineAttachUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

export function deleteVoltageLevelOnLine(
    studyUuid,
    nodeUuid,
    modificationUuid,
    lineToAttachTo1Id,
    lineToAttachTo2Id,
    replacingLine1Id,
    replacingLine1Name
) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPES.DELETE_VOLTAGE_LEVEL_ON_LINE.type,
        lineToAttachTo1Id,
        lineToAttachTo2Id,
        replacingLine1Id,
        replacingLine1Name,
    });

    let deleteVoltageLevelOnLineUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    if (modificationUuid) {
        console.info('Updating delete voltage level on line', body);
        deleteVoltageLevelOnLineUrl += '/' + encodeURIComponent(modificationUuid);
    } else {
        console.info('Creating delete voltage level on line', body);
    }

    return backendFetchText(deleteVoltageLevelOnLineUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

export function deleteAttachingLine(
    studyUuid,
    nodeUuid,
    modificationUuid,
    lineToAttachTo1Id,
    lineToAttachTo2Id,
    attachedLineId,
    replacingLine1Id,
    replacingLine1Name
) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPES.DELETE_ATTACHING_LINE.type,
        lineToAttachTo1Id,
        lineToAttachTo2Id,
        attachedLineId,
        replacingLine1Id,
        replacingLine1Name,
    });

    let deleteVoltageLevelOnLineUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    if (modificationUuid) {
        console.info('Updating delete attaching line', body);
        deleteVoltageLevelOnLineUrl += '/' + encodeURIComponent(modificationUuid);
    } else {
        console.info('Creating delete attaching line', body);
    }

    return backendFetchText(deleteVoltageLevelOnLineUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

export function deleteEquipment(studyUuid, nodeUuid, equipmentType, equipmentId, modificationUuid, equipmentInfos) {
    let deleteEquipmentUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (modificationUuid) {
        deleteEquipmentUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating equipment deletion');
    } else {
        console.info('Creating equipment deletion');
    }

    return backendFetch(deleteEquipmentUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.EQUIPMENT_DELETION.type,
            equipmentId: equipmentId,
            equipmentType: equipmentType,
            equipmentInfos: equipmentInfos,
        }),
    });
}

export function deleteEquipmentByFilter(studyUuid, nodeUuid, equipmentType, filters, modificationUuid) {
    let deleteEquipmentUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (modificationUuid) {
        deleteEquipmentUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating by filter deletion');
    } else {
        console.info('Creating by filter deletion');
    }

    return backendFetch(deleteEquipmentUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.BY_FILTER_DELETION.type,
            filters: filters,
            equipmentType: equipmentType,
        }),
    });
}

export function fetchNetworkModifications(studyUuid, nodeUuid, onlyStashed) {
    console.info('Fetching network modifications (metadata) for nodeUuid : ', nodeUuid);
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('onlyStashed', onlyStashed);
    urlSearchParams.append('onlyMetadata', true);
    const modificationsGetUrl = getNetworkModificationUrl(studyUuid, nodeUuid) + '?' + urlSearchParams.toString();
    console.debug(modificationsGetUrl);
    return backendFetchJson(modificationsGetUrl);
}

export function updateSwitchState(studyUuid, nodeUuid, switchId, open) {
    console.info('updating switch ' + switchId + ' ...');
    const updateSwitchUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    console.debug(updateSwitchUrl);
    return backendFetch(updateSwitchUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/text',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.EQUIPMENT_ATTRIBUTE_MODIFICATION.type,
            equipmentType: EQUIPMENT_TYPES.SWITCH,
            equipmentId: switchId,
            equipmentAttributeName: 'open',
            equipmentAttributeValue: open,
        }),
    });
}

export function createVsc(
    studyUuid,
    nodeUuid,
    id,
    name,
    nominalV,
    r,
    maxP,
    operatorActivePowerLimitSide1,
    operatorActivePowerLimitSide2,
    convertersMode,
    activePowerSetpoint,
    angleDroopActivePowerControl,
    p0,
    droop,
    converterStation1,
    converterStation2,
    properties,
    isUpdate,
    modificationUuid
) {
    let createVscUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        createVscUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating vsc creation');
    } else {
        console.info('Creating vsc creation');
    }

    const body = JSON.stringify({
        type: MODIFICATION_TYPES.VSC_CREATION.type,
        equipmentId: id,
        equipmentName: name,
        nominalV: nominalV,
        r: r,
        maxP: maxP,
        operatorActivePowerLimitFromSide1ToSide2: operatorActivePowerLimitSide1,
        operatorActivePowerLimitFromSide2ToSide1: operatorActivePowerLimitSide2,
        convertersMode: convertersMode,
        activePowerSetpoint: activePowerSetpoint,
        angleDroopActivePowerControl: angleDroopActivePowerControl,
        p0: p0,
        droop: droop,
        converterStation1: converterStation1,
        converterStation2: converterStation2,
        properties: properties,
    });

    return backendFetchText(createVscUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

export function modifyVsc(
    studyUuid,
    nodeUuid,
    id,
    name,
    nominalV,
    r,
    maxP,
    operatorActivePowerLimitSide1,
    operatorActivePowerLimitSide2,
    convertersMode,
    activePowerSetpoint,
    angleDroopActivePowerControl,
    p0,
    droop,
    converterStation1,
    converterStation2,
    properties,
    isUpdate,
    modificationUuid
) {
    let modificationUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (modificationUuid) {
        modificationUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating Vsc modification');
    } else {
        console.info('Creating Vsc modification');
    }

    const vscModification = {
        type: MODIFICATION_TYPES.VSC_MODIFICATION.type,
        equipmentId: id,
        equipmentName: toModificationOperation(name),
        nominalV: toModificationOperation(nominalV),
        r: toModificationOperation(r),
        maxP: toModificationOperation(maxP),
        operatorActivePowerLimitFromSide1ToSide2: toModificationOperation(operatorActivePowerLimitSide1),
        operatorActivePowerLimitFromSide2ToSide1: toModificationOperation(operatorActivePowerLimitSide2),
        convertersMode: toModificationOperation(convertersMode),
        activePowerSetpoint: toModificationOperation(activePowerSetpoint),
        angleDroopActivePowerControl: toModificationOperation(angleDroopActivePowerControl),
        p0: toModificationOperation(p0),
        droop: toModificationOperation(droop),
        converterStation1: converterStation1,
        converterStation2: converterStation2,
        properties: properties,
    }; //FIXME add missing informations

    return backendFetchText(modificationUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(vscModification),
    });
}
export function modifyByFormula(studyUuid, nodeUuid, equipmentType, formulas, isUpdate, modificationUuid) {
    let modificationUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        modificationUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating by formula modification');
    } else {
        console.info('Creating by formula modification');
    }

    const body = JSON.stringify({
        type: MODIFICATION_TYPES.BY_FORMULA_MODIFICATION.type,
        identifiableType: equipmentType,
        formulaInfosList: formulas,
    });

    return backendFetchText(modificationUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: body,
    });
}

export function modifyByAssignment(studyUuid, nodeUuid, equipmentType, assignmentsList, isUpdate, modificationUuid) {
    let modificationUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        modificationUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating modification by assignment');
    } else {
        console.info('Creating modification by assignment');
    }

    const body = JSON.stringify({
        type: MODIFICATION_TYPES.MODIFICATION_BY_ASSIGNMENT.type,
        equipmentType: equipmentType,
        assignmentInfosList: assignmentsList,
    });

    return backendFetchText(modificationUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: body,
    });
}

export function createTabularCreation(studyUuid, nodeUuid, creationType, creations, isUpdate, modificationUuid) {
    let createTabularCreationUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        createTabularCreationUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating tabular creation');
    } else {
        console.info('Creating tabular creation');
    }

    return backendFetchText(createTabularCreationUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.TABULAR_CREATION.type,
            creationType: creationType,
            creations: creations,
        }),
    });
}
