/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { typeAndFetchers } from './common-config';
import { COLUMN_TYPES } from 'components/custom-aggrid/custom-aggrid-header.type';

const tab = 'TwoWindingsTransformers';

export const TWO_WINDINGS_TRANSFORMER_TAB_DEF: SpreadsheetTabDefinition = {
    index: 3,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER),
    columns: [
        {
            id: 'id',
            name: 'ID',
            type: COLUMN_TYPES.TEXT,
            formula: 'id',
            dependencies: [],
        },
        {
            id: 'name',
            name: 'Name',
            type: COLUMN_TYPES.TEXT,
            formula: 'name',
            dependencies: [],
        },
        {
            id: 'country',
            name: 'Country',
            type: COLUMN_TYPES.ENUM,
            formula: 'country',
            dependencies: [],
        },
        {
            id: 'voltageLevelId1',
            name: 'Voltage level ID 1',
            type: COLUMN_TYPES.TEXT,
            formula: 'voltageLevelId1',
            dependencies: [],
        },
        {
            id: 'voltageLevelId2',
            name: 'Voltage level ID 2',
            type: COLUMN_TYPES.TEXT,
            formula: 'voltageLevelId2',
            dependencies: [],
        },
        {
            id: 'nominalVoltage1',
            name: 'Nominal voltage 1 (kV)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'nominalVoltage1',
            precision: 0,
            dependencies: [],
        },
        {
            id: 'nominalVoltage2',
            name: 'Nominal voltage 2 (kV)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'nominalVoltage2',
            precision: 0,
            dependencies: [],
        },
        {
            id: 'ratedU1',
            name: 'Rated voltage 1 (kV)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'ratedU1',
            precision: 0,
            dependencies: [],
        },
        {
            id: 'ratedU2',
            name: 'Rated voltage 2 (kV)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'ratedU2',
            precision: 0,
            dependencies: [],
        },
        {
            id: 'terminal1Connected',
            name: 'Connected 1',
            type: COLUMN_TYPES.BOOLEAN,
            formula: 'terminal1Connected',
            dependencies: [],
        },
        {
            id: 'terminal2Connected',
            name: 'Connected 2',
            type: COLUMN_TYPES.BOOLEAN,
            formula: 'terminal2Connected',
            dependencies: [],
        },
        {
            id: 'p1',
            name: 'p1 (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'p1',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'p2',
            name: 'p2 (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'p2',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'q1',
            name: 'q1 (MVar)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'q1',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'q2',
            name: 'q2 (MVar)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'q2',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'ratioTapChanger.hasLoadTapChangingCapabilities',
            name: 'Ratio on-load',
            type: COLUMN_TYPES.BOOLEAN,
            formula: 'ratioTapChanger.hasLoadTapChangingCapabilities',
            dependencies: [],
        },
        {
            id: 'ratioTapChanger.regulationMode',
            name: 'Ratio regulation mode',
            type: COLUMN_TYPES.ENUM,
            formula: 'ratioTapChanger.regulationMode',
            dependencies: [],
        },
        {
            id: 'ratioTapChanger.lowTapPosition',
            name: 'Ratio low tap position',
            type: COLUMN_TYPES.NUMBER,
            formula: 'ratioTapChanger.lowTapPosition',
            precision: 0,
            dependencies: [],
        },
        {
            id: 'ratioTapChanger.highTapPosition',
            name: 'Ratio high tap position',
            type: COLUMN_TYPES.NUMBER,
            formula: 'ratioTapChanger.highTapPosition',
            precision: 0,
            dependencies: [],
        },
        {
            id: 'ratioTapChanger.tapPosition',
            name: 'Ratio tap',
            type: COLUMN_TYPES.NUMBER,
            formula: 'ratioTapChanger.tapPosition',
            precision: 0,
            dependencies: [],
        },
        {
            id: 'ratioTapChanger.targetV',
            name: 'Voltage set point (kV)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'ratioTapChanger.targetV',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'ratioTapChanger.targetDeadband',
            name: 'Ratio deadband',
            type: COLUMN_TYPES.NUMBER,
            formula: 'ratioTapChanger.targetDeadband',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'ratioTapChanger.regulationType',
            name: 'Ratio regulation',
            type: COLUMN_TYPES.ENUM,
            formula: 'ratioTapChanger.regulationType',
            dependencies: [],
        },
        {
            id: 'ratioTapChanger.regulationSide',
            name: 'Ratio regulated side',
            type: COLUMN_TYPES.ENUM,
            formula: 'ratioTapChanger.regulationSide',
            dependencies: [],
        },
        {
            id: 'ratioTapChanger.ratioRegulatingTerminal',
            name: 'Ratio regulated terminal',
            type: COLUMN_TYPES.TEXT,
            formula: 'ratioTapChanger.ratioRegulatingTerminal',
            dependencies: [],
        },
        {
            id: 'phaseTapChanger.regulationMode',
            name: 'Phase regulation mode',
            type: COLUMN_TYPES.ENUM,
            formula: 'phaseTapChanger.regulationMode',
            dependencies: [],
        },
        {
            id: 'phaseTapChanger.lowTapPosition',
            name: 'Phase low tap position',
            type: COLUMN_TYPES.NUMBER,
            formula: 'phaseTapChanger.lowTapPosition',
            precision: 0,
            dependencies: [],
        },
        {
            id: 'phaseTapChanger.highTapPosition',
            name: 'Phase high tap position',
            type: COLUMN_TYPES.NUMBER,
            formula: 'phaseTapChanger.highTapPosition',
            precision: 0,
            dependencies: [],
        },
        {
            id: 'phaseTapChanger.tapPosition',
            name: 'Phase tap',
            type: COLUMN_TYPES.NUMBER,
            formula: 'phaseTapChanger.tapPosition',
            precision: 0,
            dependencies: [],
        },
        {
            id: 'phaseTapChanger.regulationValue',
            name: 'Current (A) or flow set point (MW)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'phaseTapChanger.regulationValue',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'phaseTapChanger.targetDeadband',
            name: 'Phase deadband',
            type: COLUMN_TYPES.NUMBER,
            formula: 'phaseTapChanger.targetDeadband',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'phaseTapChanger.regulationType',
            name: 'Phase regulation',
            type: COLUMN_TYPES.ENUM,
            formula: 'phaseTapChanger.regulationType',
            dependencies: [],
        },
        {
            id: 'phaseTapChanger.regulationSide',
            name: 'Phase regulated side',
            type: COLUMN_TYPES.ENUM,
            formula: 'phaseTapChanger.regulationSide',
            dependencies: [],
        },
        {
            id: 'phaseTapChanger.phaseRegulatingTerminal',
            name: 'Phase regulated terminal',
            type: COLUMN_TYPES.TEXT,
            formula: 'phaseTapChanger.phaseRegulatingTerminal',
            dependencies: [],
        },
        {
            id: 'r',
            name: 'Series resistance (Ω)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'r',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'x',
            name: 'Series reactance (Ω)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'x',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'g',
            name: 'Magnetizing conductance (μS)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'unitToMicroUnit(g)',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'b',
            name: 'Magnetizing susceptance (μS)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'unitToMicroUnit(b)',
            precision: 1,
            dependencies: [],
        },
        {
            id: 'ratedS',
            name: 'Rated nominal power (MVA)',
            type: COLUMN_TYPES.NUMBER,
            formula: 'ratedS',
            precision: 1,
            dependencies: [],
        },
    ],
};
