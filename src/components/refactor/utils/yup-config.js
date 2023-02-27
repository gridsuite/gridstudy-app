/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as yup from 'yup';
import { HORIZONTAL_POSITION, ID, VERTICAL_POSITION } from './field-constants';

/* yup.addMethod(yup.array, 'unique', function (message, mapper = (a) => a) {
    return this.test('unique-ids', 'Ids must be unique', function (values) {
        const ids = values.map((value) => value[ID]);
        const uniqueIds = new Set(ids);
        return ids.length === uniqueIds.size;
    });
}); */

yup.addMethod(
    yup.array,
    'unique',
    function (fieldName, message, mapper = (a) => a) {
        return this.test('unique-fields', message, function (values) {
            const fields = values.map((value) => value[fieldName]);
            const uniqueFields = new Set(fields);
            return fields.length === uniqueFields.size;
        });
    }
);

/* yup.addMethod(
    yup.array,
    'uniqueHorizontalVertical',
    function (message, mapper = (a) => a) {
        return this.test(
            'unique-horizontal-vertical',
            message,
            function (values) {
                const fields = values.filter(
                    (value, index) => values.indexOf(value) === index
                );
                return fields.length === values.size;
            }
        );
    }
); */

yup.addMethod(
    yup.array,
    'uniqueHorizontalVertical',
    function (message, mapper = (a) => a) {
        return this.test(
            'unique-positions',
            'Horizontal and Vertical positions must be unique',
            function (value) {
                const horizontalPositions = value.map(
                    (v) => v[HORIZONTAL_POSITION]
                );
                const verticalPositions = value.map(
                    (v) => v[VERTICAL_POSITION]
                );
                const uniqueHorizontalPositions = new Set(horizontalPositions);
                const uniqueVerticalPositions = new Set(verticalPositions);
                if (
                    horizontalPositions.length ===
                        uniqueHorizontalPositions.size &&
                    verticalPositions.length === uniqueVerticalPositions.size
                ) {
                    return true;
                } else {
                    return false;
                    /*  return this.createError({
                        message:
                            'Horizontal and Vertical positions must be unique for each object',
                        path: `${this.path}[${value.findIndex(
                            (v) =>
                                v[HORIZONTAL_POSITION] ===
                                    v[HORIZONTAL_POSITION] &&
                                v[VERTICAL_POSITION] === v[VERTICAL_POSITION]
                        )}]`,
                    }); */
                }
            }
        );
    }
);

const uniqueHorizontalVertical = () => {
    const set = new Set();
    return yup
        .mixed()
        .test(
            'uniqueHorizontalVertical',
            '${path} contains a duplicate HORIZONTAL_POSITION or VERTICAL_POSITION',
            function (value) {
                const { HORIZONTAL_POSITION, VERTICAL_POSITION } =
                    this.options.context;
                const key = `${value[HORIZONTAL_POSITION]},${value[VERTICAL_POSITION]}`;
                if (set.has(key)) {
                    return false;
                }
                set.add(key);
                return true;
            }
        );
};

yup.addMethod(yup.number, 'uniqueHorizontalVertical', uniqueHorizontalVertical);
yup.addMethod(yup.object, 'uniqueHorizontalVertical', uniqueHorizontalVertical);

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
