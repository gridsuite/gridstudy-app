/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, MouseEvent, useCallback } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { SPREADSHEET_SAVE_OPTIONS } from './utils/constants';
import SaveIcon from '@mui/icons-material/Save';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/reducer';
import { PARAM_DEVELOPER_MODE } from '../../utils/config-params';
import CustomSpreadsheetSaveDialog from './custom-spreadsheet/custom-spreadsheet-save-dialog';
import { useStateBoolean } from '@gridsuite/commons-ui';

interface SpreadsheetSaveProps {
    indexTab: number;
}

export default function SpreadsheetSave({ indexTab }: Readonly<SpreadsheetSaveProps>) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const developerMode = useSelector((state: AppState) => state[PARAM_DEVELOPER_MODE]);
    const customSaveDialogOpen = useStateBoolean(false);

    const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleMenuItemClick = useCallback(
        (option: { id: string; label: string }) => {
            if (option.id === SPREADSHEET_SAVE_OPTIONS.SAVE_MODEL.id) {
                customSaveDialogOpen.setTrue();
            }
            if (option.id === SPREADSHEET_SAVE_OPTIONS.EXPORT_CSV.id) {
                // TODO
            }
            handleClose();
        },
        [customSaveDialogOpen, handleClose]
    );

    return (
        <>
            <span>
                <FormattedMessage id="spreadsheet/save/button" />
            </span>
            <IconButton aria-label="dialog" onClick={handleClick}>
                <SaveIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                {Object.values(SPREADSHEET_SAVE_OPTIONS)
                    .filter((option) => developerMode || !option.devMode)
                    .map((option) => (
                        <MenuItem key={option.id} onClick={() => handleMenuItemClick(option)}>
                            {<FormattedMessage id={option.label} />}
                        </MenuItem>
                    ))}
            </Menu>
            <CustomSpreadsheetSaveDialog indexTab={indexTab} open={customSaveDialogOpen}></CustomSpreadsheetSaveDialog>
        </>
    );
}
