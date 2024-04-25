/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import yup from 'components/utils/yup-config';
import {
    ADDED,
    ADDITIONAL_PROPERTIES,
    DELETION_MARK,
    NAME,
    PREVIOUS_VALUE,
    VALUE,
} from 'components/utils/field-constants';
import { fetchAppsAndUrls } from '../../../../../services/utils';
import { isBlankOrEmpty } from 'components/utils/validation-functions';

export type Property = {
    [NAME]: string | null;
    [VALUE]: string | null;
    [PREVIOUS_VALUE]: string | null;
    [DELETION_MARK]: boolean;
    [ADDED]: boolean;
};

type Properties = {
    [ADDITIONAL_PROPERTIES]: Property[];
};

export type PredefinedProperties = {
    [propertyName: string]: string[];
};

type Equipment = {
    properties: Record<string, string> | undefined;
};

interface Metadata {
    name: string;
    url: string;
    appColor: string;
    hiddenInAppsMenu: boolean;
    resources: unknown;
}

interface StudyMetadata extends Metadata {
    name: 'Study';
    predefinedEquipmentProperties: {
        [networkElementType: string]: PredefinedProperties;
    };
}

const isStudyMetadata = (metadata: Metadata): metadata is StudyMetadata => {
    return metadata.name === 'Study';
};

export const fetchPredefinedProperties = (
    networkElementType: string
): Promise<PredefinedProperties | undefined> => {
    return fetchAppsAndUrls().then((res: [Metadata]) => {
        const studyMetadata = res.filter(isStudyMetadata);
        if (!studyMetadata) {
            return Promise.reject('Study entry could not be found in metadata');
        }

        return studyMetadata[0].predefinedEquipmentProperties?.[
            networkElementType
        ]; // There should be only one study metadata
    });
};

export const emptyProperties: Properties = {
    [ADDITIONAL_PROPERTIES]: [],
};

export const initializedProperty = (): Property => {
    return {
        [NAME]: null,
        [VALUE]: null,
        [PREVIOUS_VALUE]: null,
        [DELETION_MARK]: false,
        [ADDED]: true,
    };
};

export const getPropertiesFromModification = (
    properties: Property[] | undefined
): Properties => {
    return {
        [ADDITIONAL_PROPERTIES]: properties
            ? properties.map((p) => {
                  return {
                      [NAME]: p[NAME],
                      [VALUE]: p[VALUE],
                      [PREVIOUS_VALUE]: p[PREVIOUS_VALUE],
                      [ADDED]: p[ADDED],
                      [DELETION_MARK]: p[DELETION_MARK],
                  };
              })
            : [],
    };
};

export const copyEquipmentPropertiesForCreation = (
    equipmentInfos: Equipment
): Properties => {
    return {
        [ADDITIONAL_PROPERTIES]: equipmentInfos.properties
            ? Object.entries(equipmentInfos.properties).map(([name, value]) => {
                  return {
                      [NAME]: name,
                      [VALUE]: value,
                      [PREVIOUS_VALUE]: null,
                      [DELETION_MARK]: false,
                      [ADDED]: true,
                  };
              })
            : [],
    };
};

export function getConcatenatedProperties(
    equipment: any,
    getValues: (name: string) => any
): any {
    // ex: current Array [ {Object {  name: "p1", value: "v2", previousValue: undefined, added: true, deletionMark: false } }, {...} ]
    const modificationProperties = getValues(ADDITIONAL_PROPERTIES);
    return mergeModificationAndEquipmentProperties(
        modificationProperties,
        equipment
    );
}

/*
    We first load modification properties (empty at creation but could be filled later on), then we load properties
    already present on the equipment (network). If one of the equipment properties key is present in the modification
    we update the previousValue of this one, it means the modification change the network property value.
    If not we add it as an unmodified property. We will be able to delete it or modify its value, but not it's name.
 */
export const mergeModificationAndEquipmentProperties = (
    modificationProperties: Property[],
    equipment: Equipment
): Property[] => {
    const newModificationProperties = new Map<string, Property>();
    for (const property of modificationProperties) {
        if (property.name !== null) {
            newModificationProperties.set(property.name, property);
        }
    }
    if (equipment.properties !== undefined) {
        Object.entries(equipment.properties).forEach(([name, value]) => {
            if (name !== null) {
                let propertyToAdd;
                // If the property is present in the modification and in the equipment
                if (newModificationProperties.has(name)) {
                    const modProperty = newModificationProperties.get(name)!;
                    propertyToAdd = {
                        ...modProperty,
                        previousValue: value, // We set previous value of the modification to the equipment value
                    };
                } else {
                    propertyToAdd = {
                        [NAME]: name,
                        [VALUE]: null,
                        [PREVIOUS_VALUE]: value,
                        [DELETION_MARK]: false,
                        [ADDED]: false,
                    };
                }
                newModificationProperties.set(name, propertyToAdd);
            }
        });
    }
    return Array.from(newModificationProperties.values());
};

export const toModificationProperties = (properties: Properties) => {
    const filteredProperties = properties[ADDITIONAL_PROPERTIES]?.filter(
        (p: Property) => !isBlankOrEmpty(p.value) || p[DELETION_MARK]
    );
    return filteredProperties?.length === 0 ? undefined : filteredProperties;
};

export const creationPropertiesSchema = yup.object({
    [ADDITIONAL_PROPERTIES]: yup
        .array()
        .of(
            yup.object().shape({
                [NAME]: yup.string().required(),
                [VALUE]: yup.string().required(),
                [PREVIOUS_VALUE]: yup.string().nullable(),
                [DELETION_MARK]: yup.boolean().required(),
                [ADDED]: yup.boolean().required(),
            })
        )
        .test('checkUniqueProperties', 'DuplicatedPropsError', (values) =>
            checkUniquePropertyNames(values)
        ),
});

export const modificationPropertiesSchema = yup.object({
    [ADDITIONAL_PROPERTIES]: yup
        .array()
        .of(
            yup.object().shape({
                [NAME]: yup.string().required(),
                [VALUE]: yup
                    .string()
                    .nullable()
                    .when([PREVIOUS_VALUE, DELETION_MARK], {
                        is: (
                            previousValue: string | null,
                            deletionMark: boolean
                        ) => previousValue === null && !deletionMark,
                        then: (schema) => schema.required(),
                    }),
                [PREVIOUS_VALUE]: yup.string().nullable(),
                [DELETION_MARK]: yup.boolean().required(),
                [ADDED]: yup.boolean().required(),
            })
        )
        .test('checkUniqueProperties', 'DuplicatedPropsError', (values) =>
            checkUniquePropertyNames(values)
        ),
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
