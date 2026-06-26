/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
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

    // Representative voltages currently shown (checked). `undefined` means "not initialized yet":
    // until the effect below runs, nothing is hidden (see unselectedVlNames), which avoids a flash
    // where every band would be hidden before the selection is populated.
    const [selectedNominalVoltages, setSelectedNominalVoltages] = useState<number[]>();

    // Nominal voltages present on the previous render, to detect newly-appeared ones.
    const previousPresentRef = useRef<number[]>([]);
    useEffect(() => {
        // Voltages that just appeared in the diagram (e.g. after expanding/adding a voltage level).
        const newlyPresent = presentNominalVoltages.filter((v) => !previousPresentRef.current.includes(v));
        if (newlyPresent.length === 0) {
            return;
        }
        setSelectedNominalVoltages((prev) => {
            const current = prev ?? [];
            return [...current, ...newlyPresent.filter((v) => !current.includes(v))];
        });
        previousPresentRef.current = presentNominalVoltages;
    }, [presentNominalVoltages]);

    // Bands whose representative is unchecked → hidden in the diagram.
    const unselectedVlNames = useMemo(() => {
        // Not initialized yet: hide nothing (the diagram shows fully until the selection is set).
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
