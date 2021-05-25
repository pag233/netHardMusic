import React from 'react';
import { useSelector } from 'react-redux';

import { avatarSelector } from '../reduxStore/userSlice';
import PropTypes from 'prop-types';

import Icons from '../icons';
import './userAvatar.scss';
/**
 * 
 * @param {string} className - 类名
 * @param {string} avatar - 头像url
 */
export default function UserAvatar({ className, avatar }) {
  const computedClassName = className ? className + ' user-avatar' : 'user-avatar';
  return (
    <div className={computedClassName}>
      {
        avatar ? <img className='user-avatar-img' src={avatar} alt="" /> : Icons.userCircle
      }
    </div>
  );
}
UserAvatar.propTypes = {
  className: PropTypes.string,
  avatar: PropTypes.string
};
export function LoginUserAvatar(props) {
  const { className } = props;
  const avatar = useSelector(avatarSelector);
  return (
    <UserAvatar className={className} avatar={avatar} />
  );
}