/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const Line = { label: 'Lines', type: 'LINE' };
export const Generator = { label: 'Generators', type: 'GENERATOR' };
export const Load = { label: 'Loads', type: 'LOAD' };
export const Battery = { label: 'Batteries', type: 'BATTERY' };
export const SVC = {
    label: 'StaticVarCompensators',
    type: 'STATIC_VAR_COMPENSATOR',
};
export const DanglingLine = { label: 'DanglingLines', type: 'DANGLING_LINE' };
export const LCC = {
    label: 'LccConverterStations',
    type: 'LCC_CONVERTER_STATION',
};
export const VSC = {
    label: 'VscConverterStations',
    type: 'VSC_CONVERTER_STATION',
};
export const Hvdc = { label: 'HvdcLines', type: 'HVDC_LINE' };
export const BusBar = { label: 'BusBarSections', type: 'BUSBAR_SECTION' };
export const TwoWindingTransfo = {
    label: 'TwoWindingsTransformers',
    type: 'TWO_WINDINGS_TRANSFORMER',
};
export const ThreeWindingTransfo = {
    label: 'ThreeWindingsTransformers',
    type: 'THREE_WINDINGS_TRANSFORMER',
};
export const ShuntCompensator = {
    label: 'ShuntCompensators',
    type: 'SHUNT_COMPENSATOR',
};
export const VoltageLevel = {
    label: 'VoltageLevels',
    type: 'VOLTAGE_LEVEL',
};
export const Substation = {
    label: 'Substations',
    type: 'SUBSTATION',
};
