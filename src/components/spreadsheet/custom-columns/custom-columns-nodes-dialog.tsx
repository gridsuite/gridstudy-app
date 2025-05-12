/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useMemo } from 'react';
import { Grid } from '@mui/material';
import { CustomFormProvider, UseStateBooleanReturn } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import {
    CustomColumnNodesForm,
    customColumnNodesFormSchema,
    initialCustomColumnNodesForm,
    NODES_ALIASES,
} from './custom-columns-nodes-form-utils';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';
import NodeAliasTable from './node-alias-table';
import { UUID } from 'crypto';
import { NodeAlias } from './node-alias.type';
import { CurrentTreeNode } from '../../graph/tree-node.type';

export type CustomColumnNodesDialogProps = {
    open: UseStateBooleanReturn;
    nodeAliases: NodeAlias[] | undefined;
    updateNodeAliases: (newNodeAliases: NodeAlias[]) => void;
};

const styles = {
    dialogContent: {
        width: '40%',
        height: '55%',
        maxWidth: 'none',
        margin: 'auto',
    },
};

const toCustomColumnNodesDialogFormValues = (nodeAliases: NodeAlias[]) => {
    return { [NODES_ALIASES]: nodeAliases };
};

export default function CustomColumnNodesDialog({
    open,
    nodeAliases,
    updateNodeAliases,
    ...dialogProps
}: Readonly<CustomColumnNodesDialogProps>) {
    const formMethods = useForm<CustomColumnNodesForm>({
        defaultValues: initialCustomColumnNodesForm,
        resolver: yupResolver(customColumnNodesFormSchema),
    });

    const treeModel = useSelector((state: AppState) => state.networkModificationTreeModel);
    const nodes = useMemo(
        () =>
            treeModel?.treeNodes.map((currentTreeNode: CurrentTreeNode) => {
                return { name: currentTreeNode.data.label, id: currentTreeNode.id };
            }) ?? [],
        [treeModel]
    );

    const { reset } = formMethods;

    const onValidate = (data: CustomColumnNodesForm) => {
        onClose();
        const completeData: NodeAlias[] = data.nodesAliases.map((nodeAlias) => {
            const id = nodes.find((node) => node.name === nodeAlias.name)?.id as UUID;
            return { id: id, name: nodeAlias.name, alias: nodeAlias.alias };
        });
        updateNodeAliases(completeData);
    };

    const onClose = () => {
        open.setFalse();
        reset(initialCustomColumnNodesForm);
    };

    useEffect(() => {
        if (open.value && nodeAliases != null) {
            let selected = { selected: false };
            reset(
                toCustomColumnNodesDialogFormValues(
                    nodeAliases.map((value) => {
                        return { ...value, ...selected };
                    })
                )
            );
        }
    }, [open, nodeAliases, reset]);

    return (
        <CustomFormProvider validationSchema={customColumnNodesFormSchema} {...formMethods}>
            <ModificationDialog
                titleId={'spreadsheet/custom_column/parameter_nodes'}
                open={open.value}
                onClose={onClose}
                onSave={onValidate}
                onClear={() => null}
                PaperProps={{ sx: styles.dialogContent }}
                {...dialogProps}
            >
                <Grid container>
                    <NodeAliasTable />
                </Grid>
            </ModificationDialog>
        </CustomFormProvider>
    );
}
