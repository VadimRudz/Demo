import { APIResponse, APIRequestContext } from '@playwright/test';
import { getBodiesWithoutOptionalFields, getBodiesWithIncorrectProperties, getBodiesWithoutRequiredFields } from './requests.functions';

type RequestOptions = Parameters<APIRequestContext['post']>[1];

async function sendMultipleRequests(request: (options: RequestOptions) => Promise<APIResponse>, bodies: [any, string][]) {
  const responsesWithErrorMessages: [APIResponse, string][] = [];
  for (const bodyWithErrorMessage of bodies) {
    const response = await request({ data: bodyWithErrorMessage[0] });
    responsesWithErrorMessages.push([response, `${bodyWithErrorMessage[1]}, status: ${response.status()}`]);
  }
  return responsesWithErrorMessages;
}

export async function sendRequestsWithoutOptionalFields(request: (options: RequestOptions) => Promise<APIResponse>, originalBody: any) {
  return sendMultipleRequests(request, getBodiesWithoutOptionalFields(originalBody));
}

export async function sendRequestsWithIncorrectBodyPropertiesTypes(request: (options: RequestOptions) => Promise<APIResponse>, originalBody: any) {
  return sendMultipleRequests(request, getBodiesWithIncorrectProperties(originalBody));
}

export async function sendRequestsWithoutRequiredFields(request: (options: RequestOptions) => Promise<APIResponse>, originalBody: any) {
  return sendMultipleRequests(request, getBodiesWithoutRequiredFields(originalBody));
}
