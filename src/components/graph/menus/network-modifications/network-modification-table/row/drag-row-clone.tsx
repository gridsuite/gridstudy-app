/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import { networkModificationTableStyles } from '../network-modification-table-styles';
import { Row } from '@tanstack/react-table';
import { ComposedModificationMetadata } from '../utils';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import React, { useCallback } from 'react';
import { mergeSx, NetworkModificationMetadata, useModificationLabelComputer } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';

const DragCloneRow = ({ row }: { row: Row<ComposedModificationMetadata> }) => {
    const intl = useIntl();
    const { computeLabel } = useModificationLabelComputer();

    const getModificationLabel = useCallback(
        (modification: ComposedModificationMetadata, formatBold: boolean = true) => {
            return intl.formatMessage(
                { id: `network_modifications.${modification.messageType}` },
                { ...(modification as NetworkModificationMetadata), ...computeLabel(modification, formatBold) }
            );
        },
        [computeLabel, intl]
    );

    return (
        <Box sx={networkModificationTableStyles.dragRowClone}>
            <Box sx={networkModificationTableStyles.tableCell}>
                <Box sx={mergeSx(networkModificationTableStyles.dragHandle, { opacity: 1 })}>
                    <DragIndicatorIcon fontSize="small" sx={networkModificationTableStyles.dragIndicatorIcon} />
                </Box>
            </Box>
            <Box sx={networkModificationTableStyles.tableCell}>
                <Box sx={networkModificationTableStyles.modificationLabel}>{getModificationLabel(row.original)}</Box>
            </Box>
        </Box>
    );
};

export default DragCloneRow;
