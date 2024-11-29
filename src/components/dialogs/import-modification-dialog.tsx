/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { ElementType, useSnackMessage, DirectoryItemSelector, TreeViewFinderNodeProps } from '@gridsuite/commons-ui';
import { copyOrMoveModifications } from '../../services/study';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { NetworkModificationCopyType } from 'components/graph/menus/network-modification-menu.type';

/**
 * Dialog to select some network modifications and append them in the current node
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param currentNode the current node
 * @param studyUuid Id of the current study
 */

interface ImportModificationDialogProps {
    open: boolean;
    onClose: () => void;
}

const ImportModificationDialog: FunctionComponent<ImportModificationDialogProps> = ({ open, onClose }) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    const processSelectedElements = (selectedElements: TreeViewFinderNodeProps[]) => {
        const copyInfos = {
            copyType: NetworkModificationCopyType.INSERT,
        };
        const modificationUuidList = selectedElements.map((e) => e.id);
        // import selected modifications
        if (modificationUuidList.length > 0 && studyUuid && currentNode) {
            copyOrMoveModifications(studyUuid, currentNode.id, modificationUuidList, copyInfos).catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'errDuplicateModificationMsg',
                });
            });
        }
        // close the file selector
        onClose();
    };

    return (
        <DirectoryItemSelector
            open={open}
            onClose={processSelectedElements}
            types={[ElementType.MODIFICATION]}
            multiSelect={true}
            title={intl.formatMessage({
                id: 'ModificationsSelection',
            })}
        />
    );
};

export default ImportModificationDialog;
