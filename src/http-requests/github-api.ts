import http from 'http';
import { getConfig } from './../configurations/config';
import axios from 'axios';

export async function kitchenActionRequest(url, data) {
  const token = getConfig<string>('github.personalAccessToken');

  const requestConfiguration = {
    validateStatus: null,
    headers: {
      accept: 'application/vnd.github.v3+json',
      authorization: `Bearer ${token}`,
    },
  };

  let response;
  try {
    response = await axios.post(url, data, requestConfiguration);
  } catch (error) {
    // Network error handling
    console.log(`Error sending HTTP request at ${url}. Error message: ${error.message}.`);
    throw new Error('Internal Error');
  }

  switch (response.status) {
    case 204:
      return response.data;
    case 401:
      console.log(`Invalid credentials sent to the url: ${url}. It could be either invalid credentials or an error.`);
      throw new Error('Internal Error');
    default:
      console.log(`The url: ${url} returned an unexpected response status: "${response.status} - ${http.STATUS_CODES[response.status]}".`);
      throw new Error('Internal Error');
  }
}

export async function getRunnerURlRequest(date?: string) {
  let url = `${getConfig<string>('github.workflowRunnerUrl')}?branch=master&created==>${date}`;
  if (!date) {
    url = `${getConfig<string>('github.workflowRunnerUrl')}?branch=master`;
  }

  console.log(url);
  
  const token = getConfig<string>('github.personalAccessToken');

  const requestConfiguration = {
    validateStatus: null,
    headers: {
      accept: 'application/vnd.github.v3+json',
      authorization: `Bearer ${token}`,
    },
  };

  let response;
  try {
    response = await axios.get(url, requestConfiguration);
  } catch (error) {
    // Network error handling
    console.log(`Error sending HTTP request at ${url}. Error message: ${error.message}.`);
    throw new Error('Internal Error');
  }

  switch (response.status) {
    case 200:
      return response.data?.workflow_runs?.[0]?.html_url;
    case 401:
      console.log(`Invalid credentials sent to the url: ${url}. It could be either invalid credentials or an error.`);
      throw new Error('Internal Error');

    default:
      console.log(`The url: ${url} returned an unexpected response status: "${response.status} - ${http.STATUS_CODES[response.status]}".`);
      throw new Error('Internal Error');
  }
}
