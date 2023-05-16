import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppBar, Box, Grid, IconButton, TextField } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

export const SearchBar = ({
    searchInput,
    setSearchInput,
    searchResult,
    focusCellCallback,
    onClose,
}) => {
    const searchInputRef = useRef();
    const [occurenceIndex, setOccurenceIndex] = useState(-1);

    const goToNextOccurence = useCallback(
        (action) => {
            if (action === 'NEXT') {
                setOccurenceIndex((oldOccurenceIndex) => {
                    const newOccurenceIndex =
                        oldOccurenceIndex + 1 < searchResult.length
                            ? oldOccurenceIndex + 1
                            : 0;
                    focusCellCallback(searchResult[newOccurenceIndex]);
                    return newOccurenceIndex;
                });
            } else if (action === 'PREV') {
                setOccurenceIndex((oldOccurenceIndex) => {
                    const newOccurenceIndex =
                        oldOccurenceIndex - 1 >= 0
                            ? oldOccurenceIndex - 1
                            : searchResult.length - 1;
                    focusCellCallback(searchResult[newOccurenceIndex]);
                    return newOccurenceIndex;
                });
            } else if (action === 'RESET') {
                setOccurenceIndex(-1);
            }
        },
        [searchResult, focusCellCallback]
    );

    useEffect(() => {
        goToNextOccurence('RESET');
    }, [searchResult, goToNextOccurence]);

    useEffect(() => {
        searchInputRef.current.focus();
    }, []);

    useEffect(() => {
        const openSearch = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                goToNextOccurence('NEXT');
            }
        };
        document.addEventListener('keydown', openSearch);

        return () => document.removeEventListener('keydown', openSearch);
    }, [goToNextOccurence]);

    const noResult = useMemo(() => searchResult.length === 0, [searchResult]);

    return (
        <Box height={16} m={3}>
            <AppBar style={{ bottom: 0, top: 'auto' }}>
                <Grid
                    spacing={2}
                    p={1}
                    alignItems={'center'}
                    direction="row"
                    container
                >
                    <Grid xs={6} item>
                        <TextField
                            inputRef={searchInputRef}
                            size="small"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            label="Rechercher"
                        />
                        <IconButton
                            disabled={noResult}
                            onClick={() => goToNextOccurence('PREV')}
                        >
                            <KeyboardArrowUpIcon />
                        </IconButton>
                        <IconButton
                            disabled={noResult}
                            onClick={() => goToNextOccurence('NEXT')}
                        >
                            <KeyboardArrowDownIcon />
                        </IconButton>
                        {searchInput.length !== 0 &&
                            (noResult ? (
                                <>Aucun résultat</>
                            ) : (
                                <>
                                    {occurenceIndex === -1 ? (
                                        <>{searchResult.length} occurences</>
                                    ) : (
                                        <>
                                            Occurence {occurenceIndex + 1} sur{' '}
                                            {searchResult.length}
                                        </>
                                    )}
                                </>
                            ))}
                    </Grid>
                    <Grid xs={6} item textAlign={'right'}>
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </AppBar>
        </Box>
    );
};
