/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { Row } from '@tanstack/react-table';
import { mergeSx, NetworkModificationMetadata, useModificationLabelComputer } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import { Box, Tooltip } from '@mui/material';
import {
    createModificationNameCellStyle,
    createNameCellLabelBoxSx,
    createNameCellRootStyle,
    networkModificationTableStyles,
} from '../network-modification-table-styles';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DepthBox from './depth-box';
import { ComposedModificationMetadata, isCompositeModification } from '../utils';
import { useTheme } from '@mui/material/styles';

const NameCell: FunctionComponent<{
    row: Row<ComposedModificationMetadata>;
}> = ({ row }) => {
    const intl = useIntl();
    const theme = useTheme();
    const { computeLabel } = useModificationLabelComputer();

    const depth = row.depth;

    const getModificationLabel = useCallback(
        (modification: ComposedModificationMetadata, formatBold: boolean = true) => {
            return intl.formatMessage(
                { id: `network_modifications.${modification.messageType}` },
                { ...(modification as NetworkModificationMetadata), ...computeLabel(modification, formatBold) }
            );
        },
        [computeLabel, intl]
    );

    const label = useMemo(() => getModificationLabel(row.original), [getModificationLabel, row.original]);

    const renderDepthBox = () => {
        let depthLevelCount = depth;
        return Array.from({ length: depthLevelCount }, (_, i) => (
            <DepthBox
                key={i}
                isCompositeModification={isCompositeModification(row.original)}
                firstLevel={i === 0}
                folder={isCompositeModification(row.original) && i === depthLevelCount - 1}
            />
        ));
    };

    return (
        <Box
            sx={mergeSx(
                networkModificationTableStyles.tableCell,
                createNameCellRootStyle(theme, row.getIsExpanded(), depth)
            )}
        >
            {renderDepthBox()}
            <Box sx={networkModificationTableStyles.nameCellInnerRow}>
                {isCompositeModification(row.original) && (
                    <Box sx={networkModificationTableStyles.nameCellTogglerBox}>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                row.getToggleExpandedHandler()();
                            }}
                            sx={networkModificationTableStyles.nameCellToggleButton}
                            aria-label={row.getIsExpanded() ? 'Collapse' : 'Expand'}
                        >
                            {row.getIsExpanded() ? (
                                <KeyboardArrowDownIcon fontSize="small" />
                            ) : (
                                <KeyboardArrowRightIcon fontSize="small" />
                            )}
                        </IconButton>
                    </Box>
                )}
                <Box sx={createNameCellLabelBoxSx(row.getIsExpanded(), depth)}>
                    <Tooltip disableFocusListener disableTouchListener title={label}>
                        <Box
                            sx={mergeSx(
                                networkModificationTableStyles.modificationLabel,
                                createModificationNameCellStyle(row.original.activated)
                            )}
                        >
                            {label}
                        </Box>
                    </Tooltip>
                </Box>
            </Box>
        </Box>
    );
};

export default NameCell;
