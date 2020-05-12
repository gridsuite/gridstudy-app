/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import {FormattedMessage} from "react-intl";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import React from "react";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";

/**
 * Dialog to delete an element #TODO To be moved in the common-ui repository once it has been created
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {EventListener} onClick Event to submit the deletion
 * @param {String} title Title of the dialog
 * @param {String} message Message of the dialog
 */
const DeleteDialog = ({ open, onClose, onClick, title, message }) => {

    const handleClose = () => {
        onClose();
    };

    const handleClick = () => {
        console.debug("Request for deletion");
        onClick();
    };

    const handleKeyPressed = (event) => {
        if (open && event.key === "Enter") {
            handleClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} aria-labelledby="dialog-title-delete" onKeyPress={handleKeyPressed}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="outlined"><FormattedMessage id="cancel" /></Button>
                <Button onClick={handleClick} variant="text"><FormattedMessage id="delete" /></Button>
            </DialogActions>
        </Dialog>
    )
}

DeleteDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
};

/**
 * Dialog to rename an element #TODO To be moved in the common-ui repository once it has been created
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {EventListener} onClick Event to submit the renaming
 * @param {String} title Title of the dialog
 * @param {String} message Message of the dialog
 * @param {String} currentName Name before renaming
 */
const RenameDialog = ({ open, onClose, onClick, title, message, currentName }) => {

    const [newNameValue, setNewNameValue] = React.useState(currentName);

    const updateNameValue= (event) => {
        setNewNameValue(event.target.value);
    };

    const handleClick = () => {
        if (currentName !== newNameValue) {
            console.debug("Request for renaming : " + currentName + " => " + newNameValue);
            onClick(newNameValue);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        onClose();
    }

    const handleExited = () => {
        setNewNameValue(currentName);
    };

    const handleKeyPressed = (event) => {
        if (open && event.key === "Enter") {
            handleClick();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} onExited={handleExited} aria-labelledby="dialog-title-rename" onKeyPress={handleKeyPressed}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <InputLabel htmlFor="newName">{message}</InputLabel>
                <TextField autoFocus value={newNameValue} required={true} onChange={updateNameValue}  />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="text"><FormattedMessage id="cancel" /></Button>
                <Button onClick={handleClick} variant="outlined"><FormattedMessage id="rename"  /></Button>
            </DialogActions>
        </Dialog>
    );
};

RenameDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    currentName: PropTypes.string.isRequired,
};

export { DeleteDialog, RenameDialog };