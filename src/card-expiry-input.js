// @flow

import { Component } from 'react';
import {
  checkIsNumeric,
  handleKeyDown,
  inputRenderer,
  isMonthDashKey
} from './utils';
import { formatExpiry, isHighlighted } from './utils/formatter';
import isExpiryInvalid from './utils/is-expiry-invalid';

type Props = {
  autoAdvance: Function,
  cardExpiryInputProps: Object,
  customTextLabels: Object,
  inputClassName: string,
  setback: Function,
  setFieldInvalid: Function,
  setFieldValid: Function
};

type State = {};

class CardExpiryInput extends Component<Props, State> {
  cardExpiryField: any;
  cardNumberField: any;
  cvcField: any;

  static defaultProps = {
    autoAdvance: () => {},
    cardExpiryInputProps: {},
    customTextLabels: {},
    inputClassName: '',
    setback: () => {},
    setFieldInvalid: () => {},
    setFieldValid: () => {}
  };

  handleCardExpiryBlur = (
    { onBlur }: { onBlur?: ?Function } = { onBlur: null }
  ) => (e: SyntheticInputEvent<*>) => {
    const { customTextLabels } = this.props;
    const cardExpiry = e.target.value.split(' / ').join('/');
    const expiryError = isExpiryInvalid(
      cardExpiry,
      customTextLabels.expiryError
    );
    if (expiryError) {
      this.props.setFieldInvalid(expiryError);
    }

    const { cardExpiryInputProps } = this.props;
    cardExpiryInputProps.onBlur && cardExpiryInputProps.onBlur(e);
    onBlur && onBlur(e);
  };

  handleCardExpiryChange = (
    { onChange }: { onChange?: ?Function } = { onChange: null }
  ) => (e: SyntheticInputEvent<*>) => {
    const { customTextLabels, autoAdvance } = this.props;

    this.cardExpiryField.value = formatExpiry(e);
    const value = this.cardExpiryField.value.split(' / ').join('/');

    this.props.setFieldValid();

    const expiryError = isExpiryInvalid(value, customTextLabels.expiryError);
    if (value.length > 4) {
      if (expiryError) {
        this.props.setFieldInvalid(expiryError);
      } else {
        autoAdvance && autoAdvance();
      }
    }

    const { cardExpiryInputProps } = this.props;
    cardExpiryInputProps.onChange && cardExpiryInputProps.onChange(e);
    onChange && onChange(e);
  };

  handleCardExpiryKeyPress = (e: any) => {
    const value = e.target.value;

    if (!isMonthDashKey(e)) {
      checkIsNumeric(e);
    }

    if (value && !isHighlighted()) {
      const valueLength = value.split(' / ').join('').length;
      if (valueLength >= 4) {
        e.preventDefault();
      }
    }
  };

  focus = () => {
    this.cardExpiryField.focus();
  };

  render = () => {
    const {
      cardExpiryInputProps,
      inputClassName,
      customTextLabels
    } = this.props;
    return inputRenderer({
      handleCardExpiryChange: onChange =>
        this.handleCardExpiryChange({ onChange }),
      handleCardExpiryBlur: onBlur => this.handleCardExpiryBlur({ onBlur }),
      props: {
        id: 'card-expiry',
        ref: cardExpiryField => {
          this.cardExpiryField = cardExpiryField;
        },
        autoComplete: 'cc-exp',
        className: `credit-card-input ${inputClassName}`,
        placeholder: customTextLabels.expiryPlaceholder || 'MM/YY',
        type: 'tel',
        ...cardExpiryInputProps,
        onBlur: this.handleCardExpiryBlur(),
        onChange: this.handleCardExpiryChange(),
        onKeyDown: handleKeyDown(this.props.setback),
        onKeyPress: this.handleCardExpiryKeyPress
      }
    });
  };
}

export default CardExpiryInput;
