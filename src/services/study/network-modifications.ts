/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    backendFetch,
    backendFetchJson,
    backendFetchText,
    EquipmentInfos,
    EquipmentType,
    MODIFICATION_TYPES,
    ModificationType,
    NetworkModificationMetadata,
} from '@gridsuite/commons-ui';
import { toModificationOperation } from '../../components/utils/utils';
import { getStudyUrlWithNodeUuid, getStudyUrlWithNodeUuidAndRootNetworkUuid, safeEncodeURIComponent } from './index';
import { EQUIPMENT_TYPES } from '../../components/utils/equipment-types';
import { BRANCH_SIDE, OPERATING_STATUS_ACTION } from '../../components/network/constants';
import type { UUID } from 'node:crypto';
import {
    Assignment,
    AttachLineInfo,
    BalancesAdjustmentInfos,
    BatteryCreationInfos,
    BatteryModificationInfos,
    CreateCouplingDeviceInfos,
    CreateVoltageLevelSectionInfos,
    CreateVoltageLevelTopologyInfos,
    DeleteAttachingLineInfo,
    DivideLineInfo,
    GenerationDispatchModificationInfos,
    GeneratorCreationInfos,
    GeneratorModificationInfos,
    LCCCreationInfo,
    LccModificationInfos,
    LineCreationInfo,
    LineModificationInfos,
    LinesAttachToSplitLinesInfo,
    LoadCreationInfo,
    LoadModificationInfo,
    MoveVoltageLevelFeederBaysInfos,
    NetworkModificationRequestInfos,
    ShuntCompensatorCreationInfos,
    ShuntCompensatorModificationInfo,
    StaticVarCompensatorCreationInfo,
    SubstationCreationInfo,
    SubstationModificationInfo,
    TopologyVoltageLevelModificationInfos,
    TwoWindingsTransformerCreationInfo,
    TwoWindingsTransformerModificationInfo,
    Variations,
    VariationType,
    VoltageLevelCreationInfo,
    VoltageLeveModificationInfo,
    VSCCreationInfo,
    VSCModificationInfo,
} from '../network-modification-types';
import { Filter } from '../../components/dialogs/network-modifications/by-filter/commons/by-filter.type';
import { ExcludedNetworkModifications } from 'components/graph/menus/network-modifications/network-modification-menu.type';
import { TabularProperty } from '../../components/dialogs/network-modifications/tabular/properties/property-utils';
import { Modification } from '../../components/dialogs/network-modifications/tabular/tabular-common';
import {
    ENABLE_OLG_MODIFICATION,
    OLGS_MODIFICATION_TYPE,
    OPERATIONAL_LIMITS_GROUPS_MODIFICATION_TYPE,
} from '../../components/utils/field-constants';

function getNetworkModificationUrl(studyUuid: string | null | undefined, nodeUuid: string | undefined) {
    return getStudyUrlWithNodeUuid(studyUuid, nodeUuid) + '/network-modifications';
}

export function changeNetworkModificationOrder(
    studyUuid: UUID | null,
    nodeUuid: UUID | undefined,
    itemUuid: UUID,
    beforeUuid: UUID
) {
    console.info('reorder node ' + nodeUuid + ' of study ' + studyUuid + ' ...');
    const url =
        getStudyUrlWithNodeUuid(studyUuid, nodeUuid) +
        '/network-modification/' +
        itemUuid +
        '?' +
        new URLSearchParams({ beforeUuid: beforeUuid || '' }).toString();
    console.debug(url);
    return backendFetch(url, { method: 'put' });
}

export function stashModifications(studyUuid: UUID | null, nodeUuid: UUID | undefined, modificationUuids: UUID[]) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('stashed', String(true));
    urlSearchParams.append('uuids', String(modificationUuids));
    const modificationDeleteUrl = getNetworkModificationUrl(studyUuid, nodeUuid) + '?' + urlSearchParams.toString();
    console.debug(modificationDeleteUrl);
    return backendFetch(modificationDeleteUrl, {
        method: 'PUT',
    });
}

export function setModificationMetadata(
    studyUuid: UUID | null,
    nodeUuid: UUID | undefined,
    modificationUuid: UUID,
    metadata: Partial<NetworkModificationMetadata>
): Promise<Response> {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('uuids', String([modificationUuid]));
    const modificationUpdateUrl = getNetworkModificationUrl(studyUuid, nodeUuid) + '?' + urlSearchParams.toString();
    return backendFetch(modificationUpdateUrl, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
    });
}

export function updateModificationStatusByRootNetwork(
    studyUuid: UUID,
    nodeUuid: UUID,
    rootNetworkUuid: UUID,
    modificationUuid: UUID,
    activated: boolean
) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('activated', String(activated));
    urlSearchParams.append('uuids', String([modificationUuid]));
    const modificationUpdateActiveUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, nodeUuid, rootNetworkUuid) +
        '/network-modifications' +
        '?' +
        urlSearchParams.toString();
    console.debug(modificationUpdateActiveUrl);
    return backendFetch(modificationUpdateActiveUrl, {
        method: 'PUT',
    });
}

export function restoreModifications(studyUuid: UUID | null, nodeUuid: UUID | undefined, modificationUuids: UUID[]) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('stashed', String(false));
    urlSearchParams.append('uuids', String(modificationUuids));
    const RestoreModificationsUrl = getNetworkModificationUrl(studyUuid, nodeUuid) + '?' + urlSearchParams.toString();

    console.debug(RestoreModificationsUrl);
    return backendFetch(RestoreModificationsUrl, {
        method: 'PUT',
    });
}

export function deleteModifications(studyUuid: UUID | null, nodeUuid: UUID | undefined, modificationUuids: UUID[]) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('uuids', String(modificationUuids));

    const modificationDeleteUrl = getNetworkModificationUrl(studyUuid, nodeUuid) + '?' + urlSearchParams.toString();

    console.debug(modificationDeleteUrl);
    return backendFetch(modificationDeleteUrl, {
        method: 'DELETE',
    });
}

export function requestNetworkChange(studyUuid: string, nodeUuid: UUID, groovyScript: string) {
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

function changeOperatingStatus(
    studyUuid: UUID | undefined | null,
    nodeUuid: UUID | undefined,
    equipment: Partial<EquipmentInfos> | null,
    action: string
) {
    const changeOperatingStatusUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    console.debug('%s with action: %s', changeOperatingStatusUrl, action);

    let energizedVoltageLevelId;
    switch (action) {
        case OPERATING_STATUS_ACTION.ENERGISE_END_ONE:
            energizedVoltageLevelId = equipment?.voltageLevelId1;
            break;
        case OPERATING_STATUS_ACTION.ENERGISE_END_TWO:
            energizedVoltageLevelId = equipment?.voltageLevelId2;
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
            equipmentId: equipment?.id,
            energizedVoltageLevelId: energizedVoltageLevelId,
            action: action,
        }),
    });
}

export function lockoutEquipment(
    studyUuid: UUID | undefined,
    nodeUuid: UUID | undefined,
    equipment: EquipmentInfos | null
) {
    console.info('locking out equipment ' + equipment?.id + ' ...');
    return changeOperatingStatus(studyUuid, nodeUuid, equipment, OPERATING_STATUS_ACTION.LOCKOUT);
}

export function tripEquipment(
    studyUuid: UUID | undefined | null,
    nodeUuid: UUID | undefined,
    equipment: Partial<EquipmentInfos> | null
) {
    console.info('tripping equipment ' + equipment?.id + ' ...');
    return changeOperatingStatus(studyUuid, nodeUuid, equipment, OPERATING_STATUS_ACTION.TRIP);
}

export function energiseEquipmentEnd(
    studyUuid: UUID | undefined,
    nodeUuid: UUID | undefined,
    branch: EquipmentInfos | null,
    branchSide: string
) {
    console.info('energise branch ' + branch?.id + ' on side ' + branchSide + ' ...');
    return changeOperatingStatus(
        studyUuid,
        nodeUuid,
        branch,
        branchSide === BRANCH_SIDE.ONE
            ? OPERATING_STATUS_ACTION.ENERGISE_END_ONE
            : OPERATING_STATUS_ACTION.ENERGISE_END_TWO
    );
}

export function switchOnEquipment(
    studyUuid: UUID | undefined,
    nodeUuid: UUID | undefined,
    branch: EquipmentInfos | null
) {
    console.info('switching on branch ' + branch?.id + ' ...');
    return changeOperatingStatus(studyUuid, nodeUuid, branch, OPERATING_STATUS_ACTION.SWITCH_ON);
}

export function generationDispatch({
    studyUuid,
    nodeUuid,
    uuid,
    lossCoefficient,
    defaultOutageRate,
    generatorsWithoutOutage,
    generatorsWithFixedSupply,
    generatorsFrequencyReserve,
    substationsGeneratorsOrdering,
}: GenerationDispatchModificationInfos) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPES.GENERATION_DISPATCH.type,
        lossCoefficient: lossCoefficient,
        defaultOutageRate: defaultOutageRate,
        generatorsWithoutOutage: generatorsWithoutOutage,
        generatorsWithFixedSupply: generatorsWithFixedSupply,
        generatorsFrequencyReserve: generatorsFrequencyReserve,
        substationsGeneratorsOrdering: substationsGeneratorsOrdering,
    });

    let generationDispatchUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    if (uuid) {
        console.info('Updating generation dispatch ', body);
        generationDispatchUrl = generationDispatchUrl + '/' + encodeURIComponent(uuid);
    } else {
        console.info('Creating generation dispatch ', body);
    }

    return backendFetchText(generationDispatchUrl, {
        method: uuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

export function generatorScaling(
    studyUuid: UUID,
    nodeUuid: UUID,
    modificationUuid: UUID | undefined,
    variationType: VariationType,
    variations: Variations[]
) {
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
    }).then((response) =>
        response.ok
            ? response.text()
            : response.text().then((text: string) => Promise.reject(new Error('Error generator scaling : ' + text)))
    );
}

export function createBattery({
    batteryCreationInfos,
    studyUuid,
    nodeUuid,
    modificationUuid,
    isUpdate,
}: {
    batteryCreationInfos: BatteryCreationInfos;
    studyUuid: UUID;
    nodeUuid: UUID;
    modificationUuid?: string | null;
    isUpdate: boolean;
}) {
    let createBatteryUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    if (modificationUuid) {
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
        body: JSON.stringify(batteryCreationInfos),
    });
}

export function modifyBattery({
    batteryModificationInfos,
    studyUuid,
    nodeUuid,
    modificationUuid,
    isUpdate,
}: {
    batteryModificationInfos: BatteryModificationInfos;
    studyUuid: UUID;
    nodeUuid?: UUID;
    modificationUuid: string | null;
    isUpdate: boolean;
}) {
    let modificationUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    if (modificationUuid) {
        modificationUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating battery modification');
    } else {
        console.info('Creating battery modification');
    }
    return backendFetchText(modificationUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(batteryModificationInfos),
    });
}

export function createLoad({
    studyUuid,
    nodeUuid,
    id,
    name,
    loadType,
    p0,
    q0,
    voltageLevelId,
    busOrBusbarSectionId,
    isUpdate,
    modificationUuid,
    connectionDirection,
    connectionName,
    connectionPosition,
    terminalConnected,
    properties,
}: LoadCreationInfo) {
    let createLoadUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        createLoadUrl += '/' + safeEncodeURIComponent(modificationUuid);
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

export function modifyLoad({
    studyUuid,
    nodeUuid,
    modificationUuid = undefined,
    id,
    name,
    loadType,
    p0,
    q0,
    voltageLevelId = undefined,
    busOrBusbarSectionId = undefined,
    connectionName = undefined,
    connectionDirection = undefined,
    connectionPosition = undefined,
    terminalConnected = undefined,
    pMeasurementValue,
    pMeasurementValidity,
    qMeasurementValue,
    qMeasurementValidity,
    properties,
}: LoadModificationInfo) {
    let modifyLoadUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    const isUpdate = !!modificationUuid;
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
            pMeasurementValue: toModificationOperation(pMeasurementValue),
            pMeasurementValidity: toModificationOperation(pMeasurementValidity),
            qMeasurementValue: toModificationOperation(qMeasurementValue),
            qMeasurementValidity: toModificationOperation(qMeasurementValidity),
            properties,
        }),
    });
}

export function modifyGenerator({
    generatorModificationInfos,
    studyUuid,
    nodeUuid,
    modificationUuid,
    isUpdate,
}: {
    generatorModificationInfos: GeneratorModificationInfos;
    studyUuid: UUID;
    nodeUuid?: UUID;
    modificationUuid: string | null;
    isUpdate: boolean;
}) {
    let modificationUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (modificationUuid) {
        modificationUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating generator modification');
    } else {
        console.info('Creating generator modification');
    }
    return backendFetchText(modificationUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatorModificationInfos),
    });
}

export function createGenerator({
    generatorCreationInfos,
    studyUuid,
    nodeUuid,
    modificationUuid,
    isUpdate,
}: {
    generatorCreationInfos: GeneratorCreationInfos;
    studyUuid: UUID;
    nodeUuid: UUID;
    modificationUuid?: string | null;
    isUpdate: boolean;
}) {
    let createGeneratorUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    if (modificationUuid) {
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
        body: JSON.stringify(generatorCreationInfos),
    });
}

export function createShuntCompensator({
    shuntCompensatorCreationInfos,
    studyUuid,
    nodeUuid,
    modificationUuid,
    isUpdate,
}: {
    shuntCompensatorCreationInfos: ShuntCompensatorCreationInfos;
    studyUuid: UUID;
    nodeUuid: UUID;
    modificationUuid?: string | null;
    isUpdate: boolean;
}) {
    let createShuntUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    if (modificationUuid) {
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
        body: JSON.stringify(shuntCompensatorCreationInfos),
    });
}

export function modifyShuntCompensator({
    studyUuid,
    nodeUuid,
    modificationUuid = undefined,
    shuntCompensatorId,
    shuntCompensatorName,
    maximumSectionCount,
    sectionCount,
    maxSusceptance,
    maxQAtNominalV,
    shuntCompensatorType,
    voltageLevelId,
    busOrBusbarSectionId = undefined,
    connectionName = undefined,
    connectionDirection = undefined,
    connectionPosition = undefined,
    terminalConnected = undefined,
    properties,
}: ShuntCompensatorModificationInfo) {
    let modificationUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    const isUpdate = !!modificationUuid;
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

export function createStaticVarCompensator(staticVarCompensatorCreationParameters: StaticVarCompensatorCreationInfo) {
    const {
        studyUuid,
        nodeUuid,
        staticCompensatorId,
        staticCompensatorName,
        voltageLevelId,
        busOrBusbarSectionId,
        connectionName,
        connectionDirection,
        connectionPosition,
        terminalConnected,
        maxSusceptance,
        minSusceptance,
        maxQAtNominalV,
        minQAtNominalV,
        regulationMode,
        isRegulating,
        voltageSetpoint,
        reactivePowerSetpoint,
        voltageRegulationType,
        regulatingTerminalId,
        regulatingTerminalType,
        regulatingTerminalVlId,
        standbyAutomatonOn,
        standby,
        lowVoltageSetpoint,
        highVoltageSetpoint,
        lowVoltageThreshold,
        highVoltageThreshold,
        b0,
        q0,
        isUpdate,
        modificationUuid,
        properties,
    } = staticVarCompensatorCreationParameters;
    let createShuntUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        createShuntUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating static var compensator creation');
    } else {
        console.info('Creating static var compensator creation');
    }

    return backendFetchText(createShuntUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.STATIC_VAR_COMPENSATOR_CREATION.type,
            equipmentId: staticCompensatorId,
            equipmentName: staticCompensatorName,
            voltageLevelId: voltageLevelId,
            busOrBusbarSectionId: busOrBusbarSectionId,
            connectionDirection: connectionDirection,
            connectionName: connectionName,
            connectionPosition: connectionPosition,
            terminalConnected: terminalConnected,
            maxSusceptance: maxSusceptance,
            minSusceptance: minSusceptance,
            maxQAtNominalV: maxQAtNominalV,
            minQAtNominalV: minQAtNominalV,
            regulationMode: regulationMode,
            isRegulating: isRegulating,
            voltageSetpoint: voltageSetpoint,
            reactivePowerSetpoint: reactivePowerSetpoint,
            voltageRegulationType: voltageRegulationType,
            regulatingTerminalId: regulatingTerminalId,
            regulatingTerminalType: regulatingTerminalType,
            regulatingTerminalVlId: regulatingTerminalVlId,
            standbyAutomatonOn: standbyAutomatonOn,
            standby: standby,
            lowVoltageSetpoint: lowVoltageSetpoint,
            highVoltageSetpoint: highVoltageSetpoint,
            lowVoltageThreshold: lowVoltageThreshold,
            highVoltageThreshold: highVoltageThreshold,
            b0: b0,
            q0: q0,
            properties,
        }),
    });
}

export function createLine({
    studyUuid,
    nodeUuid,
    equipmentId,
    equipmentName,
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
    operationalLimitsGroups,
    selectedOperationalLimitsGroupId1,
    selectedOperationalLimitsGroupId2,
    isUpdate = false,
    modificationUuid,
    connectionName1,
    connectionDirection1,
    connectionName2,
    connectionDirection2,
    connectionPosition1,
    connectionPosition2,
    connected1,
    connected2,
    properties,
}: LineCreationInfo) {
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
            equipmentId: equipmentId,
            equipmentName: equipmentName,
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
            operationalLimitsGroups: operationalLimitsGroups,
            selectedOperationalLimitsGroupId1: selectedOperationalLimitsGroupId1,
            selectedOperationalLimitsGroupId2: selectedOperationalLimitsGroupId2,
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

export function modifyLine({
    studyUuid,
    nodeUuid,
    modificationUuid,
    lineId,
    equipmentName,
    r,
    x,
    g1,
    b1,
    g2,
    b2,
    operationalLimitsGroups,
    selectedOperationalLimitsGroupId1,
    selectedOperationalLimitsGroupId2,
    enableOLGModification,
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
    properties,
    p1MeasurementValue,
    p1MeasurementValidity,
    q1MeasurementValue,
    q1MeasurementValidity,
    p2MeasurementValue,
    p2MeasurementValidity,
    q2MeasurementValue,
    q2MeasurementValidity,
}: LineModificationInfos) {
    let modifyLineUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    const isUpdate = !!modificationUuid;
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
            equipmentName: equipmentName,
            r: toModificationOperation(r),
            x: toModificationOperation(x),
            g1: toModificationOperation(g1),
            b1: toModificationOperation(b1),
            g2: toModificationOperation(g2),
            b2: toModificationOperation(b2),
            operationalLimitsGroups: operationalLimitsGroups,
            selectedOperationalLimitsGroupId1: selectedOperationalLimitsGroupId1,
            selectedOperationalLimitsGroupId2: selectedOperationalLimitsGroupId2,
            [ENABLE_OLG_MODIFICATION]: enableOLGModification,
            [OLGS_MODIFICATION_TYPE]: enableOLGModification
                ? OPERATIONAL_LIMITS_GROUPS_MODIFICATION_TYPE.REPLACE
                : null,
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
            p1MeasurementValue: toModificationOperation(p1MeasurementValue),
            p1MeasurementValidity: toModificationOperation(p1MeasurementValidity),
            q1MeasurementValue: toModificationOperation(q1MeasurementValue),
            q1MeasurementValidity: toModificationOperation(q1MeasurementValidity),
            p2MeasurementValue: toModificationOperation(p2MeasurementValue),
            p2MeasurementValidity: toModificationOperation(p2MeasurementValidity),
            q2MeasurementValue: toModificationOperation(q2MeasurementValue),
            q2MeasurementValidity: toModificationOperation(q2MeasurementValidity),
        }),
    });
}

export function createTwoWindingsTransformer({
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
    limitsGroups,
    selectedLimitsGroup1,
    selectedLimitsGroup2,
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
    properties,
}: TwoWindingsTransformerCreationInfo) {
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
            operationalLimitsGroups: limitsGroups,
            selectedOperationalLimitsGroupId1: selectedLimitsGroup1,
            selectedOperationalLimitsGroupId2: selectedLimitsGroup2,
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

export function modifyTwoWindingsTransformer({
    studyUuid,
    nodeUuid,
    modificationUuid = undefined,
    twoWindingsTransformerId,
    twoWindingsTransformerName,
    r,
    x,
    g,
    b,
    ratedS,
    ratedU1,
    ratedU2,
    operationalLimitsGroups,
    selectedLimitsGroup1,
    selectedLimitsGroup2,
    enableOLGModification,
    ratioTapChanger,
    phaseTapChanger,
    voltageLevelId1 = undefined,
    busOrBusbarSectionId1 = undefined,
    voltageLevelId2 = undefined,
    busOrBusbarSectionId2 = undefined,
    connectionName1 = undefined,
    connectionName2 = undefined,
    connectionDirection1 = undefined,
    connectionDirection2 = undefined,
    connectionPosition1 = undefined,
    connectionPosition2 = undefined,
    connected1 = undefined,
    connected2 = undefined,
    properties: propertiesForBackend,
    p1MeasurementValue,
    p1MeasurementValidity,
    q1MeasurementValue,
    q1MeasurementValidity,
    p2MeasurementValue,
    p2MeasurementValidity,
    q2MeasurementValue,
    q2MeasurementValidity,
    ratioTapChangerToBeEstimated,
    phaseTapChangerToBeEstimated,
}: TwoWindingsTransformerModificationInfo) {
    let modifyTwoWindingsTransformerUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    const isUpdate = !!modificationUuid;
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
            operationalLimitsGroups: operationalLimitsGroups,
            selectedOperationalLimitsGroupId1: selectedLimitsGroup1,
            selectedOperationalLimitsGroupId2: selectedLimitsGroup2,
            [ENABLE_OLG_MODIFICATION]: enableOLGModification,
            [OLGS_MODIFICATION_TYPE]: enableOLGModification
                ? OPERATIONAL_LIMITS_GROUPS_MODIFICATION_TYPE.REPLACE
                : null,
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
            properties: propertiesForBackend,
            p1MeasurementValue: toModificationOperation(p1MeasurementValue),
            p1MeasurementValidity: toModificationOperation(p1MeasurementValidity),
            q1MeasurementValue: toModificationOperation(q1MeasurementValue),
            q1MeasurementValidity: toModificationOperation(q1MeasurementValidity),
            p2MeasurementValue: toModificationOperation(p2MeasurementValue),
            p2MeasurementValidity: toModificationOperation(p2MeasurementValidity),
            q2MeasurementValue: toModificationOperation(q2MeasurementValue),
            q2MeasurementValidity: toModificationOperation(q2MeasurementValidity),
            ratioTapChangerToBeEstimated: toModificationOperation(ratioTapChangerToBeEstimated),
            phaseTapChangerToBeEstimated: toModificationOperation(phaseTapChangerToBeEstimated),
        }),
    });
}

export interface CreateTabularModificationProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    modificationType: string;
    modifications: Modification[];
    modificationUuid: UUID;
    tabularType:
        | ModificationType.LIMIT_SETS_TABULAR_MODIFICATION
        | ModificationType.TABULAR_MODIFICATION
        | ModificationType.TABULAR_CREATION;
    csvFilename?: string;
    properties?: TabularProperty[];
}

export function createTabularModification({
    studyUuid,
    nodeUuid,
    modificationType,
    modifications,
    modificationUuid,
    tabularType,
    csvFilename,
    properties,
}: CreateTabularModificationProps) {
    let tabularModificationUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    const isUpdate = !!modificationUuid;
    if (isUpdate) {
        tabularModificationUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating ' + tabularType);
    } else {
        console.info('Creating ' + tabularType);
    }

    return backendFetchText(tabularModificationUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: tabularType,
            modificationType: modificationType,
            modifications: modifications,
            properties: properties,
            csvFilename: csvFilename,
        }),
    });
}

export function createSubstation({
    studyUuid,
    nodeUuid,
    substationId,
    substationName,
    country,
    isUpdate = false,
    modificationUuid,
    properties,
}: SubstationCreationInfo) {
    let url = getNetworkModificationUrl(studyUuid, nodeUuid);

    const body = JSON.stringify({
        type: MODIFICATION_TYPES.SUBSTATION_CREATION.type,
        equipmentId: substationId,
        equipmentName: substationName,
        country: country === '' ? null : country,
        properties,
    });

    if (modificationUuid) {
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
export function formatPropertiesForBackend(previousProperties: any, newProperties: any) {
    if (JSON.stringify(previousProperties) === JSON.stringify(newProperties)) {
        // return null so the backend does not update the properties
        return null;
    }

    //take each attribute of previousProperties and convert it to and array of { 'name': aa, 'value': yy }
    const previousPropertiesArray = Object.entries(previousProperties).map(([name, value]) => ({ name, value }));
    const newPropertiesArray = Object.entries(newProperties).map(([name, value]) => ({ name, value }));

    const propertiesModifications: any = [];
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

export function modifySubstation({
    studyUuid,
    nodeUuid,
    modificationUuid = undefined,
    id,
    name,
    country,
    properties,
}: SubstationModificationInfo) {
    let modifyUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    const isUpdate = !!modificationUuid;
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
    substationCreation,
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
}: VoltageLevelCreationInfo) {
    let createVoltageLevelUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        createVoltageLevelUrl += '/' + safeEncodeURIComponent(modificationUuid);
        console.info('Updating voltage level creation');
    } else {
        console.info('Creating voltage level creation');
    }

    const body = JSON.stringify({
        type: MODIFICATION_TYPES.VOLTAGE_LEVEL_CREATION.type,
        equipmentId: voltageLevelId,
        equipmentName: voltageLevelName,
        substationId: substationId,
        substationCreation: substationCreation,
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

export function modifyVoltageLevel({
    studyUuid,
    nodeUuid,
    modificationUuid = undefined,
    voltageLevelId,
    voltageLevelName,
    nominalV,
    lowVoltageLimit,
    highVoltageLimit,
    lowShortCircuitCurrentLimit,
    highShortCircuitCurrentLimit,
    properties,
}: VoltageLeveModificationInfo) {
    let modificationUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    const isUpdate = !!modificationUuid;
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

export function modifyVoltageLevelTopology({
    topologyVoltageLevelModificationInfos,
    studyUuid,
    nodeUuid,
    modificationUuid,
    isUpdate,
}: {
    topologyVoltageLevelModificationInfos: TopologyVoltageLevelModificationInfos;
    studyUuid: UUID;
    nodeUuid?: UUID;
    modificationUuid: string | null;
    isUpdate: boolean;
}) {
    let modificationUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    if (modificationUuid) {
        modificationUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating voltage level topology modification');
    } else {
        console.info('Creating voltage level topology modification');
    }
    return backendFetchText(modificationUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(topologyVoltageLevelModificationInfos),
    });
}

export function divideLine({
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
    newLine2Name,
}: DivideLineInfo) {
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

export function attachLine({
    studyUuid,
    nodeUuid,
    modificationUuid,
    lineToAttachToId,
    percent,
    attachmentPointId,
    attachmentPointName,
    attachmentPointDetailInformation,
    mayNewVoltageLevelInfos,
    existingVoltageLevelId,
    bbsOrBusId,
    attachmentLine,
    newLine1Id,
    newLine1Name,
    newLine2Id,
    newLine2Name,
}: AttachLineInfo) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPES.LINE_ATTACH_TO_VOLTAGE_LEVEL.type,
        lineToAttachToId,
        percent,
        attachmentPointId,
        attachmentPointName,
        attachmentPointDetailInformation,
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

export function createVoltageLevelSection({
    voltageLevelSectionInfos,
    studyUuid,
    nodeUuid,
    modificationUuid,
    isUpdate,
}: {
    voltageLevelSectionInfos: CreateVoltageLevelSectionInfos;
    studyUuid: UUID;
    nodeUuid?: UUID;
    modificationUuid: string | null;
    isUpdate: boolean;
}) {
    let modificationUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    if (modificationUuid) {
        modificationUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating voltage level topology modification');
    } else {
        console.info('Creating voltage level topology modification');
    }
    return backendFetchText(modificationUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(voltageLevelSectionInfos),
    });
}

export function loadScaling(
    studyUuid: string,
    nodeUuid: UUID,
    modificationUuid: UUID | undefined,
    variationType: VariationType,
    variations: Variations[]
) {
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
    }).then((response) =>
        response.ok
            ? response.text()
            : response.text().then((text: string) => Promise.reject(new Error('Error load scaling: ' + text)))
    );
}

export function linesAttachToSplitLines({
    studyUuid,
    nodeUuid,
    uuid,
    lineToAttachTo1Id,
    lineToAttachTo2Id,
    attachedLineId,
    voltageLevelId,
    bbsBusId,
    replacingLine1Id,
    replacingLine1Name,
    replacingLine2Id,
    replacingLine2Name,
}: LinesAttachToSplitLinesInfo) {
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

    if (uuid) {
        lineAttachUrl += '/' + encodeURIComponent(uuid);
        console.info('Updating attaching lines to splitting lines');
    } else {
        console.info('Creating attaching lines to splitting lines');
    }

    return backendFetchText(lineAttachUrl, {
        method: uuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

export function deleteVoltageLevelOnLine(
    studyUuid: string,
    nodeUuid: UUID,
    modificationUuid: UUID | undefined,
    lineToAttachTo1Id: string,
    lineToAttachTo2Id: string,
    replacingLine1Id: string,
    replacingLine1Name: string | null
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

export function deleteAttachingLine({
    studyUuid,
    nodeUuid,
    modificationUuid,
    lineToAttachTo1Id,
    lineToAttachTo2Id,
    attachedLineId,
    replacingLine1Id,
    replacingLine1Name,
}: DeleteAttachingLineInfo) {
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

export function deleteEquipment(
    studyUuid: string,
    nodeUuid: UUID | undefined,
    equipmentType: EquipmentType | string | null,
    equipmentId: string,
    modificationUuid: UUID | undefined,
    equipmentInfos: any = undefined
) {
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

export function deleteEquipmentByFilter(
    studyUuid: string,
    nodeUuid: string,
    equipmentType: keyof typeof EQUIPMENT_TYPES | null,
    filters: Filter[],
    modificationUuid: string
) {
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

export function fetchNetworkModifications(
    studyUuid: UUID | null,
    nodeUuid: string,
    onlyStashed: boolean
): Promise<NetworkModificationMetadata[]> {
    console.info('Fetching network modifications (metadata) for nodeUuid : ', nodeUuid);
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('onlyStashed', onlyStashed.toString());
    urlSearchParams.append('onlyMetadata', 'true');
    const modificationsGetUrl = getNetworkModificationUrl(studyUuid, nodeUuid) + '?' + urlSearchParams.toString();
    console.debug(modificationsGetUrl);
    return backendFetchJson(modificationsGetUrl);
}

export function fetchExcludedNetworkModifications(
    studyUuid: UUID | null,
    nodeUuid: string
): Promise<ExcludedNetworkModifications[]> {
    console.info('Fetching excluded network modifications by root networks for nodeUuid : ', nodeUuid);
    const urlSearchParams = new URLSearchParams();
    const modificationsGetUrl = getStudyUrlWithNodeUuid(studyUuid, nodeUuid) + '/excluded-network-modifications?';
    urlSearchParams.toString();
    console.debug(modificationsGetUrl);
    return backendFetchJson(modificationsGetUrl);
}

export function updateSwitchState(studyUuid: string, nodeUuid: UUID | undefined, switchId: string, open: boolean) {
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

export function createLcc({
    studyUuid,
    nodeUuid,
    id,
    name,
    nominalV,
    r,
    maxP,
    convertersMode,
    activePowerSetpoint,
    converterStation1,
    converterStation2,
    properties,
    isUpdate = false,
    modificationUuid,
}: LCCCreationInfo) {
    let createLccUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        createLccUrl += '/' + safeEncodeURIComponent(modificationUuid);
        console.info('Updating lcc hvdc line creation');
    } else {
        console.info('Creating lcc hvdc line creation');
    }

    return backendFetchText(createLccUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.LCC_CREATION.type,
            equipmentId: id,
            equipmentName: name,
            nominalV: nominalV,
            r: r,
            maxP: maxP,
            convertersMode: convertersMode,
            activePowerSetpoint: activePowerSetpoint,
            converterStation1: converterStation1,
            converterStation2: converterStation2,
            properties: properties,
        }),
    });
}

export function modifyLcc({
    lccModificationInfos,
    studyUuid,
    nodeUuid,
    modificationUuid,
    isUpdate,
}: {
    lccModificationInfos: LccModificationInfos;
    studyUuid: UUID;
    nodeUuid?: UUID;
    modificationUuid: string | null;
    isUpdate: boolean;
}) {
    let modifyLccUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        modifyLccUrl += '/' + safeEncodeURIComponent(modificationUuid);
        console.info('Updating lcc hvdc line modification');
    } else {
        console.info('Creating lcc hvdc line modification');
    }

    return backendFetchText(modifyLccUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(lccModificationInfos),
    });
}

export function createVsc({
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
    modificationUuid,
}: VSCCreationInfo) {
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

export function modifyVsc({
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
    modificationUuid,
}: VSCModificationInfo) {
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
    }; //add missing informations

    return backendFetchText(modificationUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(vscModification),
    });
}

export function modifyByFormula(
    studyUuid: string,
    nodeUuid: UUID,
    equipmentType: string,
    formulas: any,
    isUpdate: boolean,
    modificationUuid: UUID
) {
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

export function modifyByAssignment(
    studyUuid: string,
    nodeUuid: UUID,
    equipmentType: string,
    assignmentsList: Assignment[],
    isUpdate: boolean,
    modificationUuid: UUID | null
) {
    let modificationUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (isUpdate) {
        modificationUrl += '/' + safeEncodeURIComponent(modificationUuid);
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

export function createCouplingDevice({
    createCouplingDeviceInfos,
    studyUuid,
    nodeUuid,
    modificationUuid,
    isUpdate,
}: {
    createCouplingDeviceInfos: CreateCouplingDeviceInfos;
    studyUuid: UUID;
    nodeUuid: UUID;
    modificationUuid?: string | null;
    isUpdate: boolean;
}) {
    let modifyUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (modificationUuid) {
        modifyUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating coupling device');
    } else {
        console.info('Creating coupling device');
    }

    return backendFetchText(modifyUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(createCouplingDeviceInfos),
    });
}

export function balancesAdjustment({
    studyUuid,
    nodeUuid,
    modificationUuid,
    ...balancesAdjustmentInfos
}: Omit<BalancesAdjustmentInfos, 'uuid'> & NetworkModificationRequestInfos) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPES.BALANCES_ADJUSTMENT.type,
        ...balancesAdjustmentInfos,
    });

    let balancesAdjustmentUrl = getNetworkModificationUrl(studyUuid, nodeUuid);
    if (modificationUuid) {
        console.info('Updating balances adjustment ', body);
        balancesAdjustmentUrl = balancesAdjustmentUrl + '/' + encodeURIComponent(modificationUuid);
    } else {
        console.info('Creating balances adjustment ', body);
    }

    return backendFetchText(balancesAdjustmentUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

export function createVoltageLevelTopology({
    createVoltageLevelTopologyInfos,
    studyUuid,
    nodeUuid,
    modificationUuid,
    isUpdate,
}: {
    createVoltageLevelTopologyInfos: CreateVoltageLevelTopologyInfos;
    studyUuid: UUID;
    nodeUuid: UUID;
    modificationUuid?: string | null;
    isUpdate: boolean;
}) {
    let modifyUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (modificationUuid) {
        modifyUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating voltage level topology');
    } else {
        console.info('Creating voltage level topology');
    }
    return backendFetchText(modifyUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(createVoltageLevelTopologyInfos),
    });
}

export function moveVoltageLevelFeederBays({
    moveVoltageLevelFeederBaysInfos,
    studyUuid,
    nodeUuid,
    modificationUuid,
    isUpdate,
}: {
    moveVoltageLevelFeederBaysInfos: MoveVoltageLevelFeederBaysInfos;
    studyUuid: UUID;
    nodeUuid: UUID;
    modificationUuid?: string | null;
    isUpdate: boolean;
}) {
    let modifyUrl = getNetworkModificationUrl(studyUuid, nodeUuid);

    if (modificationUuid) {
        modifyUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating voltage level topology');
    } else {
        console.info('Creating voltage level topology');
    }
    return backendFetchText(modifyUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(moveVoltageLevelFeederBaysInfos),
    });
}
