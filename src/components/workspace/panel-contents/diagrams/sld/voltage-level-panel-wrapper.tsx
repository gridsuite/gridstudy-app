/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import { selectPanelMetadata } from '../../../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../../../redux/store';
import { SLDPanelMetadata } from '../../../../workspace/types/workspace.types';
import { VoltageLevelPanelContent } from './voltage-level-panel-content';

interface VoltageLevelPanelWrapperProps {
    panelId: UUID;
    studyUuid: UUID;
    currentNodeId: UUID;
    currentRootNetworkUuid: UUID;
}

export const VoltageLevelPanelWrapper = ({
    panelId,
    studyUuid,
    currentNodeId,
    currentRootNetworkUuid,
}: VoltageLevelPanelWrapperProps) => {
    const metadata = useSelector((state: RootState) => selectPanelMetadata(state, panelId)) as
        | SLDPanelMetadata
        | undefined;

    // If panel is associated with NAD, don't render here - it's shown in the NAD panel
    if (metadata?.associatedToNadPanel) {
        return null;
    }

    return (
        <VoltageLevelPanelContent
            panelId={panelId}
            studyUuid={studyUuid}
            currentNodeId={currentNodeId}
            currentRootNetworkUuid={currentRootNetworkUuid}
        />
    );
};
