/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useMemo } from 'react';
import { Grid } from '@mui/material';
import { CustomFormProvider, type MuiStyles, type UseStateBooleanReturn } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import NodeConfigTable from './node-config-table';
import { UUID } from 'crypto';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';
import { NodeAlias } from '../../../types/node-alias.type';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import { initialNodesForm, NODES_ALIASES, NodesForm, nodesFormSchema } from './nodes-config-dialog.utils';

export type NodesConfigDialogProps = {
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
} as const satisfies MuiStyles;

const toCustomColumnNodesDialogFormValues = (nodeAliases: NodeAlias[]) => {
    return { [NODES_ALIASES]: nodeAliases };
};

export default function NodesConfigDialog({
    open,
    nodeAliases,
    updateNodeAliases,
    ...dialogProps
}: Readonly<NodesConfigDialogProps>) {
    const formMethods = useForm<NodesForm>({
        defaultValues: initialNodesForm,
        resolver: yupResolver(nodesFormSchema),
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

    const onValidate = (data: NodesForm) => {
        onClose();
        const completeData: NodeAlias[] = data.nodesAliases.map((nodeAlias) => {
            const id = nodes.find((node) => node.name === nodeAlias.name)?.id as UUID;
            return { id: id, name: nodeAlias.name, alias: nodeAlias.alias };
        });
        updateNodeAliases(completeData);
    };

    const onClose = () => {
        open.setFalse();
        reset(initialNodesForm);
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
        <CustomFormProvider validationSchema={nodesFormSchema} {...formMethods}>
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
                    <NodeConfigTable />
                </Grid>
            </ModificationDialog>
        </CustomFormProvider>
    );
}
