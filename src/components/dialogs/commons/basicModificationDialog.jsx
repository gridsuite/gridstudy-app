/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';
import ModificationDialogContent from './modification-dialog-content';

/**
 * Generic Modification Dialog which manage basic common behaviors
 * @param {EventListener} onClose Event to close the dialog
 * @param {CallbackEvent} onClear callback when the dialog needs to be cleared
 * @param {CallbackEvent} onSave callback when saving the modification
 * @param {Boolean} disabledSave to control disabled prop of the validate button
 * @param {Array} props props that are forwarded to the MUI Dialog component
 */
const BasicModificationDialog = ({ onClose, onClear, onSave, disabledSave = false, ...props }) => {
    const closeAndClear = (event, reason) => {
        onClear();
        onClose(event, reason);
    };

    const handleSubmit = (event) => {
        onSave();
        // do not wait fetch response and close dialog, errors will be shown in snackbar.
        closeAndClear(event, 'validateButtonClick');
    };

    const submitButton = (
        <Button onClick={handleSubmit} variant="outlined" disabled={disabledSave}>
            <FormattedMessage id="validate" />
        </Button>
    );

    return <ModificationDialogContent submitButton={submitButton} closeAndClear={closeAndClear} {...props} />;
};

BasicModificationDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    disabledSave: PropTypes.bool,
};

export default BasicModificationDialog;
