/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';

interface DepthBoxProps {
    showTick?: boolean;
}

const DepthBox = ({ showTick = false }: DepthBoxProps) => {
    return (
        <Box
            sx={{
                width: '32px',
                display: 'flex',
                justifyContent: 'center',
                alignSelf: 'stretch',
                position: 'relative',
            }}
        >
            <Box sx={{ width: '1px', backgroundColor: 'divider', alignSelf: 'stretch' }} />
            {showTick && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '5px',
                        height: '1px',
                        backgroundColor: 'divider',
                        transform: 'translateY(-50%)',
                    }}
                />
            )}
        </Box>
    );
};

export default DepthBox;
