/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useRef } from 'react';

import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';

import { FormattedMessage } from 'react-intl';

import { useDispatch, useSelector } from 'react-redux';
import { setSelectedDirectory } from '../../redux/actions';
import CustomTreeItem from './custom-tree-item';
import { Box } from '@mui/material';

const styles = {
    treeViewRoot: (theme) => ({
        padding: theme.spacing(0.5),
    }),
    treeItemRoot: (theme) => ({
        userSelect: 'none',
        '&:focus > .MuiTreeItem-content .MuiTreeItem-label, .focused': {
            borderRadius: theme.spacing(2),
            backgroundColor: theme.row.primary,
        },
        '&:hover': {
            borderRadius: theme.spacing(2),
            backgroundColor: theme.row.primary,
        },
    }),
    treeItemSelected: (theme) => ({
        borderRadius: theme.spacing(2),
        backgroundColor: theme.row.hover,
        fontWeight: 'bold',
    }),
    treeItemContent: (theme) => ({
        paddingRight: theme.spacing(1),
        paddingLeft: theme.spacing(1),
    }),
    treeItemIconContainer: {
        width: '18px',
        display: 'flex',
        justifyContent: 'center',
    },
    treeItemLabel: (theme) => ({
        flexGrow: 1,
        overflow: 'hidden',
        paddingRight: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        fontWeight: 'inherit',
        color: 'inherit',
    }),
    treeItemLabelRoot: (theme) => ({
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0.5, 0),
    }),
    treeItemLabelText: {
        fontWeight: 'inherit',
        flexGrow: 1,
    },
    icon: (theme) => ({
        marginRight: theme.spacing(1),
        width: '18px',
        height: '18px',
    }),
};

const DirectoryTreeView = ({
    treeViewUuid,
    mapData,
    onContextMenu,
    onDirectoryUpdate,
}) => {
    const dispatch = useDispatch();

    const [expanded, setExpanded] = React.useState([]);
    const selectedDirectory = useSelector((state) => state.selectedDirectory);
    const currentPath = useSelector((state) => state.currentPath);

    const mapDataRef = useRef({});
    const expandedRef = useRef([]);
    const selectedDirectoryRef = useRef(null);
    selectedDirectoryRef.current = selectedDirectory;
    expandedRef.current = expanded;
    mapDataRef.current = mapData;

    const ensureInOutExpansion = useCallback(
        (inIds, outIds = []) => {
            let prevAsSet = new Set(expandedRef.current);
            // if on both side : no-op
            let inIdsSet = new Set(
                inIds.filter((id) => !outIds.includes(id) && !prevAsSet.has(id))
            );
            let outIdsSet = new Set(
                outIds.filter((id) => !inIds.includes(id) && prevAsSet.has(id))
            );

            if (inIdsSet.size > 0 || outIdsSet.size > 0) {
                let purged = [...prevAsSet].filter((id) => !outIdsSet.has(id));
                let grown = purged.concat(...inIdsSet);
                setExpanded(grown);
            }
        },
        [expandedRef]
    );

    const toggleDirectories = useCallback(
        (ids) => {
            let ins = [];
            let outs = [];
            ids.forEach((id) => {
                if (!expandedRef.current.includes(id)) {
                    ins.push(id);
                } else {
                    outs.push(id);
                }
            });
            ensureInOutExpansion(ins, outs);
        },
        [expandedRef, ensureInOutExpansion]
    );

    /* User interaction */
    function handleContextMenuClick(event, nodeId) {
        onContextMenu(event, nodeId);
    }

    function handleLabelClick(nodeId) {
        if (selectedDirectory?.elementUuid !== nodeId) {
            dispatch(setSelectedDirectory(mapDataRef.current[nodeId]));
        }
        if (!expandedRef.current.includes(nodeId)) {
            // update fold status of item
            toggleDirectories([nodeId]);
        }
    }

    function handleIconClick(nodeId) {
        onDirectoryUpdate(nodeId, expandedRef.current.includes(nodeId));
        toggleDirectories([nodeId]);
    }

    useEffect(() => {
        if (currentPath.length === 0) {
            return;
        }
        if (currentPath[0].elementUuid !== treeViewUuid) {
            return;
        }
        ensureInOutExpansion(currentPath.map((n) => n.elementUuid));
    }, [currentPath, ensureInOutExpansion, treeViewUuid]);

    /* Handle Rendering */
    const renderTree = (node) => {
        if (!node) {
            return;
        }
        return (
            <CustomTreeItem
                key={node.elementUuid}
                nodeId={node.elementUuid}
                label={
                    <Box
                        sx={styles.treeItemLabelRoot}
                        onContextMenu={(e) =>
                            handleContextMenuClick(e, node.elementUuid)
                        }
                    >
                        {node.accessRights?.isPrivate ? (
                            <Tooltip
                                TransitionComponent={Zoom}
                                disableFocusListener
                                disableTouchListener
                                enterDelay={1000}
                                enterNextDelay={1000}
                                title={<FormattedMessage id="private" />}
                                placement="bottom"
                                arrow
                            >
                                <LockIcon sx={styles.icon} />
                            </Tooltip>
                        ) : null}
                        <Tooltip
                            TransitionComponent={Zoom}
                            disableFocusListener
                            disableTouchListener
                            enterDelay={1000}
                            enterNextDelay={1000}
                            title={node.elementName}
                            arrow
                            placement="bottom-start"
                        >
                            <Typography noWrap sx={styles.treeItemLabelText}>
                                {node.elementName}
                            </Typography>
                        </Tooltip>
                    </Box>
                }
                ContentProps={{
                    onExpand: handleIconClick,
                    onSelect: handleLabelClick,
                    styles: {
                        root: styles.treeItemRoot,
                        selected: styles.treeItemSelected,
                        focused: styles.treeItemFocused,
                        label: styles.treeItemLabel,
                        iconContainer: styles.treeItemIconContainer,
                    },
                }}
                endIcon={
                    node.subdirectoriesCount > 0 ? (
                        <ChevronRightIcon sx={styles.icon} />
                    ) : null
                }
                sx={{
                    content: styles.treeItemContent,
                }}
            >
                {Array.isArray(node.children)
                    ? node.children.map((child) =>
                          renderTree(mapDataRef.current[child.elementUuid])
                      )
                    : null}
            </CustomTreeItem>
        );
    };

    return (
        <>
            <TreeView
                sx={styles.treeViewRoot}
                defaultCollapseIcon={<ExpandMoreIcon sx={styles.icon} />}
                defaultExpandIcon={<ChevronRightIcon sx={styles.icon} />}
                expanded={expanded}
                selected={
                    selectedDirectory ? selectedDirectory.elementUuid : null
                }
            >
                {renderTree(mapDataRef.current[treeViewUuid])}
            </TreeView>
        </>
    );
};

export default DirectoryTreeView;
