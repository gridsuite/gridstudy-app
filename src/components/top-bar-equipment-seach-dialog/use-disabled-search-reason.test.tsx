import { renderHook, waitFor } from '@testing-library/react';
import { useDisabledSearchReason } from './use-disabled-search-reason';
import { StudyIndexationStatus } from 'appRedux/reducer';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { StudyDisplayMode } from 'components/network-modification.type';
import { NodeType } from 'components/graph/tree-node.type';

jest.mock('react-intl', () => ({
    useIntl: () => ({
        formatMessage: jest.fn().mockImplementation((message) => message),
    }),
}));

const getWrapper =
    (store: Store) =>
    ({ children }: { children?: React.ReactNode }) =>
        <Provider store={store}>{children}</Provider>;

const AllowedReturn = {
    view: { id: 'UnsupportedView' },
    node: { id: 'InvalidNode' },
    index: { id: 'waitingStudyIndexation' },
    default: '',
};

describe('useDisabledSearchReason', () => {
    test('initialState should return InvalidNode"', async () => {
        // creates mock store
        const store = configureMockStore()({
            studyDisplayMode: StudyDisplayMode.HYBRID,
            studyIndexationStatus: StudyIndexationStatus.NOT_INDEXED,
            currentTreeNode: null,
        });
        // render the hook with the custom wrapper
        const { result } = renderHook(() => useDisabledSearchReason(), {
            wrapper: getWrapper(store),
        });
        expect(result.current).toStrictEqual(AllowedReturn.node);
    });
    test('Tree view is not Implemented yet should return unsupportedView"', () => {
        // creates mock store
        const store = configureMockStore()({
            studyDisplayMode: StudyDisplayMode.TREE,
            studyIndexationStatus: StudyIndexationStatus.NOT_INDEXED,
            currentTreeNode: null,
        });
        // render the hook with the custom wrapper
        const { result } = renderHook(() => useDisabledSearchReason(), { wrapper: getWrapper(store) });
        expect(result.current).toStrictEqual(AllowedReturn.view);
    });
    test('Tree view is not Implemented yet should return unsupportedView"', () => {
        // creates mock store
        const store = configureMockStore()({
            studyDisplayMode: StudyDisplayMode.HYBRID,
            studyIndexationStatus: StudyIndexationStatus.NOT_INDEXED,
            currentTreeNode: { type: NodeType.ROOT },
        });
        // render the hook with the custom wrapper
        const { result } = renderHook(() => useDisabledSearchReason(), { wrapper: getWrapper(store) });
        expect(result.current).toStrictEqual(AllowedReturn.index);
    });
    test('Tree view is not Implemented yet should return unsupportedView"', () => {
        // creates mock store
        const store = configureMockStore()({
            studyDisplayMode: StudyDisplayMode.DRAW,
            studyIndexationStatus: StudyIndexationStatus.INDEXED,
            currentTreeNode: { type: NodeType.ROOT },
        });
        // render the hook with the custom wrapper
        const { result } = renderHook(() => useDisabledSearchReason(), { wrapper: getWrapper(store) });
        expect(result.current).toStrictEqual(AllowedReturn.default);
    });
});
