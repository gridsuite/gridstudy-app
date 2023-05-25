import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
    menuItem: {
        padding: '0px',
        margin: '7px',
    },
    listItemText: {
        fontSize: 12,
        padding: '0px',
        margin: '4px',
    },
}));

const NodeMenuItem = ({ item }) => {
    const classes = useStyles();
    const intl = useIntl();

    return (
        <>
            {item && (
                <MenuItem
                    className={classes.menuItem}
                    onClick={item.action}
                    disabled={item.disabled}
                >
                    <ListItemText
                        className={classes.listItemText}
                        primary={
                            <Typography noWrap>
                                {intl.formatMessage({
                                    id: item.id,
                                })}
                            </Typography>
                        }
                    />
                </MenuItem>
            )}
        </>
    );
};

NodeMenuItem.protoTypes = {
    item: PropTypes.object.isRequired,
};
export default NodeMenuItem;
