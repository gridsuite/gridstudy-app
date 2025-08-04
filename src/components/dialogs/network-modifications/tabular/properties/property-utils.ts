/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import yup from 'components/utils/yup-config';
import { TABULAR_PROPERTIES, NAME, PREDEFINED, SELECTED } from 'components/utils/field-constants';

export const PROPERTY_CSV_COLUMN_PREFIX = 'property_';

export type TabularProperty = {
    [NAME]: string;
    [PREDEFINED]: boolean;
    [SELECTED]: boolean;
};

export type TabularProperties = {
    [TABULAR_PROPERTIES]?: TabularProperty[];
};

export const emptyProperties: TabularProperties = {
    [TABULAR_PROPERTIES]: [] as TabularProperty[],
};

export const buildPredefinedProperties = (names: string[]) => {
    let properties: TabularProperty[] = [];
    names.forEach((name) => {
        properties.push({
            [NAME]: name,
            [PREDEFINED]: true,
            [SELECTED]: false,
        });
    });
    return {
        [TABULAR_PROPERTIES]: properties,
    };
};

export const initializedProperty = (): TabularProperty => {
    return {
        [NAME]: '',
        [PREDEFINED]: false,
        [SELECTED]: true,
    };
};

export const propertiesSchema = yup.object({
    [TABULAR_PROPERTIES]: yup
        .array()
        .of(
            yup.object().shape({
                [NAME]: yup.string().required(),
                [PREDEFINED]: yup.boolean().required(),
                [SELECTED]: yup.boolean().required(),
            })
        )
        .test('checkUniqueProperties', 'DuplicatedPropsError', (values) => checkUniquePropertyNames(values)),
});

const checkUniquePropertyNames = (
    properties:
        | {
              name: string;
          }[]
        | undefined
) => {
    if (properties === undefined) {
        return true;
    }
    const validValues = properties.filter((v) => v.name);
    return validValues.length === new Set(validValues.map((v) => v.name)).size;
};

export type PropertiesFormType = yup.InferType<typeof propertiesSchema>;
