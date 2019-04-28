// @flow

import { Component } from 'react';
import payment from 'payment';
import { checkIsNumeric, handleKeyDown, inputRenderer } from './utils';
import {
  formatCvc,
  hasCVCReachedMaxLength,
  isHighlighted
} from './utils/formatter';

type Props = {
  autoAdvance: Function,
  cardCVCInputProps: Object,
  cardNumber: ?string,
  customTextLabels: Object,
  enableZipInput: boolean,
  inputClassName: string,
  setback: Function,
  setFieldInvalid: Function,
  setFieldValid: Function,
  showZip: boolean
};

type State = {};

class CardCVCInput extends Component<Props, State> {
  cardExpiryField: any;
  cvcField: any;

  static defaultProps = {
    autoAdvance: () => {},
    cardCVCInputProps: {},
    cardNumber: '',
    customTextLabels: {},
    enableZipInput: false,
    inputClassName: '',
    setback: () => {},
    setFieldInvalid: () => {},
    setFieldValid: () => {},
    showZip: false
  };

  handleCardCVCBlur = (
    { onBlur }: { onBlur?: ?Function } = { onBlur: null }
  ) => (e: SyntheticInputEvent<*>) => {
    const { customTextLabels } = this.props;
    if (!payment.fns.validateCardCVC(e.target.value)) {
      this.props.setFieldInvalid(
        customTextLabels.invalidCvc || 'CVC is invalid'
      );
    }

    const { cardCVCInputProps } = this.props;
    cardCVCInputProps.onBlur && cardCVCInputProps.onBlur(e);
    onBlur && onBlur(e);
  };

  handleCardCVCChange = (
    { onChange }: { onChange?: ?Function } = { onChange: null }
  ) => (e: SyntheticInputEvent<*>) => {
    const {
      autoAdvance,
      cardNumber,
      customTextLabels,
      enableZipInput,
      showZip
    } = this.props;
    const value = formatCvc(e.target.value);
    this.cvcField.value = value;
    const CVC = value;
    const CVCLength = CVC.length;
    const isZipFieldAvailable = enableZipInput && showZip;
    const cardType = payment.fns.cardType(cardNumber);

    this.props.setFieldValid();
    if (CVCLength >= 4) {
      if (!payment.fns.validateCardCVC(CVC, cardType)) {
        this.props.setFieldInvalid(
          customTextLabels.invalidCvc || 'CVC is invalid'
        );
      }
    }

    if (isZipFieldAvailable && hasCVCReachedMaxLength(cardType, CVCLength)) {
      autoAdvance && autoAdvance();
    }

    const { cardCVCInputProps } = this.props;
    cardCVCInputProps.onChange && cardCVCInputProps.onChange(e);
    onChange && onChange(e);
  };

  handleCardCVCKeyPress = (e: any) => {
    const cardType = payment.fns.cardType(this.props.cardNumber);
    const value = e.target.value;
    checkIsNumeric(e);
    if (value && !isHighlighted()) {
      const valueLength = value.split(' / ').join('').length;
      if (hasCVCReachedMaxLength(cardType, valueLength)) {
        e.preventDefault();
      }
    }
  };

  focus = () => {
    this.cvcField.focus();
  };

  render = () => {
    const { cardCVCInputProps, inputClassName, customTextLabels } = this.props;

    return inputRenderer({
      handleCardCVCChange: onChange => this.handleCardCVCChange({ onChange }),
      handleCardCVCBlur: onBlur => this.handleCardCVCBlur({ onBlur }),
      props: {
        id: 'cvc',
        ref: cvcField => {
          this.cvcField = cvcField;
        },
        maxLength: '5',
        autoComplete: 'off',
        className: `credit-card-input ${inputClassName}`,
        placeholder: customTextLabels.cvcPlaceholder || 'CVC',
        type: 'tel',
        ...cardCVCInputProps,
        onBlur: this.handleCardCVCBlur(),
        onChange: this.handleCardCVCChange(),
        onKeyDown: handleKeyDown(this.props.setback),
        onKeyPress: this.handleCardCVCKeyPress
      }
    });
  };
}

export default CardCVCInput;
