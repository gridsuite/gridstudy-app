/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getTapChangerRegulationTerminalValue } from 'components/utils/utils';
import { REGULATION_TYPES, SHUNT_COMPENSATOR_TYPES } from 'components/network/constants';
import {
    getComputedRegulationTypeId,
    getComputedTapSideId,
    getInitialTwtRatioRegulationModeId,
} from 'components/dialogs/network-modifications/two-windings-transformer/tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane-utils';
import {
    getComputedPhaseRegulationTypeId,
    getComputedPhaseTapChangerRegulationMode,
    getPhaseTapRegulationSideId,
} from 'components/dialogs/network-modifications/two-windings-transformer/tap-changer-pane/phase-tap-changer-pane/phase-tap-changer-pane-utils';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { Identifiable } from '@gridsuite/commons-ui';

/*
 * This function is used to format the data of the table to be able to display it in the table
 * and resolve the issue of the calculated fields
 */
const mapRatioTapChanger = (twt: any) => {
    if (!twt?.ratioTapChanger) {
        return twt;
    }

    const regulationType = getComputedRegulationTypeId(twt) ?? undefined;
    const regulationSide = regulationType === REGULATION_TYPES.LOCAL.id ? getComputedTapSideId(twt) : undefined;
    const ratioRegulatingTerminal =
        regulationType === REGULATION_TYPES.DISTANT.id
            ? getTapChangerRegulationTerminalValue(twt.ratioTapChanger)
            : null;

    return {
        ...twt,
        ratioTapChanger: {
            ...twt.ratioTapChanger,
            regulationMode: getInitialTwtRatioRegulationModeId(twt) ?? undefined,
            regulationType,
            regulationSide,
            ratioRegulatingTerminal,
        },
    };
};

const mapPhaseTapChanger = (twt: any) => {
    if (!twt?.phaseTapChanger) {
        return twt;
    }

    const regulationType = getComputedPhaseRegulationTypeId(twt) ?? undefined;
    const regulationSide = regulationType === REGULATION_TYPES.LOCAL.id ? getPhaseTapRegulationSideId(twt) : undefined;
    const phaseRegulatingTerminal =
        regulationType === REGULATION_TYPES.DISTANT.id
            ? getTapChangerRegulationTerminalValue(twt.phaseTapChanger)
            : null;

    return {
        ...twt,
        phaseTapChanger: {
            ...twt.phaseTapChanger,
            regulationMode: getComputedPhaseTapChangerRegulationMode(twt.phaseTapChanger)?.id ?? undefined,
            regulationType,
            regulationSide,
            phaseRegulatingTerminal,
        },
    };
};

const mapTwtDataForTable = (twt: any) => {
    let formattedTwt = mapRatioTapChanger(twt);
    formattedTwt = mapPhaseTapChanger(formattedTwt);

    return formattedTwt;
};

const mapGeneratorDataForTable = (generator: any) => {
    const formattedGenerator = { ...generator };
    const hasDistantRegulation =
        formattedGenerator.regulatingTerminalVlId || formattedGenerator.regulatingTerminalConnectableId;
    formattedGenerator.RegulationTypeText =
        formattedGenerator.RegulationTypeText ||
        (hasDistantRegulation ? REGULATION_TYPES.DISTANT.id : REGULATION_TYPES.LOCAL.id);
    return formattedGenerator;
};

const mapShuntCompensatorDataForTable = (shuntCompensator: any) => {
    const formattedCompensator = { ...shuntCompensator };

    if (formattedCompensator.type === undefined) {
        formattedCompensator.type =
            formattedCompensator.maxSusceptance > 0
                ? SHUNT_COMPENSATOR_TYPES.CAPACITOR.id
                : SHUNT_COMPENSATOR_TYPES.REACTOR.id;
    }

    return formattedCompensator;
};

const mapSpreadsheetEquipment = (equipmentType: EQUIPMENT_TYPES, equipment: Identifiable) => {
    switch (equipmentType) {
        case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
            return mapTwtDataForTable(equipment);
        case EQUIPMENT_TYPES.GENERATOR:
            return mapGeneratorDataForTable(equipment);
        case EQUIPMENT_TYPES.SHUNT_COMPENSATOR:
            return mapShuntCompensatorDataForTable(equipment);
        default:
            return equipment;
    }
};

export const mapSpreadsheetEquipments = (equipmentType: EQUIPMENT_TYPES, equipments: Identifiable[]) => {
    if (equipments && equipments?.length > 0) {
        return equipments.map((equipment) => {
            return mapSpreadsheetEquipment(equipmentType, equipment);
        });
    }
    return equipments;
};
