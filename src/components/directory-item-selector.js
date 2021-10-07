import React, { useCallback, useEffect, useRef, useState } from 'react';
import TreeViewFinder from '@gridsuite/commons-ui/lib/components/TreeViewFinder';
import PropTypes from 'prop-types';
import { fetchDirectoryContent, fetchRootFolders } from '../utils/rest-api';
import { makeStyles } from '@material-ui/core/styles';
import {
    getIconFor,
    elementType,
} from '@gridsuite/commons-ui/lib/utils/elementType';

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
                icon: getIconFor(newData.type, classes.icon),
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

    return (
        <TreeViewFinder
            multiselect={true}
            onTreeBrowse={fetchDirectory}
            data={data}
            onlyLeaves={true}
            {...props}
        />
    );
};

DirectoryItemSelector.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    types: PropTypes.array.isRequired,
    title: PropTypes.object.isRequired,
};

export default DirectoryItemSelector;
