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
import { ContextMenuCoordinates, LimitsGroupsContextualMenu } from './limits-groups-contextual-menu';
import { isBlankOrEmpty } from '../../utils/validation-functions';
import { stylesLayout } from 'components/utils/tab-utils';
import { APPLICABILITY } from '../../network/constants';
import { type MuiStyles, NAME } from '@gridsuite/commons-ui';
import { LimitsGroupsContextualMenu } from './limits-groups-contextual-menu';
import { tabStyles } from 'components/utils/tab-utils';
import { OperationalLimitsGroupTabLabel } from './operational-limits-group-tab-label';
import { OperationalLimitsGroupFormSchema } from './operational-limits-groups-types';
import { CurrentLimitsData } from 'services/study/network-map.type';
import { FormattedMessage } from 'react-intl';
import { blue } from '@mui/material/colors';
import { generateEmptyOperationalLimitsGroup, generateUniqueId } from './operational-limits-groups-utils';
import { limitsStyles } from './operational-limits-groups-styles';

const limitsStyles = {
    tabs: () => ({
        ...stylesLayout.listDisplay,
        maxHeight: '50vh',
        height: '100%',
        borderRight: 1,
        borderColor: 'divider',
        transition: 'transform 0.3s ease-in-out',
        '& .MuiTabs-indicator': {
            borderRight: `3px solid ${blue[700]}`,
        },
        '.MuiTab-root.MuiButtonBase-root': {
            textTransform: 'none',
            textAlign: 'left',
            alignItems: 'stretch',
            p: 0,
        },
    }),
    tabBackground: {
        '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.05)', // blue[700]
        },
        maxWidth: 600,
        width: '100%',
        p: 1,
        minHeight: 60,
    },
    copyLimitsToRightBackground: {
        height: 200,
        display: 'flex',
    },
    copyLimitsToLeftBackground: {
        height: '50%',
    },
    copyLimitsButtons: {
        alignSelf: 'flex-end',
        minWidth: '0px',
        height: 'auto',
        padding: '1',
    },
} as const satisfies MuiStyles;

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
        const [editingTabIndex, setEditingTabIndex] = useState<number>(-1);
        const [contextMenuCoordinates, setContextMenuCoordinates] = useState<ContextMenuCoordinates>({
            x: null,
            y: null,
            tabIndex: null,
        });
        const [editedLimitGroupName, setEditedLimitGroupName] = useState('');
        const [editionError, setEditionError] = useState<string>('');
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
            (event: React.MouseEvent<HTMLElement>, index: number): void => {
                if (!editable) {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
                setIndexSelectedLimitSet(index);
                setContextMenuCoordinates({
                    x: event.clientX,
                    y: event.clientY,
                    tabIndex: index,
                });
            },
            [editable, setIndexSelectedLimitSet]
        );

        const handleCloseMenu = useCallback(() => {
            setContextMenuCoordinates({
                x: null,
                y: null,
                tabIndex: null,
            });
        }, [setContextMenuCoordinates]);

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
                    variant="scrollable"
                    value={indexSelectedLimitSet !== null && indexSelectedLimitSet}
                    onChange={handleTabChange}
                    sx={limitsStyles.tabs}
                >
                    {limitsGroups.map((opLg: OperationalLimitsGroupFormSchema, index: number) => (
                        <Tab
                            onMouseEnter={() => setHoveredRowIndex(index)}
                            onContextMenu={(e) => handleOpenMenu(e, index)}
                            key={opLg.id + index}
                            disableRipple
                            sx={limitsStyles.tabBackground}
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
                        />
                    ))}
                </Tabs>
                <LimitsGroupsContextualMenu
                    parentFormName={parentFormName}
                    indexSelectedLimitSet={indexSelectedLimitSet}
                    setIndexSelectedLimitSet={setIndexSelectedLimitSet}
                    handleCloseMenu={handleCloseMenu}
                    contextMenuCoordinates={contextMenuCoordinates}
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
