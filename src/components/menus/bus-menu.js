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

export const BusMenu = ({
    busId,
    handleRunShortcircuitAnalysis,
    position,
    closeBusMenu,
}) => {
    const classes = useStyles();
    return (
        <Menu
            className={classes.menu}
            open={true}
            anchorReference="anchorPosition"
            anchorPosition={{
                position: 'absolute',
                top: position[1],
                left: position[0],
            }}
            onClose={closeBusMenu}
        >
            <MenuItem
                className={classes.menuItem}
                onClick={() => handleRunShortcircuitAnalysis(busId)}
                selected={false}
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
