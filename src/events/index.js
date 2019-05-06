import events from './events';
import * as types from './types';

export default function() {
  return {
    ...events(),
    types
  };
}
