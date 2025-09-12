/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box, FormHelperText } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { InfoOutlined, WarningAmberRounded } from '@mui/icons-material';

type HeaderWithTooltipProps = {
    displayName: string;
    tooltipTitle: string;
    isNodeBuilt: boolean;
    disabledTooltip: boolean;
};

export default function HeaderWithTooltip({
    displayName,
    tooltipTitle,
    isNodeBuilt,
    disabledTooltip,
}: Readonly<HeaderWithTooltipProps>) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                padding: '0 4px',
            }}
        >
            <span style={{ marginRight: '8px' }}>{displayName}</span>
            {!disabledTooltip && (
                <FormHelperText
                    error={false}
                    sx={{
                        m: 0,
                        p: 0,
                        minWidth: 'auto',
                        lineHeight: 1,
                        display: 'flex',
                    }}
                >
                    <Tooltip
                        title={tooltipTitle}
                        placement="right"
                        arrow
                        PopperProps={{
                            modifiers: [
                                {
                                    name: 'offset',
                                    options: {
                                        offset: [0, -10],
                                    },
                                },
                            ],
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            {isNodeBuilt ? (
                                <InfoOutlined color="info" fontSize="small" />
                            ) : (
                                <WarningAmberRounded color="warning" fontSize="small" />
                            )}
                        </span>
                    </Tooltip>
                </FormHelperText>
            )}
        </Box>
    );
}
