/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { styles } from '../styles';

interface DepthBoxProps {
    showTick?: boolean;
}

const DepthBox = ({ showTick = false }: DepthBoxProps) => {
    return (
        <Box sx={styles.depthBoxOuter}>
            <Box sx={styles.depthBoxLine} />
            {showTick && <Box sx={styles.depthBoxTick} />}
        </Box>
    );
};

export default DepthBox;
