/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { AppState, StudyIndexationStatus } from 'redux/reducer';
import { StudyDisplayMode } from '../network-modification.type';

export const useDisabledSearchReason = () => {
    const intl = useIntl();
    const studyDisplayMode = useSelector((state: AppState) => state.studyDisplayMode);
    const studyIndexationStatus = useSelector((state: AppState) => state.studyIndexationStatus);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    if (studyDisplayMode === StudyDisplayMode.TREE) {
        return intl.formatMessage({
            id: 'UnsupportedView',
        });
    } else if (!isNodeBuilt(currentNode)) {
        return intl.formatMessage({
            id: 'InvalidNode',
        });
    } else if (studyIndexationStatus !== StudyIndexationStatus.INDEXED) {
        return intl.formatMessage({
            id: 'waitingStudyIndexation',
        });
    } else {
        return '';
    }
};
