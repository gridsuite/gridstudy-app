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
import { IntlShape } from 'react-intl';

export const NA_Value = 'N/A';

export const formatNAValue = (value: string, intl: IntlShape): string => {
    return value === NA_Value ? intl.formatMessage({ id: 'Undefined' }) : value;
};

export const convertDuration = (duration: number) => {
    if (!duration || isNaN(duration)) {
        return '';
    }

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    if (seconds === 0) {
        return minutes + ' mn';
    }

    if (minutes === 0) {
        return seconds + ' s';
    }

    return `${minutes}' ${seconds}"`;
};

/*
 * This function is used to format the data of the table to be able to display it in the table
 * and resolve the issue of the calculated fields
 */
const formatRatioTapChanger = (twt: any) => {
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

const formatPhaseTapChanger = (twt: any) => {
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

export const formatTwtDataForTable = (twt: any) => {
    let formattedTwt = formatRatioTapChanger(twt);
    formattedTwt = formatPhaseTapChanger(formattedTwt);

    return formattedTwt;
};

const formatGeneratorDataForTable = (generator: any) => {
    const formattedGenerator = { ...generator };
    const hasDistantRegulation =
        formattedGenerator.regulatingTerminalVlId || formattedGenerator.regulatingTerminalConnectableId;
    formattedGenerator.RegulationTypeText =
        formattedGenerator.RegulationTypeText ||
        (hasDistantRegulation ? REGULATION_TYPES.DISTANT.id : REGULATION_TYPES.LOCAL.id);
    return formattedGenerator;
};

const formatShuntCompensatorDataForTable = (shuntCompensator: any) => {
    const formattedCompensator = { ...shuntCompensator };

    if (formattedCompensator.type === undefined) {
        formattedCompensator.type =
            formattedCompensator.maxSusceptance > 0
                ? SHUNT_COMPENSATOR_TYPES.CAPACITOR.id
                : SHUNT_COMPENSATOR_TYPES.REACTOR.id;
    }

    return formattedCompensator;
};

export const formatFetchedEquipments = (equipmentType: EQUIPMENT_TYPES, equipments: Identifiable[]) => {
    if (equipments && equipments?.length > 0) {
        return equipments.map((equipment) => {
            return formatFetchedEquipment(equipmentType, equipment);
        });
    }
    return equipments;
};

export const formatFetchedEquipment = (equipmentType: EQUIPMENT_TYPES, equipment: Identifiable) => {
    switch (equipmentType) {
        case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
            return formatTwtDataForTable(equipment);
        case EQUIPMENT_TYPES.GENERATOR:
            return formatGeneratorDataForTable(equipment);
        case EQUIPMENT_TYPES.SHUNT_COMPENSATOR:
            return formatShuntCompensatorDataForTable(equipment);
        default:
            return equipment;
    }
};
