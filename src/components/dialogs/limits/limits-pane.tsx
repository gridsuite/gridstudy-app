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
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { LimitsSidePane } from './limits-side-pane';
import { SelectedOperationalLimitGroup } from './selected-operational-limit-group.jsx';
import { CurrentTreeNode } from '../../../redux/reducer';
import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";

const styles = {
    limitsBackground: {
        backgroundColor: '#383838', // TODO : may be found in the theme ??
        padding: 2,
    },
    limitsBackgroundUnselected: {
        backgroundColor: '#1a1919', // TODO : may be found in the theme ??
    },
};
export interface LimitsPaneProps {
    id?: string;
    currentNode?: CurrentTreeNode;
    equipmentToModify?: any;
    clearableFields?: any;
}
interface LimitSet {
    id: string;
    temporaryLimits: Object[];
    permanentLimit?: number;
}


export function LimitsPane({
    id = LIMITS,
    currentNode,
    equipmentToModify,
    clearableFields,
}: Readonly<LimitsPaneProps>) {
    const [limitSets, setLimitSets] = useState<LimitSet[]>([]); // TODO ?? devrait probablement seulement contenir les string des ids des deux côtés mélangés mais avec un seul visible à la fois
    const [selectedSet, setSelectedSet] = useState<LimitSet | null>(limitSets[0] || null);
    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setSelectedSet(limitSets[newValue] || null);
    };

    const limitSets1 = useWatch({
        name: `${id}.${CURRENT_LIMITS_1}`,
    });
    const limitSets2 = useWatch({
        name: `${id}.${CURRENT_LIMITS_2}`,
    });

    useEffect(() => { // TODO : plutôt un useMemo
        let allLimitSets: LimitSet[] = [];
        // console.log("Mathieu limitSets1 : " + JSON.stringify(limitSets1, null, 4));
        // console.log("Mathieu limitSets2 : " + JSON.stringify(limitSets2, null, 4));
        if (limitSets1) {
            allLimitSets = [...limitSets1];
        }
        if (limitSets2) {
            allLimitSets = [...limitSets2];
        }
        // console.log("Mathieu allLimitSets : " + JSON.stringify(allLimitSets, null, 4));
        setLimitSets(allLimitSets);
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
    const newLimitSet: LimitSet = {
        id: `New Limit Set ${limitSets.length - 1}`,
        temporaryLimits: [],
        permanentLimit: undefined,
    };
    setLimitSets([...limitSets, newLimitSet]); // TODO : l'ajouter dans les deux côtés ?
    setTabValue(limitSets.length);
    setSelectedSet(newLimitSet);
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
                        selectedName={`${id}.${SELECTED_LIMIT_GROUP_1}`}
                        optionsFormName={`${id}.${CURRENT_LIMITS_1}`}
                    />
                </Grid>
                <Grid item xs={5}>
                    <SelectedOperationalLimitGroup
                        selectedName={`${id}.${SELECTED_LIMIT_GROUP_2}`}
                        optionsFormName={`${id}.${CURRENT_LIMITS_2}`}
                    />
                </Grid>
            </Grid>
            {/* limits */}
            <Grid container item xs={12} columns={11}>
                <Grid item xs={1}>
                    <IconButton color="primary" onClick={() => addNewLimitSet()}>
                        <AddCircleIcon />
                    </IconButton>
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{ flexGrow: 1 }}
                    >
                        {limitSets.map((set, index) => (
                            <Tab
                                key={set.id}
                                label={set.id}
                                sx={{
                                    backgroundColor: index === tabValue ? styles.limitsBackground.backgroundColor : styles.limitsBackgroundUnselected.backgroundColor,
                                    '&.Mui-selected': { backgroundColor: styles.limitsBackground.backgroundColor },
                                }}
                            />
                        ))}
                    </Tabs>
                </Grid>
                <Grid item xs={5}>
                    <LimitsSidePane
                        arrayFormName={`${id}.${CURRENT_LIMITS_1}`}
                        clearableFields={clearableFields}
                        indexLimitSet={0}
                        permanentCurrentLimitPreviousValue={equipmentToModify?.currentLimits1?.permanentLimit}
                        previousValues={equipmentToModify?.currentLimits1?.temporaryLimits}
                        currentNode={currentNode}
                    />
                </Grid>
                <Grid item xs={5}>
                    <LimitsSidePane
                        arrayFormName={`${id}.${CURRENT_LIMITS_2}`}
                        clearableFields={clearableFields}
                        indexLimitSet={0}
                        permanentCurrentLimitPreviousValue={equipmentToModify?.currentLimits2?.permanentLimit}
                        previousValues={equipmentToModify?.currentLimits2?.temporaryLimits}
                        currentNode={currentNode}
                    />
                </Grid>
            </Grid>
        </Grid>
    );
}
