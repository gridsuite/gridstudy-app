/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { TreeViewFinder } from '@gridsuite/commons-ui';
import PropTypes from 'prop-types';
import { fetchDirectoryContent } from '../../utils/rest-api';
import { getFileIcon, elementType } from '@gridsuite/commons-ui';
import { useSelector, useDispatch } from 'react-redux';
import { updatedTree } from '../tree-views-container';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { setTreeData } from '../../../redux/actions';

const styles = {
    icon: (theme) => ({
        marginRight: theme.spacing(1),
        width: '18px',
        height: '18px',
    }),
};

function sortAlphabetically(a, b) {
    return a.name.localeCompare(b.name);
}

const DirectorySelector = (props) => {
    const [data, setData] = useState([]);
    const contentFilter = useCallback(
        () => new Set([elementType.DIRECTORY]),
        []
    );

    const { snackError } = useSnackMessage();
    const treeData = useSelector((state) => state.treeData);
    const dispatch = useDispatch();

    const convertChildren = useCallback((children) => {
        return children.map((e) => {
            return {
                id: e.elementUuid,
                name: e.elementName,
                icon: getFileIcon(e.type, styles.icon),
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
    }, []);

    const convertRoots = useCallback(
        (newRoots) => {
            return newRoots.map((e) => {
                return {
                    id: e.elementUuid,
                    name: e.elementName,
                    icon: getFileIcon(e.type, styles.icon),
                    children:
                        e.type === elementType.DIRECTORY
                            ? convertChildren(
                                  treeData.mapData[e.elementUuid].children
                              )
                            : undefined,
                    childrenCount:
                        e.type === elementType.DIRECTORY
                            ? e.subdirectoriesCount
                            : undefined,
                };
            });
        },
        [convertChildren, treeData.mapData]
    );

    useEffect(() => {
        if (treeData.rootDirectories.length > 0) {
            setData(convertRoots(treeData.rootDirectories));
        }
    }, [convertRoots, treeData.rootDirectories]);

    const addToDirectory = useCallback(
        (nodeId, content) => {
            let [nrs, mdr] = updatedTree(
                treeData.rootDirectories,
                treeData.mapData,
                nodeId,
                content
            );
            dispatch(
                setTreeData({
                    rootDirectories: nrs,
                    mapData: mdr,
                })
            );
        },
        [dispatch, treeData]
    );

    const fetchDirectoryWarn = useCallback(
        (directoryUuid, msg) =>
            snackError({
                messageTxt: msg,
                headerId: 'directoryUpdateWarning',
                headerValues: { directoryUuid },
            }),
        [snackError]
    );

    const fetchDirectory = useCallback(
        (directoryUuid) => {
            fetchDirectoryContent(directoryUuid)
                .then((childrenToBeInserted) => {
                    // update directory Content
                    addToDirectory(
                        directoryUuid,
                        childrenToBeInserted.filter((item) =>
                            contentFilter().has(item.type)
                        )
                    );
                })
                .catch((error) => {
                    fetchDirectoryWarn(directoryUuid, error.message);
                });
        },
        [addToDirectory, contentFilter, fetchDirectoryWarn]
    );

    return (
        <TreeViewFinder
            onTreeBrowse={fetchDirectory}
            data={data}
            onlyLeaves={false}
            sortMethod={sortAlphabetically}
            {...props}
        />
    );
};

DirectorySelector.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    types: PropTypes.arrayOf(PropTypes.string),
    title: PropTypes.string,
    validationButtonText: PropTypes.string,
    contentText: PropTypes.string,
};

export default DirectorySelector;
