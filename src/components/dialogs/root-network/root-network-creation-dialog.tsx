/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import RootNetworkDialog from './root-network-dialog';

const RootNetworkCreationDialog: React.FC<any> = ({ open, onSave, onClose, titleId, dialogProps }) => {
    return (
        <RootNetworkDialog
            open={open}
            onSave={onSave}
            onClose={onClose}
            titleId={titleId}
            dialogProps={dialogProps}
            isCreationMode={true}
        />
    );
};

export default RootNetworkCreationDialog;
