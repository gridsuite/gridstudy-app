/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { fetchNetworkModificationTreeNode } from '../utils/rest-api';
import {
    networkModificationTreeNodeAdded,
    networkModificationTreeNodesRemoved,
    networkModificationTreeNodesUpdated,
} from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import NetworkModificationTree from './network-modification-tree';
import PropTypes from 'prop-types';

export const NetworkModificationTreePane = ({
    studyUuid,
    drawerNodeEditorOpen,
    closeDrawerNodeEditor,
    studyMapTreeDisplay,
}) => {
    const treeModel = useSelector(
        (state) => state.networkModificationTreeModel
    );

    const dispatch = useDispatch();
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

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
            drawerNodeEditorOpen={drawerNodeEditorOpen}
            closeDrawerNodeEditor={closeDrawerNodeEditor}
            studyMapTreeDisplay={studyMapTreeDisplay}
        />
    );
};

export default NetworkModificationTreePane;

NetworkModificationTreePane.propTypes = {
    studyUuid: PropTypes.string.isRequired,
    drawerNodeEditorOpen: PropTypes.bool.isRequired,
    closeDrawerNodeEditor: PropTypes.func.isRequired,
    studyMapTreeDisplay: PropTypes.string.isRequired,
};
