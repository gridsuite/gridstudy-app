/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const SUBSTATION_RADIUS = 500;
export const SUBSTATION_RADIUS_MAX_PIXEL = 5;
export const SUBSTATION_RADIUS_MIN_PIXEL = 1;

export const TABLES_DEFINITIONS = {
    SUBSTATIONS: {
        index: 0,
        name: 'Substations',
        columns: [
            {
                width: 400,
                id: 'ID',
                dataKey: 'id',
            },
            {
                width: 200,
                id: 'Name',
                dataKey: 'name',
            },
            {
                width: 200,
                id: 'Country',
                dataKey: 'countryName',
            },
        ],
    },

    VOLTAGE_LEVELS: {
        index: 1,
        name: 'VoltageLevels',
        columns: [
            {
                width: 400,
                id: 'ID',
                dataKey: 'id',
            },
            {
                width: 200,
                id: 'Name',
                dataKey: 'name',
            },
            {
                width: 400,
                id: 'SubstationId',
                dataKey: 'substationId',
            },
            {
                width: 200,
                id: 'NominalVoltage',
                dataKey: 'nominalVoltage',
                numeric: true,
                fractionDigits: 0,
            },
        ],
    },

    LINES: {
        index: 2,
        name: 'Lines',
        columns: [
            {
                width: 400,
                id: 'ID',
                dataKey: 'id',
            },
            {
                width: 200,
                id: 'Name',
                dataKey: 'name',
            },
            {
                width: 400,
                id: 'VoltageLevelIdSide1',
                dataKey: 'voltageLevelId1',
            },
            {
                width: 400,
                id: 'VoltageLevelIdSide2',
                dataKey: 'voltageLevelId2',
            },
            {
                width: 200,
                id: 'ActivePowerSide1',
                dataKey: 'p1',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ActivePowerSide2',
                dataKey: 'p2',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ReactivePowerSide1',
                dataKey: 'q1',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ReactivePowerSide2',
                dataKey: 'q2',
                numeric: true,
                fractionDigits: 1,
            },
        ],
    },

    TWO_WINDINGS_TRANSFORMERS: {
        index: 3,
        name: 'TwoWindingsTransformers',
        columns: [
            {
                width: 400,
                id: 'ID',
                dataKey: 'id',
            },
            {
                width: 200,
                id: 'Name',
                dataKey: 'name',
            },
            {
                width: 400,
                id: 'VoltageLevelIdSide1',
                dataKey: 'voltageLevelId1',
            },
            {
                width: 400,
                id: 'VoltageLevelIdSide2',
                dataKey: 'voltageLevelId2',
            },
            {
                width: 200,
                id: 'ActivePowerSide1',
                dataKey: 'p1',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ActivePowerSide2',
                dataKey: 'p2',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ReactivePowerSide1',
                dataKey: 'q1',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ReactivePowerSide2',
                dataKey: 'q2',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 150,
                id: 'RatioTap',
                dataKey: 'ratioTapChangerPosition',
                numeric: true,
                changeCmd: generateTapRequest('Ratio'),
                fractionDigits: 0,
            },
            {
                width: 150,
                id: 'PhaseTap',
                dataKey: 'phaseTapChangerPosition',
                numeric: true,
                changeCmd: generateTapRequest('Phase'),
                fractionDigits: 0,
            },
        ],
    },

    THREE_WINDINGS_TRANSFORMERS: {
        index: 4,
        name: 'ThreeWindingsTransformers',
        columns: [
            {
                width: 400,
                id: 'ID',
                dataKey: 'id',
            },
            {
                width: 200,
                id: 'Name',
                dataKey: 'name',
            },
            {
                width: 400,
                id: 'VoltageLevelIdSide1',
                dataKey: 'voltageLevelId1',
            },
            {
                width: 400,
                id: 'VoltageLevelIdSide2',
                dataKey: 'voltageLevelId2',
            },
            {
                width: 400,
                id: 'VoltageLevelIdSide3',
                dataKey: 'voltageLevelId3',
            },
            {
                width: 200,
                id: 'ActivePowerSide1',
                dataKey: 'p1',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ActivePowerSide2',
                dataKey: 'p2',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ActivePowerSide3',
                dataKey: 'p3',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ReactivePowerSide1',
                dataKey: 'q1',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ReactivePowerSide2',
                dataKey: 'q2',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ReactivePowerSide3',
                dataKey: 'q3',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 150,
                id: 'RatioTap1',
                dataKey: 'ratioTapChanger1Position',
                numeric: true,
                changeCmd: generateTapRequest('Ratio', 1),
                fractionDigits: 0,
            },
            {
                width: 150,
                id: 'RatioTap2',
                dataKey: 'ratioTapChanger2Position',
                numeric: true,
                changeCmd: generateTapRequest('Ratio', 2),
                fractionDigits: 0,
            },
            {
                width: 150,
                id: 'RatioTap3',
                dataKey: 'ratioTapChanger3Position',
                numeric: true,
                changeCmd: generateTapRequest('Ratio', 3),
                fractionDigits: 0,
            },
            {
                width: 150,
                id: 'PhaseTap1',
                dataKey: 'phaseTapChanger1Position',
                numeric: true,
                changeCmd: generateTapRequest('Phase', 1),
                fractionDigits: 0,
            },
            {
                width: 150,
                id: 'PhaseTap2',
                dataKey: 'phaseTapChanger2Position',
                numeric: true,
                changeCmd: generateTapRequest('Phase', 2),
                fractionDigits: 0,
            },
            {
                width: 150,
                id: 'PhaseTap3',
                dataKey: 'phaseTapChanger3Position',
                numeric: true,
                changeCmd: generateTapRequest('Phase', 3),
                fractionDigits: 0,
            },
        ],
    },

    GENERATORS: {
        index: 5,
        name: 'Generators',
        columns: [
            {
                width: 400,
                id: 'ID',
                dataKey: 'id',
            },
            {
                width: 200,
                id: 'Name',
                dataKey: 'name',
            },
            {
                width: 400,
                id: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                width: 200,
                id: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'TargetP',
                dataKey: 'targetP',
                numeric: true,
                changeCmd: 'equipment.setTargetP({})',
                fractionDigits: 1,
            },
        ],
    },

    LOADS: {
        index: 6,
        name: 'Loads',
        columns: [
            {
                width: 400,
                id: 'ID',
                dataKey: 'id',
            },
            {
                width: 200,
                id: 'Name',
                dataKey: 'name',
            },
            {
                width: 200,
                id: 'LoadType',
                dataKey: 'type',
            },
            {
                width: 400,
                id: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                width: 200,
                id: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ConstantActivePower',
                dataKey: 'p0',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ConstantReactivePower',
                dataKey: 'q0',
                numeric: true,
                fractionDigits: 1,
            },
        ],
    },

    SHUNT_COMPENSATORS: {
        index: 7,
        name: 'ShuntCompensators',
        columns: [
            {
                width: 400,
                id: 'ID',
                dataKey: 'id',
            },
            {
                width: 200,
                id: 'Name',
                dataKey: 'name',
            },
            {
                width: 400,
                id: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                width: 200,
                id: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'TargetV',
                dataKey: 'targetV',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'TargetDeadband',
                dataKey: 'targetDeadband',
                numeric: true,
                fractionDigits: 1,
            },
        ],
    },

    STATIC_VAR_COMPENSATORS: {
        index: 8,
        name: 'StaticVarCompensators',
        columns: [
            {
                width: 400,
                id: 'ID',
                dataKey: 'id',
            },
            {
                width: 200,
                id: 'Name',
                dataKey: 'name',
            },
            {
                width: 400,
                id: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                width: 200,
                id: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'VoltageSetpoint',
                dataKey: 'voltageSetpoint',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ReactivePowerSetpoint',
                dataKey: 'reactivePowerSetpoint',
                numeric: true,
                fractionDigits: 1,
            },
        ],
    },

    BATTERIES: {
        index: 9,
        name: 'Batteries',
        columns: [
            {
                width: 400,
                id: 'ID',
                dataKey: 'id',
            },
            {
                width: 200,
                id: 'Name',
                dataKey: 'name',
            },
            {
                width: 400,
                id: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                width: 200,
                id: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ConstantActivePower',
                dataKey: 'p0',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ConstantReactivePower',
                dataKey: 'q0',
                numeric: true,
                fractionDigits: 1,
            },
        ],
    },

    HVDC_LINES: {
        index: 10,
        name: 'HvdcLines',
        columns: [
            {
                width: 400,
                id: 'ID',
                dataKey: 'id',
            },
            {
                width: 200,
                id: 'Name',
                dataKey: 'name',
            },
            {
                width: 400,
                id: 'ConvertersMode',
                dataKey: 'convertersMode',
            },
            {
                width: 400,
                id: 'ConverterStationId1',
                dataKey: 'converterStationId1',
            },
            {
                width: 400,
                id: 'ConverterStationId2',
                dataKey: 'converterStationId2',
            },
            {
                width: 200,
                id: 'R',
                dataKey: 'r',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'NominalV',
                dataKey: 'nominalV',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 300,
                id: 'ActivePowerSetpoint',
                dataKey: 'activePowerSetpoint',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'MaxP',
                dataKey: 'maxP',
                numeric: true,
                fractionDigits: 1,
            },
        ],
    },

    LCC_CONVERTER_STATIONS: {
        index: 11,
        name: 'LccConverterStations',
        columns: [
            {
                width: 400,
                id: 'ID',
                dataKey: 'id',
            },
            {
                width: 200,
                id: 'Name',
                dataKey: 'name',
            },
            {
                width: 400,
                id: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                width: 400,
                id: 'HvdcLineId',
                dataKey: 'hvdcLineId',
            },
            {
                width: 200,
                id: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'PowerFactor',
                dataKey: 'powerFactor',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'LossFactor',
                dataKey: 'lossFactor',
                numeric: true,
                fractionDigits: 1,
            },
        ],
    },

    VSC_CONVERTER_STATIONS: {
        index: 12,
        name: 'VscConverterStations',
        columns: [
            {
                width: 400,
                id: 'ID',
                dataKey: 'id',
            },
            {
                width: 200,
                id: 'Name',
                dataKey: 'name',
            },
            {
                width: 400,
                id: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                width: 400,
                id: 'HvdcLineId',
                dataKey: 'hvdcLineId',
            },
            {
                width: 200,
                id: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'LossFactor',
                dataKey: 'lossFactor',
                numeric: true,
                fractionDigits: 1,
            },
        ],
    },

    DANGLING_LINES: {
        index: 13,
        name: 'DanglingLines',
        columns: [
            {
                width: 400,
                id: 'ID',
                dataKey: 'id',
            },
            {
                width: 200,
                id: 'Name',
                dataKey: 'name',
            },
            {
                width: 400,
                id: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                width: 200,
                id: 'UcteXnodeCode',
                dataKey: 'ucteXnodeCode',
            },
            {
                width: 200,
                id: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ConstantActivePower',
                dataKey: 'p0',
                numeric: true,
                fractionDigits: 1,
            },
            {
                width: 200,
                id: 'ConstantReactivePower',
                dataKey: 'q0',
                numeric: true,
                fractionDigits: 1,
            },
        ],
    },
};

export function TABLES_COLUMNS_NAMES() {
    return Object.values(TABLES_DEFINITIONS)
        .map((value) => value.columns)
        .map((cols) => cols.map((c) => c.id));
}

function generateTapRequest(type, leg) {
    const getLeg = leg !== undefined ? '.getLeg' + leg + '()' : '';
    return (
        'tap = equipment' +
        getLeg +
        '.get' +
        type +
        'TapChanger()\n' +
        'if (tap.getLowTapPosition() <= {} && {} < tap.getHighTapPosition() ) { \n' +
        '    tap.setTapPosition({})\n' +
        // to force update of transformer as sub elements changes like tapChanger are not detected
        '    equipment.setFictitious(equipment.isFictitious())\n' +
        '} else {\n' +
        "throw new Exception('incorrect value')\n" +
        ' }\n'
    );
}
