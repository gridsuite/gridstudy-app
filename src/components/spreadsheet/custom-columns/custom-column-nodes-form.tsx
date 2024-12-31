/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import { AutocompleteInput, TextInput } from '@gridsuite/commons-ui';
import GridItem from '../../dialogs/commons/grid-item';
import { NODE_ALIAS, NODE_INFO } from './custom-columns-nodes-form-utils';
import { useSelector } from 'react-redux';

type NodeInfo = {
    nodeName: string;
    nodeId: string;
};

const NodeAliasCreation = ({ name, index }) => {
    const treeModel = useSelector((state) => state.networkModificationTreeModel);
    const nodeInfos: NodeInfo[] = useMemo(
        () =>
            treeModel?.treeNodes.map((o) => {
                return {
                    nodeName: o.data.label,
                    nodeId: o.id,
                };
            }) ?? [],
        [treeModel]
    );

    const getNodeName = (nodeInfo: NodeInfo): string => {
        return nodeInfo.nodeName;
    };

    const nodeAliasField = (
        <TextInput name={`${name}.${index}.${NODE_ALIAS}`} label={'spreadsheet/parameter_aliases/node_alias'} />
    );

    const nodeNameField = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            //hack to work with freesolo autocomplete
            //setting null programatically when freesolo is enable wont empty the field
            name={`${name}.${index}.${NODE_INFO}`}
            label={'spreadsheet/parameter_aliases/node_name'}
            options={nodeInfos}
            getOptionLabel={getNodeName}
            inputTransform={(value) => (value === null ? '' : value)}
            outputTransform={(value) => value}
            size={'small'}
            formProps={{ margin: 'normal' }}
        />
    );

    return (
        <>
            <GridItem size={3}>{nodeAliasField}</GridItem>
            <GridItem size={2}>{nodeNameField}</GridItem>
        </>
    );
};

export default NodeAliasCreation;
