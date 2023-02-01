import PropTypes from 'prop-types';

export const SeriesType = PropTypes.arrayOf(
    PropTypes.shape({
        index: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        data: PropTypes.arrayOf(PropTypes.object),
    })
);
