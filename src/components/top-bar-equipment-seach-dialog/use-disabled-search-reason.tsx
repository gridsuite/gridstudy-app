import { isNodeBuilt } from 'components/graph/util/model-functions';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import {
    ReduxState,
    StudyDisplayMode,
    StudyIndexationStatus,
} from 'redux/reducer.type';

export const useDisabledSearchReason = () => {
    const intl = useIntl();
    const studyDisplayMode = useSelector(
        (state: ReduxState) => state.studyDisplayMode
    );
    const studyIndexationStatus = useSelector(
        (state: ReduxState) => state.studyIndexationStatus
    );
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );

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
