/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { changeStudyAccessRights } from '../utils/rest-api';
import { FormattedMessage, useIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import FormControl from '@material-ui/core/FormControl';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import Alert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';

/**
 * Dialog to change the access rights of a study #TODO To be moved in the common-ui repository once it has been created
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param studyUuid the uuid of the study to export
 * @param userId the name of the logged in user
 * @param {String} title Title of the dialog
 * @param {String} isPrivate tells if the study is private or not
 */
const AccessRightsDialog = ({
    open,
    onClose,
    studyUuid,
    userId,
    title,
    isPrivate,
}) => {
    const [loading, setLoading] = React.useState(false);

    const [selected, setSelected] = React.useState(
        isPrivate !== undefined ? isPrivate.toString() : null
    );

    const [error, setError] = React.useState('');

    const useStyles = makeStyles(() => ({
        formControl: {
            minWidth: 300,
        },
    }));

    const handleClick = () => {
        setLoading(true);
        changeStudyAccessRights(studyUuid, userId, selected).then(
            (response) => {
                if (!response.ok) {
                    setError(
                        intl.formatMessage({ id: 'modifyAccessRightsError' })
                    );
                } else {
                    onClose();
                }
            }
        );
        setLoading(false);
    };

    const handleClose = () => {
        onClose();
        setLoading(false);
        setError('');
    };

    const handleExited = () => {
        onClose();
        setLoading(false);
        setError('');
    };

    const handleChange = (event) => {
        setSelected(event.target.value);
    };

    const classes = useStyles();
    const intl = useIntl();

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            onExited={handleExited}
            aria-labelledby="dialog-title-accessRights"
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <FormControl className={classes.formControl}>
                    <RadioGroup
                        aria-label=""
                        name="studyAccessRights"
                        value={selected}
                        onChange={handleChange}
                        row
                    >
                        <FormControlLabel
                            value="false"
                            control={<Radio />}
                            label=<FormattedMessage id="public" />
                        />
                        <FormControlLabel
                            value="true"
                            control={<Radio />}
                            label=<FormattedMessage id="private" />
                        />
                    </RadioGroup>
                    {error !== '' && <Alert severity="error">{error}</Alert>}
                </FormControl>
                {loading && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '5px',
                        }}
                    >
                        <CircularProgress />
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="text">
                    <FormattedMessage id="cancel" />
                </Button>
                <Button onClick={handleClick} variant="outlined">
                    <FormattedMessage id="edit" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

AccessRightsDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    studyUuid: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    isPrivate: PropTypes.bool.isRequired,
};

export default AccessRightsDialog;
