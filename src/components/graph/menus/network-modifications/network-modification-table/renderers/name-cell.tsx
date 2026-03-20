/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { Row } from '@tanstack/react-table';
import { mergeSx, useModificationLabelComputer } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import { Box, SxProps, Theme, Tooltip } from '@mui/material';
import { createModificationNameCellStyle, styles } from '../styles';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DepthBox from './depth-box';
import { ComposedModificationMetadata } from '../utils';

const createIndentedCellStyle = (depth: number): SxProps<Theme> => ({
    display: 'flex',
    alignItems: 'stretch',
    gap: 0,
});

const NameCell: FunctionComponent<{ row: Row<ComposedModificationMetadata> }> = ({ row }) => {
    const intl = useIntl();
    const { computeLabel } = useModificationLabelComputer();

    const hasSubModifications = row.original.subModifications?.length > 0;
    const depth = row.depth;

    const getModificationLabel = useCallback(
        (modification: ComposedModificationMetadata, formatBold: boolean = true) => {
            return intl.formatMessage(
                { id: `network_modifications.${modification.messageType}` },
                { ...modification, ...computeLabel(modification, formatBold) }
            );
        },
        [computeLabel, intl]
    );

    const label = useMemo(() => getModificationLabel(row.original), [getModificationLabel, row.original]);

    const renderDepthBox = () => {
        const count = depth;
        return Array.from({ length: count }, (_, i) => (
            <DepthBox key={i} showTick={hasSubModifications && i === count - 1} />
        ));
    };

    return (
        <Box
            sx={mergeSx(
                styles.tableCell,
                createModificationNameCellStyle(row.original.activated),
                createIndentedCellStyle(depth),
                { height: '100%' }
            )}
        >
            {renderDepthBox()}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1, minWidth: 0, alignSelf: 'stretch' }}>
                {/* Always reserve exactly 32px for the toggler so labels align across all depths */}
                {hasSubModifications && (
                    <Box
                        sx={{
                            width: '32px',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                row.getToggleExpandedHandler()();
                            }}
                            sx={{ padding: '4px', width: '32px', height: '32px' }}
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
                <Tooltip disableFocusListener disableTouchListener title={label}>
                    <Box
                        sx={mergeSx(
                            styles.modificationLabel,
                            row.getIsExpanded() || depth > 0
                                ? {
                                      alignSelf: 'stretch',
                                      display: 'flex',
                                      alignItems: 'center',
                                      flex: 1,
                                      borderBottom: (theme: Theme) => `1px solid rgba(81, 81, 81, 1)`,
                                      borderLeft: (theme: Theme) => `1px solid rgba(81, 81, 81, 1)`,
                                      borderTop: (theme: Theme) => `1px solid rgba(81, 81, 81, 1)`,
                                  }
                                : {}
                        )}
                    >
                        {label}
                    </Box>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default NameCell;
