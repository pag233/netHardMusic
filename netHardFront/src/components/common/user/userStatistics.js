import React from 'react';

import PropTypes from 'prop-types';

import './userstatistics.scss';

export default function UserStatistics({ location }) {
    const statistics = [{ type: '动态', count: 0 }, { type: '关注', count: 0 }, { type: '粉丝', count: 0 }];
    const computedClassName = location + '-statistics';
    return (
        <div className={computedClassName}>
            {
                statistics.map(({ type, count }, key) => (
                    <div className="state" key={key}>
                        <span className='count'>{count}</span>
                        <span className='type'>{type}</span>
                    </div>
                ))
            }
        </div>
    );
}

UserStatistics.propTypes = {
    location: PropTypes.string.isRequired
};