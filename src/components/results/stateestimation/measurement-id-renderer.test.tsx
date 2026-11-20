/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MeasurementIdRenderer } from './measurement-id-renderer';
import { PanelType } from '../../workspace/types/workspace.types';
import { useWorkspacePanelActions } from '../../workspace/hooks/use-workspace-panel-actions';

jest.mock('../../workspace/hooks/use-workspace-panel-actions', () => ({
    useWorkspacePanelActions: jest.fn(),
}));

const mockOpenSLD = jest.fn();
let container: HTMLDivElement;
let root: Root;

async function render(value: unknown, data?: unknown) {
    await act(async () => {
        root.render(<MeasurementIdRenderer {...({ value, data } as any)} />);
    });
}

beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    jest.mocked(useWorkspacePanelActions).mockReturnValue({ openSLD: mockOpenSLD } as any);
    mockOpenSLD.mockClear();
    container = document.createElement('div');
    root = createRoot(container);
});

afterEach(async () => {
    await act(async () => root.unmount());
});

describe('MeasurementIdRenderer', () => {
    it('renders nothing when the value is falsy', async () => {
        await render('');

        expect(container.innerHTML).toBe('');
    });

    it('renders the value and opens its voltage-level SLD when clicked', async () => {
        await render('Measurement 1', { locationId: 'VL1' });

        const button = container.querySelector('button');
        expect(button).not.toBeNull();
        expect(button?.textContent).toContain('Measurement 1');

        await act(async () => button?.click());

        expect(mockOpenSLD).toHaveBeenCalledWith({
            equipmentId: 'VL1',
            panelType: PanelType.SLD_VOLTAGE_LEVEL,
        });
    });

    it('renders the value as plain text when data is missing', async () => {
        await render('Measurement 1');

        expect(container.querySelector('button')).toBeNull();
        expect(container.textContent).toContain('Measurement 1');
        expect(mockOpenSLD).not.toHaveBeenCalled();
    });

    it('renders the value as plain text when the location is missing', async () => {
        await render('Measurement 1', { locationId: undefined });

        expect(container.querySelector('button')).toBeNull();
        expect(container.textContent).toContain('Measurement 1');
        expect(mockOpenSLD).not.toHaveBeenCalled();
    });
});
