/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, MouseEvent, useCallback } from 'react';
import { Button, Menu, MenuItem, Theme, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useStateBoolean } from '@gridsuite/commons-ui';
import { NEW_SPREADSHEET_CREATION_OPTIONS, SpreadsheetOption } from '../constants';
import { FormattedMessage } from 'react-intl';
import { SpreadsheetTabDefinition } from '../config/spreadsheet.type';

interface CustomSpreadsheetConfigProps {
    disabled: boolean;
    resetTabIndex: (newTablesDefinitions: SpreadsheetTabDefinition[]) => void;
}

const styles = {
    addButton: (theme: Theme) => ({
        color: theme.palette.primary.main,
    }),
};

const CustomSpreadsheetConfig: React.FC<CustomSpreadsheetConfigProps> = ({ disabled, resetTabIndex }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const dialogOpen = useStateBoolean(false);
    const [selectedOption, setSelectedOption] = useState<SpreadsheetOption | undefined>();

    const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleMenuItemClick = useCallback(
        (option: SpreadsheetOption) => {
            setSelectedOption(option);
            dialogOpen.setTrue();
            handleClose();
        },
        [dialogOpen, handleClose]
    );

    const SelectedDialog = selectedOption?.dialog;

    return (
        <>
            <Tooltip title={<FormattedMessage id="spreadsheet/create_new_spreadsheet/add_button_tooltip" />}>
                <Button onClick={handleClick} disabled={disabled} sx={styles.addButton}>
                    <AddIcon />
                </Button>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                {Object.values(NEW_SPREADSHEET_CREATION_OPTIONS).map((option) => (
                    <MenuItem key={option.id} onClick={() => handleMenuItemClick(option)}>
                        {<FormattedMessage id={option.label} />}
                    </MenuItem>
                ))}
            </Menu>

            {SelectedDialog && <SelectedDialog open={dialogOpen} resetTabIndex={resetTabIndex} />}
        </>
    );
};

export default CustomSpreadsheetConfig;
