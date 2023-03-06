/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    ID,
    BUS_BAR_SECTIONS,
    HORIZONTAL_POSITION,
    VERTICAL_POSITION,
    SWITCH_KIND,
    TO_BBS,
    FROM_BBS,
    BUS_BAR_CONNECTIONS,
} from 'components/refactor/utils/field-constants';
import { findIndexesOfDuplicateFieldValues } from 'components/refactor/utils/utils';
import yup from 'components/refactor/utils/yup-config';

const buildValidationError = (errors, field) => {
    return errors.length === 0
        ? true
        : {
              name: 'ValidationError',
              path: `${field}`,
              errors: [],
              inner: errors,
          };
};

export const controleUniqueId = (values, message) => {
    const indexes = findIndexesOfDuplicateFieldValues(values, ID);
    return indexes?.length === 0
        ? true
        : {
              name: 'ValidationError',
              path: `${BUS_BAR_SECTIONS}`,
              errors: [],
              inner: indexes.map(
                  (index) =>
                      new yup.ValidationError(
                          message,
                          null,
                          `${BUS_BAR_SECTIONS}[${index}].${ID}`
                      )
              ),
          };
};

export const controleUniqueHorizontalVertical = (values, message) => {
    const errors = [];

    if (!values || !Array.isArray(values)) {
        // Return a validation error object if the busBarSections array is null or undefined
        return {
            name: 'ValidationError',
            path: `${BUS_BAR_SECTIONS}`,
            errors: [],
            inner: [],
        };
    }

    // Loop through each item in the array
    values.forEach((section, i) => {
        // Loop through each item in the array after the current item
        values.slice(i + 1).forEach((otherSection, j) => {
            const horizontalPosition = section?.[HORIZONTAL_POSITION];
            const verticalPosition = section?.[VERTICAL_POSITION];

            if (
                horizontalPosition === otherSection?.[HORIZONTAL_POSITION] &&
                verticalPosition === otherSection?.[VERTICAL_POSITION]
            ) {
                // If they are the same, add validation errors for both items
                errors.push(
                    new yup.ValidationError(
                        message,
                        null,
                        `${BUS_BAR_SECTIONS}[${i}].${HORIZONTAL_POSITION}`
                    ),
                    new yup.ValidationError(
                        message,
                        null,
                        `${BUS_BAR_SECTIONS}[${i}].${VERTICAL_POSITION}`
                    ),
                    new yup.ValidationError(
                        message,
                        null,
                        `${BUS_BAR_SECTIONS}[${
                            j + i + 1
                        }].${HORIZONTAL_POSITION}`
                    ),
                    new yup.ValidationError(
                        message,
                        null,
                        `${BUS_BAR_SECTIONS}[${j + i + 1}].${VERTICAL_POSITION}`
                    )
                );
            }
        });
    });

    return buildValidationError(errors, BUS_BAR_SECTIONS);
};

/*
 * Get BusBarSection indexes linked to itself
 */
const findBusBarSectionIndexesItSelf = (values) => {
    const indexes = [];
    values?.forEach((value, index) => {
        if (
            value[SWITCH_KIND] === 'DISCONNECTOR' &&
            value[FROM_BBS] === value[TO_BBS]
        ) {
            indexes.push(index);
        }
    });
    return indexes;
};

export const controleBusBarSectionLink = (values, message) => {
    const errors = [];
    const indexes = findBusBarSectionIndexesItSelf(values);
    if (indexes?.length > 0) {
        indexes.forEach((index) => {
            errors.push(
                new yup.ValidationError(
                    message,
                    null,
                    `${BUS_BAR_CONNECTIONS}[${index}].${FROM_BBS}`
                )
            );
            errors.push(
                new yup.ValidationError(
                    message,
                    null,
                    `${BUS_BAR_CONNECTIONS}[${index}].${TO_BBS}`
                )
            );
        });
    }

    return buildValidationError(errors, BUS_BAR_CONNECTIONS);
};
