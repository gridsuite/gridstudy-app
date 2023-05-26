import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
    menuItem: {
        // NestedMenu item manages only label prop of string type
        // It fix paddings itself then we must force this padding
        // to justify menu items texts
        paddingLeft: '12px',
    },
}));

const NodeMenuItem = ({ item }) => {
    const classes = useStyles();

    return (
        <MenuItem
            className={classes.menuItem}
            onClick={item.action}
            disabled={item.disabled}
        >
            <ListItemText
                primary={
                    <Typography>
                        <FormattedMessage id={item.id} />
                    </Typography>
                }
            />
        </MenuItem>
    );
};

NodeMenuItem.protoTypes = {
    item: PropTypes.object.isRequired,
};
export default NodeMenuItem;
