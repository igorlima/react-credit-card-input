// @flow

import { Component } from 'react';
import payment from 'payment';
import creditCardType from 'credit-card-type';
import { checkIsNumeric, inputRenderer } from './utils';
import {
  formatCardNumber,
  hasCardNumberReachedMaxLength,
  isHighlighted
} from './utils/formatter';
import images from './utils/images';

const CARD_TYPES = {
  mastercard: 'MASTERCARD',
  visa: 'VISA',
  amex: 'AMERICAN_EXPRESS'
};

type Props = {
  CARD_TYPES: Object,
  autoAdvance: Function,
  cardNumberInputProps: Object,
  customTextLabels: Object,
  enableZipInput: boolean,
  images: Object,
  inputClassName: string,
  setFieldInvalid: Function,
  setFieldValid: Function,
  watchState: Function
};

type State = {
  cardImage: string,
  cardNumberLength: number,
  cardNumber: ?string,
  errorText: ?string,
  showZip: boolean
};

class CardNumberInput extends Component<Props, State> {
  cardNumberField: any;

  static defaultProps = {
    autoAdvance: () => {},
    cardNumberInputProps: {},
    customTextLabels: {},
    enableZipInput: false,
    images: {},
    inputClassName: '',
    setFieldInvalid: () => {},
    setFieldValid: () => {},
    watchState: () => {}
  };

  constructor(props: Props) {
    super(props);
    this.CARD_TYPES = Object.assign({}, CARD_TYPES, props.CARD_TYPES);
    this.images = Object.assign({}, images, props.images);
    this.state = {
      cardImage: this.images.placeholder,
      cardNumberLength: 0,
      cardNumber: null,
      showZip: false
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { cardImage, cardNumber, showZip } = this.state;
    const { watchState } = this.props;

    if (
      cardImage !== prevState.cardImage ||
      cardNumber !== prevState.cardNumber ||
      showZip !== prevState.showZip
    ) {
      watchState({ cardImage, cardNumber, showZip });
    }
  }

  componentDidMount = () => {
    this.setState({ cardNumber: this.cardNumberField.value }, () => {
      const cardType = payment.fns.cardType(this.state.cardNumber);
      const images = this.images;
      this.setState({
        cardImage: images[cardType] || images.placeholder
      });
    });
  };

  handleCardNumberBlur = (
    { onBlur }: { onBlur?: ?Function } = { onBlur: null }
  ) => (e: SyntheticInputEvent<*>) => {
    const { customTextLabels } = this.props;
    if (!payment.fns.validateCardNumber(e.target.value)) {
      this.props.setFieldInvalid(
        customTextLabels.invalidCardNumber || 'Card number is invalid'
      );
    }

    const { cardNumberInputProps } = this.props;
    cardNumberInputProps.onBlur && cardNumberInputProps.onBlur(e);
    onBlur && onBlur(e);
  };

  handleCardNumberChange = (
    { onChange }: { onChange?: ?Function } = { onChange: null }
  ) => (e: SyntheticInputEvent<*>) => {
    const {
      autoAdvance,
      customTextLabels,
      enableZipInput,
      cardNumberInputProps
    } = this.props;
    const images = this.images;
    const cardNumber = e.target.value;
    const cardNumberLength = cardNumber.split(' ').join('').length;
    const cardType = payment.fns.cardType(cardNumber);
    const cardTypeInfo =
      creditCardType.getTypeInfo(
        creditCardType.types[this.CARD_TYPES[cardType]]
      ) || {};
    const cardTypeLengths = cardTypeInfo.lengths || [16];

    this.cardNumberField.value = formatCardNumber(cardNumber);

    this.setState({
      cardImage: images[cardType] || images.placeholder,
      cardNumber
    });

    if (enableZipInput) {
      this.setState({ showZip: cardNumberLength >= 6 });
    }

    this.props.setFieldValid();
    if (cardTypeLengths) {
      const lastCardTypeLength = cardTypeLengths[cardTypeLengths.length - 1];
      for (let length of cardTypeLengths) {
        if (
          length === cardNumberLength &&
          payment.fns.validateCardNumber(cardNumber)
        ) {
          autoAdvance && autoAdvance();
          break;
        }
        if (cardNumberLength === lastCardTypeLength) {
          this.props.setFieldInvalid(
            customTextLabels.invalidCardNumber || 'Card number is invalid'
          );
        }
      }
    }

    cardNumberInputProps.onChange && cardNumberInputProps.onChange(e);
    onChange && onChange(e);
  };

  handleCardNumberKeyPress = (e: any) => {
    const value = e.target.value;
    checkIsNumeric(e);
    if (value && !isHighlighted()) {
      const valueLength = value.split(' ').join('').length;
      if (hasCardNumberReachedMaxLength(value, valueLength)) {
        e.preventDefault();
      }
    }
  };

  focus = () => {
    this.cardNumberField.focus();
  };

  render = () => {
    const {
      cardNumberInputProps,
      inputClassName,
      customTextLabels
    } = this.props;
    return inputRenderer({
      handleCardNumberChange: onChange =>
        this.handleCardNumberChange({ onChange }),
      handleCardNumberBlur: onBlur => this.handleCardNumberBlur({ onBlur }),
      props: {
        id: 'card-number',
        ref: cardNumberField => {
          this.cardNumberField = cardNumberField;
        },
        maxLength: '19',
        autoComplete: 'cc-number',
        className: `credit-card-input ${inputClassName}`,
        placeholder: customTextLabels.cardNumberPlaceholder || 'Card number',
        type: 'tel',
        ...cardNumberInputProps,
        onBlur: this.handleCardNumberBlur(),
        onChange: this.handleCardNumberChange(),
        onKeyPress: this.handleCardNumberKeyPress
      }
    });
  };
}

export default CardNumberInput;
