// @flow

const checkIsNumeric = (e: any) => {
  if (!/^\d*$/.test(e.key)) {
    e.preventDefault();
  }
};

export default checkIsNumeric;
