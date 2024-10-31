/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { NetworkModificationMetadata } from './network-modification-menu.type';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { setModificationActivated } from 'services/study/network-modifications';
import { Switch, Tooltip } from '@mui/material';
import { UUID } from 'crypto';
import { FormattedMessage } from 'react-intl';

interface SwitchNetworkModificationActiveProps {
    modificationUuid: UUID;
    modificationActivated: boolean;
    setModifications: Dispatch<SetStateAction<NetworkModificationMetadata[]>>;
    disabled?: boolean;
}

export const SwitchNetworkModificationActive = (props: SwitchNetworkModificationActiveProps) => {
    const { setModifications, modificationActivated, modificationUuid, disabled = false } = props;
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [isLoading, setIsLoading] = useState(false);
    const { snackError } = useSnackMessage();

    const updateModification = useCallback(
        (activated: boolean) => {
            setModificationActivated(studyUuid, currentNode?.id, modificationUuid, activated)
                .catch((err) => {
                    snackError({ messageTxt: err.message, messageId: 'networkModificationActivationError' });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [studyUuid, currentNode?.id, modificationUuid, snackError]
    );

    const toggleModificationActive = useCallback(() => {
        setIsLoading(true);
        setModifications((oldModifications) => {
            const newModifications = [...oldModifications];
            const modificationToUpdate = newModifications.find((m) => m.uuid === modificationUuid);
            if (!modificationToUpdate) {
                return oldModifications;
            }
            modificationToUpdate.activated = !modificationToUpdate.activated;
            updateModification(modificationToUpdate.activated);
            return newModifications;
        });
    }, [modificationUuid, updateModification, setModifications]);

    return (
        <Tooltip title={<FormattedMessage id={modificationActivated ? 'disable' : 'enable'} />} arrow>
            <span>
                <Switch
                    size="small"
                    disabled={isLoading || disabled}
                    checked={modificationActivated}
                    onClick={toggleModificationActive}
                />
            </span>
        </Tooltip>
    );
};
