// @flow

const isMonthDashKey = ({ key, target: { value } } = {}) => {
  return !value.match(/[/-]/) && /^[/-]$/.test(key);
};

export default isMonthDashKey;
