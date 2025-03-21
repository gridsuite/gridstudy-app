/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, CircularProgress, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { styles } from './network-modification-node-editor-utils';

export interface NetworkModificationEditorNameHeaderProps {
    modificationCount?: number;
    notificationMessageId?: string;
    isFetchingModifications: boolean;
    isImpactedByNotification: () => boolean;
    pendingState: boolean;
}

export const NetworkModificationEditorNameHeader = (props: NetworkModificationEditorNameHeaderProps) => {
    const {
        modificationCount,
        isFetchingModifications,
        isImpactedByNotification,
        notificationMessageId,
        pendingState,
    } = props;
    if (isImpactedByNotification() && notificationMessageId) {
        return (
            <>
                <Box sx={styles.icon}>
                    <CircularProgress size={'1em'} sx={styles.modificationCircularProgress} />
                </Box>
                <Typography noWrap>
                    <FormattedMessage id={notificationMessageId} />
                </Typography>
            </>
        );
    }

    if (isFetchingModifications) {
        return (
            <>
                <Box sx={styles.icon}>
                    <CircularProgress size={'1em'} sx={styles.modificationCircularProgress} />
                </Box>
                <Typography noWrap>
                    <FormattedMessage id={'network_modifications.modifications'} />
                </Typography>
            </>
        );
    }

    return (
        <>
            {pendingState && (
                <Box sx={styles.icon}>
                    <CircularProgress size={'1em'} sx={styles.modificationCircularProgress} />
                </Box>
            )}
            <Typography noWrap>
                <FormattedMessage
                    id={'network_modifications.modificationsCount'}
                    values={{
                        count: modificationCount ?? '',
                        hide: pendingState,
                    }}
                />
            </Typography>
        </>
    );
};
