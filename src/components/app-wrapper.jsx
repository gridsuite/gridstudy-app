/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import App from './app';
import { createTheme, CssBaseline, responsiveFontSizes, ThemeProvider, StyledEngineProvider } from '@mui/material';
import { enUS as MuiCoreEnUS, frFR as MuiCoreFrFR } from '@mui/material/locale';
import {
    LIGHT_THEME,
    LANG_FRENCH,
    CardErrorBoundary,
    loginEn,
    loginFr,
    reportViewerEn,
    reportViewerFr,
    SnackbarProvider,
    topBarEn,
    topBarFr,
    tableEn,
    tableFr,
    elementSearchEn,
    elementSearchFr,
    filterExpertEn,
    filterExpertFr,
    equipmentSearchEn,
    equipmentSearchFr,
    directoryItemsInputEn,
    directoryItemsInputFr,
    treeviewFinderEn,
    treeviewFinderFr,
    cardErrorBoundaryEn,
    cardErrorBoundaryFr,
    flatParametersEn,
    flatParametersFr,
    multipleSelectionDialogEn,
    multipleSelectionDialogFr,
    commonButtonEn,
    commonButtonFr,
    componentsFr,
    componentsEn,
    equipmentsEn,
    equipmentsFr,
    networkModificationsEn,
    networkModificationsFr,
    rootNetworkEn,
    rootNetworkFr,
    importParamsEn,
    importParamsFr,
    exportParamsEn,
    exportParamsFr,
    parametersEn,
    parametersFr,
    NotificationsProvider,
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
import {
    PARAM_THEME,
    basemap_style_theme_key,
    MAP_BASEMAP_MAPBOX,
    MAP_BASEMAP_CARTO,
    MAP_BASEMAP_CARTO_NOLABEL,
} from '../utils/config-params';
import useNotificationsUrlGenerator from 'hooks/use-notifications-url-generator';
import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions } from 'ag-grid-community';

// Register all community features (migration to V33)
ModuleRegistry.registerModules([AllCommunityModule]);

// Mark all grids as using legacy themes (migration to V33)
provideGlobalGridOptions({ theme: 'legacy' });

const lightTheme = createTheme({
    components: {
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
    palette: {
        mode: 'light',
    },
    link: {
        color: 'blue',
    },
    node: {
        background: '#1976d2',
        hover: '#84adce',
        border: '#0f3d68',
    },
    selectedRow: {
        background: '#8E9C9B',
    },
    editableCell: {
        outline: 'solid 1px #1976D2',
        border: 'solid 1px #BABFC7',
        borderRadius: '3px',
        boxShadow: '0 1px 20px 1px #BABFC766',
    },
    editableCellError: {
        outline: 'solid 1px red',
        border: 'solid 1px #BABFC7',
        borderRadius: '3px',
        boxShadow: '0 1px 20px 1px #BABFC766',
    },
    aggridValueChangeHighlightBackgroundColor: '#C8E6C9 !important',
    tooltipTable: {
        background: '#e6e6e6',
    },
    formFiller: {
        background: '#e6e6e6',
    },
    searchedText: {
        highlightColor: '#53AAFF',
        currentHighlightColor: '#FFA853',
    },
    severityChip: {
        disabledColor: '#EAECED',
    },
    [basemap_style_theme_key(MAP_BASEMAP_MAPBOX)]: 'mapbox://styles/mapbox/light-v9',
    [basemap_style_theme_key(MAP_BASEMAP_CARTO_NOLABEL)]:
        'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
    [basemap_style_theme_key(MAP_BASEMAP_CARTO)]: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    aggrid: {
        theme: 'ag-theme-alpine',
        overlay: {
            background: '#e6e6e6',
        },
    },
    networkModificationPanel: {
        backgroundColor: 'white',
        border: 'solid 1px #babfc7',
    },
    reactflow: {
        backgroundColor: 'white',
    },
});

const darkTheme = createTheme({
    components: {
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
    palette: {
        mode: 'dark',
        tabBackground: '#1e1e1e',
    },
    link: {
        color: 'green',
    },
    node: {
        background: '#1976d2',
        hover: '#90caf9',
        border: '#cce3f9',
    },
    selectedRow: {
        background: '#545C5B',
    },
    editableCell: {
        outline: 'solid 1px #90CAF9',
        border: 'solid 1px #68686E',
        borderRadius: '3px',
        boxShadow: '0 1px 20px 1px #000',
    },
    editableCellError: {
        outline: 'solid 1px red',
        border: 'solid 1px #68686E',
        borderRadius: '3px',
        boxShadow: '0 1px 20px 1px #000',
    },
    tooltipTable: {
        background: '#121212',
    },
    formFiller: {
        background: '#2C2C2C',
    },
    searchedText: {
        highlightColor: '#123FBB',
        currentHighlightColor: '#BB8E12',
    },
    severityChip: {
        disabledColor: '#3B434A',
    },
    [basemap_style_theme_key(MAP_BASEMAP_MAPBOX)]: 'mapbox://styles/mapbox/dark-v9',
    [basemap_style_theme_key(MAP_BASEMAP_CARTO_NOLABEL)]:
        'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
    [basemap_style_theme_key(MAP_BASEMAP_CARTO)]: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    aggrid: {
        theme: 'ag-theme-alpine-dark',
        overlay: {
            background: '#121212',
        },
    },
    networkModificationPanel: {
        backgroundColor: '#252525',
        border: 'solid 1px #68686e',
    },
    reactflow: {
        backgroundColor: '#414141',
    },
});

// no other way to copy style: https://mui.com/material-ui/customization/theming/#api
function createThemeWithComponents(baseTheme, ...args) {
    return createTheme(
        baseTheme,
        {
            palette: {
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
            },
        },
        ...args
    );
}

function getMuiTheme(theme, locale) {
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
        ...rootNetworkEn,
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
        ...rootNetworkFr,
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

const basename = new URL(document.querySelector('base').href).pathname;

const AppWrapperWithRedux = () => {
    const computedLanguage = useSelector((state) => state.computedLanguage);
    const theme = useSelector((state) => state[PARAM_THEME]);
    const themeCompiled = useMemo(() => getMuiTheme(theme, computedLanguage), [computedLanguage, theme]);

    const urlMapper = useNotificationsUrlGenerator();

    return (
        <IntlProvider locale={computedLanguage} messages={messages[computedLanguage]}>
            <BrowserRouter basename={basename}>
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={themeCompiled}>
                        <SnackbarProvider hideIconVariant={false}>
                            <CssBaseline />
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
