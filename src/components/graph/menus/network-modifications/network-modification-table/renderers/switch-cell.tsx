/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Switch, Tooltip } from '@mui/material';
import { ComposedModificationMetadata, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { setModificationMetadata } from 'services/study/network-modifications';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { useIsAnyNodeBuilding } from 'components/utils/is-any-node-building-hook';
import { AppState } from '../../../../../../redux/reducer.type';

export interface SwitchCellRendererProps {
    data: ComposedModificationMetadata;
}

const SwitchCell: FunctionComponent<SwitchCellRendererProps> = (props) => {
    const { data } = props;
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [isLoading, setIsLoading] = useState(false);
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const mapDataLoading = useSelector((state: AppState) => state.mapDataLoading);

    const { snackError } = useSnackMessage();

    const modificationUuid = data?.uuid;
    const [modificationActivated, setModificationActivated] = useState(data?.activated);

    // Re-sync the local checked state when the row data is refreshed (e.g. after a server notification).
    useEffect(() => {
        setModificationActivated(data?.activated);
    }, [data?.activated]);

    const toggleModificationActive = useCallback(
        (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
            if (!modificationUuid) {
                return;
            }

            setIsLoading(true);
            setModificationActivated(checked);

            setModificationMetadata(studyUuid, currentNode?.id, modificationUuid, {
                activated: checked,
                type: data?.type,
            })
                ?.catch((error) => {
                    setModificationActivated(data?.activated); // rollback
                    snackWithFallback(snackError, error, { headerId: 'networkModificationActivationError' });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [modificationUuid, studyUuid, currentNode?.id, data?.type, data?.activated, snackError]
    );

    return (
        <Tooltip
            title={<FormattedMessage id={modificationActivated ? 'deactivateModification' : 'activateModification'} />}
            arrow
            enterDelay={250}
        >
            <span>
                <Switch
                    size="small"
                    disabled={isLoading || isAnyNodeBuilding || mapDataLoading}
                    checked={modificationActivated}
                    onChange={toggleModificationActive}
                />
            </span>
        </Tooltip>
    );
};

export default SwitchCell;
