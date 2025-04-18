/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../components/utils/yup-config';
import { areArrayElementsUnique } from '../../utils/utils';

export const NODE_ALIAS = 'alias';
export const NODE_NAME = 'name';
export const NODES_ALIASES = 'nodesAliases';

export const initialCustomColumnNodesForm: CustomColumnNodesForm = {
    [NODES_ALIASES]: [],
};

export const customColumnNodesFormSchema = yup.object().shape({
    [NODES_ALIASES]: yup
        .array()
        .of(
            yup.object().shape({
                [NODE_ALIAS]: yup
                    .string()
                    .default('')
                    .required()
                    .test(
                        'maxSize',
                        'spreadsheet/parameter_aliases/max_characters_reached',
                        (value) => value.length < 11
                    )
                    .test('noSpecialCharacters', 'spreadsheet/parameter_aliases/no_special_characters', (value) =>
                        /^([a-zA-Z0-9])+$/.test(value)
                    ),
                [NODE_NAME]: yup.string().default('').required(),
            })
        )
        .required()
        .test('distinctAliases', 'spreadsheet/parameter_aliases/unique_aliases', (array) => {
            //filter to remove empty values, so we don't get this error instead of required when 2 fields are empty
            const aliasesArray = array.map((l) => l[NODE_ALIAS]).filter((value) => value);
            return areArrayElementsUnique(aliasesArray);
        })
        .test('uniqueNodeNames', 'spreadsheet/parameter_aliases/unique_node_names', (array) => {
            const nodeNamesArray = array.map((l) => l[NODE_NAME]).filter((value) => value);
            return areArrayElementsUnique(nodeNamesArray);
        }),
});

export type CustomColumnNodesForm = yup.InferType<typeof customColumnNodesFormSchema>;
