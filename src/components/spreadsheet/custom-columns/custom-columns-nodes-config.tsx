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
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { useFetchEquipment } from '../data-fetching/use-fetch-equipment';

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

type CustomColumnsNodesConfigProps = {
    disabled?: boolean;
    tabIndex: number;
    nodeAliases: NodeAlias[] | undefined;
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
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const tableType = useSelector((state: AppState) => state.tables.definitions[tabIndex]?.type);

    const { fetchNodesEquipmentData } = useFetchEquipment(tableType);

    const nodesToReload = useMemo(() => {
        // Get all aliased nodes ids, except for Root and current node (both are always up-to-date)
        return nodeAliases?.filter((node) => node.id !== currentNode?.id && node.name !== ROOT_NODE_LABEL);
    }, [currentNode?.id, nodeAliases]);

    const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleRefresh = useCallback(() => {
        if (nodesToReload?.length) {
            const nodesIdsToReload = new Set<string>(nodesToReload.map((n) => n.id as string));
            fetchNodesEquipmentData(nodesIdsToReload, undefined);
        }
    }, [fetchNodesEquipmentData, nodesToReload]);

    return (
        <>
            <Button sx={spreadsheetStyles.spreadsheetButton} size={'small'} onClick={handleClick} disabled={disabled}>
                <BuildIcon sx={styles.icon} />
                <FormattedMessage id="spreadsheet/custom_column/nodes" />
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem
                    key={NodesOptionId.CONFIG}
                    onClick={() => {
                        dialogOpen.setTrue();
                        handleClose();
                    }}
                >
                    <FormattedMessage id={'spreadsheet/custom_column/option/parameter'} />
                </MenuItem>
                <Tooltip
                    title={
                        <FormattedMessage
                            id={'spreadsheet/custom_column/option/refresh/tooltip'}
                            values={{
                                aliases: nodesToReload?.map((node) => node.alias).join(', '),
                            }}
                        />
                    }
                >
                    <MenuItem
                        key={NodesOptionId.REFRESH}
                        onClick={() => {
                            handleClose();
                            handleRefresh();
                        }}
                        disabled={nodesToReload ? nodesToReload.length === 0 : true}
                    >
                        <FormattedMessage id={'spreadsheet/custom_column/option/refresh'} />
                    </MenuItem>
                </Tooltip>
            </Menu>
            <CustomColumnNodesDialog
                open={dialogOpen}
                nodeAliases={nodeAliases}
                updateNodeAliases={updateNodeAliases}
            />
        </>
    );
}
