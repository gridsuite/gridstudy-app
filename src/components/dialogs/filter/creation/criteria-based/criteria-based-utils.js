/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import CountriesInput from '../../../utils/rhf-inputs/select-inputs/countries-input';
import {
    COUNTRIES,
    COUNTRIES_1,
    COUNTRIES_2,
    CRITERIA_BASED,
    ENERGY_SOURCE,
    NOMINAL_VOLTAGE,
    NOMINAL_VOLTAGE_1,
    NOMINAL_VOLTAGE_2,
    NOMINAL_VOLTAGE_3,
} from '../../../utils/field-constants';
import RangeInput, {
    DEFAULT_RANGE_VALUE,
    getRangeInputDataForm,
    getRangeInputSchema,
} from '../../../utils/rhf-inputs/range-input';
import yup from '../../../utils/yup-config';
import SelectInput from '../../../utils/rhf-inputs/select-inputs/select-input';

const countries = {
    renderer: CountriesInput,
    props: {
        label: 'Countries',
        name: `${CRITERIA_BASED}.${COUNTRIES}`,
    },
};

const countries1 = {
    renderer: CountriesInput,
    props: {
        label: 'Countries1',
        name: `${CRITERIA_BASED}.${COUNTRIES_1}`,
    },
};

const countries2 = {
    renderer: CountriesInput,
    props: {
        label: 'Countries2',
        name: `${CRITERIA_BASED}.${COUNTRIES_2}`,
    },
};

const nominalVoltage = {
    renderer: RangeInput,
    props: {
        label: 'nominalVoltage',
        name: `${CRITERIA_BASED}.${NOMINAL_VOLTAGE}`,
    },
};

const nominalVoltage1 = {
    renderer: RangeInput,
    props: {
        label: 'nominalVoltage1',
        name: `${CRITERIA_BASED}.${NOMINAL_VOLTAGE_1}`,
    },
};

const nominalVoltage2 = {
    renderer: RangeInput,
    props: {
        label: 'nominalVoltage2',
        name: `${CRITERIA_BASED}.${NOMINAL_VOLTAGE_2}`,
    },
};

const nominalVoltage3 = {
    renderer: RangeInput,
    props: {
        label: 'nominalVoltage3',
        name: `${CRITERIA_BASED}.${NOMINAL_VOLTAGE_3}`,
    },
};

const energySource = {
    renderer: SelectInput,
    props: {
        label: 'EnergySourceText',
        name: `${CRITERIA_BASED}.${ENERGY_SOURCE}`,
        options: [
            { id: 'HYDRO', label: 'Hydro' },
            { id: 'NUCLEAR', label: 'Nuclear' },
            { id: 'WIND', label: 'Wind' },
            { id: 'THERMAL', label: 'Thermal' },
            { id: 'SOLAR', label: 'Solar' },
            { id: 'OTHER', label: 'Other' },
        ],
    },
};

export const CONTINGENCY_LIST_EQUIPMENTS = {
    LINE: {
        id: 'LINE',
        label: 'Lines',
        fields: [countries1, countries2, nominalVoltage1, nominalVoltage2],
    },
    TWO_WINDINGS_TRANSFORMER: {
        id: 'TWO_WINDINGS_TRANSFORMER',
        label: 'TwoWindingsTransformers',
        fields: [countries, nominalVoltage1, nominalVoltage2],
    },
    GENERATOR: {
        id: 'GENERATOR',
        label: 'Generators',
        fields: [countries, nominalVoltage],
    },
    SHUNT_COMPENSATOR: {
        id: 'SHUNT_COMPENSATOR',
        label: 'ShuntCompensators',
        fields: [countries, nominalVoltage],
    },
    HVDC_LINE: {
        id: 'HVDC_LINE',
        label: 'HvdcLines',
        fields: [countries1, countries2, nominalVoltage],
    },
    BUSBAR_SECTION: {
        id: 'BUSBAR_SECTION',
        label: 'BusBarSections',
        fields: [countries, nominalVoltage],
    },
    DANGLING_LINE: {
        id: 'DANGLING_LINE',
        label: 'DanglingLines',
        fields: [countries, nominalVoltage],
    },
};

export const FILTER_EQUIPMENTS = {
    ...CONTINGENCY_LIST_EQUIPMENTS,
    THREE_WINDINGS_TRANSFORMER: {
        id: 'THREE_WINDINGS_TRANSFORMER',
        label: 'ThreeWindingsTransformers',
        fields: [countries, nominalVoltage1, nominalVoltage2, nominalVoltage3],
    },
    GENERATOR: {
        id: 'GENERATOR',
        label: 'Generators',
        fields: [countries, energySource, nominalVoltage],
    },
    LOAD: {
        id: 'LOAD',
        label: 'Loads',
        fields: [countries, nominalVoltage],
    },
    BATTERY: {
        id: 'BATTERY',
        label: 'Batteries',
        fields: [countries, nominalVoltage],
    },
    LCC_CONVERTER_STATION: {
        id: 'LCC_CONVERTER_STATION',
        label: 'LccConverterStations',
        fields: [countries, nominalVoltage],
    },
    VSC_CONVERTER_STATION: {
        id: 'VSC_CONVERTER_STATION',
        label: 'VscConverterStations',
        fields: [countries, nominalVoltage],
    },
    VOLTAGE_LEVEL: {
        id: 'VOLTAGE_LEVEL',
        label: 'VoltageLevels',
        fields: [countries, nominalVoltage],
    },
    SUBSTATION: {
        id: 'SUBSTATION',
        label: 'Substations',
        fields: [countries, nominalVoltage],
    },
};

export const getCriteriaBasedSchema = (extraFields) => ({
    [CRITERIA_BASED]: yup.object().shape({
        [COUNTRIES]: yup.array().of(yup.string()),
        [COUNTRIES_1]: yup.array().of(yup.string()),
        [COUNTRIES_2]: yup.array().of(yup.string()),
        ...getRangeInputSchema(NOMINAL_VOLTAGE),
        ...getRangeInputSchema(NOMINAL_VOLTAGE_1),
        ...getRangeInputSchema(NOMINAL_VOLTAGE_2),
        ...getRangeInputSchema(NOMINAL_VOLTAGE_3),
        ...extraFields,
    }),
});

export const getCriteriaBasedFormData = (criteriaValues, extraFields) => ({
    [CRITERIA_BASED]: {
        [COUNTRIES]: criteriaValues?.[COUNTRIES] ?? [],
        [COUNTRIES_1]: criteriaValues?.[COUNTRIES_1] ?? [],
        [COUNTRIES_2]: criteriaValues?.[COUNTRIES_2] ?? [],
        ...getRangeInputDataForm(
            NOMINAL_VOLTAGE,
            criteriaValues?.[NOMINAL_VOLTAGE] ?? DEFAULT_RANGE_VALUE
        ),
        ...getRangeInputDataForm(
            NOMINAL_VOLTAGE_1,
            criteriaValues?.[NOMINAL_VOLTAGE_1] ?? DEFAULT_RANGE_VALUE
        ),
        ...getRangeInputDataForm(
            NOMINAL_VOLTAGE_2,
            criteriaValues?.[NOMINAL_VOLTAGE_2] ?? DEFAULT_RANGE_VALUE
        ),
        ...getRangeInputDataForm(
            NOMINAL_VOLTAGE_3,
            criteriaValues?.[NOMINAL_VOLTAGE_3] ?? DEFAULT_RANGE_VALUE
        ),
        ...extraFields,
    },
});
