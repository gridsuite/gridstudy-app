/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button, Grid, type GridProps, Theme, Tooltip } from '@mui/material';
import NodesConfigButton from '../spreadsheet/spreadsheet-toolbar/nodes-config/nodes-config-button';
import { FormattedMessage } from 'react-intl';
import { Save as SaveIcon } from '@mui/icons-material';
import { Restore as RestoreIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { updateNodeAliases } from '../../../services/study/node-alias';
import { NodeAlias } from '../types/node-alias.type';

const styles = {
    resetButton: (theme: Theme) => ({
        color: theme.palette.primary.main,
        minWidth: '100%',
    }),
    saveButton: (theme: Theme) => ({
        color: theme.palette.primary.main,
        minWidth: '100%',
    }),
};

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
                <Tooltip title={<FormattedMessage id="spreadsheet/collection/save/button_tooltip" />}>
                    <span>
                        <Button sx={styles.saveButton} size={'small'} onClick={onSaveClick} disabled={disabled}>
                            <SaveIcon />
                        </Button>
                    </span>
                </Tooltip>
            </Grid>
            <Grid item padding={padding}>
                <Tooltip title={<FormattedMessage id="spreadsheet/reset_spreadsheet_collection/button_tooltip" />}>
                    <span>
                        <Button sx={styles.resetButton} size="small" onClick={onExportClick} disabled={disabled}>
                            <RestoreIcon />
                        </Button>
                    </span>
                </Tooltip>
            </Grid>
        </Grid>
    );
}
