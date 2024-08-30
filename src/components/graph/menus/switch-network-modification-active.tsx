/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react';
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
    hidden?: boolean;
}

export const SwitchNetworkModificationActive = (props: SwitchNetworkModificationActiveProps) => {
    const { setModifications, modificationActive, modificationUuid, hidden = false } = props;
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [isLoading, setIsLoading] = useState(false);
    const { snackError } = useSnackMessage();
    const previousModificationActive = useRef(modificationActive);

    const updateModification = useCallback(
        (active: boolean) => {
            setIsLoading(true);
            setModificationActive(studyUuid, currentNode?.id, modificationUuid, active)
                .catch((err) => {
                    setModifications((oldModifications) => {
                        const newModifications = [...oldModifications];
                        const modificationToUpdate = newModifications.find((m) => m.uuid === modificationUuid);
                        if (!modificationToUpdate) {
                            return oldModifications;
                        }
                        modificationToUpdate.active = !active;

                        return newModifications;
                    });
                    snackError({ messageTxt: err.message });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [studyUuid, currentNode?.id, modificationUuid]
    );

    const toggleModificationActive = useCallback(() => {
        // update locally and send modification as debounce to prevent sending multiple request if user is clicking multiple times
        setModifications((oldModifications) => {
            const newModifications = [...oldModifications];
            const modificationToUpdate = newModifications.find((m) => m.uuid === modificationUuid);
            if (!modificationToUpdate) {
                return oldModifications;
            }
            previousModificationActive.current = modificationToUpdate.active;
            modificationToUpdate.active = !modificationToUpdate.active;
            updateModification(modificationToUpdate.active);
            return newModifications;
        });
    }, [modificationUuid, updateModification, setModifications]);

    return (
        <Switch
            sx={hidden ? { display: 'none' } : {}}
            disabled={isLoading}
            checked={modificationActive}
            onClick={() => toggleModificationActive()}
        />
    );
};
