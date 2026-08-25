import '@testing-library/jest-dom';
const nodeFetch = require('node-fetch');
global.fetch = nodeFetch;
global.Request = nodeFetch.Request;
global.Response = nodeFetch.Response;
global.Headers = nodeFetch.Headers;
