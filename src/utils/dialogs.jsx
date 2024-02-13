/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { FormattedMessage } from 'react-intl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import React from 'react';
import { CancelButton } from '@gridsuite/commons-ui';

const SelectOptionsDialog = ({
    open,
    onClose,
    onClick,
    title,
    child,
    style,
    validateKey,
}) => {
    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} sx={style}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent style={{ padding: '8px 32px 8px 15px' }}>
                {child}
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={handleClose} />
                <Button onClick={onClick} variant="outlined">
                    <FormattedMessage id={validateKey || 'validate'} />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

SelectOptionsDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    child: PropTypes.element.isRequired,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    validateKey: PropTypes.string,
};

export { SelectOptionsDialog };
