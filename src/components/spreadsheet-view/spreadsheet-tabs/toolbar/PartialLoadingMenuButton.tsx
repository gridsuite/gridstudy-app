/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Badge, ListSubheader, Menu } from '@mui/material';
import { Dataset as DatasetIcon, DatasetOutlined as DatasetDisabled } from '@mui/icons-material';
import TooltipIconButton, { type TooltipIconButtonProps } from '../../../common/tooltip-icon-button';
import { useSelector } from 'react-redux';
import { type MuiStyles } from '@gridsuite/commons-ui';
import type { AppState } from '../../../../redux/reducer';
import { SpreadsheetEquipmentType } from '../../types/spreadsheet.type';
import PartialLoadingMenuItem from './PartialLoadingMenuItem';
import { updateSpreadsheetParameters } from '../../../../services/study/spreadsheet';

const styles = {
    headers: (theme) => ({
        backgroundColor: 'transparent',
    }),
} as const satisfies MuiStyles;

export type PartialLoadingMenuButtonProps = Omit<TooltipIconButtonProps, 'tooltip' | 'size' | 'onClick'>;

export default function PartialLoadingMenuButton({ disabled, ...props }: Readonly<PartialLoadingMenuButtonProps>) {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const BtnIcon = disabled ? DatasetDisabled : DatasetIcon;
    const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>(undefined);

    const remoteBranchOlg = useSelector(
        (state: AppState) =>
            state.spreadsheetOptionalLoadingParameters[SpreadsheetEquipmentType.BRANCH].operationalLimitsGroups
    );
    const remoteLineOlg = useSelector(
        (state: AppState) =>
            state.spreadsheetOptionalLoadingParameters[SpreadsheetEquipmentType.LINE].operationalLimitsGroups
    );
    const remoteTwtOlg = useSelector(
        (state: AppState) =>
            state.spreadsheetOptionalLoadingParameters[SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER]
                .operationalLimitsGroups
    );
    const remoteGeneratorRegTerm = useSelector(
        (state: AppState) =>
            state.spreadsheetOptionalLoadingParameters[SpreadsheetEquipmentType.GENERATOR].regulatingTerminal
    );
    const [localBranchOlg, setLocalBranchOlg] = useState<boolean>(remoteBranchOlg);
    const [localLineOlg, setLocalLineOlg] = useState<boolean>(remoteLineOlg);
    const [localTwtOlg, setLocalTwtOlg] = useState<boolean>(remoteTwtOlg);
    const [localGeneratorRegTerm, setLocalGeneratorRegTerm] = useState<boolean>(remoteGeneratorRegTerm);

    const handleClick = useCallback<NonNullable<TooltipIconButtonProps['onClick']>>(
        (event) => {
            setAnchorEl(event.currentTarget);
            setLocalBranchOlg(remoteBranchOlg);
            setLocalLineOlg(remoteLineOlg);
            setLocalTwtOlg(remoteTwtOlg);
            setLocalGeneratorRegTerm(remoteGeneratorRegTerm);
        },
        [remoteBranchOlg, remoteGeneratorRegTerm, remoteLineOlg, remoteTwtOlg]
    );

    const handleClose = useCallback(() => {
        setAnchorEl(undefined);
        if (
            localBranchOlg !== remoteBranchOlg ||
            localLineOlg !== remoteLineOlg ||
            localTwtOlg !== remoteTwtOlg ||
            localGeneratorRegTerm !== remoteGeneratorRegTerm
        ) {
            if (studyUuid) {
                updateSpreadsheetParameters(studyUuid, {
                    [SpreadsheetEquipmentType.BRANCH]: { operationalLimitsGroups: localBranchOlg },
                    [SpreadsheetEquipmentType.LINE]: { operationalLimitsGroups: localLineOlg },
                    [SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER]: {
                        operationalLimitsGroups: localTwtOlg,
                    },
                    [SpreadsheetEquipmentType.GENERATOR]: {
                        regulatingTerminal: localGeneratorRegTerm,
                    },
                });
            }
        }
    }, [
        localBranchOlg,
        remoteBranchOlg,
        localLineOlg,
        remoteLineOlg,
        localTwtOlg,
        remoteTwtOlg,
        localGeneratorRegTerm,
        remoteGeneratorRegTerm,
        studyUuid,
    ]);

    const open = anchorEl !== undefined;

    const isOptionalData = useMemo(
        () => remoteBranchOlg || remoteLineOlg || remoteTwtOlg || remoteGeneratorRegTerm,
        [remoteBranchOlg, remoteGeneratorRegTerm, remoteLineOlg, remoteTwtOlg]
    );

    return (
        <>
            <TooltipIconButton
                id="lazy-loading-button"
                aria-controls={open ? 'lazy-loading-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                tooltip={<FormattedMessage id="spreadsheet/tabs/lazy_loading/toolbar_button_tooltip" />}
                size="small"
                disabled={disabled}
                onClick={handleClick}
                {...props}
            >
                <Badge variant="dot" color="secondary" invisible={!isOptionalData}>
                    <BtnIcon color={open ? 'action' : 'primary'} />
                </Badge>
            </TooltipIconButton>
            <Menu
                id="lazy-loading-menu"
                open={open}
                onClose={handleClose}
                anchorEl={anchorEl}
                MenuListProps={{
                    'aria-labelledby': 'lazy-loading-button',
                    sx: { py: 0 },
                }}
                variant="menu"
            >
                <ListSubheader sx={styles.headers}>
                    <FormattedMessage id="BRANCH" />
                </ListSubheader>
                <PartialLoadingMenuItem
                    value={localBranchOlg}
                    labelId="spreadsheet/tabs/lazy_loading/labels/operationalLimitsGroups"
                    onChange={setLocalBranchOlg}
                />

                <ListSubheader sx={styles.headers}>
                    <FormattedMessage id="LINE" />
                </ListSubheader>
                <PartialLoadingMenuItem
                    value={localLineOlg}
                    labelId="spreadsheet/tabs/lazy_loading/labels/operationalLimitsGroups"
                    onChange={setLocalLineOlg}
                />

                <ListSubheader sx={styles.headers}>
                    <FormattedMessage id="TWO_WINDINGS_TRANSFORMER" />
                </ListSubheader>
                <PartialLoadingMenuItem
                    value={localTwtOlg}
                    labelId="spreadsheet/tabs/lazy_loading/labels/operationalLimitsGroups"
                    onChange={setLocalTwtOlg}
                />

                <ListSubheader sx={styles.headers}>
                    <FormattedMessage id="GENERATOR" />
                </ListSubheader>
                <PartialLoadingMenuItem
                    value={localGeneratorRegTerm}
                    labelId="spreadsheet/tabs/lazy_loading/labels/regulatingTerminal"
                    onChange={setLocalGeneratorRegTerm}
                />
            </Menu>
        </>
    );
}
