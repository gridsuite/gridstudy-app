/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ListItemIcon, ListItemText, Menu, Typography } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import { FormattedMessage } from 'react-intl';
import { FunctionComponent, useCallback, useMemo } from 'react';
import {
    isNodeBuilt,
    isNodeReadOnly,
} from 'components/graph/util/model-functions';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';
import { useIsAnyNodeBuilding } from 'components/utils/is-any-node-building-hook';
import { ComputingType } from 'components/computing-status/computing-type';
import { RunningStatus } from 'components/utils/running-status';
import { CustomMenuItem } from '../utils/custom-nested-menu';

interface BusMenuProps {
    busId: string;
    handleRunShortcircuitAnalysis: (busId: string) => void;
    position: [number, number];
    closeBusMenu: () => void;
}

const styles = {
    menu: {
        minWidth: '300px',
        maxHeight: '800px',
        overflowY: 'visible',
    },
    menuItem: {
        // NestedMenu item manages only label prop of string type
        // It fix paddings itself then we must force this padding
        // to justify menu items texts
        paddingLeft: '12px',
    },
};

export const BusMenu: FunctionComponent<BusMenuProps> = ({
    busId,
    handleRunShortcircuitAnalysis,
    position,
    closeBusMenu,
}) => {
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );

    const oneBusShortcircuitAnalysisState = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS]
    );

    const isAnyNodeBuilding = useIsAnyNodeBuilding();

    const handleClickRunShortcircuitAnalysis = useCallback(
        () => handleRunShortcircuitAnalysis(busId),
        [busId, handleRunShortcircuitAnalysis]
    );

    const isNodeEditable = useMemo(
        () =>
            isNodeBuilt(currentNode) &&
            !isNodeReadOnly(currentNode) &&
            !isAnyNodeBuilding,
        [currentNode, isAnyNodeBuilding]
    );

    return (
        <Menu
            sx={styles.menu}
            open={true}
            anchorReference="anchorPosition"
            anchorPosition={{
                top: position[1],
                left: position[0],
            }}
            onClose={closeBusMenu}
        >
            <CustomMenuItem
                sx={styles.menuItem}
                onClick={handleClickRunShortcircuitAnalysis}
                selected={false}
                disabled={
                    oneBusShortcircuitAnalysisState === RunningStatus.RUNNING ||
                    !isNodeEditable
                }
            >
                <ListItemIcon>
                    <BoltIcon />
                </ListItemIcon>

                <ListItemText
                    primary={
                        <Typography noWrap>
                            <FormattedMessage id="ShortCircuitAnalysis" />
                        </Typography>
                    }
                />
            </CustomMenuItem>
        </Menu>
    );
};
