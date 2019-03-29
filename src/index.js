import React, { Component } from 'react';
import payment from 'payment';
import creditCardType from 'credit-card-type';

import {
  formatCardNumber,
  formatExpiry,
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
    height: '1.3em',
    zIndex: 2
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
  amex: 'AMERICAN_EXPRESS'
};

const inputRenderer = ({ props }, style = {}) => (
  <input style={Object.assign({}, styles.crediCardInput, style)} {...props} />
);

class CreditCardInput extends Component {
  static defaultProps = {
    cardCVCInputRenderer: inputRenderer,
    cardExpiryInputRenderer: inputRenderer,
    fakeCardNumberInputRenderer: inputRenderer,
    cardNumberInputRenderer: inputRenderer,
    cardZipInputRenderer: inputRenderer,
    cardExpiryInputProps: {},
    cardNumberInputProps: {},
    cardCVCInputProps: {},
    cardZipInputProps: {},
    cardImageClassName: '',
    cardImageStyle: {},
    containerClassName: '',
    containerStyle: {},
    dangerTextClassName: '',
    dangerTextStyle: {},
    enableZipInput: false,
    enableMobileFriendlyMode: false,
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
    this.fakeCardNumberField = null;
    this.cardNumberField = null;
    this.cvcField = null;
    this.zipField = null;
    this.state = {
      cardImage: images.placeholder,
      cardNumberLength: 0,
      cardNumber: null,
      errorText: null,
      showZip: false,
      isMobileFriendly: false
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

  checkIsNumeric = e => {
    if (!/^\d*$/.test(e.key)) {
      e.preventDefault();
    }
  };

  handleCardNumberBlur = ({ onBlur } = { onBlur: null }) => e => {
    const { customTextLabels, enableMobileFriendlyMode } = this.props;
    if (!payment.fns.validateCardNumber(e.target.value)) {
      this.setFieldInvalid(
        customTextLabels.invalidCardNumber || 'Card number is invalid',
        'cardNumber'
      );
    } else {
      enableMobileFriendlyMode && this.setState({ isMobileFriendly: true });
    }

    const { cardNumberInputProps } = this.props;
    cardNumberInputProps.onBlur && cardNumberInputProps.onBlur(e);
    onBlur && onBlur(e);
  };

  handleCardNumberFocus = ({ onFocus } = { onFocus: null }) => e => {
    const { enableMobileFriendlyMode } = this.props;
    if (enableMobileFriendlyMode) {
      this.setState({ isMobileFriendly: false }, () => {
        this.cardNumberField.focus();
      });
    }

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
    const cardTypeLengths = cardTypeInfo.lengths || [16];

    this.cardNumberField.value = formatCardNumber(cardNumber);
    if (this.fakeCardNumberField) {
      this.fakeCardNumberField.value = this.cardNumberField.value.substr(-4);
    }

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
        if (cardNumberLength === lastCardTypeLength) {
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
    const cardExpiry = e.target.value.split(' / ').join('/');

    this.cardExpiryField.value = formatExpiry(cardExpiry);

    this.setFieldValid();

    const expiryError = isExpiryInvalid(
      cardExpiry,
      customTextLabels.expiryError
    );
    if (cardExpiry.length > 4) {
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
    this.checkIsNumeric(e);
    if (value && !isHighlighted()) {
      const valueLength = value.split(' / ').join('').length;
      if (valueLength >= 4) {
        e.preventDefault();
      }
    }
  };

  handleCardCVCBlur = ({ onBlur } = { onBlur: null }) => e => {
    const { customTextLabels } = this.props;
    if (!payment.fns.validateCardCVC(e.target.value)) {
      this.setFieldInvalid(
        customTextLabels.invalidCvc || 'CVC is invalid',
        'cardCVC'
      );
    }

    const { cardCVCInputProps } = this.props;
    cardCVCInputProps.onBlur && cardCVCInputProps.onBlur(e);
    onBlur && onBlur(e);
  };

  handleCardCVCChange = ({ onChange } = { onChange: null }) => e => {
    const { customTextLabels } = this.props;
    const CVC = e.target.value;
    const CVCLength = CVC.length;
    const isZipFieldAvailable = this.props.enableZipInput && this.state.showZip;
    const cardType = payment.fns.cardType(this.state.cardNumber);

    this.setFieldValid();
    if (CVCLength >= 4) {
      if (!payment.fns.validateCardCVC(CVC, cardType)) {
        this.setFieldInvalid(
          customTextLabels.invalidCvc || 'CVC is invalid',
          'cardCVC'
        );
      }
    }

    if (isZipFieldAvailable && hasCVCReachedMaxLength(cardType, CVCLength)) {
      this.zipField.focus();
    }

    const { cardCVCInputProps } = this.props;
    cardCVCInputProps.onChange && cardCVCInputProps.onChange(e);
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
    const {
      cardImage,
      errorText,
      showZip,
      isFormInvalid,
      isMobileFriendly
    } = this.state;
    const {
      cardImageClassName,
      cardImageStyle,
      cardCVCInputProps,
      cardZipInputProps,
      cardExpiryInputProps,
      cardNumberInputProps,
      cardCVCInputRenderer,
      cardExpiryInputRenderer,
      fakeCardNumberInputRenderer,
      cardNumberInputRenderer,
      cardZipInputRenderer,
      containerClassName,
      containerStyle,
      dangerTextClassName,
      dangerTextStyle,
      enableZipInput,
      enableMobileFriendlyMode,
      fieldClassName,
      fieldStyle,
      inputClassName,
      inputStyle,
      invalidStyle,
      customTextLabels
    } = this.props;
    const mobileTranslateX =
      enableMobileFriendlyMode && isMobileFriendly ? '-2em' : '0';
    const inputWrapperTranslateX = `translateX(${
      (enableMobileFriendlyMode && !isMobileFriendly) ||
      (enableZipInput && !showZip)
        ? '4rem'
        : mobileTranslateX
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
            className={cardImageClassName}
            style={Object.assign({}, styles.cardImage, cardImageStyle)}
            src={cardImage}
          />
          <label
            style={Object.assign({}, styles.inputWrapper, inputStyle)}
            data-max="9999 9999 9999 9999 9999"
          >
            {enableMobileFriendlyMode &&
              fakeCardNumberInputRenderer(
                {
                  handleCardNumberFocus: onFocus =>
                    this.handleCardNumberFocus({ onFocus }),
                  props: {
                    id: 'fake-card-number',
                    ref: fakeCardNumberField => {
                      this.fakeCardNumberField = fakeCardNumberField;
                    },
                    autoComplete: 'cc-number',
                    className: `credit-card-input ${inputClassName}`,
                    placeholder:
                      customTextLabels.cardNumberPlaceholder || 'Card number',
                    type: 'tel',
                    onFocus: this.handleCardNumberFocus()
                  }
                },
                !isMobileFriendly ? { display: 'none' } : {}
              )}
            {cardNumberInputRenderer(
              {
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
                    customTextLabels.cardNumberPlaceholder || 'Card number',
                  type: 'tel',
                  ...cardNumberInputProps,
                  onBlur: this.handleCardNumberBlur(),
                  onFocus: this.handleCardNumberFocus(),
                  onChange: this.handleCardNumberChange(),
                  onKeyPress: this.handleCardNumberKeyPress
                }
              },
              Object.assign(
                { transition: 'transform 1.0s' },
                enableMobileFriendlyMode && isMobileFriendly
                  ? { transform: 'translateX(-320px)', zIndex: 0 }
                  : { transform: 'translateX(0px)' }
              )
            )}
            <label style={styles.inputWrapperPsedoAfter}>
              9999 9999 9999 9999 9999
            </label>
          </label>
          <label
            style={Object.assign({}, styles.inputWrapper, inputStyle, {
              transform: inputWrapperTranslateX
            })}
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
                onKeyDown: this.handleKeyDown(
                  enableMobileFriendlyMode
                    ? this.fakeCardNumberField
                    : this.cardNumberField
                ),
                onKeyPress: this.handleCardExpiryKeyPress
              }
            })}
            <label style={styles.inputWrapperPsedoAfter}>MM / YY 9</label>
          </label>
          <label
            style={Object.assign({}, styles.inputWrapper, inputStyle, {
              transform: inputWrapperTranslateX
            })}
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
                autoComplete: 'off',
                className: `credit-card-input ${inputClassName}`,
                placeholder: customTextLabels.cvcPlaceholder || 'CVC',
                type: 'tel',
                ...cardCVCInputProps,
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
