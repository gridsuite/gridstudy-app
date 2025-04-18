/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { BoxProps } from '@mui/material/Box/Box';

const styles = {
    fullHeight: {
        height: '100%',
    },
};

export type TabPanelLazyProps = BoxProps & {
    selected?: boolean;
};

function TabPanelLazy({ children, selected, ...otherProps }: Readonly<TabPanelLazyProps>) {
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized && selected) {
            setInitialized(true);
        }
    }, [selected, initialized]);

    return (
        <Box
            style={
                selected
                    ? {
                          display: 'inherit',
                          position: 'relative',
                          visibility: 'visible',
                      }
                    : {
                          display: 'inherit',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          visibility: 'hidden',
                          zIndex: -1,
                      }
            }
            sx={styles.fullHeight}
            {...otherProps}
        >
            {initialized && children}
        </Box>
    );
}

export default TabPanelLazy;
