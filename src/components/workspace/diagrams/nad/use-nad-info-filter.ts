/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo, useState } from 'react';

/** Toggleable NAD information layers, in display order. */
export type NadSelectedInfoKey =
    | 'activePowerValue'
    | 'reactivePowerValue'
    | 'permanentLimitPercentage'
    | 'activePowerArrow'
    | 'reactivePowerArrow'
    | 'voltageLevelName';

export type NadSelectedInfos = Record<NadSelectedInfoKey, boolean>;

// CSS selectors (on the rendered NAD SVG) hidden when the matching info is turned off.
// Values are <text> elements, arrows are <path> elements carrying the direction class
// (nad-arrow-in/out). As in the theme css-vars files, active arrows carry only the direction
// class while reactive arrows also carry nad-reactive.
const INFO_SELECTORS: Record<NadSelectedInfoKey, string[]> = {
    activePowerValue: ['text.nad-active'],
    reactivePowerValue: ['text.nad-reactive'],
    permanentLimitPercentage: ['text.nad-permanent-limit-percentage'],
    activePowerArrow: ['path.nad-arrow-in:not(.nad-reactive)', 'path.nad-arrow-out:not(.nad-reactive)'],
    reactivePowerArrow: ['path.nad-reactive.nad-arrow-in', 'path.nad-reactive.nad-arrow-out'],
    voltageLevelName: ['.nad-text-nodes'],
};

const ALL_SHOWN: NadSelectedInfos = {
    activePowerValue: true,
    reactivePowerValue: true,
    permanentLimitPercentage: true,
    activePowerArrow: true,
    reactivePowerArrow: true,
    voltageLevelName: true,
};

interface UseNadInfoFilterReturn {
    /** Current on/off state of each information layer. */
    selectedInfos: NadSelectedInfos;
    /** Toggle a single information layer. */
    toggleSelectedInfo: (key: NadSelectedInfoKey) => void;
    /** CSS selectors to hide in the diagram (one entry per disabled layer's selectors). */
    hiddenInfoSelectors: string[];
}

/**
 * Information-layer masking logic for NAD. Settings are transient (reset on reload),
 * default to "all shown" so the diagram looks unchanged until the user opts to hide something.
 */
export function useNadInfoFilter(): UseNadInfoFilterReturn {
    const [selectedInfos, setSelectedInfos] = useState<NadSelectedInfos>(ALL_SHOWN);

    const toggleSelectedInfo = useCallback((key: NadSelectedInfoKey) => {
        setSelectedInfos((prev) => ({ ...prev, [key]: !prev[key] }));
    }, []);

    const hiddenInfoSelectors = useMemo(
        () =>
            (Object.keys(INFO_SELECTORS) as NadSelectedInfoKey[])
                .filter((key) => !selectedInfos[key])
                .flatMap((key) => INFO_SELECTORS[key]),
        [selectedInfos]
    );

    return { selectedInfos, toggleSelectedInfo, hiddenInfoSelectors };
}
