const bodyPropertyTypesMap = new Map<string, any>([
  ['string', 'any'],
  ['number', 1000],
  ['boolean', true],
  ['null', null],
  ['object', { any: 'any' }],
  ['array', ['Haaland', 'De Bruyne', 'Saliba']],
]);

function getType(object: any) {
  if (typeof object === 'object') {
    if (Array.isArray(object)) {
      return 'array';
    }
    if (object === null) {
      return 'null';
    }
    return 'object';
  }
  return typeof object;
}

export function clearRequiredFieldsMarks(body: any) {
  if (body === '') {
    return body;
  }
  const newBody = { ...body };
  /* eslint-disable-next-line prefer-const */
  for (let [property, value] of Object.entries(body)) {
    if (property.startsWith('_')) {
      delete newBody[property];
      newBody[property = property.substring(1)] = value;
    }
    if (getType(value) === 'object') {
      newBody[property] = clearRequiredFieldsMarks(value);
    } else if (getType(value) === 'array') {
      /* eslint-disable-next-line no-use-before-define */
      newBody[property] = clearRequiredFieldsMarksInArray(value as any[]);
    }
  }
  return newBody;
}

function clearRequiredFieldsMarksInArray(array: any[]): any[] {
  const newArray = [];
  for (const element of array) {
    if (getType(element) === 'object') {
      newArray.push(clearRequiredFieldsMarks(element));
    } else if (getType(element) === 'array') {
      newArray.push(clearRequiredFieldsMarksInArray(element));
    } else {
      newArray.push(element);
    }
  }
  return newArray;
}

function getBodiesWithoutSomeFields(propertiesFilter: (property: string) => boolean, originalBody: any, initialProperty = '') {
  const bodiesWithErrorMessages: [any, string][] = [];
  for (const [property, value] of Object.entries(originalBody)) {
    if (propertiesFilter(property)) {
      const newBody = { ...originalBody };
      delete newBody[property];
      const errorMessage = `\ndeleted property: ${initialProperty}.${property}`;
      bodiesWithErrorMessages.push([clearRequiredFieldsMarks(newBody), errorMessage]);
    }
    if (getType(value) === 'object') {
      getBodiesWithoutSomeFields(propertiesFilter, value, `${initialProperty}.${property}`)
        .forEach((subpropertyWithErrorMessage) => {
          const newBody = { ...originalBody, [property]: subpropertyWithErrorMessage[0] };
          bodiesWithErrorMessages.push([clearRequiredFieldsMarks(newBody), subpropertyWithErrorMessage[1]]);
        });
    } else if (getType(value) === 'array') {
      /* eslint-disable-next-line no-use-before-define */
      getArraysWithoutSomeFields(propertiesFilter, value as any[], `${initialProperty}.${property}`)
        .forEach((arrayWithErrorMessage) => {
          const newBody = { ...originalBody, [property]: arrayWithErrorMessage[0] };
          bodiesWithErrorMessages.push([clearRequiredFieldsMarks(newBody), arrayWithErrorMessage[1]]);
        });
    }
  }
  return bodiesWithErrorMessages;
}

function getArraysWithoutSomeFields(propertiesFilter: (property: string) => boolean, originalArray: any[], initialProperty: string) {
  const arraysWithErrorMessages: [any[], string][] = [];
  if (getType(originalArray[0]) === 'object') {
    getBodiesWithoutSomeFields(propertiesFilter, originalArray[0], `${initialProperty}.[0]`)
      .forEach((bodyWithErrorMessage) => arraysWithErrorMessages.push([[bodyWithErrorMessage[0]], bodyWithErrorMessage[1]]));
  } else if (getType(originalArray[0]) === 'array') {
    getArraysWithoutSomeFields(propertiesFilter, originalArray[0], `${initialProperty}.[0]`)
      .forEach((arrayWithErrorMessage) => arraysWithErrorMessages.push([[arrayWithErrorMessage[0]], arrayWithErrorMessage[1]]));
  }
  return arraysWithErrorMessages;
}

export function getBodiesWithoutOptionalFields(originalBody: any) {
  return getBodiesWithoutSomeFields((property) => !property.startsWith('_'), originalBody);
}

export function getBodiesWithIncorrectProperties(originalBody: any, initialProperty = '') {
  const bodiesWithErrorMessages: [any, string][] = [];
  for (const [property, value] of Object.entries(originalBody)) {
    for (const type of bodyPropertyTypesMap.keys()) {
      if (getType(value) !== type) {
        const newBody = { ...originalBody, [property]: bodyPropertyTypesMap.get(type) };
        const errorMessage = `\nchanged property: ${initialProperty}.${property}, original type: ${getType(value)}, new type: ${type}`;
        bodiesWithErrorMessages.push([newBody, errorMessage]);
      }
    }
    if (getType(value) === 'object') {
      getBodiesWithIncorrectProperties(value, `${initialProperty}.${property}`)
        .forEach((subpropertyWithErrorMessage) => {
          const newBody = { ...originalBody, [property]: subpropertyWithErrorMessage[0] };
          bodiesWithErrorMessages.push([newBody, subpropertyWithErrorMessage[1]]);
        });
    } else if (getType(value) === 'array') {
      /* eslint-disable-next-line no-use-before-define */
      getArraysWithIncorrectProperties(value as any[], `${initialProperty}.${property}`)
        .forEach((arrayWithErrorMessage) => {
          const newBody = { ...originalBody, [property]: arrayWithErrorMessage[0] };
          bodiesWithErrorMessages.push([newBody, arrayWithErrorMessage[1]]);
        });
    }
  }
  return bodiesWithErrorMessages;
}

function getArraysWithIncorrectProperties(originalArray: any[], initialProperty: string) {
  const arraysWithErrorMessages: [any[], string][] = [];
  for (const type of bodyPropertyTypesMap.keys()) {
    if (getType(originalArray[0]) !== type) {
      const newArray = [bodyPropertyTypesMap.get(type)];
      const errorMessage = `\nchanged property: ${initialProperty}.[0], original type: ${getType(originalArray[0])}, new type: ${type}`;
      arraysWithErrorMessages.push([newArray, errorMessage]);
    }
  }
  if (getType(originalArray[0]) === 'object') {
    getBodiesWithIncorrectProperties(originalArray[0], `${initialProperty}.[0]`)
      .forEach((bodyWithErrorMessage) => arraysWithErrorMessages.push([[bodyWithErrorMessage[0]], bodyWithErrorMessage[1]]));
  } else if (getType(originalArray[0]) === 'array') {
    getArraysWithIncorrectProperties(originalArray[0], `${initialProperty}.[0]`)
      .forEach((arrayWithErrorMessage) => arraysWithErrorMessages.push([[arrayWithErrorMessage[0]], arrayWithErrorMessage[1]]));
  }
  return arraysWithErrorMessages;
}

export function getBodiesWithoutRequiredFields(originalBody: any) {
  return getBodiesWithoutSomeFields((property) => property.startsWith('_'), originalBody);
}
