/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, type GridProps } from '@mui/material';
import { Restore as RestoreIcon, Save as SaveIcon } from '@mui/icons-material';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { type MuiStyles } from '@gridsuite/commons-ui';
import type { AppState } from '../../../redux/reducer';
import NodesConfigButton from '../spreadsheet/spreadsheet-toolbar/nodes-config/nodes-config-button';
import type { NodeAlias } from '../types/node-alias.type';
import TooltipIconButton from '../../common/tooltip-icon-button';
import PartialLoadingMenuButton from './toolbar/PartialLoadingMenuButton';

const styles = {
    button: (theme) => ({
        color: theme.palette.primary.main,
        minWidth: '100%',
    }),
} as const satisfies MuiStyles;

export type SpreadsheetTabsToolbarProps = Omit<GridProps, 'item' | 'container'> & {
    selectedTabIndex: number;
    disabled: boolean;
    nodeAliases: NodeAlias[] | undefined;
    updateNodeAliases: (nodeAliases: NodeAlias[]) => void;
    onSaveClick: () => void;
    onExportClick: () => void;
};

export default function SpreadsheetTabsToolbar({
    disabled,
    onSaveClick,
    onExportClick,
    selectedTabIndex,
    nodeAliases,
    updateNodeAliases,
    padding,
    ...props
}: Readonly<SpreadsheetTabsToolbarProps>) {
    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    return (
        <Grid item container {...props}>
            <Grid item padding={padding}>
                <NodesConfigButton
                    disabled={disabled}
                    tableType={tablesDefinitions[selectedTabIndex]?.type}
                    nodeAliases={nodeAliases}
                    updateNodeAliases={updateNodeAliases}
                />
            </Grid>
            <Grid item padding={padding}>
                <PartialLoadingMenuButton sx={styles.button} disabled={disabled} />
            </Grid>
            <Grid item padding={padding}>
                <TooltipIconButton
                    tooltip={<FormattedMessage id="spreadsheet/collection/save/button_tooltip" />}
                    sx={styles.button}
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
                    sx={styles.button}
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
