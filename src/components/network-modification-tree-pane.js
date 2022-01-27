/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import {
    fetchNetworkModificationTree,
    fetchNetworkModificationTreeNode,
} from '../utils/rest-api';
import {
    loadNetworkModificationTreeSuccess,
    networkModificationTreeNodeAdded,
    networkModificationTreeNodesRemoved,
    networkModificationTreeNodesUpdated,
    selectTreeNode,
} from '../redux/actions';
import NetworkModificationTreeModel from './graph/network-modification-tree-model';
import { displayErrorMessageWithSnackbar, useIntlRef } from '../utils/messages';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import NetworkModificationTree from './network-modification-tree';
import PropTypes from 'prop-types';

export const NetworkModificationTreePane = ({
    studyUuid,
    closeDrawerNodeEditor,
    drawerNodeEditorOpen,
}) => {
    const treeModel = useSelector(
        (state) => state.networkModificationTreeModel
    );

    const intlRef = useIntlRef();
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    useEffect(() => {
        console.info(
            `Loading network modification tree of study '${studyUuid}'...`
        );

        fetchNetworkModificationTree(studyUuid)
            .then((tree) => {
                dispatch(selectTreeNode(tree.id));

                const networkModificationTreeModel =
                    new NetworkModificationTreeModel();
                networkModificationTreeModel.setTreeElements(tree);
                networkModificationTreeModel.updateLayout();
                dispatch(
                    loadNetworkModificationTreeSuccess(
                        networkModificationTreeModel
                    )
                );
            })
            .catch((errorMessage) =>
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'NetworkModificationTreeLoadError',
                        intlRef: intlRef,
                    },
                })
            )
            .finally(() =>
                console.debug('Network modification tree loading finished')
            );
        // Note: studyUuid and dispatch don't change
    }, [studyUuid, enqueueSnackbar, intlRef, dispatch]);

    const updateNodes = useCallback(
        (updatedNodesIds) => {
            Promise.all(
                updatedNodesIds.map((nodeId) =>
                    fetchNetworkModificationTreeNode(studyUuid, nodeId)
                )
            ).then((values) => {
                dispatch(networkModificationTreeNodesUpdated(values));
            });
        },
        [studyUuid, dispatch]
    );

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'nodeCreated'
            ) {
                fetchNetworkModificationTreeNode(
                    studyUuid,
                    studyUpdatedForce.eventData.headers['newNode']
                ).then((node) => {
                    dispatch(
                        networkModificationTreeNodeAdded(
                            node,
                            studyUpdatedForce.eventData.headers['node']
                        )
                    );
                });
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'nodeDeleted'
            ) {
                dispatch(
                    networkModificationTreeNodesRemoved(
                        studyUpdatedForce.eventData.headers['nodes']
                    )
                );
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'nodeUpdated'
            ) {
                updateNodes(studyUpdatedForce.eventData.headers['nodes']);
            }
        }
    }, [studyUuid, studyUpdatedForce, updateNodes, dispatch]);

    return (
        <NetworkModificationTree
            treeModel={treeModel}
            closeDrawerNodeEditor={closeDrawerNodeEditor}
            drawerNodeEditorOpen={drawerNodeEditorOpen}
        />
    );
};

export default NetworkModificationTreePane;

NetworkModificationTreePane.propTypes = {
    studyUuid: PropTypes.string.isRequired,
    drawerNodeEditorOpen: PropTypes.bool.isRequired,
    closeDrawerNodeEditor: PropTypes.func.isRequired,
};
