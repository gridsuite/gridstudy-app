/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback } from 'react';
import { Theme, useTheme } from '@mui/material';
import { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import { useIntl } from 'react-intl';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColumnResizedEvent, GetLocaleTextParams } from 'ag-grid-community';
import { Box } from '@mui/system';
import { mergeSx } from '../utils/functions';

interface CustomAGGGridStyleProps {
    shouldHidePinnedHeaderRightBorder?: boolean;
    showOverlay?: boolean;
}

interface CustomAGGridProps extends AgGridReactProps, CustomAGGGridStyleProps {}

const styles = {
    grid: (theme: Theme) => ({
        width: 'auto',
        height: '100%',
        position: 'relative',

        '--ag-value-change-value-highlight-background-color':
            theme.aggridValueChangeHighlightBackgroundColor,

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
        //removes border on focused cell - using "suppressCellFocus" Aggrid option causes side effects and breaks field edition
        '& .ag-cell-focus, .ag-cell': {
            border: 'none !important',
        },
    }),
    noBorderRight: {
        // hides right border for header of "Edit" column due to column being pinned
        '& .ag-pinned-left-header': {
            borderRight: 'none',
        },
    },
    overlayBackground: (theme: Theme) => ({
        '& .ag-overlay-loading-wrapper': {
            background: theme.overlay.background,
        },
        '& .ag-overlay-no-rows-wrapper': {
            background: 'none',
        },
    }),
};

// We have to define a minWidth to column to activate this feature
const onColumnResized = (params: ColumnResizedEvent) => {
    const { column, finished } = params;
    const colDefinedMinWidth = column?.getColDef()?.minWidth;
    if (column && colDefinedMinWidth && finished) {
        const newWidth = column?.getActualWidth();
        if (newWidth < colDefinedMinWidth) {
            column?.setActualWidth(colDefinedMinWidth);
        }
    }
};

export const CustomAGGrid = React.forwardRef<any, CustomAGGridProps>(
    (props, ref) => {
        const {
            shouldHidePinnedHeaderRightBorder = false,
            overlayNoRowsTemplate,
            loadingOverlayComponent,
            loadingOverlayComponentParams,
            showOverlay = false,
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
                    shouldHidePinnedHeaderRightBorder && styles.noBorderRight,
                    showOverlay && styles.overlayBackground
                )}
                className={theme.aggrid}
            >
                <AgGridReact
                    ref={ref}
                    getLocaleText={getLocaleText}
                    suppressPropertyNamesCheck={true}
                    loadingOverlayComponent={loadingOverlayComponent}
                    loadingOverlayComponentParams={
                        loadingOverlayComponentParams
                    }
                    overlayNoRowsTemplate={overlayNoRowsTemplate}
                    onColumnResized={onColumnResized}
                    enableCellTextSelection
                    {...props}
                />
            </Box>
        );
    }
);
