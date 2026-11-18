/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Badge, Button, ListSubheader, Menu, Tooltip } from '@mui/material';
import { Dataset as DatasetIcon } from '@mui/icons-material';
import { type TooltipIconButtonProps } from '../../../common/tooltip-icon-button';
import { useSelector } from 'react-redux';
import { type MuiStyles } from '@gridsuite/commons-ui';
import type { AppState } from '../../../../redux/reducer.type';
import { SpreadsheetEquipmentType } from '../../types/spreadsheet.type';
import PartialLoadingMenuItem from './PartialLoadingMenuItem';
import { updateSpreadsheetParameters } from '../../../../services/study/spreadsheet';
import { spreadsheetStyles } from '../../spreadsheet.style';
import { useSpreadsheetOptionalLoadingParameters } from '../../hooks/use-spreadsheet-optional-loading-parameters';

const styles = {
    headers: () => ({
        backgroundColor: 'transparent',
    }),
} as const satisfies MuiStyles;

type PartialLoadingMenuButtonProps = {
    disabled?: boolean;
};

export default function PartialLoadingMenuButton({ disabled }: Readonly<PartialLoadingMenuButtonProps>) {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>(undefined);

    const {
        remoteBranchOlg,
        remoteLineOlg,
        remoteLineBus: lineBus,
        remoteTwtOlg,
        remoteGeneratorRegTerm,
        remoteGeneratorBus: generatorBus,
        remoteBatteryRegTerm,
        remoteBusNetworkComponents,
    } = useSpreadsheetOptionalLoadingParameters();
    const remoteLineBus = lineBus ?? false;
    const remoteGeneratorBus = generatorBus ?? false;
    const [localBranchOlg, setLocalBranchOlg] = useState<boolean>(remoteBranchOlg);
    const [localLineOlg, setLocalLineOlg] = useState<boolean>(remoteLineOlg);
    const [localLineBus, setLocalLineBus] = useState<boolean>(remoteLineBus);
    const [localTwtOlg, setLocalTwtOlg] = useState<boolean>(remoteTwtOlg);
    const [localGeneratorRegTerm, setLocalGeneratorRegTerm] = useState<boolean>(remoteGeneratorRegTerm);
    const [localGeneratorBus, setLocalGeneratorBus] = useState<boolean>(remoteGeneratorBus);
    const [localBatteryRegTerm, setLocalBatteryRegTerm] = useState<boolean>(remoteBatteryRegTerm);
    const [localBusNetworkComponents, setLocalBusNetworkComponents] = useState<boolean>(remoteBusNetworkComponents);

    const handleClick = useCallback<NonNullable<TooltipIconButtonProps['onClick']>>(
        (event) => {
            setAnchorEl(event.currentTarget);
            setLocalBranchOlg(remoteBranchOlg);
            setLocalLineOlg(remoteLineOlg);
            setLocalLineBus(remoteLineBus);
            setLocalTwtOlg(remoteTwtOlg);
            setLocalGeneratorRegTerm(remoteGeneratorRegTerm);
            setLocalGeneratorBus(remoteGeneratorBus);
            setLocalBatteryRegTerm(remoteBatteryRegTerm);
            setLocalBusNetworkComponents(remoteBusNetworkComponents);
        },
        [
            remoteBatteryRegTerm,
            remoteBranchOlg,
            remoteBusNetworkComponents,
            remoteGeneratorRegTerm,
            remoteGeneratorBus,
            remoteLineOlg,
            remoteLineBus,
            remoteTwtOlg,
        ]
    );

    const handleClose = useCallback(() => {
        setAnchorEl(undefined);
        if (
            localBranchOlg !== remoteBranchOlg ||
            localLineOlg !== remoteLineOlg ||
            localLineBus !== remoteLineBus ||
            localTwtOlg !== remoteTwtOlg ||
            localGeneratorRegTerm !== remoteGeneratorRegTerm ||
            localGeneratorBus !== remoteGeneratorBus ||
            localBatteryRegTerm !== remoteBatteryRegTerm ||
            localBusNetworkComponents !== remoteBusNetworkComponents
        ) {
            if (studyUuid) {
                updateSpreadsheetParameters(studyUuid, {
                    [SpreadsheetEquipmentType.BRANCH]: { operationalLimitsGroups: localBranchOlg },
                    [SpreadsheetEquipmentType.LINE]: { operationalLimitsGroups: localLineOlg, bus: localLineBus },
                    [SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER]: {
                        operationalLimitsGroups: localTwtOlg,
                    },
                    [SpreadsheetEquipmentType.GENERATOR]: {
                        regulatingTerminal: localGeneratorRegTerm,
                        bus: localGeneratorBus,
                    },
                    [SpreadsheetEquipmentType.BUS]: {
                        networkComponents: localBusNetworkComponents,
                    },
                    [SpreadsheetEquipmentType.BATTERY]: {
                        regulatingTerminal: localBatteryRegTerm,
                    },
                });
            }
        }
    }, [
        localBranchOlg,
        remoteBranchOlg,
        localLineOlg,
        remoteLineOlg,
        localLineBus,
        remoteLineBus,
        localTwtOlg,
        remoteTwtOlg,
        localGeneratorRegTerm,
        remoteGeneratorRegTerm,
        localGeneratorBus,
        remoteGeneratorBus,
        localBatteryRegTerm,
        remoteBatteryRegTerm,
        localBusNetworkComponents,
        remoteBusNetworkComponents,
        studyUuid,
    ]);

    const open = anchorEl !== undefined;

    const isOptionalData = useMemo(
        () =>
            remoteBranchOlg ||
            remoteLineOlg ||
            remoteLineBus ||
            remoteTwtOlg ||
            remoteGeneratorRegTerm ||
            remoteGeneratorBus ||
            remoteBatteryRegTerm ||
            remoteBusNetworkComponents,
        [
            remoteBatteryRegTerm,
            remoteBranchOlg,
            remoteBusNetworkComponents,
            remoteGeneratorRegTerm,
            remoteGeneratorBus,
            remoteLineOlg,
            remoteLineBus,
            remoteTwtOlg,
        ]
    );

    return (
        <>
            <Badge variant="dot" color="secondary" invisible={!isOptionalData}>
                <Tooltip title={<FormattedMessage id="spreadsheet/tabs/lazy_loading/toolbar_button_tooltip" />}>
                    <span>
                        <Button
                            sx={spreadsheetStyles.toolbarButton}
                            size={'small'}
                            onClick={handleClick}
                            disabled={disabled}
                        >
                            <DatasetIcon />
                        </Button>
                    </span>
                </Tooltip>
            </Badge>
            <Menu
                id="lazy-loading-menu"
                open={open}
                onClose={handleClose}
                anchorEl={anchorEl}
                variant="menu"
                slotProps={{
                    list: {
                        'aria-labelledby': 'lazy-loading-button',
                        sx: { py: 0 },
                    },
                }}
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
                <PartialLoadingMenuItem
                    value={localLineBus}
                    labelId="spreadsheet/tabs/lazy_loading/labels/bus"
                    onChange={setLocalLineBus}
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
                <PartialLoadingMenuItem
                    value={localGeneratorBus}
                    labelId="spreadsheet/tabs/lazy_loading/labels/bus"
                    onChange={setLocalGeneratorBus}
                />

                <ListSubheader sx={styles.headers}>
                    <FormattedMessage id="BATTERY" />
                </ListSubheader>
                <PartialLoadingMenuItem
                    value={localBatteryRegTerm}
                    labelId="spreadsheet/tabs/lazy_loading/labels/regulatingTerminal"
                    onChange={setLocalBatteryRegTerm}
                />

                <ListSubheader sx={styles.headers}>
                    <FormattedMessage id="BUS" />
                </ListSubheader>
                <PartialLoadingMenuItem
                    value={localBusNetworkComponents}
                    labelId="spreadsheet/tabs/lazy_loading/labels/networkComponentsInformation"
                    onChange={setLocalBusNetworkComponents}
                />
            </Menu>
        </>
    );
}
