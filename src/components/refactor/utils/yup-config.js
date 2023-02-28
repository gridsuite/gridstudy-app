/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import * as yup from 'yup';
import {
    BUS_BAR_SECTIONS,
    HORIZONTAL_POSITION,
    VERTICAL_POSITION,
} from './field-constants';

const SameHorizAndVertPosMessage = (
    <FormattedMessage id={'SameHorizAndVertPos'} />
);

yup.addMethod(
    yup.array,
    'unique',
    function (fieldName, message, mapper = (a) => a) {
        return this.test('unique-fields', message, function (values) {
            const counts = new Map();
            values.forEach((element, index) => {
                const id = element[fieldName];
                counts.set(id, (counts.get(id) || []).concat(index));
            });
            const result = [...counts.values()]
                .filter((indexes) => indexes.length > 1)
                .flat();
            return result?.length === 0
                ? true
                : {
                      name: 'ValidationError',
                      path: `${BUS_BAR_SECTIONS}`,
                      errors: [],
                      inner: result.map(
                          (index) =>
                              new yup.ValidationError(
                                  message?.props?.id,
                                  null,
                                  `${BUS_BAR_SECTIONS}[${index}].${fieldName}`
                              )
                      ),
                  };
        });
    }
);

yup.addMethod(
    yup.array,
    'uniqueHorizontalVertical',
    function (message, mapper = (a) => a) {
        // Return a yup test function that validates the array
        return this.test(
            // Set the name of the validation rule
            'unique-positions',
            // Set the error message to display if the validation fails
            'Horizontal and Vertical positions must be unique',
            function (values) {
                // Initialize the errors and indexes arrays
                let errors = [];
                let indexs = [];

                // Loop through each item in the array
                for (let i = 0; i < values.length; i++) {
                    // Loop through each item in the array after the current item
                    for (let j = i + 1; j < values.length; j++) {
                        // Check if the horizontal and vertical positions are the same
                        if (
                            !indexs.includes(j) &&
                            values[j]?.[HORIZONTAL_POSITION] ===
                                values[i]?.[HORIZONTAL_POSITION] &&
                            values[j]?.[VERTICAL_POSITION] ===
                                values[i]?.[VERTICAL_POSITION]
                        ) {
                            // If they are the same, add validation errors for both items
                            errors.push(
                                new yup.ValidationError(
                                    SameHorizAndVertPosMessage?.props?.id,
                                    null,
                                    `${BUS_BAR_SECTIONS}[${i}].${HORIZONTAL_POSITION}`
                                ),
                                new yup.ValidationError(
                                    SameHorizAndVertPosMessage?.props?.id,
                                    null,
                                    `${BUS_BAR_SECTIONS}[${i}].${VERTICAL_POSITION}`
                                ),
                                new yup.ValidationError(
                                    SameHorizAndVertPosMessage?.props?.id,
                                    null,
                                    `${BUS_BAR_SECTIONS}[${j}].${HORIZONTAL_POSITION}`
                                ),
                                new yup.ValidationError(
                                    SameHorizAndVertPosMessage?.props?.id,
                                    null,
                                    `${BUS_BAR_SECTIONS}[${j}].${VERTICAL_POSITION}`
                                )
                            );
                        }
                    }
                }

                return errors?.length === 0
                    ? true
                    : // Return a validation error object if there are any errors
                      {
                          name: 'ValidationError',
                          path: `${BUS_BAR_SECTIONS}`,
                          errors: [],
                          inner: errors,
                      };
            }
        );
    }
);

yup.setLocale({
    mixed: {
        required: 'YupRequired',
        notType: ({ type }) => {
            if (type === 'number') {
                return 'YupNotTypeNumber';
            } else {
                return 'YupNotTypeDefault';
            }
        },
    },
});

export default yup;
