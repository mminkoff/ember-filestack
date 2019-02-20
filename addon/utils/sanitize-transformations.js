import { isNone } from '@ember/utils';

export default function sanitizeTransformations(obj) {
  Object.keys(obj).forEach((key) => {
    let value = obj[key];
    let type = typeof value;

    if (type === 'object' && value !== null) {
      sanitizeTransformations(value);
      if (Object.keys(value).length === 0) {
        delete obj[key]
      }
    } else if (isNone(value)) {
      delete obj[key];
    }
  });
}
