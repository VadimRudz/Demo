import { When, Then } from '@cucumber/cucumber';
import { APIRequestContext, request } from '@playwright/test';
import {
  ContextDefaultMock, ContextDefaultStage, ContextTokenStage, ContextUnauthorisedStage, ContextForbiddenMock, ContextForbiddenStage,
} from '../utils/api-requests/contexts';
import { getRequestBody as getCustomerRequestBody } from '../utils/api-requests/customer/requests.bodies';
import { getRequestBody as getAdminRequestBody } from '../utils/api-requests/admin/requests.bodies';
import { getResponseBody as getCustomerResponseBody } from '../utils/api-requests/customer/responses.bodies';
import { getResponseBody as getAdminResponseBody } from '../utils/api-requests/admin/responses.bodies';
import { sendRequestsWithoutOptionalFields, sendRequestsWithIncorrectBodyPropertiesTypes, sendRequestsWithoutRequiredFields } from '../utils/api-requests/common.requests';
import responseObject from './response.object';

export async function getRequest(methodName: string, contextName = 'default') {
  let context: APIRequestContext;
  switch (contextName) {
    case 'default': {
      if (process.env.NODE_ENV!.trim() === 'customer_stage' || process.env.NODE_ENV!.trim() === 'admin_stage') {
        context = await request.newContext(ContextDefaultStage);
      } else {
        context = await request.newContext(ContextDefaultMock);
      }
      break;
    }
    case 'token_stage': {
      context = await request.newContext(ContextTokenStage);
      break;
    }
    case 'unauthorised': {
      context = await request.newContext(ContextUnauthorisedStage);
      break;
    }
    case 'forbidden': {
      if (process.env.NODE_ENV!.trim() === 'customer_stage' || process.env.NODE_ENV!.trim() === 'admin_stage') {
        context = await request.newContext(ContextForbiddenStage);
        break;
      }
      context = await request.newContext(ContextForbiddenMock);
      break;
    }
    default: {
      throw new Error(`${contextName} context name not found`);
    }
  }

  switch (methodName) {
    case 'GET': {
      return context.get.bind(context);
    }
    case 'POST': {
      return context.post.bind(context);
    }
    case 'PATCH': {
      return context.patch.bind(context);
    }
    case 'DELETE': {
      return context.delete.bind(context);
    }
    default: {
      throw new Error(`${methodName} method name not found`);
    }
  }
}

When('user sends {string} request to {string} endpoint with {string} body', async (methodName: string, path: string, bodyName: string) => {
  const request = await getRequest(methodName);
  if (bodyName === 'empty') {
    responseObject.response = await request(path);
  } else {
    // eslint-disable-next-line no-param-reassign
    bodyName = process.env.NODE_ENV!.trim().endsWith('_stage') ? `${bodyName}_stage` : bodyName;
    if (process.env.NODE_ENV!.trim() === 'customer_mock') {
      responseObject.response = await request(path, { data: getCustomerRequestBody(bodyName) });
    }
    if (process.env.NODE_ENV!.trim() === 'customer_stage') {
      responseObject.response = await request(path, { data: getCustomerRequestBody(bodyName) });
    }
    if (process.env.NODE_ENV!.trim() === 'admin_mock') {
      responseObject.response = await request(path, { data: getAdminRequestBody(bodyName) });
    }
    if (process.env.NODE_ENV!.trim() === 'admin_stage') {
      responseObject.response = await request(path, { data: getAdminRequestBody(bodyName) });
    }
  }
});

Then('user gets response code {int} {string}', async (statusNumber: number, statusText: string) => {
  const actualResponseCode = `${responseObject.response.status()} ${responseObject.response.statusText()}`;
  const expectedResponseCode = `${statusNumber} ${statusText}`;
  expect(actualResponseCode).toEqual(expectedResponseCode);
});


Then('user sees {string} response body', async (bodyName: string) => {
  let expectedResponseBody;
  // eslint-disable-next-line no-param-reassign
  bodyName = process.env.NODE_ENV!.trim().endsWith('_stage') ? `${bodyName}_stage` : bodyName;
  if (process.env.NODE_ENV!.trim() === 'customer_mock') {
    expectedResponseBody = getCustomerResponseBody(bodyName);
  }
  if (process.env.NODE_ENV!.trim() === 'customer_stage') {
    logger.info(bodyName);
    expectedResponseBody = getCustomerResponseBody(bodyName);
  }
  if (process.env.NODE_ENV!.trim() === 'admin_mock') {
    expectedResponseBody = getAdminResponseBody(bodyName);
  }
  if (process.env.NODE_ENV!.trim() === 'admin_stage') {
    expectedResponseBody = getAdminResponseBody(bodyName);
  }
  const actualResponseBody = await responseObject.responseBody;
  expect(actualResponseBody).toEqual(expectedResponseBody);
});

