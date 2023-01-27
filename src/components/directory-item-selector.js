/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchDirectoryContent,
    fetchElementsMetadata,
    fetchRootFolders,
} from '../utils/rest-api';
import makeStyles from '@mui/styles/makeStyles';
import {
    getFileIcon,
    elementType,
    useSnackMessage,
    TreeViewFinder,
} from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { notificationType } from '../utils/NotificationType';

const useStyles = makeStyles((theme) => ({
    icon: {
        marginRight: theme.spacing(1),
        width: '18px',
        height: '18px',
    },
}));

const DirectoryItemSelector = (props) => {
    const [data, setData] = useState([]);
    const [rootDirectories, setRootDirectories] = useState([]);
    const nodeMap = useRef({});
    const classes = useStyles();
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);
    const dataRef = useRef([]);
    dataRef.current = data;

    const rootsRef = useRef([]);
    rootsRef.current = rootDirectories;
    const { snackError } = useSnackMessage();
    const openRef = useRef();
    openRef.current = props.open;
    const contentFilter = useCallback(
        () => new Set([elementType.DIRECTORY, ...props.types]),
        [props.types]
    );

    const convertChildren = useCallback(
        (children) => {
            return children.map((e) => {
                return {
                    id: e.elementUuid,
                    name: e.elementName,
                    specificMetadata: e.specificMetadata,
                    icon: getFileIcon(e.type, classes.icon),
                    children:
                        e.type === elementType.DIRECTORY
                            ? convertChildren(e.children)
                            : undefined,
                    childrenCount:
                        e.type === elementType.DIRECTORY
                            ? e.subdirectoriesCount
                            : undefined,
                };
            });
        },
        [classes.icon]
    );

    const convertRoots = useCallback(
        (newRoots) => {
            return newRoots.map((e) => {
                return {
                    id: e.elementUuid,
                    name: e.elementName,
                    icon: getFileIcon(e.type, classes.icon),
                    children:
                        e.type === elementType.DIRECTORY
                            ? convertChildren(
                                  nodeMap.current[e.elementUuid].children
                              )
                            : undefined,
                    childrenCount:
                        e.type === elementType.DIRECTORY
                            ? e.subdirectoriesCount
                            : undefined,
                };
            });
        },
        [classes.icon, convertChildren]
    );

    const addToDirectory = useCallback(
        (nodeId, content) => {
            let [nrs, mdr] = updatedTree(
                rootsRef.current,
                nodeMap.current,
                nodeId,
                content
            );
            setRootDirectories(nrs);
            nodeMap.current = mdr;
            setData(convertRoots(nrs));
        },
        [convertRoots]
    );

    const updateRootDirectories = useCallback(() => {
        fetchRootFolders(props?.types)
            .then((data) => {
                let [nrs, mdr] = updatedTree(
                    rootsRef.current,
                    nodeMap.current,
                    null,
                    data
                );
                setRootDirectories(nrs);
                nodeMap.current = mdr;
                setData(convertRoots(nrs));
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'DirectoryItemSelector',
                });
            });
    }, [convertRoots, props.types, snackError]);

    useEffect(() => {
        if (props.open) {
            updateRootDirectories();
        }
    }, [props.open, updateRootDirectories]);

    const fetchDirectory = useCallback(
        (nodeId) => {
            fetchDirectoryContent(nodeId, props.types)
                .then((children) => {
                    const childrenMatchedTypes = children.filter((item) =>
                        contentFilter().has(item.type)
                    );
                    if (
                        props.equipmentTypes &&
                        props.equipmentTypes.length > 0
                    ) {
                        // filtering also with equipment types
                        fetchElementsMetadata(
                            childrenMatchedTypes.map((e) => e.elementUuid),
                            props.types,
                            props.equipmentTypes
                        ).then((childrenWithMetada) => {
                            const children = props.itemFilter
                                ? childrenWithMetada.filter((val) => {
                                      // Accept every directories
                                      if (val.type === elementType.DIRECTORY) {
                                          return true;
                                      }
                                      // otherwise filter with the custon itemFilter func
                                      return props.itemFilter(val);
                                  })
                                : childrenWithMetada;
                            // update directory content
                            addToDirectory(nodeId, children);
                        });
                    } else {
                        // update directory content
                        addToDirectory(nodeId, childrenMatchedTypes);
                    }
                })
                .catch((error) => {
                    console.warn(
                        `Could not update subs (and content) of '${nodeId}' : ${error.message}`
                    );
                });
        },
        [props, contentFilter, addToDirectory]
    );

    useEffect(() => {
        if (openRef.current && studyUpdatedForce.eventData.headers) {
            if (
                Object.values(notificationType).includes(
                    studyUpdatedForce.eventData.headers['notificationType']
                )
            ) {
                if (!studyUpdatedForce.eventData.headers['isRootDirectory']) {
                    fetchDirectory(
                        studyUpdatedForce.eventData.headers['directoryUuid']
                    );
                } else {
                    updateRootDirectories();
                }
            }
        }
    }, [studyUpdatedForce, fetchDirectory, updateRootDirectories]);

    function sortHandlingDirectories(a, b) {
        //If children property is set it means it's a directory, they are handled differently in order to keep them at the top of the list
        if (a.children && !b.children) {
            return -1;
        } else if (b.children && !a.children) {
            return 1;
        }
        return a.name.localeCompare(b.name);
    }

    return (
        <TreeViewFinder
            multiselect={true}
            onTreeBrowse={fetchDirectory}
            data={data}
            onlyLeaves={true}
            sortMethod={sortHandlingDirectories}
            {...props}
        />
    );
};

DirectoryItemSelector.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    types: PropTypes.array.isRequired,
    equipmentTypes: PropTypes.array,
    title: PropTypes.string.isRequired,
};

export default DirectoryItemSelector;

/**
 * Make an updated tree [root_nodes, id_to_node] from previous tree and new {id, children}
 * @param prevRoots previous [root nodes]
 * @param prevMap previous map (js object) uuid to children nodes
 * @param nodeId uuid of the node to update children, may be null or undefined (means root)
 * @param children new value of the node children (shallow nodes)
 */
function updatedTree(prevRoots, prevMap, nodeId, children) {
    const nextChildren = children
        .sort((a, b) => a.elementName.localeCompare(b.elementName))
        .map((n) => {
            let pn = prevMap[n.elementUuid];
            if (!pn) {
                return { ...n, children: [], parentUuid: nodeId };
            } else if (
                n.elementName === pn.elementName &&
                sameRights(n.accessRights, pn.accessRights) &&
                n.subdirectoriesCount === pn.subdirectoriesCount &&
                nodeId === pn.parentUuid
            ) {
                return pn;
            } else {
                if (pn.parentUuid !== nodeId) {
                    console.warn('reparent ' + pn.parentUuid + ' -> ' + nodeId);
                }
                return {
                    ...pn,
                    elementName: n.elementName,
                    accessRights: n.accessRights,
                    subdirectoriesCount: n.subdirectoriesCount,
                    parentUuid: nodeId,
                };
            }
        });

    const prevChildren = nodeId ? prevMap[nodeId]?.children : prevRoots;
    if (
        prevChildren?.length === nextChildren.length &&
        prevChildren.every((e, i) => e === nextChildren[i])
    ) {
        return [prevRoots, prevMap];
    }

    let nextUuids = new Set(children ? children.map((n) => n.elementUuid) : []);
    let prevUuids = prevChildren ? prevChildren.map((n) => n.elementUuid) : [];
    let mayNodeId = nodeId ? [nodeId] : [];

    let nonCopyUuids = new Set([
        ...nextUuids,
        ...mayNodeId,
        ...Array.prototype.concat(
            ...prevUuids
                .filter((u) => !nextUuids.has(u))
                .map((u) =>
                    flattenDownNodes(prevMap[u], (n) => n.children).map(
                        (n) => n.elementUuid
                    )
                )
        ),
    ]);

    const prevNode = nodeId ? prevMap[nodeId] : {};
    const nextNode = {
        elementUuid: nodeId,
        parentUuid: null,
        ...prevNode,
        children: nextChildren,
        subdirectoriesCount: nextChildren.length,
    };

    const nextMap = Object.fromEntries([
        ...Object.entries(prevMap).filter(([k, v], i) => !nonCopyUuids.has(k)),
        ...nextChildren.map((n) => [n.elementUuid, n]),
        ...refreshedUpNodes(prevMap, nextNode).map((n) => [n.elementUuid, n]),
    ]);

    const nextRoots =
        nodeId === null
            ? nextChildren
            : prevRoots.map((r) => nextMap[r.elementUuid]);

    const ret = [nextRoots, nextMap];

    return ret;
}

function sameRights(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.isPrivate === b.isPrivate;
}

function flattenDownNodes(n, cef) {
    const subs = cef(n);
    if (subs.length === 0) return [n];
    const ret = Array.prototype.concat(
        [n],
        ...subs.map((sn) => flattenDownNodes(sn, cef))
    );
    return ret;
}

function refreshedUpNodes(m, nn) {
    if (!nn?.elementUuid) return [];
    if (nn.parentUuid === null) return [nn];
    const parent = m[nn.parentUuid];
    const nextChildren = parent.children.map((c) =>
        c.elementUuid === nn.elementUuid ? nn : c
    );
    const nextParent = { ...parent, children: nextChildren };
    return [nn, ...refreshedUpNodes(m, nextParent)];
}
