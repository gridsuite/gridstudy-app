/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { StudyDisplayMode } from '../network-modification.type';
import { RootNetworkIndexationStatus } from 'types/notification-types';

export const useDisabledSearchReason = () => {
    const intl = useIntl();
    const toggleOptions = useSelector((state: AppState) => state.toggleOptions);
    const rootNetworkIndexationStatus = useSelector((state: AppState) => state.rootNetworkIndexationStatus);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    if (!toggleOptions.includes(StudyDisplayMode.DIAGRAM_GRID_LAYOUT)) {
        return intl.formatMessage({
            id: 'UnsupportedView',
        });
    } else if (!isNodeBuilt(currentNode)) {
        return intl.formatMessage({
            id: 'InvalidNode',
        });
    } else if (rootNetworkIndexationStatus !== RootNetworkIndexationStatus.INDEXED) {
        return intl.formatMessage({
            id: 'waitingRootNetworkIndexation',
        });
    } else {
        return '';
    }
};
