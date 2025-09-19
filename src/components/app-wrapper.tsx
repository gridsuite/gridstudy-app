/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import App from './app';
import {
    createTheme,
    CssBaseline,
    GlobalStyles,
    responsiveFontSizes,
    StyledEngineProvider,
    type Theme,
    type ThemeOptions,
    ThemeProvider,
} from '@mui/material';
import { enUS as MuiCoreEnUS, frFR as MuiCoreFrFR } from '@mui/material/locale';
import {
    CardErrorBoundary,
    cardErrorBoundaryEn,
    cardErrorBoundaryFr,
    commonButtonEn,
    commonButtonFr,
    componentsEn,
    componentsFr,
    directoryItemsInputEn,
    directoryItemsInputFr,
    dndTableEn,
    dndTableFr,
    elementSearchEn,
    elementSearchFr,
    equipmentSearchEn,
    equipmentSearchFr,
    equipmentsEn,
    equipmentsFr,
    exportParamsEn,
    exportParamsFr,
    filterExpertEn,
    filterExpertFr,
    flatParametersEn,
    flatParametersFr,
    type GsLangUser,
    type GsTheme,
    importParamsEn,
    importParamsFr,
    LANG_FRENCH,
    LIGHT_THEME,
    loginEn,
    loginFr,
    multipleSelectionDialogEn,
    multipleSelectionDialogFr,
    networkModificationsEn,
    networkModificationsFr,
    NotificationsProvider,
    parametersEn,
    parametersFr,
    reportViewerEn,
    reportViewerFr,
    SnackbarProvider,
    tableEn,
    tableFr,
    topBarEn,
    topBarFr,
    treeviewFinderEn,
    treeviewFinderFr,
} from '@gridsuite/commons-ui';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router';
import { Provider, useSelector } from 'react-redux';
import messages_en from '../translations/en.json';
import messages_fr from '../translations/fr.json';
import messages_plugins from '../plugins/translations';
import { grid_en } from '../translations/grid-en';
import { grid_fr } from '../translations/grid-fr';
import backend_locale_en from '../translations/external/backend-locale-en';
import backend_locale_fr from '../translations/external/backend-locale-fr';
import dynamic_mapping_models_en from '../translations/external/dynamic-mapping-models-en';
import dynamic_mapping_models_fr from '../translations/external/dynamic-mapping-models-fr';
import csv_locale_en from '../translations/dynamic/csv-locale-en';
import csv_locale_fr from '../translations/dynamic/csv-locale-fr';
import filter_locale_en from '../translations/dynamic/filter-locale-en';
import filter_locale_fr from '../translations/dynamic/filter-locale-fr';
import menu_locale_en from '../translations/dynamic/menu-locale-en';
import menu_locale_fr from '../translations/dynamic/menu-locale-fr';
import table_locale_en from '../translations/dynamic/table-locale-en';
import table_locale_fr from '../translations/dynamic/table-locale-fr';
import errors_locale_en from '../translations/dynamic/errors-locale-en';
import errors_locale_fr from '../translations/dynamic/errors-locale-fr';
import events_locale_fr from '../translations/dynamic/events-locale-fr';
import events_locale_en from '../translations/dynamic/events-locale-en';
import spreadsheet_locale_fr from '../translations/spreadsheet-fr';
import spreadsheet_locale_en from '../translations/spreadsheet-en';
import { store } from '../redux/store';
import { type AppState } from '../redux/reducer';
import { PARAM_THEME } from '../utils/config-params';
import useNotificationsUrlGenerator from 'hooks/use-notifications-url-generator';
import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions } from 'ag-grid-community';
import { lightThemeCssVars } from '../styles/light-theme-css-vars';
import { darkThemeCssVars } from '../styles/dark-theme-css-vars';

// Register all community features (migration to V33)
ModuleRegistry.registerModules([AllCommunityModule]);

// Mark all grids as using legacy themes (migration to V33)
provideGlobalGridOptions({ theme: 'legacy' });

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        toolbarBackgroundColor: '#EEE',
        cancelButtonColor: undefined as any, // set in the common theme function
        tabBackground: undefined as any, // set in the common theme function
    },
    node: {
        common: {
            background: '#F5F5F5',
            activeBackground: '#BBDEFB',
        },
        modification: {
            border: 'solid 1px #999FA1',
            selectedBackground: '#E1F5FE',
            selectedBorder: 'solid 1px #0288D1',
            hoverBorderColor: '#03A9F4',
            activeBorderColor: '#29B6F6',
        },
        root: {
            border: 'solid 1px #3CEC96',
            selectedBackground: '#E1F5FE',
            hoverBorderColor: '#3CEC96',
            activeBorderColor: '#64B5F6',
            icon: {
                fill: '#0B556F',
                background: '#3CEC96',
            },
        },
        buildStatus: {
            error: '#F44336',
            warning: '#FFA726',
            success: '#66BB6A',
            notBuilt: '#E0E0E0',
        },
    },
    selectedRow: {
        backgroundColor: '#8E9C9B',
    },
    tooltipTable: {
        backgroundColor: '#e6e6e6',
    },
    formFiller: {
        backgroundColor: '#e6e6e6',
    },
    searchedText: {
        highlightColor: '#53AAFF',
        currentHighlightColor: '#FFA853',
    },
    severityChip: {
        disabledColor: '#EAECED',
    },
    agGrid: {
        theme: 'ag-theme-alpine',
        valueChangeHighlightBackgroundColor: '#C8E6C9 !important',
        backgroundColor: '#e6e6e6',
    },
    networkModificationPanel: {
        backgroundColor: 'white',
        border: 'solid 1px #babfc7',
    },
    reactflow: {
        backgroundColor: 'white',
        labeledGroup: {
            backgroundColor: 'white',
            borderColor: '#11161A',
        },
        edge: {
            stroke: '#6F767B',
        },
        handle: {
            border: '2px solid #6F767B',
            background: '#F5F5F5',
        },
    },
});

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        tabBackground: '#1e1e1e',
        toolbarBackgroundColor: '#424242',
        cancelButtonColor: undefined as any, // set in the common theme function
    },
    node: {
        common: {
            background: '#2C2E2E',
            activeBackground: '#263238',
        },
        modification: {
            border: 'solid 1px #BDBDBD',
            selectedBackground: '#37474F',
            selectedBorder: 'solid 3px #29B6F6',
            hoverBorderColor: '#B3E5FC',
            activeBorderColor: '#00A6D9',
        },
        root: {
            border: 'solid 1px #3CEC96',
            selectedBackground: '#212121',
            hoverBorderColor: '#00C853',
            activeBorderColor: '#00E676',
            icon: {
                fill: '#0B556F',
                background: '#3CEC96',
            },
        },
        buildStatus: {
            error: '#D32F2F',
            warning: '#ED6C02',
            success: '#2E7D32',
            notBuilt: '#E0E0E0',
        },
    },
    selectedRow: {
        backgroundColor: '#545C5B',
    },
    tooltipTable: {
        backgroundColor: '#121212',
    },
    formFiller: {
        backgroundColor: '#2C2C2C',
    },
    searchedText: {
        highlightColor: '#123FBB',
        currentHighlightColor: '#BB8E12',
    },
    severityChip: {
        disabledColor: '#3B434A',
    },
    agGrid: {
        theme: 'ag-theme-alpine-dark',
        backgroundColor: '#121212',
    },
    networkModificationPanel: {
        backgroundColor: '#252525',
        border: 'solid 1px #68686e',
    },
    reactflow: {
        backgroundColor: '#414141',
        labeledGroup: {
            backgroundColor: '#11161A',
            borderColor: '#D9D9D9',
        },
        edge: {
            stroke: '#D9D9D9',
        },
        handle: {
            border: '2px solid #D9D9D9',
            background: '#121212',
        },
    },
});

// no other way to copy style: https://mui.com/material-ui/customization/theming/#api
function createThemeWithComponents(baseTheme: Theme, ...args: object[]) {
    return createTheme(
        baseTheme,
        {
            palette: {
                ...baseTheme.palette,
                cancelButtonColor: {
                    main: baseTheme.palette.text.secondary,
                },
                tabBackground: baseTheme.palette.tabBackground ?? baseTheme.palette.background.default,
            },
            components: {
                CancelButton: {
                    defaultProps: {
                        color: 'cancelButtonColor',
                    },
                },
                MuiTab: {
                    styleOverrides: {
                        root: {
                            textTransform: 'none',
                        },
                    },
                },
                MuiButton: {
                    styleOverrides: {
                        root: {
                            textTransform: 'none',
                        },
                    },
                },
            },
        } satisfies Pick<ThemeOptions, 'palette' | 'components'>,
        ...args
    );
}

function getMuiTheme(theme: GsTheme, locale: GsLangUser) {
    return responsiveFontSizes(
        createThemeWithComponents(
            theme === LIGHT_THEME ? lightTheme : darkTheme,
            locale === LANG_FRENCH ? MuiCoreFrFR : MuiCoreEnUS // MUI core translations
        )
    );
}

const messages = {
    en: {
        ...treeviewFinderEn,
        ...messages_en,
        ...networkModificationsEn,
        ...exportParamsEn,
        ...importParamsEn,
        ...reportViewerEn,
        ...loginEn,
        ...topBarEn,
        ...tableEn,
        ...elementSearchEn,
        ...filterExpertEn,
        ...equipmentSearchEn,
        ...directoryItemsInputEn,
        ...cardErrorBoundaryEn,
        ...flatParametersEn,
        ...multipleSelectionDialogEn,
        ...commonButtonEn,
        ...componentsEn,
        ...dndTableEn,
        ...equipmentsEn,
        ...grid_en,
        ...backend_locale_en,
        ...dynamic_mapping_models_en,
        ...csv_locale_en,
        ...filter_locale_en,
        ...menu_locale_en,
        ...table_locale_en,
        ...errors_locale_en,
        ...events_locale_en,
        ...spreadsheet_locale_en,
        ...parametersEn,
        ...messages_plugins.en, // keep it at the end to allow translation overwriting
    },
    fr: {
        ...treeviewFinderFr,
        ...messages_fr,
        ...networkModificationsFr,
        ...exportParamsFr,
        ...importParamsFr,
        ...reportViewerFr,
        ...loginFr,
        ...topBarFr,
        ...tableFr,
        ...elementSearchFr,
        ...filterExpertFr,
        ...equipmentSearchFr,
        ...directoryItemsInputFr,
        ...cardErrorBoundaryFr,
        ...flatParametersFr,
        ...multipleSelectionDialogFr,
        ...commonButtonFr,
        ...componentsFr,
        ...dndTableFr,
        ...equipmentsFr,
        ...grid_fr,
        ...backend_locale_fr,
        ...dynamic_mapping_models_fr,
        ...csv_locale_fr,
        ...filter_locale_fr,
        ...menu_locale_fr,
        ...table_locale_fr,
        ...errors_locale_fr,
        ...events_locale_fr,
        ...spreadsheet_locale_fr,
        ...parametersFr,
        ...messages_plugins.fr, // keep it at the end to allow translation overwriting
    },
};

const basename = new URL(document.querySelector('base')!.href).pathname;

const AppWrapperWithRedux = () => {
    const computedLanguage = useSelector((state: AppState) => state.computedLanguage);
    const theme = useSelector((state: AppState) => state[PARAM_THEME]);
    const themeCompiled = useMemo(() => getMuiTheme(theme, computedLanguage), [computedLanguage, theme]);

    const rootCssVars = theme === LIGHT_THEME ? lightThemeCssVars : darkThemeCssVars;

    const urlMapper = useNotificationsUrlGenerator();

    return (
        <IntlProvider locale={computedLanguage} messages={messages[computedLanguage]}>
            <BrowserRouter basename={basename}>
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={themeCompiled}>
                        <SnackbarProvider hideIconVariant={false}>
                            <CssBaseline />
                            <GlobalStyles styles={{ ':root': rootCssVars }} />
                            <CardErrorBoundary>
                                <NotificationsProvider urls={urlMapper}>
                                    <App />
                                </NotificationsProvider>
                            </CardErrorBoundary>
                        </SnackbarProvider>
                    </ThemeProvider>
                </StyledEngineProvider>
            </BrowserRouter>
        </IntlProvider>
    );
};

const AppWrapper = () => {
    return (
        <Provider store={store}>
            <AppWrapperWithRedux />
        </Provider>
    );
};

export default AppWrapper;
