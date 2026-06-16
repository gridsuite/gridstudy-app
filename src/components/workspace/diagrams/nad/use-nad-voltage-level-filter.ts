/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import type { DiagramMetadata } from '@powsybl/network-viewer';
import { useBaseVoltages } from '../../../../hooks/use-base-voltages';

interface UseNadVoltageLevelFilterReturn {
    /** Representative nominal voltages shown on the filtering tab. */
    presentNominalVoltages: number[];
    /** Representative voltages currently checked. */
    selectedNominalVoltages: number[];
    setSelectedNominalVoltages: Dispatch<SetStateAction<number[] | undefined>>;
    /** Band names whose representative is unchecked → need to be hidden in the diagram. */
    unselectedVlNames: string[];
}

/**
 * Voltage-level band filtering logic for NAD.
 */
export function useNadVoltageLevelFilter(
    svgMetadata: DiagramMetadata | null | undefined
): UseNadVoltageLevelFilterReturn {
    const { baseVoltages } = useBaseVoltages();

    // Voltages actually present in the current diagram, derived from the SVG metadata CSS classes.
    const presentVlNames = useMemo(() => {
        const vlNames = new Set<string>();
        const collectVlNames = (classes?: string[]) =>
            classes?.forEach((cls) => {
                // CSS class carried by NAD elements for their voltage-level band, e.g. "nad-voltage-level-6".
                const matchedVlNames = /^nad-(voltage-level-\d+)$/.exec(cls);
                if (matchedVlNames) {
                    vlNames.add(matchedVlNames[1]);
                }
            });
        svgMetadata?.nodes?.forEach((node) => collectVlNames(node.classes));
        svgMetadata?.busNodes?.forEach((busNode) => collectVlNames(busNode.classes));
        return vlNames;
    }, [svgMetadata]);

    const presentBaseVoltages = useMemo(
        () => (baseVoltages ?? []).filter((bv) => presentVlNames.has(bv.name)),
        [baseVoltages, presentVlNames]
    );

    // The voltages displayed to the user on the filtering tab
    const presentNominalVoltages = useMemo(() => presentBaseVoltages.map((bv) => bv.minValue), [presentBaseVoltages]);

    // Representative voltages currently shown (checked). Initialized once to "all shown".
    const [selectedNominalVoltages, setSelectedNominalVoltages] = useState<number[]>();
    useEffect(() => {
        if (presentNominalVoltages.length > 0) {
            // only on initialization, need computed nominalVoltages, so can't do it at useState creation
            setSelectedNominalVoltages((prev) => prev ?? presentNominalVoltages);
        }
    }, [presentNominalVoltages]);

    // Bands whose representative is unchecked → hidden in the diagram.
    const unselectedVlNames = useMemo(() => {
        if (selectedNominalVoltages === undefined) {
            return [];
        }
        return presentBaseVoltages.filter((bv) => !selectedNominalVoltages.includes(bv.minValue)).map((bv) => bv.name);
    }, [presentBaseVoltages, selectedNominalVoltages]);

    return {
        presentNominalVoltages,
        selectedNominalVoltages: selectedNominalVoltages ?? presentNominalVoltages,
        setSelectedNominalVoltages,
        unselectedVlNames,
    };
}
