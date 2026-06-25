/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createRoot } from 'react-dom/client';
import SilentRenew from './components/silent-renew';
import { SILENT_RENEW_CALLBACK_PATH } from './services/utils';

const container = document.getElementById('root');
const root = createRoot(container!);

(async () => {
    if (globalThis.location.pathname.endsWith(SILENT_RENEW_CALLBACK_PATH)) {
        root.render(<SilentRenew />);
        return;
    }
    const appWrapper = import('./components/app-wrapper');
    await Promise.all([
        import('typeface-roboto'),
        import('@xyflow/react/dist/base.css'),
        import('./index.css'),
        import('./configure-yup-init'),
        appWrapper,
    ]);
    const { default: AppWrapper } = await appWrapper;
    root.render(<AppWrapper />);
})();
