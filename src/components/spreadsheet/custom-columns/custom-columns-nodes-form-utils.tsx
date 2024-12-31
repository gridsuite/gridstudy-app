/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../components/utils/yup-config';

export const NODE_ALIAS = 'alias';
export const NODE_INFO = 'nodeInfo';
export const NODE_ID = 'nodeId';
export const NODE_NAME = 'nodeName';
export const NODES_ALIASES = 'nodesAliases';

export const initialCustomColumnNodesForm: CustomColumnNodesForm = {
    [NODES_ALIASES]: [
        { alias: 'alias1', nodeInfo: { nodeId: 'nodeId1', nodeName: 'name1' } },
        { alias: 'alias2', nodeInfo: { nodeId: 'nodeId2', nodeName: 'name2' } },
    ],
};

export const customColumnNodesFormSchema = yup.object().shape({
    [NODES_ALIASES]: yup
        .array()
        .of(
            yup.object().shape({
                [NODE_ALIAS]: yup.string().required().max(60, 'Column name must be at most 60 characters'),
                [NODE_INFO]: yup
                    .object()
                    .shape({
                        [NODE_ID]: yup.string().required(),
                        [NODE_NAME]: yup.string().required(),
                    })
                    .required(),
            })
        )
        .required(),
});

export type CustomColumnNodesForm = yup.InferType<typeof customColumnNodesFormSchema>;
