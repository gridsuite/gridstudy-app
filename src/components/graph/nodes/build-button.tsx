/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BUILD_STATUS } from 'components/network/constants';
import React, { useCallback, useState } from 'react';
import { PlayCircleFilled, StopCircleOutlined } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import { buildNode, unbuildNode } from '../../../services/study';
import type { UUID } from 'node:crypto';
import { type MuiStyles, useSnackMessage } from '@gridsuite/commons-ui';
import { HTTP_MAX_NODE_BUILDS_EXCEEDED_MESSAGE } from 'components/network-modification-tree-pane';

type BuildButtonProps = {
    buildStatus?: BUILD_STATUS;
    studyUuid: UUID | null;
    currentRootNetworkUuid: UUID | null;
    nodeUuid: UUID;
};

const styles = {
    button: {
        minWidth: '40px',
    },
    playColor: (theme) => ({
        color: theme.palette.mode === 'light' ? 'grey' : 'white',
    }),
} as const satisfies MuiStyles;

export const BuildButton = ({ buildStatus, studyUuid, currentRootNetworkUuid, nodeUuid }: BuildButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const { snackError } = useSnackMessage();

    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            if (!studyUuid || !currentRootNetworkUuid || isLoading) {
                return;
            }

            setIsLoading(true);

            if (!buildStatus || buildStatus === BUILD_STATUS.NOT_BUILT) {
                buildNode(studyUuid, nodeUuid, currentRootNetworkUuid)
                    .catch((error) => {
                        if (error.status === 403 && error.message.includes(HTTP_MAX_NODE_BUILDS_EXCEEDED_MESSAGE)) {
                            // retrieve last word of the message (ex: "MAX_NODE_BUILDS_EXCEEDED max allowed built nodes : 2" -> 2)
                            let limit = error.message.split(/[: ]+/).pop();
                            snackError({
                                messageId: 'maxBuiltNodeExceededError',
                                messageValues: { limit: limit },
                            });
                        } else {
                            snackError({
                                messageTxt: error.message,
                                headerId: 'NodeBuildingError',
                            });
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            } else {
                unbuildNode(studyUuid, nodeUuid, currentRootNetworkUuid)
                    .catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'NodeUnbuildingError',
                        });
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            }
        },
        [studyUuid, currentRootNetworkUuid, nodeUuid, buildStatus, isLoading, snackError]
    );

    const getIcon = () => {
        if (isLoading) {
            return <CircularProgress size={24} color="primary" />;
        }
        return !buildStatus || buildStatus === BUILD_STATUS.NOT_BUILT ? (
            <PlayCircleFilled sx={styles.playColor} />
        ) : (
            <StopCircleOutlined color="primary" />
        );
    };

    const isButtonDisabled = isLoading || !studyUuid || !currentRootNetworkUuid;

    return (
        <Button size="small" onClick={handleClick} sx={styles.button} disabled={isButtonDisabled}>
            {getIcon()}
        </Button>
    );
};
