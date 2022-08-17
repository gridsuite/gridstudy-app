/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TreeViewFinder } from '@gridsuite/commons-ui';
import PropTypes from 'prop-types';
import { fetchDirectoryContent, fetchRootFolders } from '../utils/rest-api';
import makeStyles from '@mui/styles/makeStyles';
import { getFileIcon, elementType } from '@gridsuite/commons-ui';

const useStyles = makeStyles((theme) => ({
    icon: {
        marginRight: theme.spacing(1),
        width: '18px',
        height: '18px',
    },
}));

const DirectoryItemSelector = (props) => {
    const [data, setData] = useState([]);
    const nodeMap = useRef({});
    const classes = useStyles();

    const contentFilter = useCallback(
        () => new Set([elementType.DIRECTORY, ...props.types]),
        [props.types]
    );

    const directory2Tree = useCallback(
        (newData) => {
            const newNode = {
                id: newData.elementUuid,
                name: newData.elementName,
                icon: getFileIcon(newData.type, classes.icon),
                children:
                    newData.type === elementType.DIRECTORY ? [] : undefined,
            };
            return (nodeMap.current[newNode.id] = newNode);
        },
        [nodeMap, classes]
    );

    useEffect(() => {
        if (props.open && data.length === 0) {
            fetchRootFolders().then((roots) => {
                setData(roots.map(directory2Tree));
            });
        }
    }, [props.open, data, directory2Tree]);

    const addToDirectory = useCallback(
        (nodeId, content) => {
            const node = nodeMap.current[nodeId];
            node.children = content.map(directory2Tree);
        },
        [directory2Tree]
    );

    const fetchDirectory = (nodeId) => {
        const filter = contentFilter();
        fetchDirectoryContent(nodeId).then((content) => {
            addToDirectory(
                nodeId,
                content.filter((item) => filter.has(item.type))
            );
            setData([...data]);
        });
    };

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
    title: PropTypes.string.isRequired,
};

export default DirectoryItemSelector;
