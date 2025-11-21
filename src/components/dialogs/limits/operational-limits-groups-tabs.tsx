/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Tab, Tabs } from '@mui/material';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import {
    LIMITS_PROPERTIES,
    OPERATIONAL_LIMITS_GROUPS,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
} from '../../utils/field-constants';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { OperationalLimitsGroup } from '../../../services/network-modification-types';
import { LimitsGroupsContextualMenu } from './limits-groups-contextual-menu';
import { tabStyles } from 'components/utils/tab-utils';
import { OperationalLimitsGroupTabLabel } from './operational-limits-group-tab-label';
import { OperationalLimitsGroupFormSchema } from './operational-limits-groups-types';
import { CurrentLimitsData } from 'services/study/network-map.type';
import { generateEmptyOperationalLimitsGroup, generateUniqueId } from './operational-limits-groups-utils';
import { limitsStyles } from './operational-limits-groups-styles';

export interface OperationalLimitsGroupsTabsProps {
    parentFormName: string;
    limitsGroups: OperationalLimitsGroupFormSchema[];
    indexSelectedLimitSet: number | null;
    setIndexSelectedLimitSet: React.Dispatch<React.SetStateAction<number | null>>;
    currentLimitsToModify: CurrentLimitsData[];
    editable: boolean;
}

export const OperationalLimitsGroupsTabs = forwardRef<any, OperationalLimitsGroupsTabsProps>(
    (
        {
            parentFormName,
            limitsGroups,
            setIndexSelectedLimitSet,
            indexSelectedLimitSet,
            editable,
            currentLimitsToModify,
        },
        ref
    ) => {
        const [hoveredRowIndex, setHoveredRowIndex] = useState(-1);
        const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
        const [activatedByMenuTabIndex, setActivatedByMenuTabIndex] = useState<number | null>(null);
        const { getValues } = useFormContext();
        const operationalLimitsGroupsFormName: string = `${parentFormName}.${OPERATIONAL_LIMITS_GROUPS}`;
        const {
            fields: operationalLimitsGroups,
            append: appendToLimitsGroups,
            prepend: prependToLimitsGroups,
            remove: removeLimitsGroups,
        } = useFieldArray<{
            [key: string]: OperationalLimitsGroupFormSchema[];
        }>({
            name: operationalLimitsGroupsFormName,
        });
        const selectedLimitsGroups1: string = useWatch({
            name: `${parentFormName}.${SELECTED_LIMITS_GROUP_1}`,
        });
        const selectedLimitsGroups2: string = useWatch({
            name: `${parentFormName}.${SELECTED_LIMITS_GROUP_2}`,
        });

        const handleOpenMenu = useCallback(
            (event: React.MouseEvent<HTMLButtonElement>, index: number): void => {
                event.stopPropagation();
                setMenuAnchorEl(event.currentTarget);
                setIndexSelectedLimitSet(index);
                setActivatedByMenuTabIndex(index);
            },
            [setMenuAnchorEl, setIndexSelectedLimitSet, setActivatedByMenuTabIndex]
        );

        const handleCloseMenu = useCallback(() => {
            setMenuAnchorEl(null);
            setActivatedByMenuTabIndex(null);
        }, [setMenuAnchorEl, setActivatedByMenuTabIndex]);

        useEffect(() => {
            // as long as there are limit sets, one should be selected
            if (indexSelectedLimitSet === null && limitsGroups.length > 0) {
                setIndexSelectedLimitSet(0);
            }
        }, [indexSelectedLimitSet, setIndexSelectedLimitSet, limitsGroups]);

        const prependEmptyOperationalLimitsGroup = useCallback(
            (name: string) => {
                prependToLimitsGroups(generateEmptyOperationalLimitsGroup(name));
            },
            [prependToLimitsGroups]
        );

        const addNewLimitSet = useCallback(() => {
            const formName: string = `${parentFormName}.${OPERATIONAL_LIMITS_GROUPS}`;
            const operationalLimiSetGroups: OperationalLimitsGroup[] = getValues(formName);
            let name = 'DEFAULT';

            // Try to generate unique name
            if (operationalLimiSetGroups?.length > 0) {
                const ids: string[] = operationalLimiSetGroups.map((l) => l.name);
                name = generateUniqueId('DEFAULT', ids);
            }
            prependEmptyOperationalLimitsGroup(name);
            setIndexSelectedLimitSet(0);
        }, [parentFormName, getValues, prependEmptyOperationalLimitsGroup, setIndexSelectedLimitSet]);

        useImperativeHandle(ref, () => ({ addNewLimitSet }));

        const handleTabChange = useCallback(
            (event: React.SyntheticEvent, newValue: number): void => {
                setIndexSelectedLimitSet(newValue);
            },
            [setIndexSelectedLimitSet]
        );

        return (
            <>
                <Tabs
                    orientation="vertical"
                    variant="fullWidth"
                    value={indexSelectedLimitSet !== null && indexSelectedLimitSet}
                    onChange={handleTabChange}
                    sx={tabStyles.listDisplay}
                    visibleScrollbar
                >
                    {limitsGroups.map((opLg: OperationalLimitsGroupFormSchema, index: number) => (
                        <Tab
                            onMouseEnter={() => setHoveredRowIndex(index)}
                            onMouseLeave={() => setHoveredRowIndex(-1)}
                            key={opLg.id + index}
                            label={
                                <OperationalLimitsGroupTabLabel
                                    operationalLimitsGroup={opLg}
                                    showIconButton={index === hoveredRowIndex || index === activatedByMenuTabIndex}
                                    editable={!editable}
                                    limitsPropertiesName={`${parentFormName}.${OPERATIONAL_LIMITS_GROUPS}[${index}].${LIMITS_PROPERTIES}`}
                                    handleOpenMenu={handleOpenMenu}
                                    index={index}
                                />
                            }
                            sx={limitsStyles.limitsBackground}
                        />
                    ))}
                </Tabs>
                <LimitsGroupsContextualMenu
                    parentFormName={parentFormName}
                    indexSelectedLimitSet={indexSelectedLimitSet}
                    setIndexSelectedLimitSet={setIndexSelectedLimitSet}
                    menuAnchorEl={menuAnchorEl}
                    handleCloseMenu={handleCloseMenu}
                    activatedByMenuTabIndex={activatedByMenuTabIndex}
                    selectedLimitsGroups1={selectedLimitsGroups1}
                    selectedLimitsGroups2={selectedLimitsGroups2}
                    currentLimitsToModify={currentLimitsToModify}
                    operationalLimitsGroups={operationalLimitsGroups}
                    appendToLimitsGroups={appendToLimitsGroups}
                    removeLimitsGroups={removeLimitsGroups}
                />
            </>
        );
    }
);
