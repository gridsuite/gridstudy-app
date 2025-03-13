/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { Button, Tooltip } from '@mui/material';
import { useStateBoolean } from '@gridsuite/commons-ui';
import CustomColumnNodesDialog from './custom-columns-nodes-dialog';
import BuildIcon from '@mui/icons-material/Build';
import { spreadsheetStyles } from '../utils/style';
import { ROOT_NODE_LABEL } from '../../../constants/node.constant';
import { NodeAlias } from './node-alias.type';
import { MouseEvent, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reloadNodesAliases } from '../../../redux/actions';
import { AppState } from '../../../redux/reducer';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { SpreadsheetEquipmentsReloadNodes } from '../config/spreadsheet.type';

const styles = {
    icon: {
        height: '20px',
        width: '20px',
    },
};

enum NodesOptionId {
    CONFIG = 'CONFIG',
    REFRESH = 'REFRESH',
}

interface NodesOption {
    id: NodesOptionId;
    label: string;
    action: () => void;
    disabled?: boolean;
    tooltipMsgId?: string;
    tooltipMsgValues?: Record<string, any>;
}

type CustomColumnsNodesConfigProps = {
    disabled?: boolean;
    tabIndex: number;
    nodeAliases: NodeAlias[];
    updateNodeAliases: (newNodeAliases: NodeAlias[]) => void;
};

export default function CustomColumnsNodesConfig({
    disabled,
    tabIndex,
    nodeAliases,
    updateNodeAliases,
}: Readonly<CustomColumnsNodesConfigProps>) {
    const dialogOpen = useStateBoolean(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const dispatch = useDispatch();
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const tableType = useSelector((state: AppState) => state.tables.definitions[tabIndex].type);

    const nodesToReload = useMemo(() => {
        // Get all aliased nodes ids, except for Root and current node (both are always up-to-date)
        return nodeAliases.filter((node) => node.id !== currentNode?.id && node.name !== ROOT_NODE_LABEL);
    }, [currentNode?.id, nodeAliases]);

    const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleRefresh = useCallback(() => {
        if (nodesToReload?.length) {
            const reloadData: SpreadsheetEquipmentsReloadNodes = {
                sheetType: tableType,
                nodesId: nodesToReload.map((node) => node.id),
            };
            dispatch(reloadNodesAliases(reloadData));
            console.debug(`Refresh requested for ${nodesToReload.length} aliased nodes`);
        }
    }, [dispatch, nodesToReload, tableType]);

    const nodesOptions = useMemo(
        () => ({
            [NodesOptionId.CONFIG]: {
                id: NodesOptionId.CONFIG,
                label: 'spreadsheet/custom_column/option/parameter',
                action: dialogOpen.setTrue,
            },
            [NodesOptionId.REFRESH]: {
                id: NodesOptionId.REFRESH,
                label: 'spreadsheet/custom_column/option/refresh',
                action: () => handleRefresh(),
                disabled: nodesToReload ? nodesToReload.length === 0 : true,
                tooltipMsgId: 'spreadsheet/custom_column/option/refresh/tooltip',
                tooltipMsgValues: {
                    aliases: nodesToReload?.map((node) => node.alias).join(', '),
                },
            },
        }),
        [dialogOpen.setTrue, nodesToReload, handleRefresh]
    );

    const handleMenuItemClick = useCallback(
        (optionId: NodesOptionId) => {
            nodesOptions[optionId].action();
            handleClose();
        },
        [nodesOptions, handleClose]
    );

    const renderMenuItem = useCallback(
        (option: NodesOption) => {
            return (
                <MenuItem key={option.id} onClick={() => handleMenuItemClick(option.id)} disabled={option?.disabled}>
                    <FormattedMessage id={option.label} />
                </MenuItem>
            );
        },
        [handleMenuItemClick]
    );

    const renderMenuEntry = useCallback(
        (option: NodesOption) => {
            return (
                <>
                    {option.tooltipMsgId && (
                        <Tooltip title={<FormattedMessage id={option.tooltipMsgId} values={option.tooltipMsgValues} />}>
                            {renderMenuItem(option)}
                        </Tooltip>
                    )}
                    {!option.tooltipMsgId && renderMenuItem(option)}
                </>
            );
        },
        [renderMenuItem]
    );

    return (
        <>
            <Button sx={spreadsheetStyles.spreadsheetButton} size={'small'} onClick={handleClick} disabled={disabled}>
                <BuildIcon sx={styles.icon} />
                <FormattedMessage id="spreadsheet/custom_column/nodes" />
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                {Object.values(nodesOptions).map(renderMenuEntry)}
            </Menu>
            <CustomColumnNodesDialog
                open={dialogOpen}
                nodeAliases={nodeAliases}
                updateNodeAliases={updateNodeAliases}
            />
        </>
    );
}
