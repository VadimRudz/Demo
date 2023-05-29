import { Logger } from 'winston';
import {
  BeforeAll, After, Status, setDefaultTimeout, ITestCaseHookParameter,
} from '@cucumber/cucumber';
import { Expect, expect as playwrightExpect } from '@playwright/test';
import customLogger from './logger';
import responseObject from '../../step-definitions/response.object';
import { getDate } from '../../utils/generators/date.generator';
import { ContextDefaultStage, ContextForbiddenStage, ContextUnauthorisedStage } from '../../utils/api-requests/contexts';
import { getRequest } from '../../step-definitions/common.steps';
import { getRequestBody as getCustomerRequestBody } from '../../utils/api-requests/customer/requests.bodies';
import { getRequestBody as getAdminRequestBody } from '../../utils/api-requests/admin/requests.bodies';

// timeout for every BDD Cucumber step execution (5000 by default)
setDefaultTimeout(Number(process.env.DEFAULT_NAVIGATION_TIMEOUT));

declare global {
  const logger: Logger;
  const expect: Expect;

  namespace NodeJS {
    interface Global {
      logger: Logger
      expect: Expect
    }
  }
}

BeforeAll(async () => {
  global.logger = customLogger;
  global.expect = playwrightExpect;
  logger.info(`date: ${getDate(new Date(), 'MMMM DD, YYYY')}; timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}; UTC offset: ${new Date().getTimezoneOffset() / -60}`);
});

BeforeAll(async () => {
  const env = process.env.NODE_ENV!.trim();
  logger.info(`NODE_ENV=__${env}__`);
  if (env === 'customer_stage' || env === 'admin_stage') {
    const request = await getRequest('POST', 'token_stage');
    let response;
    if (env === 'customer_stage') {
      response = await request('auth/user/token', { data: getCustomerRequestBody('username_stage') });
    } else {
      response = await request('auth/user/token', { data: getAdminRequestBody('username_stage') });
    }
    const responseBody = await response.json();
    ContextDefaultStage.extraHTTPHeaders.Authorization = `Bearer ${responseBody.token}`;
    ContextForbiddenStage.extraHTTPHeaders.Authorization = `Bearer ${responseBody.token}`;
    ContextUnauthorisedStage.extraHTTPHeaders.Authorization = '';
  }
});

After((scenario: ITestCaseHookParameter) => {
  if (scenario.result?.status === Status.FAILED) {
    /* eslint-disable-next-line no-param-reassign */
    scenario.result!.message += responseObject.errorMessage;
  }
  responseObject.responsesWithErrorMessages = [];
  responseObject.errorMessage = '';
});
