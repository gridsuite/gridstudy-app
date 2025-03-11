/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import 'core-js/es/array/flat-map';

import 'typeface-roboto';
import '@xyflow/react/dist/base.css';
import './index.css';

import { createRoot } from 'react-dom/client';
import { polyfillIntl } from '@gridsuite/commons-ui';
import AppWrapper from './components/app-wrapper';

const container = document.getElementById('root');
polyfillIntl(['en', 'en-GB', 'fr'], import.meta.env.VITE_DEFAULT_TIMEZONE).finally(() => {
    createRoot(container).render(<AppWrapper />);
});
