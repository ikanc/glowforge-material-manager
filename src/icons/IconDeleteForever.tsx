import React from 'react';
import { IconProps } from './IconsProps';
import './Icons.css';

export default function IconDeleteForever(props: IconProps) {
  const styles = {
    fill: props.fill ? props.fill : 'currentColor',
    height: props.height ? props.height : "24px",
    width: props.width ? props.width : "24px",
  };

  const buttonClasses = `icon-button ${(props.buttonClassName) ? props.buttonClassName : undefined}`;

  return (
    <button
      className={buttonClasses}
      onClick={(props.click) ? props.click : undefined}
      title={(props.title) ? props.title : 'Delete'}
    >
      <svg
        className={(props.className) ? props.className : undefined}
        style={styles} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path fill="none" d="M0 0h24v24H0V0z"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>
      </svg>
      {props.text}
    </button>
  );
}
