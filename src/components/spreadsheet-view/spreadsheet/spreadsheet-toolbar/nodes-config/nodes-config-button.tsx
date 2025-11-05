/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { Badge, Button, Tooltip } from '@mui/material';
import { type MuiStyles, useStateBoolean } from '@gridsuite/commons-ui';
import { useMemo } from 'react';
import { useNodeAliases, validAlias } from '../../../hooks/use-node-aliases';
import NodesConfigDialog from './nodes-config-dialog';
import { PolylineOutlined } from '@mui/icons-material';
import { spreadsheetStyles } from '../../../spreadsheet.style';

const styles = {
    badgeStyle: (theme) => ({
        '& .MuiBadge-badge': {
            minWidth: theme.spacing(2),
            height: theme.spacing(2),
            fontSize: theme.typography.caption.fontSize,
            padding: theme.spacing(0, 0.5),
        },
    }),
} as const satisfies MuiStyles;

type NodesConfigButtonProps = {
    disabled?: boolean;
};

export default function NodesConfigButton({ disabled }: Readonly<NodesConfigButtonProps>) {
    const dialogOpen = useStateBoolean(false);

    const { nodeAliases, updateNodeAliases } = useNodeAliases();

    const showWarning = useMemo(() => nodeAliases?.length && nodeAliases.some((n) => !validAlias(n)), [nodeAliases]);

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
                            sx={spreadsheetStyles.toolbarButton}
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
