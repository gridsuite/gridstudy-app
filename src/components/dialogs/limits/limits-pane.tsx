/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid, Tab, Tabs } from '@mui/material';
import {
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    LIMITS,
    SELECTED_LIMIT_GROUP_1,
    SELECTED_LIMIT_GROUP_2,
} from 'components/utils/field-constants';
import { FormattedMessage } from 'react-intl';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { LimitsSidePane } from './limits-side-pane';
import { SelectedOperationalLimitGroup } from './selected-operational-limit-group.jsx';
import { CurrentTreeNode } from '../../../redux/reducer';
import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import { LimitSet } from "../network-modifications/line/creation/load-creation-type";

const styles = {
    limitsBackground: {
        backgroundColor: '#1a1919', // TODO : may be found in the theme ??
        alignItems: 'self-start',
        justifyContent: 'flex-start',
        '&.Mui-selected': { backgroundColor: '#383838' }, // TODO : may be found in the theme ??
    },
    limitsBackgroundUnselected: {
        backgroundColor: '#1a1919', // TODO : may be found in the theme ??
        alignItems: 'self-start',
        justifyContent: 'flex-start',
    },
};
export interface LimitsPaneProps {
    id?: string;
    currentNode?: CurrentTreeNode;
    equipmentToModify?: any;
    clearableFields?: any;
}

export function LimitsPane({
    id = LIMITS,
    currentNode,
    equipmentToModify,
    clearableFields,
}: Readonly<LimitsPaneProps>) {
    const [allLimitSetsStr, setAllLimitSetsStr] = useState<string[]>([]);
    // selected set in the tab interface
    const [selectedSetStr, setSelectedSetStr] = useState<string | null>(allLimitSetsStr[0] || null);
    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setSelectedSetStr(allLimitSetsStr[newValue] || null);
    };

    const limitSets1: LimitSet[] = useWatch({
        name: `${id}.${CURRENT_LIMITS_1}`,
    });
    const limitSets2: LimitSet[] = useWatch({
        name: `${id}.${CURRENT_LIMITS_2}`,
    });
    // in the limitSets1 array
    const [indexSelectedLimitSet1, setIndexSelectedLimitSet1] = useState<number | undefined>(undefined);
    // in the limitSets2 array
    const [indexSelectedLimitSet2, setIndexSelectedLimitSet2] = useState<number | undefined>(undefined);

    useEffect(() => {
        setIndexSelectedLimitSet1(
            limitSets1.findIndex((limitSet: LimitSet) => limitSet.id === selectedSetStr)
        );
        setIndexSelectedLimitSet2(
            limitSets2.findIndex((limitSet: LimitSet) => limitSet.id === selectedSetStr)
        );
    }, [selectedSetStr, setIndexSelectedLimitSet1, setIndexSelectedLimitSet2, limitSets1, limitSets2]);

    useEffect(() => {
        let allLimitSets: string[] = [];
        allLimitSets.push(...limitSets1.map((limitSet: { id: any }) => limitSet.id));
        allLimitSets.push(...limitSets2
            .filter((limitSet: LimitSet) => !allLimitSets.find((limitSetStr) => limitSetStr === limitSet.id))
            .map((limitSet: { id: any }) => limitSet.id));
        setAllLimitSetsStr(allLimitSets);
    }, [limitSets1, limitSets2]);

    /*
    const handleCopy = (direction: 'toRight' | 'toLeft') => {
    if (selectedSet) {
      const updatedSets = limitSets.map(set => {
        if (set.id === selectedSet.id) {
          const updatedSet = { ...set };
          if (direction === 'toRight') {
            updatedSet.side_2 = [...set.side_1];
          } else {
            updatedSet.side_1 = [...set.side_2];
          }
          return updatedSet;
        }
        return set;
      });
      setLimitSets(updatedSets);
      setSelectedSet(updatedSets[tabValue]);
    }
  };
     */

    const addNewLimitSet = () => {
        /*const newLimitSet: LimitSet = {
            id: `New Limit Set ${limitSets.length - 1}`,
            temporaryLimits: [],
            permanentLimit: undefined,
        };*/
        const newLimitSet: string = `DEFAUT ${allLimitSetsStr.length > 0 ? allLimitSetsStr.length - 1 : null}`;
        setAllLimitSetsStr([...allLimitSetsStr, newLimitSet]); // TODO : l'ajouter dans les deux côtés ? cf createRows
        setTabValue(allLimitSetsStr.length);
        setSelectedSetStr(newLimitSet);
    };

    return (
        <Grid container spacing={2}>
            {/* titles */}
            <Grid container item xs={12} columns={11} spacing={2}>
                <Grid item xs={1} />
                <Grid item xs={5}>
                    <Box component={`h3`}>
                        <FormattedMessage id="Side1" />
                    </Box>
                </Grid>
                <Grid item xs={5}>
                    <Box component={`h3`}>
                        <FormattedMessage id="Side2" />
                    </Box>
                </Grid>
            </Grid>
            {/* active limit set */}
            <Grid container item xs={12} columns={11} spacing={2}>
                <Grid item xs={1} />
                <Grid item xs={5}>
                    <SelectedOperationalLimitGroup
                        selectedFormName={`${id}.${SELECTED_LIMIT_GROUP_1}`}
                        optionsFormName={`${id}.${CURRENT_LIMITS_1}`}
                    />
                </Grid>
                <Grid item xs={5}>
                    <SelectedOperationalLimitGroup
                        selectedFormName={`${id}.${SELECTED_LIMIT_GROUP_2}`}
                        optionsFormName={`${id}.${CURRENT_LIMITS_2}`}
                    />
                </Grid>
            </Grid>
            {/* limits */}
            <Grid container item xs={12} columns={11}>
                <Grid item xs={1}>
                    <Tab icon={<AddCircleIcon />} onClick={() => addNewLimitSet()} />
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{ flexGrow: 1 }}
                    >
                        {allLimitSetsStr.map((set, index) => (
                            // <Box sx={index === tabValue ? styles.limitsBackground : styles.limitsBackgroundUnselected} > TODO : bloque le clic sur tab => à arranger pour avoir l'icone comme bouton séparé
                                <Tab key={set} label={set} sx={index === tabValue ? styles.limitsBackground : styles.limitsBackgroundUnselected} />
                                // <DensityMediumIcon fontSize={'small'} />
                            //</Box>
                        ))}
                    </Tabs>
                </Grid>
                <Grid item xs={5}>
                    {limitSets1.map(
                        (item: any, index: number) =>
                            index === indexSelectedLimitSet1 && (
                                <LimitsSidePane
                                    limitSetFormName={`${id}.${CURRENT_LIMITS_1}`}
                                    clearableFields={clearableFields}
                                    indexLimitSet={index}
                                    permanentCurrentLimitPreviousValue={
                                        equipmentToModify?.currentLimits1?.permanentLimit
                                    }
                                    previousValues={equipmentToModify?.currentLimits1?.temporaryLimits}
                                    currentNode={currentNode}
                                />
                            )
                    )}
                </Grid>
                <Grid item xs={5}>
                    {limitSets2.map(
                        (item: any, index: number) =>
                            index === indexSelectedLimitSet2 && (
                                <LimitsSidePane
                                    limitSetFormName={`${id}.${CURRENT_LIMITS_2}`}
                                    clearableFields={clearableFields}
                                    indexLimitSet={index}
                                    permanentCurrentLimitPreviousValue={
                                        equipmentToModify?.currentLimits2?.permanentLimit
                                    }
                                    previousValues={equipmentToModify?.currentLimits2?.temporaryLimits}
                                    currentNode={currentNode}
                                />
                            )
                    )}
                </Grid>
            </Grid>
        </Grid>
    );
}
