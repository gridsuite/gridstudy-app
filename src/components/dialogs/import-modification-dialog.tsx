/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { elementType, useSnackMessage } from '@gridsuite/commons-ui';
import DirectoryItemSelector from '../directory-item-selector';
import { CopyType } from '../graph/menus/network-modification-node-editor';
import { copyOrMoveModifications } from '../../services/study';
import { UUID } from 'crypto';
import { FunctionComponent } from 'react';

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
    currentNode: { id: string };
    studyUuid: UUID;
}

const ImportModificationDialog: FunctionComponent<
    ImportModificationDialogProps
> = ({ open, onClose, currentNode, studyUuid }) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const processSelectedElements = (selectedElements: any[]) => {
        const copyInfos = {
            copyType: CopyType.COPY,
        };
        const modificationUuidList = selectedElements.map((e) => e.id);
        // import selected modifications
        if (modificationUuidList.length > 0) {
            copyOrMoveModifications(
                studyUuid,
                currentNode.id,
                modificationUuidList,
                copyInfos
            ).catch((errmsg) => {
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
            types={[elementType.MODIFICATION]}
            multiselect={true}
            title={intl.formatMessage({
                id: 'ModificationsSelection',
            })}
        />
    );
};

export default ImportModificationDialog;
