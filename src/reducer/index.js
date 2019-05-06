import cardTypes from '../utils/card-types';
import images from '../utils/images';
import events from '../events';
import {
  CHANGE_CARD_IMAGE,
  CHANGE_CARD_NUMBER,
  CHANGE_CARD_TYPES,
  CHANGE_CUSTOM_TEXT_LABELS,
  CHANGE_ERROR_TEXT,
  CHANGE_IMAGES,
  CHANGE_INPUT_CLASS_NAME,
  ENABLE_ZIP_INPUT,
  SHOW_ZIP
} from './actions';

type State = {
  cardTypes: Object,
  cardImage: string,
  cardNumber: ?string,
  customTextLabels: Object,
  enableZipInput: boolean,
  errorText: ?string,
  events: Object,
  images: Object,
  inputClassName: string,
  showZip: boolean
};

const inititalState: State = {
  cardImage: images.placeholder,
  cardNumber: null,
  cardTypes,
  customTextLabels: {},
  enableZipInput: false,
  errorText: null,
  events: events(),
  images,
  inputClassName: '',
  showZip: false
};

const reducer = (state: State, action) => {
  switch (action.type) {
    case CHANGE_CARD_IMAGE:
      return {
        ...state,
        cardImage: action.cardImage
      };
    case CHANGE_CARD_NUMBER:
      return {
        ...state,
        cardNumber: action.cardNumber
      };
    case CHANGE_CARD_TYPES:
      return {
        ...state,
        cardTypes: {
          ...state.cardTypes,
          ...action.cardTypes
        }
      };
    case CHANGE_CUSTOM_TEXT_LABELS:
      return {
        ...state,
        customTextLabels: action.customTextLabels
      };
    case CHANGE_ERROR_TEXT:
      return {
        ...state,
        errorText: action.errorText
      };
    case CHANGE_IMAGES:
      return {
        ...state,
        images: {
          ...state.images,
          ...action.images
        }
      };
    case CHANGE_INPUT_CLASS_NAME:
      return {
        ...state,
        inputClassName: action.inputClassName
      };
    case ENABLE_ZIP_INPUT:
      return {
        ...state,
        enableZipInput: action.enableZipInput
      };
    case SHOW_ZIP:
      return {
        ...state,
        showZip: !!action.showZip
      };
    default:
      throw new Error();
  }
};

export { inititalState, reducer };
