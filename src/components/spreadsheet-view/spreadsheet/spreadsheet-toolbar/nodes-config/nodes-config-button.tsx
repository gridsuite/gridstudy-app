/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { Badge, Button, type Theme, Tooltip } from '@mui/material';
import { useStateBoolean } from '@gridsuite/commons-ui';
import { useMemo } from 'react';
import { validAlias } from '../../../hooks/use-node-aliases';
import { SpreadsheetEquipmentType } from '../../../types/spreadsheet.type';
import type { NodeAlias } from '../../../types/node-alias.type';
import NodesConfigDialog from './nodes-config-dialog';
import { PolylineOutlined } from '@mui/icons-material';
import { useNodeConfigNotificationsListener } from './use-node-config-notifications-listener';

const styles = {
    badgeStyle: (theme: Theme) => ({
        '& .MuiBadge-badge': {
            minWidth: theme.spacing(2),
            height: theme.spacing(2),
            fontSize: theme.typography.caption.fontSize,
            padding: theme.spacing(0, 0.5),
        },
    }),
    nodesConfigButton: (theme: Theme) => ({
        color: theme.palette.primary.main,
        minWidth: '100%',
    }),
};

type NodesConfigButtonProps = {
    disabled?: boolean;
    tableType: SpreadsheetEquipmentType;
    nodeAliases: NodeAlias[] | undefined;
    updateNodeAliases: (newNodeAliases: NodeAlias[]) => void;
};

export default function NodesConfigButton({
    disabled,
    tableType,
    nodeAliases,
    updateNodeAliases,
}: Readonly<NodesConfigButtonProps>) {
    const dialogOpen = useStateBoolean(false);
    const showWarning = useMemo(
        () => nodeAliases !== undefined && nodeAliases.length > 0 && nodeAliases.some((n) => !validAlias(n)),
        [nodeAliases]
    );

    //Enables to automatically reload nodeAliases data upon receiving study notification related to node and rootNetwork update
    useNodeConfigNotificationsListener(tableType, nodeAliases);

    const badgeText = useMemo(() => {
        if (nodeAliases?.length && !showWarning) {
            return nodeAliases.length;
        } else if (showWarning) {
            return '!';
        } else {
            return undefined;
        }
    }, [nodeAliases, showWarning]);

    return (
        <>
            <Badge
                sx={styles.badgeStyle}
                max={99}
                color={showWarning ? 'warning' : 'secondary'}
                badgeContent={badgeText}
            >
                <Tooltip title={<FormattedMessage id="spreadsheet/parameter_aliases/button_tooltip" />}>
                    <span>
                        <Button
                            sx={styles.nodesConfigButton}
                            size={'small'}
                            onClick={() => dialogOpen.setTrue()}
                            disabled={disabled}
                        >
                            <PolylineOutlined />
                        </Button>
                    </span>
                </Tooltip>
            </Badge>
            <NodesConfigDialog open={dialogOpen} nodeAliases={nodeAliases} updateNodeAliases={updateNodeAliases} />
        </>
    );
}
