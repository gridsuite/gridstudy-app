/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { ElementType, DirectoryItemSelector, TreeViewFinderNodeProps } from '@gridsuite/commons-ui';
import { FunctionComponent } from 'react';

interface ImportCaseDialogProps {
    open: boolean;
    onClose: () => void;
    onSelectCase: (selectedElement: TreeViewFinderNodeProps) => void;
}

const ImportCaseDialog: FunctionComponent<ImportCaseDialogProps> = ({ open, onClose, onSelectCase }) => {
    const intl = useIntl();

    const processSelectedElements = (selectedElements: TreeViewFinderNodeProps[]) => {
        if (selectedElements && selectedElements.length > 0) {
            const selectedCase = selectedElements[0]; // Assuming single selection
            onSelectCase(selectedCase);
        }
        onClose();
    };

    return (
        <DirectoryItemSelector
            open={open}
            onClose={processSelectedElements}
            types={[ElementType.CASE]}
            title={intl.formatMessage({
                id: 'chooseCase',
            })}
            multiSelect={false}
        />
    );
};

export default ImportCaseDialog;
