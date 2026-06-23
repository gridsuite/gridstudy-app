/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createRoot } from 'react-dom/client';
import SilentRenewApp from './components/silent-renew-app';

const container = document.getElementById('root');
const root = createRoot(container!);

async function renderApp() {
    if (window.location.pathname.endsWith('/silent-renew-callback')) {
        root.render(<SilentRenewApp />);
        return;
    }
    await import('core-js/es/array/flat-map');
    await import('typeface-roboto');
    await import('@xyflow/react/dist/base.css');
    await import('./index.css');
    await import('./configure-yup-init');
    const { default: AppWrapper } = await import('./components/app-wrapper');
    root.render(<AppWrapper />);
}
renderApp().catch((error) => console.error(error));
