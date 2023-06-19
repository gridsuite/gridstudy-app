/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import RhfModificationDialog from './modification-dialog-content/rhf-modification-dialog';
import BasicModificationDialog from './modification-dialog-content/basic-modification-dialog';

/**
 * Generic Modification Dialog that can be used in a React Hook Form context, or not, depending on the need.
 * @param {Boolean} isReactHookForm use to define if the dialog is in a React Hook Form context or not.
 * @param {Array} props props that are forwarded to the corresponding dialog component
 */
const ModificationDialog = ({ isReactHookForm = true, ...props }) => {
    if (isReactHookForm) {
        return <RhfModificationDialog {...props} />;
    } else {
        return <BasicModificationDialog {...props} />;
    }
};

export default ModificationDialog;
