// @flow
import React from 'react';

const BACKSPACE_KEY_CODE = 8;
const CARD_TYPES = {
  mastercard: 'MASTERCARD',
  visa: 'VISA',
  amex: 'AMERICAN_EXPRESS'
};

const inputRenderer = ({ props }: Object) => <input {...props} />;

const isMonthDashKey = ({ key, target: { value } } = {}) => {
  return !value.match(/[/-]/) && /^[/-]$/.test(key);
};

const checkIsNumeric = (e: any) => {
  if (!/^\d*$/.test(e.key)) {
    e.preventDefault();
  }
};

const handleKeyDown = (setback: Function) => {
  return (e: SyntheticInputEvent<*>) => {
    if (e.keyCode === BACKSPACE_KEY_CODE && !e.target.value) {
      setback && setback();
    }
  };
};

export {
  CARD_TYPES,
  inputRenderer,
  isMonthDashKey,
  checkIsNumeric,
  handleKeyDown
};
