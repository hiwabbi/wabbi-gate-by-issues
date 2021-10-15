const getTicketKeys = require('./getTicketKeys');
const getWabbiGatePass = require('./getWabbiGatePass');

// Define parameters for unit testing
const ISSUE_PREFIXES = 'AB,CD,EF';
const PULL_REQUEST_TITLE = 'AB-1 This is a PR title';
const PULL_REQUEST_SOURCE = 'CD-23BranchName';
const COMMITS_URL = 'https://example.com/repos/account/repo/pulls/1/commits';
const GITHUB_TOKEN = 'dummyToken';
const WABBI_HOST = 'https://example.com';
const WABBI_GATE_TOKEN = 'placeholderForSecretWabbiGateToken';
const WABBI_PROJECT_ID = 1;
const WABBI_GATE_ID = 1;
const TICKET_KEYS = ['AB-1', 'CD-23', 'EF-4567', 'EF-89012', 'EF-1', 'EF-2', 'EF-3'];
const TICKET_KEY_COUNT = 7;

// Mock the bent module.
// The bent module is used to send HTTP requests to the Wabbi and GitHub
// services. This module is mocked to isolate the unit testing.
const bent = require('bent');
jest.mock('bent');
bent.mockImplementation((url, type, format) => {
	if (format === 'json' && type === 'POST') {
		if (url === `${WABBI_HOST}/auth/refresh`) {
			return (endpoint, body, header) => {  // eslint-disable-line no-unused-vars
				return {
					accessToken: 'dummyAccessToken'
				};
			};
		}
		if (url === `${WABBI_HOST}/api/projects/${WABBI_PROJECT_ID}/security-gates/${WABBI_GATE_ID}/passes`) {
			return (endpoint, body, header) => {  // eslint-disable-line no-unused-vars
				return {
					name: 'Test',
					notes: '<p>This is a test</p>',
					securityManager: '1',
					wabbiIndexThreshold: 'green',
					lastPass: {
						status: 'PASSED',
						datePassed: '2021-10-08T17:30:56.782Z',
						triggerId: null,
						softwareVersions: null,
						securityManager: 'Ms Manager',
						projectManager: 'Mr Manager',
						securityGateDescription: '<p>This is a test</p>',
						projectId: '1'
					}
				};
			};
		}
		if (url === `${WABBI_HOST}/api/projects/${WABBI_PROJECT_ID}/security-gates/${WABBI_GATE_ID}/passes`) {
			return (endpoint, body, header) => {  // eslint-disable-line no-unused-vars
				return {
					name: 'Test',
					notes: '<p>This is a test</p>',
					securityManager: '1',
					wabbiIndexThreshold: 'green',
					lastPass: {
						status: 'PASSED',
						datePassed: '2021-10-08T17:30:56.782Z',
						triggerId: null,
						softwareVersions: null,
						securityManager: 'Ms Manager',
						projectManager: 'Mr Manager',
						securityGateDescription: '<p>This is a test</p>',
						projectId: '1'
					}
				};
			};
		}
	}
	if (format === 'json' && type === 'GET' && url === COMMITS_URL) {
		return (endpoint, body, header) => {  // eslint-disable-line no-unused-vars
			return [
				{
					sha: 'dummy-placeholder',
					commit: {
						message: 'EF-4567 commit comment placholder',
						url: 'https://example.com/placeholder/commit',
						comment_count: 0
					},
					comments_url: 'https://example.com/placeholder/comments',
					author: {
						id: 111111111,
						type: 'User',
						site_admin: false
					},
					committer: {
						id: 2222222,
						type: 'User',
						site_admin: false
					}
				},
				{
					sha: 'dummy-placeholder',
					commit: {
						message: 'commit comment placholder EF-89012',
						url: 'https://example.com/placeholder/commit',
						comment_count: 0
					},
					comments_url: 'https://example.com/placeholder/comments',
					author: {
						id: 3333333333,
						type: 'User',
						site_admin: false
					},
					committer: {
						id: 4444444444,
						type: 'User',
						site_admin: false
					}
				},
				{
					sha: 'dummy-placeholder',
					commit: {
						message: 'EF-1 commit EF-2 comment placholder EF-3',
						url: 'https://example.com/placeholder/commit',
						comment_count: 0
					},
					comments_url: 'https://example.com/placeholder/comments',
					author: {
						id: 5555555555,
						type: 'User',
						site_admin: false
					},
					committer: {
						id: 666666666,
						type: 'User',
						site_admin: false
					}
				}
			];
		};
	}
	throw new Error();
});

// Unit testing
test('getTicketKeys correctly handles a valid input and response', async () => {
	const ticketKeys = await getTicketKeys(
		ISSUE_PREFIXES,
		PULL_REQUEST_TITLE,
		PULL_REQUEST_SOURCE,
		COMMITS_URL,
		GITHUB_TOKEN
	);
	expect(ticketKeys.length).toBe(TICKET_KEY_COUNT);
	expect(ticketKeys).toEqual(expect.arrayContaining(TICKET_KEYS));
});

test('getWabbiGatePass correctly handles a valid response', async () => {
	const status = await getWabbiGatePass(
		WABBI_HOST,
		WABBI_GATE_TOKEN,
		WABBI_PROJECT_ID,
		WABBI_GATE_ID,
		TICKET_KEYS
	);
	expect(status).toBe('PASSED');
});
