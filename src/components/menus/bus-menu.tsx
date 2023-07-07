import {
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
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

interface BusMenuProps {
    busId: string;
    handleRunShortcircuitAnalysis: (busId: string) => void;
    position: [number, number];
    closeBusMenu: () => void;
}

const useStyles = makeStyles((theme) => ({
    menu: {
        minWidth: 300,
        maxHeight: 800,
        overflowY: 'visible',
    },
    menuItem: {
        // NestedMenu item manages only label prop of string type
        // It fix paddings itself then we must force this padding
        // to justify menu items texts
        paddingLeft: '12px',
    },
}));

export const BusMenu: FunctionComponent<BusMenuProps> = ({
    busId,
    handleRunShortcircuitAnalysis,
    position,
    closeBusMenu,
}) => {
    const classes = useStyles();
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );
    const isAnyNodeBuilding = useIsAnyNodeBuilding();

    const handleClickRunShortcircuitAnalysis = useCallback(
        () => handleRunShortcircuitAnalysis(busId),
        [busId, handleRunShortcircuitAnalysis]
    );

    const isNodeEditable = useMemo(
        () =>
            busId &&
            isNodeBuilt(currentNode) &&
            !isNodeReadOnly(currentNode) &&
            !isAnyNodeBuilding,
        [currentNode, isAnyNodeBuilding]
    );

    return (
        <Menu
            className={classes.menu}
            open={true}
            anchorReference="anchorPosition"
            anchorPosition={{
                top: position[1],
                left: position[0],
            }}
            onClose={closeBusMenu}
        >
            <MenuItem
                className={classes.menuItem}
                onClick={handleClickRunShortcircuitAnalysis}
                selected={false}
                disabled={!isNodeEditable}
            >
                <ListItemIcon>
                    <BoltIcon />
                </ListItemIcon>

                <ListItemText
                    primary={
                        <Typography noWrap>
                            <FormattedMessage id="SelectiveShortCircuitAnalysis" />
                        </Typography>
                    }
                />
            </MenuItem>
        </Menu>
    );
};
