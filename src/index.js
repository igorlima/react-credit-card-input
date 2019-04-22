import React, { Component } from 'react';
import payment from 'payment';
import creditCardType from 'credit-card-type';

import {
  DEFAULT_CARD_NUMBER_MAX_LENGTH,
  formatCardNumber,
  formatExpiry,
  formatCvc,
  hasCardNumberReachedMaxLength,
  hasCVCReachedMaxLength,
  hasZipReachedMaxLength,
  isHighlighted
} from './utils/formatter';
import images from './utils/images';
import isExpiryInvalid from './utils/is-expiry-invalid';
import isZipValid from './utils/is-zip-valid';

// SassMeister | The Sass Playground!
// https://www.sassmeister.com/
//
// Four ways to style react components
// https://codeburst.io/4-four-ways-to-style-react-components-ac6f323da822
const styles = {
  container: {
    display: 'inline-block'
  },
  fieldWrapper: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  isInvalid: {
    border: '1px solid #ff3860'
  },
  cardImage: {
    height: '1.5em',
    zIndex: 2,
    width: '2em'
  },
  inputWrapper: {
    alignItems: 'center',
    marginLeft: '0.5em',
    // position: 'relative',
    display: 'flex',
    transition: 'transform 0.5s',
    transform: 'translateX(0)',
    height: '1.1em',
    overflow: 'hidden'
  },
  inputWrapperPsedoAfter: {
    // https://stackoverflow.com/questions/43701748/react-pseudo-selector-inline-styling
    // https://stackoverflow.com/questions/45730224/css-pseudo-code-libefore-in-react-inline-style
    // https://blog.logrocket.com/the-best-react-inline-style-libraries-comparing-radium-aphrodite-emotion-849ef148c473
    // https://medium.com/@pioul/modular-css-with-react-61638ae9ea3e
    // https://stackoverflow.com/questions/28269669/css-pseudo-elements-in-react/28269950
    visibility: 'hidden',
    height: 0
  },
  crediCardInput: {
    border: '0px',
    position: 'absolute',
    width: '100%',
    fontSize: '1em',
    outline: '0px'
  },
  dangerText: {
    fontSize: '0.8rem',
    margin: '5px 0 0 0',
    color: '#ff3860'
  }
};

const BACKSPACE_KEY_CODE = 8;
const CARD_TYPES = {
  mastercard: 'MASTERCARD',
  visa: 'VISA',
  amex: 'AMERICAN_EXPRESS',
  dinersclub: 'DINERS_CLUB'
};

const inputRenderer = ({ props }, style = {}) => (
  <input style={Object.assign({}, styles.crediCardInput, style)} {...props} />
);

class CreditCardInput extends Component {
  static defaultProps = {
    animationOption: {
      defaultTranslateX: '0',
      initialTranslateX: '4em'
    },
    cardCVCInputRenderer: inputRenderer,
    cardExpiryInputRenderer: inputRenderer,
    cardNumberInputRenderer: inputRenderer,
    cardZipInputRenderer: inputRenderer,
    cardExpiryInputProps: {},
    cardNumberInputProps: {},
    cardCVVInputProps: {},
    cardZipInputProps: {},
    cardImageClassName: '',
    cardImageStyle: {},
    containerClassName: '',
    containerStyle: {},
    dangerTextClassName: '',
    dangerTextStyle: {},
    enableZipInput: false,
    fieldClassName: '',
    fieldStyle: {},
    inputComponent: 'input',
    inputClassName: '',
    inputStyle: {},
    invalidClassName: 'is-invalid',
    invalidStyle: {
      border: '1px solid #ff3860'
    },
    customTextLabels: {}
  };

  constructor(props) {
    super(props);
    this.cardExpiryField = null;
    this.cardNumberField = null;
    this.cvcField = null;
    this.zipField = null;
    this.state = {
      cardImage: images.placeholder,
      cardNumberLength: 0,
      cardNumber: null,
      errorText: null,
      showZip: false
    };
  }

  componentDidMount = () => {
    this.setState({ cardNumber: this.cardNumberField.value }, () => {
      const cardType = payment.fns.cardType(this.state.cardNumber);
      this.setState({
        cardImage: images[cardType] || images.placeholder
      });
    });
  };

  isMonthDashKey = ({ key, target: { value } } = {}) => {
    return !value.match(/[/-]/) && /^[/-]$/.test(key);
  };

  checkIsNumeric = e => {
    if (!/^\d*$/.test(e.key)) {
      e.preventDefault();
    }
  };

  handleCardNumberBlur = ({ onBlur } = { onBlur: null }) => e => {
    const { customTextLabels } = this.props;
    if (!payment.fns.validateCardNumber(e.target.value)) {
      this.setFieldInvalid(
        customTextLabels.invalidCardNumber || 'Card number is invalid',
        'cardNumber'
      );
    }

    const { cardNumberInputProps } = this.props;
    cardNumberInputProps.onBlur && cardNumberInputProps.onBlur(e);
    onBlur && onBlur(e);
  };

  handleCardNumberFocus = ({ onFocus } = { onFocus: null }) => e => {
    const { cardNumberInputProps } = this.props;
    cardNumberInputProps.onFocus && cardNumberInputProps.onFocus(e);
    onFocus && onFocus(e);
  };

  handleCardNumberChange = ({ onChange } = { onChange: null }) => e => {
    const {
      customTextLabels,
      enableZipInput,
      cardNumberInputProps
    } = this.props;
    const cardNumber = e.target.value;
    const cardNumberLength = cardNumber.split(' ').join('').length;
    const cardType = payment.fns.cardType(cardNumber);
    const cardTypeInfo =
      creditCardType.getTypeInfo(creditCardType.types[CARD_TYPES[cardType]]) ||
      {};
    const cardTypeLengths = cardTypeInfo.lengths || [
      DEFAULT_CARD_NUMBER_MAX_LENGTH
    ];

    this.cardNumberField.value = formatCardNumber(cardNumber);

    this.setState({
      cardImage: images[cardType] || images.placeholder,
      cardNumber
    });

    if (enableZipInput) {
      this.setState({ showZip: cardNumberLength >= 6 });
    }

    this.setFieldValid();
    if (cardTypeLengths) {
      const lastCardTypeLength = cardTypeLengths[cardTypeLengths.length - 1];
      for (let length of cardTypeLengths) {
        if (
          length === cardNumberLength &&
          payment.fns.validateCardNumber(cardNumber)
        ) {
          this.cardExpiryField.focus();
          break;
        }
        if (cardNumberLength >= lastCardTypeLength) {
          this.setFieldInvalid(
            customTextLabels.invalidCardNumber || 'Card number is invalid',
            'cardNumber'
          );
        }
      }
    }

    cardNumberInputProps.onChange && cardNumberInputProps.onChange(e);
    onChange && onChange(e);
  };

  handleCardNumberKeyPress = e => {
    const value = e.target.value;
    this.checkIsNumeric(e);
    if (value && !isHighlighted()) {
      const valueLength = value.split(' ').join('').length;
      if (hasCardNumberReachedMaxLength(value, valueLength)) {
        e.preventDefault();
      }
    }
  };

  handleCardExpiryBlur = ({ onBlur } = { onBlur: null }) => e => {
    const { customTextLabels } = this.props;
    const cardExpiry = e.target.value.split(' / ').join('/');
    const expiryError = isExpiryInvalid(
      cardExpiry,
      customTextLabels.expiryError
    );
    if (expiryError) {
      this.setFieldInvalid(expiryError, 'cardExpiry');
    }

    const { cardExpiryInputProps } = this.props;
    cardExpiryInputProps.onBlur && cardExpiryInputProps.onBlur(e);
    onBlur && onBlur(e);
  };

  handleCardExpiryChange = ({ onChange } = { onChange: null }) => e => {
    const { customTextLabels } = this.props;
    this.cardExpiryField.value = formatExpiry(e);

    this.setFieldValid();
    const value = this.cardExpiryField.value.split(' / ').join('/');

    const expiryError = isExpiryInvalid(value, customTextLabels.expiryError);
    if (value.length > 4) {
      if (expiryError) {
        this.setFieldInvalid(expiryError, 'cardExpiry');
      } else {
        this.cvcField.focus();
      }
    }

    const { cardExpiryInputProps } = this.props;
    cardExpiryInputProps.onChange && cardExpiryInputProps.onChange(e);
    onChange && onChange(e);
  };

  handleCardExpiryKeyPress = e => {
    const value = e.target.value;

    if (!this.isMonthDashKey(e)) {
      this.checkIsNumeric(e);
    }

    if (value && !isHighlighted()) {
      const valueLength = value.split(' / ').join('').length;
      if (valueLength >= 4) {
        e.preventDefault();
      }
    }
  };

  handleCardCVCBlur = ({ onBlur } = { onBlur: null }) => e => {
    const { customTextLabels } = this.props;
    const cardType = payment.fns.cardType(this.state.cardNumber);
    if (!payment.fns.validateCardCVC(e.target.value, cardType)) {
      this.setFieldInvalid(
        customTextLabels.invalidCvc || 'CVV is invalid',
        'cardCVV'
      );
    }

    const { cardCVVInputProps } = this.props;
    cardCVVInputProps.onBlur && cardCVVInputProps.onBlur(e);
    onBlur && onBlur(e);
  };

  handleCardCVCChange = ({ onChange } = { onChange: null }) => e => {
    const { customTextLabels } = this.props;
    const value = formatCvc(e.target.value);
    this.cvcField.value = value;
    const CVC = value;
    const CVCLength = CVC.length;
    const isZipFieldAvailable = this.props.enableZipInput && this.state.showZip;
    const cardType = payment.fns.cardType(this.state.cardNumber);

    this.setFieldValid();
    if (CVCLength >= 4) {
      if (!payment.fns.validateCardCVC(CVC, cardType)) {
        this.setFieldInvalid(
          customTextLabels.invalidCvc || 'CVV is invalid',
          'cardCVV'
        );
      }
    }

    if (isZipFieldAvailable && hasCVCReachedMaxLength(cardType, CVCLength)) {
      this.zipField.focus();
    }

    const { cardCVVInputProps } = this.props;
    cardCVVInputProps.onChange && cardCVVInputProps.onChange(e);
    onChange && onChange(e);
  };

  handleCardCVCKeyPress = e => {
    const cardType = payment.fns.cardType(this.state.cardNumber);
    const value = e.target.value;
    this.checkIsNumeric(e);
    if (value && !isHighlighted()) {
      const valueLength = value.split(' / ').join('').length;
      if (hasCVCReachedMaxLength(cardType, valueLength)) {
        e.preventDefault();
      }
    }
  };

  handleCardZipBlur = ({ onBlur } = { onBlur: null }) => e => {
    const { customTextLabels } = this.props;
    if (!isZipValid(e.target.value)) {
      this.setFieldInvalid(
        customTextLabels.invalidZipCode || 'Zip code is invalid',
        'cardZip'
      );
    }

    const { cardZipInputProps } = this.props;
    cardZipInputProps.onBlur && cardZipInputProps.onBlur(e);
    onBlur && onBlur(e);
  };

  handleCardZipChange = ({ onChange } = { onChange: null }) => e => {
    const { customTextLabels } = this.props;
    const zip = e.target.value;
    const zipLength = zip.length;

    this.setFieldValid();

    if (zipLength >= 5 && !isZipValid(zip)) {
      this.setFieldInvalid(
        customTextLabels.invalidZipCode || 'Zip code is invalid',
        'cardZip'
      );
    }

    const { cardZipInputProps } = this.props;
    cardZipInputProps.onChange && cardZipInputProps.onChange(e);
    onChange && onChange(e);
  };

  handleCardZipKeyPress = e => {
    const cardType = payment.fns.cardType(this.state.cardNumber);
    const value = e.target.value;
    this.checkIsNumeric(e);
    if (value && !isHighlighted()) {
      const valueLength = value.split(' / ').join('').length;
      if (hasZipReachedMaxLength(cardType, valueLength)) {
        e.preventDefault();
      }
    }
  };

  handleKeyDown = ref => {
    return e => {
      if (e.keyCode === BACKSPACE_KEY_CODE && !e.target.value) {
        ref.focus();
      }
    };
  };

  setFieldInvalid = (errorText, inputName) => {
    const { invalidClassName, onError } = this.props;
    // $FlowFixMe
    document.getElementById('field-wrapper').classList.add(invalidClassName);
    this.setState({ errorText, isFormInvalid: true });

    if (inputName) {
      const { onError } = this.props[`${inputName}InputProps`];
      onError && onError(errorText);
    }

    if (onError) {
      onError({ inputName, error: errorText });
    }
  };

  setFieldValid = () => {
    const { invalidClassName } = this.props;
    // $FlowFixMe
    document.getElementById('field-wrapper').classList.remove(invalidClassName);
    this.setState({ errorText: null, isFormInvalid: false });
  };

  render = () => {
    const { cardImage, errorText, showZip, isFormInvalid } = this.state;
    const {
      animationOption: { defaultTranslateX, initialTranslateX },
      cardImageClassName,
      cardImageStyle,
      cardCVVInputProps,
      cardZipInputProps,
      cardExpiryInputProps,
      cardNumberInputProps,
      cardCVCInputRenderer,
      cardExpiryInputRenderer,
      cardNumberInputRenderer,
      cardZipInputRenderer,
      containerClassName,
      containerStyle,
      dangerTextClassName,
      dangerTextStyle,
      enableZipInput,
      fieldClassName,
      fieldStyle,
      inputClassName,
      inputStyle,
      invalidStyle,
      customTextLabels
    } = this.props;
    const translateX = defaultTranslateX;
    const inputWrapperTranslateX = `translateX(${
      enableZipInput && !showZip ? initialTranslateX : translateX
    })`;

    return (
      <div
        className={containerClassName}
        style={Object.assign({}, styles.container, containerStyle)}
      >
        <div
          id="field-wrapper"
          className={fieldClassName}
          style={Object.assign(
            {},
            styles.fieldWrapper,
            fieldStyle,
            isFormInvalid && invalidStyle
          )}
        >
          <img
            alt="credit card flag"
            className={cardImageClassName}
            style={Object.assign({}, styles.cardImage, cardImageStyle)}
            src={cardImage}
          />
          <label
            style={Object.assign({}, styles.inputWrapper, inputStyle)}
            className="card-number-wrapper"
            data-max="9999 9999 9999 9999 9999"
          >
            {cardNumberInputRenderer({
              handleCardNumberChange: onChange =>
                this.handleCardNumberChange({ onChange }),
              handleCardNumberBlur: onBlur =>
                this.handleCardNumberBlur({ onBlur }),
              handleCardNumberFocus: onFocus =>
                this.handleCardNumberFocus({ onFocus }),
              props: {
                id: 'card-number',
                ref: cardNumberField => {
                  this.cardNumberField = cardNumberField;
                },
                autoComplete: 'cc-number',
                className: `credit-card-input ${inputClassName}`,
                placeholder:
                  customTextLabels.cardNumberPlaceholder || 'Card Number',
                type: 'tel',
                ...cardNumberInputProps,
                onBlur: this.handleCardNumberBlur(),
                onFocus: this.handleCardNumberFocus(),
                onChange: this.handleCardNumberChange(),
                onKeyPress: this.handleCardNumberKeyPress
              }
            })}
            <label style={styles.inputWrapperPsedoAfter}>
              9999 9999 9999 9999 9999
            </label>
          </label>
        </div>
        <div
          id="field-wrapper"
          className={fieldClassName}
          style={Object.assign(
            { margin: '10px 0 0 0' },
            styles.fieldWrapper,
            fieldStyle,
            isFormInvalid && invalidStyle
          )}
        >
          <label
            style={Object.assign({}, styles.inputWrapper, inputStyle, {
              transform: inputWrapperTranslateX
            })}
            className="card-expiry-wrapper"
            data-max="MM / YY 9"
          >
            {cardExpiryInputRenderer({
              handleCardExpiryChange: onChange =>
                this.handleCardExpiryChange({ onChange }),
              handleCardExpiryBlur: onBlur =>
                this.handleCardExpiryBlur({ onBlur }),
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
                onKeyDown: this.handleKeyDown(this.cardNumberField),
                onKeyPress: this.handleCardExpiryKeyPress
              }
            })}
            <label style={styles.inputWrapperPsedoAfter}>MM / YY 9</label>
          </label>
          <label
            style={Object.assign({}, styles.inputWrapper, inputStyle, {
              transform: inputWrapperTranslateX
            })}
            className="card-cvc-wrapper"
            data-max="99999"
          >
            {cardCVCInputRenderer({
              handleCardCVCChange: onChange =>
                this.handleCardCVCChange({ onChange }),
              handleCardCVCBlur: onBlur => this.handleCardCVCBlur({ onBlur }),
              props: {
                id: 'cvc',
                ref: cvcField => {
                  this.cvcField = cvcField;
                },
                maxLength: '5',
                autoComplete: 'off',
                className: `credit-card-input ${inputClassName}`,
                placeholder: customTextLabels.cvcPlaceholder || 'CVV',
                type: 'tel',
                ...cardCVVInputProps,
                onBlur: this.handleCardCVCBlur(),
                onChange: this.handleCardCVCChange(),
                onKeyDown: this.handleKeyDown(this.cardExpiryField),
                onKeyPress: this.handleCardCVCKeyPress
              }
            })}
            <label style={styles.inputWrapperPsedoAfter}>99999</label>
          </label>
          <label
            style={Object.assign(
              {},
              styles.inputWrapper,
              { display: enableZipInput && showZip ? 'flex' : 'none' },
              { transform: inputWrapperTranslateX }
            )}
            className="zip-wrapper"
            data-max="999999"
          >
            {cardZipInputRenderer({
              handleCardZipChange: onChange =>
                this.handleCardZipChange({ onChange }),
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
                onKeyDown: this.handleKeyDown(this.cvcField),
                onKeyPress: this.handleCardZipKeyPress
              }
            })}
            <label style={styles.inputWrapperPsedoAfter}>999999</label>
          </label>
        </div>
        {errorText && (
          <p
            className={dangerTextClassName}
            style={Object.assign({}, styles.dangerText, dangerTextStyle)}
          >
            {errorText}
          </p>
        )}
      </div>
    );
  };
}

export default CreditCardInput;
