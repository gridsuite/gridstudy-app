/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback } from 'react';
import { useTheme } from '@mui/material';
import { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import { useIntl } from 'react-intl';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { GetLocaleTextParams } from 'ag-grid-community';
import { Box } from '@mui/system';
import { mergeSx } from '../utils/functions';

interface CustomAGGGridStyleProps {
    shouldHidePinnedHeaderRightBorder?: boolean;
}

interface CustomAGGridProps extends AgGridReactProps, CustomAGGGridStyleProps {}

const styles = {
    grid: {
        width: 'auto',
        height: '100%',
        position: 'relative',

        //overrides the default computed max heigt for ag grid default selector editor to make it more usable
        //can be removed if a custom selector editor is implemented
        '& .ag-select-list': {
            maxHeight: '300px !important',
        },

        //allows to hide the scrollbar in the pinned rows section as it is unecessary to our implementation
        '& .ag-body-horizontal-scroll:not(.ag-scrollbar-invisible) .ag-horizontal-left-spacer:not(.ag-scroller-corner)':
            {
                visibility: 'hidden',
            },
    },
    noBorderRight: {
        // hides right border for header of "Edit" column due to column being pinned
        '& .ag-pinned-left-header': {
            borderRight: 'none',
        },
    },
};

export const CustomAGGrid = React.forwardRef<any, CustomAGGridProps>(
    (props, ref) => {
        const {
            shouldHidePinnedHeaderRightBorder = false,
            overlayNoRowsTemplate,
        } = props;
        const theme = useTheme();
        const intl = useIntl();

        const GRID_PREFIX = 'grid.';

        const getLocaleText = useCallback(
            (params: GetLocaleTextParams) => {
                const key = GRID_PREFIX + params.key;
                return intl.formatMessage({
                    id: key,
                    defaultMessage: params.defaultValue,
                });
            },
            [intl]
        );

        return (
            <Box
                sx={mergeSx(
                    styles.grid,
                    shouldHidePinnedHeaderRightBorder && styles.noBorderRight
                )}
                className={theme.aggrid}
            >
                <AgGridReact
                    ref={ref}
                    getLocaleText={getLocaleText}
                    suppressPropertyNamesCheck={true}
                    overlayNoRowsTemplate={overlayNoRowsTemplate}
                    {...props}
                />
            </Box>
        );
    }
);
