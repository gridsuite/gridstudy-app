/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import DirectorySelector from './directory-selector';
import { useIntl } from 'react-intl';

const MoveDialog = ({ open, onClose, items }) => {
    const intl = useIntl();

    return (
        <DirectorySelector
            open={open}
            onClose={onClose}
            title={intl.formatMessage({ id: 'moveItemTitle' })}
            validationButtonText={intl.formatMessage(
                {
                    id: 'moveItemValidate',
                },
                {
                    nbElements: items.length,
                }
            )}
            contentText={intl.formatMessage({ id: 'moveItemContentText' })}
        />
    );
};

MoveDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    items: PropTypes.array.isRequired,
};

export default MoveDialog;
