// @flow

import { Component } from 'react';
import payment from 'payment';
import { checkIsNumeric, handleKeyDown, inputRenderer } from './utils';
import { hasZipReachedMaxLength, isHighlighted } from './utils/formatter';
import isZipValid from './utils/is-zip-valid';

type Props = {
  cardNumber: ?string,
  cardZipInputProps: Object,
  customTextLabels: Object,
  inputClassName: string,
  setback: Function,
  setFieldInvalid: Function,
  setFieldValid: Function
};

type State = {};

class CardZipInput extends Component<Props, State> {
  cvcField: any;
  zipField: any;

  static defaultProps = {
    cardNumber: '',
    cardZipInputProps: {},
    customTextLabels: {},
    inputClassName: '',
    setback: () => {},
    setFieldInvalid: () => {},
    setFieldValid: () => {}
  };

  handleCardZipBlur = (
    { onBlur }: { onBlur?: ?Function } = { onBlur: null }
  ) => (e: SyntheticInputEvent<*>) => {
    const { customTextLabels } = this.props;
    if (!isZipValid(e.target.value)) {
      this.props.setFieldInvalid(
        customTextLabels.invalidZipCode || 'Zip code is invalid'
      );
    }

    const { cardZipInputProps } = this.props;
    cardZipInputProps.onBlur && cardZipInputProps.onBlur(e);
    onBlur && onBlur(e);
  };

  handleCardZipChange = (
    { onChange }: { onChange?: ?Function } = { onChange: null }
  ) => (e: SyntheticInputEvent<*>) => {
    const { customTextLabels } = this.props;
    const zip = e.target.value;
    const zipLength = zip.length;

    this.props.setFieldValid();

    if (zipLength >= 5 && !isZipValid(zip)) {
      this.props.setFieldInvalid(
        customTextLabels.invalidZipCode || 'Zip code is invalid'
      );
    }

    const { cardZipInputProps } = this.props;
    cardZipInputProps.onChange && cardZipInputProps.onChange(e);
    onChange && onChange(e);
  };

  handleCardZipKeyPress = (e: any) => {
    const cardType = payment.fns.cardType(this.props.cardNumber);
    const value = e.target.value;
    checkIsNumeric(e);
    if (value && !isHighlighted()) {
      const valueLength = value.split(' / ').join('').length;
      if (hasZipReachedMaxLength(cardType, valueLength)) {
        e.preventDefault();
      }
    }
  };

  focus = () => {
    this.zipField.focus();
  };

  render = () => {
    const { cardZipInputProps, inputClassName, customTextLabels } = this.props;
    return inputRenderer({
      handleCardZipChange: onChange => this.handleCardZipChange({ onChange }),
      handleCardZipBlur: onBlur => this.handleCardZipBlur({ onBlur }),
      props: {
        id: 'zip',
        ref: zipField => {
          this.zipField = zipField;
        },
        maxLength: '6',
        className: `credit-card-input zip-input ${inputClassName}`,
        pattern: '[0-9]*',
        placeholder: customTextLabels.zipPlaceholder || 'Zip',
        type: 'text',
        ...cardZipInputProps,
        onBlur: this.handleCardZipBlur(),
        onChange: this.handleCardZipChange(),
        onKeyDown: handleKeyDown(this.props.setback),
        onKeyPress: this.handleCardZipKeyPress
      }
    });
  };
}

export default CardZipInput;
