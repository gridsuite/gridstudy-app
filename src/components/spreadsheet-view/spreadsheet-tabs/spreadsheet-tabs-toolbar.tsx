/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, type GridProps } from '@mui/material';
import { Restore as RestoreIcon, Save as SaveIcon } from '@mui/icons-material';
import { FormattedMessage } from 'react-intl';
import NodesConfigButton from '../spreadsheet/spreadsheet-toolbar/nodes-config/nodes-config-button';
import TooltipIconButton from '../../common/tooltip-icon-button';
import PartialLoadingMenuButton from './toolbar/PartialLoadingMenuButton';
import { spreadsheetStyles } from '../spreadsheet.style';

export type SpreadsheetTabsToolbarProps = Omit<GridProps, 'item' | 'container'> & {
    selectedTabIndex: number;
    disabled: boolean;
    onSaveClick: () => void;
    onExportClick: () => void;
};

export default function SpreadsheetTabsToolbar({
    disabled,
    onSaveClick,
    onExportClick,
    selectedTabIndex,
    padding,
    ...props
}: Readonly<SpreadsheetTabsToolbarProps>) {
    return (
        <Grid item container {...props}>
            <Grid item padding={padding}>
                <NodesConfigButton disabled={disabled} />
            </Grid>
            <Grid item padding={padding}>
                <PartialLoadingMenuButton disabled={disabled} />
            </Grid>
            <Grid item padding={padding}>
                <TooltipIconButton
                    tooltip={<FormattedMessage id="spreadsheet/collection/save/button_tooltip" />}
                    sx={spreadsheetStyles.toolbarButton}
                    size="small"
                    onClick={onSaveClick}
                    disabled={disabled}
                >
                    <SaveIcon />
                </TooltipIconButton>
            </Grid>
            <Grid item padding={padding}>
                <TooltipIconButton
                    tooltip={<FormattedMessage id="spreadsheet/reset_spreadsheet_collection/button_tooltip" />}
                    sx={spreadsheetStyles.toolbarButton}
                    size="small"
                    onClick={onExportClick}
                    disabled={disabled}
                >
                    <RestoreIcon />
                </TooltipIconButton>
            </Grid>
        </Grid>
    );
}
