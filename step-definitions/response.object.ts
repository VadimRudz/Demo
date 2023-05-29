import { APIResponse } from '@playwright/test';

export default class responseObject {
  static response: APIResponse;

  static get responseBody() {
    return responseObject.response.json();
  }

  static responsesWithErrorMessages: [APIResponse, string][] = [];

  static errorMessage = '';
}
