/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import { NODE_ALIAS, NODE_NAME, NODES_ALIASES } from './custom-columns-nodes-form-utils';
import { useSelector } from 'react-redux';
import DndTable from '../../utils/dnd-table/dnd-table';
import { SELECTED } from '../../utils/field-constants';
import { useFieldArray } from 'react-hook-form';
import { useIntl } from 'react-intl';

const NodeAliasTable = () => {
    const treeModel = useSelector((state) => state.networkModificationTreeModel);
    const nodeNames: string[] = useMemo(
        () =>
            treeModel?.treeNodes.map((o) => {
                return o.data.label;
            }) ?? [],
        [treeModel]
    );
    const intl = useIntl();

    const useNodesAliasesFieldArrayOutput = useFieldArray({
        name: `${NODES_ALIASES}`,
    });

    const NODES_ALIASES_COLUMNS_DEFINITIONS = useMemo(() => {
        return [
            {
                label: intl.formatMessage({ id: 'spreadsheet/parameter_aliases/node_alias' }),
                dataKey: NODE_ALIAS,
                editable: true,
                initialValue: '',
                showErrorMsg: true,
                width: '30%',
                maxWidth: '30%',
            },
            {
                label: intl.formatMessage({ id: 'spreadsheet/parameter_aliases/node_name' }),
                dataKey: NODE_NAME,
                initialValue: '',
                editable: true,
                autocomplete: true,
                options: nodeNames,
                width: '30%',
                maxWidth: '30%',
            },
        ];
    }, [intl, nodeNames]);

    const newAliasRowData = useMemo(() => {
        const newRowData = {};
        newRowData[SELECTED] = false;
        NODES_ALIASES_COLUMNS_DEFINITIONS.forEach((column) => (newRowData[column.dataKey] = column.initialValue));
        return newRowData;
    }, [NODES_ALIASES_COLUMNS_DEFINITIONS]);

    const createNodeAliasRows = () => {
        return [newAliasRowData];
    };

    return (
        <>
            <DndTable
                arrayFormName={`${NODES_ALIASES}`}
                columnsDefinition={NODES_ALIASES_COLUMNS_DEFINITIONS}
                useFieldArrayOutput={useNodesAliasesFieldArrayOutput}
                createRows={createNodeAliasRows}
                withAddRowsDialog={false}
                withLeftButtons={false}
            />
        </>
    );
};

export default NodeAliasTable;
