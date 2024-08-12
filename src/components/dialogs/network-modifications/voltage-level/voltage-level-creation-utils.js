/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { COUPLING_OMNIBUS, BUS_BAR_SECTION_ID1, BUS_BAR_SECTION_ID2 } from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';

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

/*
 * Get BusBarSection indexes linked to itself
 */
const findBusBarSectionIndexesItSelf = (values) => {
    const indexes = [];
    values?.forEach((value, index) => {
        if (value[BUS_BAR_SECTION_ID1] === value[BUS_BAR_SECTION_ID2]) {
            indexes.push(index);
        }
    });
    return indexes;
};

export const controlCouplingOmnibusBetweenSections = (values, message) => {
    const errors = [];
    const indexes = findBusBarSectionIndexesItSelf(values);
    if (indexes?.length > 0) {
        indexes.forEach((index) => {
            errors.push(new yup.ValidationError(message, null, `${COUPLING_OMNIBUS}[${index}].${BUS_BAR_SECTION_ID1}`));
            errors.push(new yup.ValidationError(message, null, `${COUPLING_OMNIBUS}[${index}].${BUS_BAR_SECTION_ID2}`));
        });
    }

    return buildValidationError(errors, COUPLING_OMNIBUS);
};
