/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import PhotoIcon from '@mui/icons-material/Photo';
import React from 'react';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { useSelector } from 'react-redux';
import Tooltip from '@mui/material/Tooltip';
import { BUILD_STATUS } from '../../network/constants';
import { AppState, RootNode as RootNodeType } from 'redux/reducer';
import { Theme } from '@mui/material/styles';
import { Box } from '@mui/system';

const styles = {
    rootSelected: (theme: Theme) => ({
        background: theme.node.background,
        borderRadius: '30%',
        boxShadow:
            theme.node.border +
            ' 0px 0px 3px 3px,' +
            theme.node.border +
            ' 0px 0px 25px,' +
            theme.node.border +
            ' 0px 0px 5px',
        '&:hover': {
            background: theme.node.background,
        },
    }),
    root: (theme: Theme) => ({
        background: 'darkseagreen',
        borderRadius: '30%',
        '&:hover': {
            background: theme.node.hover,
        },
    }),
};
const debug = false; // TODO remove this before merge
const RootNode = (props: NodeProps<RootNodeType>) => {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const isSelectedNode = () => {
        return props.id === currentNode?.id;
    };

    return (
        <>
            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    background: '#555',
                    zIndex: '1',
                }}
                isConnectable={false}
            />
            {debug && (
                <Box
                    sx={{
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        backgroundColor: 'yellow',
                        color: 'red',
                        fontSize: '36px',
                        width: '70px',
                        textAlign: 'left',
                        paddingLeft: '3px',
                    }}
                    onClick={() => {
                        navigator.clipboard.writeText(props.id).catch((err) => {
                            console.error('Failed to copy text: ', err);
                        });
                        console.error('NODE ID COPIED IN CLIPBOARD: ' + props.id); // TODO Remove all this before merge
                    }}
                >
                    {props.id.substring(0, 3)}
                </Box>
            )}
            <Tooltip title={props.data.caseName} placement="top" disableHoverListener={!props.data.caseName}>
                <IconButton sx={isSelectedNode() ? styles.rootSelected : styles.root}>
                    {(props.data.globalBuildStatus === BUILD_STATUS.BUILDING && <CircularProgress size={24} />) || (
                        <PhotoIcon />
                    )}
                </IconButton>
            </Tooltip>
        </>
    );
};

export default RootNode;
