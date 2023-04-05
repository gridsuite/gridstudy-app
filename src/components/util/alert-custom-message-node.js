import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Alert from '@mui/material/Alert';
import { FormattedMessage } from 'react-intl';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
    customMessageNode: {
        position: 'absolute',
        top: '30%',
        left: '43%',
    },
}));

const AlertCustomMessageNode = (props) => {
    const classes = useStyles();
    const { noMargin, message } = props;

    return (
        <Alert
            className={clsx({ [classes.customMessageNode]: !noMargin })}
            severity="warning"
        >
            <FormattedMessage id={message} />
        </Alert>
    );
};

AlertCustomMessageNode.defaultProps = {
    noMargin: false,
    message: '',
};

AlertCustomMessageNode.propTypes = {
    noMargin: PropTypes.bool,
    message: PropTypes.string,
};

export default AlertCustomMessageNode;
