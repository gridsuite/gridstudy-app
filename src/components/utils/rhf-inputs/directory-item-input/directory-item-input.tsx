/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Button, FormHelperText, Grid, Stack, Tooltip, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCallback, useMemo, useState } from 'react';
import { DirectoryItemSelector, DirectoryItemSelectorProps, TreeViewFinderNodeProps } from '@gridsuite/commons-ui';
import { useController } from 'react-hook-form';
import { UUID } from 'node:crypto';
import { FolderOutlined } from '@mui/icons-material';
import { DIRECTORY_ITEM_FULL_PATH, DIRECTORY_ITEM_ID } from '../../field-constants';
import { DirectoryItemSchema, getAbsenceLabelKeyFromType } from './directory-item-utils';

export interface DirectoryItemSelectorInputProps extends Omit<DirectoryItemSelectorProps, 'onClose' | 'open'> {
    name: string;
}

export function DirectoryItemInput({ name, types, ...props }: Readonly<DirectoryItemSelectorInputProps>) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const {
        field: { onChange, value },
        fieldState: { error },
    } = useController({ name });

    const nodeInfos: DirectoryItemSchema | undefined | null = value;
    const intl = useIntl();

    const breadcrumb = useMemo(() => {
        return nodeInfos?.[DIRECTORY_ITEM_FULL_PATH] ? nodeInfos[DIRECTORY_ITEM_FULL_PATH] : undefined;
    }, [nodeInfos]);

    const onNodeChanged = useCallback(
        (nodes: TreeViewFinderNodeProps[]) => {
            if (nodes.length > 0) {
                const fullPath = nodes[0]?.name;
                const nodeId: UUID | null = nodes[0]?.id;
                if (nodeId) {
                    const nodeInfos = {
                        [DIRECTORY_ITEM_ID]: nodeId,
                        [DIRECTORY_ITEM_FULL_PATH]: fullPath,
                    };
                    onChange(nodeInfos);
                }
            }
            setIsOpen(false);
        },
        [onChange]
    );

    return (
        <Box>
            <Stack direction={'row'} alignItems="center" justifyContent="space-between">
                <Grid container alignItems="center">
                    <Grid item paddingTop={1}>
                        <FolderOutlined />
                    </Grid>
                    <Grid item paddingTop={1} paddingLeft={1}>
                        <Tooltip
                            title={nodeInfos?.[DIRECTORY_ITEM_FULL_PATH] ?? ''}
                            componentsProps={{
                                tooltip: {
                                    sx: {
                                        maxWidth: 'none', //  to override the background of text is auto cut
                                    },
                                },
                            }}
                        >
                            <Typography fontWeight={breadcrumb ? undefined : 'bold'} noWrap>
                                {breadcrumb || <FormattedMessage id={getAbsenceLabelKeyFromType(types?.[0])} />}
                            </Typography>
                        </Tooltip>
                    </Grid>
                    <Grid item paddingTop={1} paddingLeft={1}>
                        {error?.message && (
                            <FormHelperText error>{intl.formatMessage({ id: error?.message })}</FormHelperText>
                        )}
                    </Grid>
                </Grid>
                <Button onClick={() => setIsOpen(true)} variant="contained" color="primary" component="label">
                    <FormattedMessage id={breadcrumb ? 'edit' : 'Select'} />
                </Button>
            </Stack>

            <DirectoryItemSelector open={isOpen} onClose={onNodeChanged} types={types} {...props} />
        </Box>
    );
}
