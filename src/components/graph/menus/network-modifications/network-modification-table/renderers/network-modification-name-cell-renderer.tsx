/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useMemo } from 'react';
import { Row } from '@tanstack/react-table';
import { NetworkModificationMetadata, useModificationLabelComputer } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import { Box, Tooltip } from '@mui/material';
import { styles } from '../styles';

const NetworkModificationNameCell = ({ row }: { row: Row<NetworkModificationMetadata> }) => {
    const intl = useIntl();
    const { computeLabel } = useModificationLabelComputer();

    const getModificationLabel = useCallback(
        (modification: NetworkModificationMetadata, formatBold: boolean = true) => {
            return intl.formatMessage(
                { id: `network_modifications.${modification.messageType}` },
                { ...modification, ...computeLabel(modification, formatBold) }
            );
        },
        [computeLabel, intl]
    );

    const label = useMemo(() => getModificationLabel(row.original), [getModificationLabel, row.original]);

    return (
        <Box sx={styles.tableCell} style={{ opacity: row.original.activated ? 1 : 0.4 }}>
            <Tooltip disableFocusListener disableTouchListener title={label}>
                <span style={styles.modificationLabel}>{label}</span>
            </Tooltip>
        </Box>
    );
};

export default NetworkModificationNameCell;
