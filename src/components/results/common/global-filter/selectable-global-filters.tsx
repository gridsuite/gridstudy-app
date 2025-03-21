/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Paper } from '@mui/material';
import { resultsGlobalFilterStyles } from './global-filter-styles';
import { mergeSx } from '@gridsuite/commons-ui';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import FolderIcon from '@mui/icons-material/Folder';
import React, { PropsWithChildren } from 'react';

export interface SelectableGlobalFiltersProps extends PropsWithChildren {
    onClickGenericFilter: () => void;
}

function SelectableGlobalFilters({ children, onClickGenericFilter }: Readonly<SelectableGlobalFiltersProps>) {
    return (
        <Paper>
            {children}
            <Box sx={resultsGlobalFilterStyles.filterTypeBox}>
                <Box
                    sx={mergeSx(resultsGlobalFilterStyles.groupLabel, {
                        paddingLeft: 2,
                        paddingTop: 1.5,
                    })}
                >
                    <FormattedMessage id={'Filters'} />
                    <IconButton
                        color="primary"
                        sx={{
                            align: 'right',
                            marginLeft: 'auto',
                        }}
                        onMouseDown={onClickGenericFilter}
                    >
                        <FolderIcon />
                    </IconButton>
                </Box>
            </Box>
        </Paper>
    );
}

export default SelectableGlobalFilters;
