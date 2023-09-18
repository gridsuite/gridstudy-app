/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    directoryUpdated,
    setActiveDirectory,
    setCurrentChildren,
    setCurrentPath,
    setSelectedDirectory,
    setTreeData,
} from '../../redux/actions';

import {
    connectNotificationsWsUpdateDirectories,
    fetchDirectoryContent,
    fetchRootFolders,
} from '../utils/rest-api';

import DirectoryTreeView from './directory-tree-view';

import { useSnackMessage } from '@gridsuite/commons-ui';
import { ElementType } from '../utils/elementType';
import { notificationType } from '../utils/notificationType';

import * as constants from '../utils/UIconstants';
// Menu
import DirectoryTreeContextualMenu from './menus/directory-tree-contextual-menu';

const initialMousePosition = {
    mouseX: null,
    mouseY: null,
};

// Node.js (used for tests) version < 11 has no Object.fromEntries
Object.fromEntries =
    Object.fromEntries ||
    ((arr) =>
        arr.reduce((acc, [k, v]) => {
            acc[k] = v;
            return acc;
        }, {}));

function buildPathToFromMap(nodeId, mapDataRef) {
    let path = [];
    if (mapDataRef && nodeId) {
        let currentUuid = nodeId;
        while (currentUuid != null && mapDataRef[currentUuid] !== undefined) {
            path.unshift({ ...mapDataRef[currentUuid] });
            currentUuid = mapDataRef[currentUuid].parentUuid;
        }
    }
    return path;
}

function flattenDownNodes(n, cef) {
    const subs = cef(n);
    if (subs.length === 0) {
        return [n];
    }
    const ret = Array.prototype.concat(
        [n],
        ...subs.map((sn) => flattenDownNodes(sn, cef))
    );
    return ret;
}

function refreshedUpNodes(m, nn) {
    if (!nn?.elementUuid) {
        return [];
    }
    if (nn.parentUuid === null) {
        return [nn];
    }
    const parent = m[nn.parentUuid];
    const nextChildren = parent.children.map((c) =>
        c.elementUuid === nn.elementUuid ? nn : c
    );
    const nextParent = { ...parent, children: nextChildren };
    return [nn, ...refreshedUpNodes(m, nextParent)];
}

function mapFromRoots(roots) {
    return Object.fromEntries(
        Array.prototype
            .concat(
                roots,
                ...roots.map((r) => flattenDownNodes(r, (n) => n.children))
            )
            .map((n) => [n.elementUuid, n])
    );
}

function sameRights(a, b) {
    if (!a && !b) {
        return true;
    }
    if (!a || !b) {
        return false;
    }
    return a.isPrivate === b.isPrivate;
}

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

const TreeViewsContainer = () => {
    const dispatch = useDispatch();

    const [openDialog, setOpenDialog] = useState(constants.DialogsId.NONE);

    const user = useSelector((state) => state.user);
    const selectedDirectory = useSelector((state) => state.selectedDirectory);
    const activeDirectory = useSelector((state) => state.activeDirectory);

    const uploadingElements = useSelector((state) => state.uploadingElements);
    const currentChildren = useSelector((state) => state.currentChildren);
    const currentChildrenRef = useRef(currentChildren);
    currentChildrenRef.current = currentChildren;
    const selectedDirectoryRef = useRef({});
    selectedDirectoryRef.current = selectedDirectory;

    const [DOMFocusedDirectory, setDOMFocusedDirectory] = useState(null);

    const wsRef = useRef();

    const { snackError } = useSnackMessage();

    const directoryUpdatedEvent = useSelector(
        (state) => state.directoryUpdated
    );
    /**
     * Contextual Menus
     */
    const [openDirectoryMenu, setOpenDirectoryMenu] = React.useState(false);

    const treeData = useSelector((state) => state.treeData);

    const treeDataRef = useRef();
    treeDataRef.current = treeData;

    const handleOpenDirectoryMenu = (event) => {
        setOpenDirectoryMenu(true);
        event.stopPropagation();
    };
    const handleCloseDirectoryMenu = (e, nextSelectedDirectoryId = null) => {
        setOpenDirectoryMenu(false);
        if (
            nextSelectedDirectoryId !== null &&
            treeDataRef.current.mapData &&
            treeDataRef.current.mapData[nextSelectedDirectoryId]
        ) {
            dispatch(
                setSelectedDirectory(
                    treeDataRef.current.mapData[nextSelectedDirectoryId]
                )
            );
        }
        //so it removes the style that we added ourselves
        if (DOMFocusedDirectory !== null) {
            DOMFocusedDirectory.classList.remove('focused');
            setDOMFocusedDirectory(null);
        }
    };

    /* Menu states */
    const [mousePosition, setMousePosition] =
        React.useState(initialMousePosition);

    /* User interactions */
    const onContextMenu = useCallback(
        (event, nodeId) => {
            //to keep the focused style (that is normally lost when opening a contextual menu)
            event.currentTarget.parentNode.classList.add('focused');
            setDOMFocusedDirectory(event.currentTarget.parentNode);

            dispatch(setActiveDirectory(nodeId));

            setMousePosition({
                mouseX: event.clientX + constants.HORIZONTAL_SHIFT,
                mouseY: event.clientY + constants.VERTICAL_SHIFT,
            });
            handleOpenDirectoryMenu(event);
        },
        [dispatch]
    );

    /* RootDirectories management */
    const updateRootDirectories = useCallback(() => {
        fetchRootFolders()
            .then((data) => {
                let [nrs, mdr] = updatedTree(
                    treeDataRef.current.rootDirectories,
                    treeDataRef.current.mapData,
                    null,
                    data
                );
                dispatch(
                    setTreeData({
                        rootDirectories: nrs,
                        mapData: mdr,
                    })
                );
            })
            .catch((error) => {
                console.warn(`Could not fetch roots ${error.message}`);
            });
    }, [dispatch]);

    /* rootDirectories initialization */
    useEffect(() => {
        if (user != null) {
            updateRootDirectories();
        }
    }, [user, updateRootDirectories]);

    /* Manage current path data */
    const updatePath = useCallback(
        (nodeId) => {
            let path = buildPathToFromMap(nodeId, treeData.mapData);
            dispatch(setCurrentPath(path));
        },
        [dispatch, treeData.mapData]
    );

    useEffect(() => {
        updatePath(selectedDirectoryRef.current?.elementUuid);
    }, [treeData.mapData, updatePath, selectedDirectory]);

    const insertContent = useCallback(
        (nodeId, childrenToBeInserted) => {
            let [nrs, mdr] = updatedTree(
                treeDataRef.current.rootDirectories,
                treeDataRef.current.mapData,
                nodeId,
                childrenToBeInserted
            );
            dispatch(
                setTreeData({
                    rootDirectories: nrs,
                    mapData: mdr,
                })
            );
        },
        [dispatch]
    );

    const updateMapData = useCallback(
        (nodeId, children) => {
            let newSubdirectories = children.filter(
                (child) => child.type === ElementType.DIRECTORY
            );

            let prevPath = buildPathToFromMap(
                selectedDirectoryRef.current?.elementUuid,
                treeDataRef.current.mapData
            );

            let prevSubInPath = prevPath.find((n) => n.parentUuid === nodeId);
            let hasToChangeSelected =
                prevSubInPath !== undefined &&
                children.find(
                    (n) => n.elementUuid === prevSubInPath.elementUuid
                ) === undefined;

            insertContent(nodeId, newSubdirectories);
            if (hasToChangeSelected) {
                // if selected directory (possibly via ancestor)
                // is deleted by another user
                // we should select (closest still existing) parent directory
                dispatch(
                    setSelectedDirectory(treeDataRef.current.mapData[nodeId])
                );
            }
        },
        [insertContent, selectedDirectoryRef, dispatch]
    );

    const mergeCurrentAndUploading = useCallback(
        (current) => {
            let elementsToMerge = Object.values(uploadingElements).filter(
                (e) =>
                    e.directory === selectedDirectoryRef.current.elementUuid &&
                    current[e.elementName] === undefined
            );
            if (elementsToMerge != null && elementsToMerge.length > 0) {
                // We need to filter current array of elements in elementsToMerge to avoid duplicates in the directoryContent component.
                // An uploading element doesn't have an elementUuid yet, then we filter on element Name and type.
                const filtredCurrentElements = current.filter(
                    (el) =>
                        !elementsToMerge.some(
                            (e) =>
                                (e.elementName === el.elementName &&
                                    e.type === el.type) ||
                                e.elementUuid
                        )
                );

                return [...filtredCurrentElements, ...elementsToMerge].sort(
                    function (a, b) {
                        return a.elementName.localeCompare(b.elementName);
                    }
                );
            } else {
                if (current == null) {
                    return null;
                } else {
                    return [...current].sort(function (a, b) {
                        return a.elementName.localeCompare(b.elementName);
                    });
                }
            }
        },
        [uploadingElements, selectedDirectoryRef]
    );

    /* currentChildren management */
    const updateCurrentChildren = useCallback(
        (children) => {
            dispatch(
                setCurrentChildren(
                    mergeCurrentAndUploading(
                        children.filter(
                            (child) => child.type !== ElementType.DIRECTORY
                        )
                    )
                )
            );
        },
        [dispatch, mergeCurrentAndUploading]
    );

    const updateDirectoryTreeAndContent = useCallback(
        (nodeId) => {
            fetchDirectoryContent(nodeId)
                .then((childrenToBeInserted) => {
                    // update directory Content
                    updateCurrentChildren(childrenToBeInserted);
                    // Update Tree Map data
                    updateMapData(nodeId, childrenToBeInserted);
                })
                .catch((error) => {
                    console.warn(
                        `Could not update subs (and content) of '${nodeId}' : ${error.message}`
                    );
                    updateMapData(nodeId, []);
                });
        },
        [updateCurrentChildren, updateMapData]
    );

    useEffect(() => {
        dispatch(
            setCurrentChildren(
                mergeCurrentAndUploading(currentChildrenRef.current)
            )
        );
    }, [currentChildrenRef, mergeCurrentAndUploading, dispatch]);

    const updateDirectoryTree = useCallback(
        (nodeId, isClose = false) => {
            // quite rare occasion to clean up
            if (isClose) {
                if (
                    treeDataRef.current.rootDirectories.some(
                        (n) => n.elementUuid === nodeId
                    )
                ) {
                    const newMap = mapFromRoots(
                        treeDataRef.current.rootDirectories
                    );
                    if (
                        Object.entries(newMap).length !==
                        Object.entries(treeDataRef.current.mapData).length
                    ) {
                        dispatch(
                            setTreeData({
                                rootDirectories:
                                    treeDataRef.current.rootDirectories,
                                mapData: newMap,
                            })
                        );
                    }
                }
                return;
            }

            fetchDirectoryContent(nodeId)
                .then((childrenToBeInserted) => {
                    // Update Tree Map data
                    updateMapData(nodeId, childrenToBeInserted);
                })
                .catch((error) => {
                    console.warn(
                        `Could not update subs of '${nodeId}' : ${error.message}`
                    );
                    updateMapData(nodeId, []);
                });
        },
        [dispatch, updateMapData]
    );

    /* Manage Studies updating with Web Socket */
    const displayErrorIfExist = useCallback(
        (error, studyName) => {
            if (error) {
                snackError({
                    messageTxt: error,
                    headerId: 'studyCreatingError',
                    headerValues: { studyName: studyName },
                });
            }
        },
        [snackError]
    );

    useEffect(() => {
        // create ws at mount event
        wsRef.current = connectNotificationsWsUpdateDirectories();

        wsRef.current.onclose = function () {
            console.error('Unexpected Notification WebSocket closed');
        };
        wsRef.current.onerror = function (event) {
            console.error('Unexpected Notification WebSocket error', event);
        };
        // We must save wsRef.current in a variable to make sure that when close is called it refers to the same instance.
        // That's because wsRef.current could be modify outside of this scope.
        const wsToClose = wsRef.current;
        // cleanup at unmount event
        return () => {
            wsToClose.close();
        };
    }, []);

    const onUpdateDirectories = useCallback(
        (event) => {
            console.debug('Received Update directories notification', event);

            let eventData = JSON.parse(event.data);
            if (!eventData.headers) {
                return;
            }
            dispatch(directoryUpdated(eventData));
        },
        [dispatch]
    );

    useEffect(() => {
        if (directoryUpdatedEvent.eventData?.headers) {
            const notificationTypeH =
                directoryUpdatedEvent.eventData.headers['notificationType'];
            const isRootDirectory =
                directoryUpdatedEvent.eventData.headers['isRootDirectory'];
            const directoryUuid =
                directoryUpdatedEvent.eventData.headers['directoryUuid'];
            const error = directoryUpdatedEvent.eventData.headers['error'];
            const elementName =
                directoryUpdatedEvent.eventData.headers['elementName'];
            if (error) {
                displayErrorIfExist(error, elementName);
                dispatch(directoryUpdated({}));
            }

            if (isRootDirectory) {
                updateRootDirectories();
                if (
                    selectedDirectoryRef.current != null && // nothing to do if nothing already selected
                    notificationTypeH === notificationType.DELETE_DIRECTORY &&
                    selectedDirectoryRef.current.elementUuid === directoryUuid
                ) {
                    dispatch(setSelectedDirectory(null));
                }
                return;
            }
            if (directoryUuid) {
                // Remark : It could be a Uuid of a rootDirectory if we need to update it because its content update
                // if dir is actually selected then call updateDirectoryTreeAndContent of this dir
                // else expanded or not then updateDirectoryTree
                if (selectedDirectoryRef.current != null) {
                    if (
                        directoryUuid ===
                        selectedDirectoryRef.current.elementUuid
                    ) {
                        updateDirectoryTreeAndContent(directoryUuid);
                        return; // break here
                    }
                }
                updateDirectoryTree(directoryUuid);
            }
        }
    }, [
        directoryUpdatedEvent,
        dispatch,
        displayErrorIfExist,
        updateDirectoryTree,
        updateDirectoryTreeAndContent,
        updateRootDirectories,
    ]);

    useEffect(() => {
        if (!wsRef.current) {
            return;
        }

        // Update onmessage of ws when needed.
        wsRef.current.onmessage = onUpdateDirectories;
    }, [onUpdateDirectories]);

    /* Handle components synchronization */
    useEffect(() => {
        if (selectedDirectory) {
            console.debug(
                'useEffect over selectedDirectory',
                selectedDirectory.elementUuid
            );
            updateDirectoryTreeAndContent(selectedDirectory.elementUuid);
        }
    }, [selectedDirectory, updateDirectoryTreeAndContent]);

    const getActiveDirectory = () => {
        if (
            treeDataRef.current.mapData &&
            treeDataRef.current.mapData[activeDirectory]
        ) {
            return treeDataRef.current.mapData[activeDirectory];
        } else {
            return null;
        }
    };

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    flexGrow: 1,
                }}
                onContextMenu={(e) => onContextMenu(e, null)}
            >
                {treeData.mapData &&
                    treeData.rootDirectories.map((rootDirectory) => (
                        <DirectoryTreeView
                            key={rootDirectory.elementUuid}
                            treeViewUuid={rootDirectory.elementUuid}
                            mapData={treeDataRef.current.mapData}
                            onContextMenu={onContextMenu}
                            onDirectoryUpdate={updateDirectoryTree}
                        />
                    ))}
            </div>

            <div
                onMouseDown={(e) => {
                    if (
                        e.button === constants.MOUSE_EVENT_RIGHT_BUTTON &&
                        openDialog === constants.DialogsId.NONE
                    ) {
                        handleCloseDirectoryMenu(e, null);
                    }
                }}
            >
                <DirectoryTreeContextualMenu
                    directory={getActiveDirectory()}
                    open={openDirectoryMenu}
                    openDialog={openDialog}
                    setOpenDialog={setOpenDialog}
                    onClose={(e) => handleCloseDirectoryMenu(e, null)}
                    anchorReference="anchorPosition"
                    anchorPosition={
                        mousePosition.mouseY !== null &&
                        mousePosition.mouseX !== null
                            ? {
                                  top: mousePosition.mouseY,
                                  left: mousePosition.mouseX,
                              }
                            : undefined
                    }
                />
            </div>
        </>
    );
};

export { updatedTree };
export default TreeViewsContainer;
