import { clearRequiredFieldsMarks } from '../requests.functions';

// all required fields start with _

// common
const anyRequestBody = {
  anyRequest: 'I am any',
};

export function getRequestBody(name: string, clear = true) {
  let body;
  switch (name) {
    case 'any':
    case 'any_stage': {
      body = anyRequestBody;
      break;
    }
    default: {
      throw new Error(`${name} body not found`);
    }
  }

  if (clear) {
    body = clearRequiredFieldsMarks(body);
  }
  return body;
}
