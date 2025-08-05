/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Box } from '@mui/material';
import { BUSBAR_SECTION_ID, IS_AFTER_BUSBAR_SECTION_ID, SECTION_COUNT } from 'components/utils/field-constants';
import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { SliderInput } from '@gridsuite/commons-ui';

interface SectionPositionSliderProps {
    busbarSectionOptions: Array<{ id: string; label: string; vertPos: number }>;
}

export function SectionPositionSlider({ busbarSectionOptions }: SectionPositionSliderProps) {
    const intl = useIntl();
    const { setValue } = useFormContext();
    const selectedBusbar = useWatch({ name: BUSBAR_SECTION_ID });
    const isAfter = useWatch({ name: IS_AFTER_BUSBAR_SECTION_ID });

    const sliderMarks = useMemo(() => {
        if (!busbarSectionOptions.length) {
            return [];
        }

        const sortedSections = [...busbarSectionOptions].sort((a, b) => a.vertPos - b.vertPos);
        const marks = [];

        marks.push({
            value: 0.5,
            label: intl.formatMessage({ id: 'newSection' }),
        });

        sortedSections.forEach((section, index) => {
            marks.push({
                value: section.vertPos,
                label: `Section ${section.vertPos}`,
            });

            if (index < sortedSections.length - 1) {
                marks.push({
                    value: section.vertPos + 0.5,
                    label: intl.formatMessage({ id: 'newSection' }),
                });
            }
        });

        const lastSection = sortedSections[sortedSections.length - 1];
        if (lastSection) {
            marks.push({
                value: lastSection.vertPos + 0.5,
                label: intl.formatMessage({ id: 'newSection' }),
            });
        }

        return marks;
    }, [busbarSectionOptions, intl]);

    const currentSliderValue = useMemo(() => {
        if (!selectedBusbar) {
            return 0.5;
        }

        const selectedSection = busbarSectionOptions.find((s) => s.id === selectedBusbar);
        if (!selectedSection) {
            return 0.5;
        }

        return isAfter ? selectedSection.vertPos + 0.5 : selectedSection.vertPos - 0.5;
    }, [selectedBusbar, isAfter, busbarSectionOptions]);

    const handleSliderChange = useCallback(
        (newValue: number | number[]) => {
            const value = Array.isArray(newValue) ? newValue[0] : newValue;

            const nearestSection = busbarSectionOptions.reduce((closest, section) => {
                const currentDistance = Math.abs(section.vertPos - value);
                const closestDistance = Math.abs(closest.vertPos - value);
                return currentDistance < closestDistance ? section : closest;
            });

            if (nearestSection) {
                setValue(BUSBAR_SECTION_ID, nearestSection.id);
                setValue(IS_AFTER_BUSBAR_SECTION_ID, value > nearestSection.vertPos);
            }
        },
        [busbarSectionOptions, setValue]
    );

    const getPositionDescription = useCallback(
        (value: number) => {
            const nearestSection = busbarSectionOptions.find(
                (s) =>
                    Math.abs(s.vertPos - value) < 0.3 ||
                    Math.abs(s.vertPos + 0.5 - value) < 0.3 ||
                    Math.abs(s.vertPos - 0.5 - value) < 0.3
            );

            if (!nearestSection) {
                return `${value}`;
            }

            if (Math.abs(nearestSection.vertPos - value) < 0.3) {
                return nearestSection.id;
            } else if (value > nearestSection.vertPos) {
                return `After ${nearestSection.id}`;
            } else {
                return `Before ${nearestSection.id}`;
            }
        },
        [busbarSectionOptions]
    );

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ mx: 2, mt: 4, mb: 2 }}>
                <SliderInput
                    name={SECTION_COUNT}
                    value={currentSliderValue}
                    onValueChanged={handleSliderChange}
                    min={0}
                    max={Math.max(...busbarSectionOptions.map((s) => s.vertPos)) + 1}
                    step={1}
                    marks={sliderMarks}
                    valueLabelDisplay="on"
                    aria-label="Custom marks"
                    aria-labelledby="track-false-slider"
                    size="medium"
                    valueLabelFormat={getPositionDescription}
                    sx={{
                        '& .MuiSlider-mark': {
                            backgroundColor: '#666',
                            width: 2,
                            height: 2,
                            borderRadius: 0,
                        },
                        '& .MuiSlider-mark:has(+ .MuiSlider-markLabel)': {
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                width: 12,
                                height: 2,
                                backgroundColor: '#666',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%) rotate(90deg)',
                            },
                        },
                    }}
                />
            </Box>
        </Box>
    );
}
