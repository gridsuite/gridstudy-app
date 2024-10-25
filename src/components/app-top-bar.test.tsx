import { screen } from '@testing-library/react';
import AppTopBar from './app-top-bar';
import { Provider } from 'react-redux';
import { initialState } from '../redux/reducer';
import { RenderBuilder, treeviewFinderEn } from '@gridsuite/commons-ui';
import { act } from 'react-dom/test-utils';
import createMockStore from 'redux-mock-store';
import messages_plugins_en from '../translations/en.json';

const ROOT_TRAD = 'rootTrad';

const renderBuilder = new RenderBuilder().withTrad({ ...treeviewFinderEn, ...messages_plugins_en, root: ROOT_TRAD });

const createStore = createMockStore();

jest.mock('./study-pane', () => ({
    StudyView: {
        MAP: 'Map',
        SPREADSHEET: 'Spreadsheet',
        RESULTS: 'Results',
        LOGS: 'Logs',
        PARAMETERS: 'Parameters',
    },
}));

jest.mock('./top-bar-equipment-seach-dialog/top-bar-equipment-search-dialog', () => ({
    TopBarEquipmentSearchDialog: () => <></>,
}));

export function mockFetch(data: any, headers: any = null) {
    if (!headers) {
        headers = { 'Content-Type': 'application/json' };
    }
    return jest.fn().mockImplementation(() =>
        Promise.resolve({
            ok: true,
            json: () => data,
            headers: new Headers(headers),
            text: () => Promise.resolve(JSON.stringify(data)),
        })
    );
}

const windowFetch = window.fetch;
beforeAll(() => {
    window.fetch = mockFetch([]);
});
afterAll(() => {
    window.fetch = windowFetch;
});
describe('AppTopBar', () => {
    test('renders the app title', async () => {
        const store = createStore(initialState);

        await act(async () => {
            renderBuilder.render(
                <Provider store={store}>
                    <AppTopBar onChangeTab={() => {}} tabIndex={1} userManager={{}} />
                </Provider>
            );
        });
        const appTitle = screen.getByTestId('test');
        expect(appTitle).toBeDefined();
    });

    test('renders the app title', async () => {
        const store = createStore({
            ...initialState,
            currentTreeNode: { data: { label: 'Root' } },
        });
        await act(async () => {
            renderBuilder.render(
                <Provider store={store}>
                    <AppTopBar
                        onChangeTab={() => {}}
                        tabIndex={1}
                        userManager={{}}
                        user={{ profile: { name: 'test', email: 'email' } }}
                    />
                </Provider>
            );
        });
        const appTitle = screen.getByText(ROOT_TRAD);
        expect(appTitle).toBeDefined();
    });
});
