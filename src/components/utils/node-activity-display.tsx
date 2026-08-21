/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Chip, CircularProgress } from '@mui/material';
import { type MuiStyles } from '@gridsuite/commons-ui';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { getNetworkModificationNode } from 'components/graph/util/model-functions';
import { useNodeActivityLabel } from 'components/utils/use-node-activity';
import { AppState } from 'redux/reducer.type';
import { NODE_ACTIVITY_IN_PROGRESS_IDS, type NodeActivity } from 'types/node-activity.type';

const styles = {
    rootNetworkLine: { display: 'flex', alignItems: 'center', gap: 0.5 },
} as const satisfies MuiStyles;

function useOtherRootNetworkTag(activity: NodeActivity): string | undefined {
    return useSelector((state: AppState) =>
        activity.rootNetworkId && activity.rootNetworkId !== state.currentRootNetworkUuid
            ? state.rootNetworks.find((rootNetwork) => rootNetwork.rootNetworkUuid === activity.rootNetworkId)?.tag
            : undefined
    );
}

export function NodeActivityChip({ activity }: Readonly<{ activity: NodeActivity }>) {
    return <Chip size="small" icon={<CircularProgress size={14} />} label={useNodeActivityLabel(activity)} />;
}

export function NodeActivityDetails({ activity }: Readonly<{ activity: NodeActivity }>) {
    const intl = useIntl();
    const treeModel = useSelector((state: AppState) => state.networkModificationTreeModel);
    const otherRootNetworkTag = useOtherRootNetworkTag(activity);
    const nodeName = getNetworkModificationNode(treeModel, activity.nodeId)?.data?.label ?? '';

    return (
        <Box>
            <Box>{intl.formatMessage({ id: 'nodeActivityNode' }, { nodeName })}</Box>
            <Box>{intl.formatMessage({ id: NODE_ACTIVITY_IN_PROGRESS_IDS[activity.label] })}</Box>
            {otherRootNetworkTag && (
                <Box sx={styles.rootNetworkLine}>
                    <FormattedMessage
                        id="nodeActivityOnRootNetwork"
                        values={{ rootNetwork: <Chip size="small" label={otherRootNetworkTag} color="primary" /> }}
                    />
                </Box>
            )}
        </Box>
    );
}
