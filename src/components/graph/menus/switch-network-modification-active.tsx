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
import { setModificationActive } from 'services/study/network-modifications';
import { Switch } from '@mui/material';
import { UUID } from 'crypto';

interface SwitchNetworkModificationActiveProps {
    modificationUuid: UUID;
    modificationActive: boolean;
    setModifications: Dispatch<SetStateAction<NetworkModificationMetadata[]>>;
    disabled?: boolean;
}

export const SwitchNetworkModificationActive = (props: SwitchNetworkModificationActiveProps) => {
    const { setModifications, modificationActive, modificationUuid, disabled = false } = props;
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [isLoading, setIsLoading] = useState(false);
    const { snackError } = useSnackMessage();

    const updateModification = useCallback(
        (active: boolean) => {
            setModificationActive(studyUuid, currentNode?.id, modificationUuid, active)
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
            modificationToUpdate.active = !modificationToUpdate.active;
            updateModification(modificationToUpdate.active);
            return newModifications;
        });
    }, [modificationUuid, updateModification, setModifications]);

    return (
        <Switch
            size="small"
            disabled={isLoading || disabled}
            checked={modificationActive}
            onClick={toggleModificationActive}
        />
    );
};
