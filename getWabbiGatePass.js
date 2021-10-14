const bent = require('bent');

/**
 * Given information to access a wabbi gate endpoint and an array of ticket keys
 * associated with the gate, returns the gate pass status
 * @param {string} wabbiHost scheme and host support for wabbi auth services.
 * @param {string} wabbiGateToken Authentication token to access wabbi auth endpoint
 * @param {string} wabbiProjectId Id of project as identified in the wabbi database
 * @param {string} wabbiGateId Id of Wabbi gate associated with ticket keys
 * @param {Array.<string>} ticketKeys ticket keys associated with wabbi gate
 * @returns {'PASSED' | 'FAILED' | undefined} wabbi gate pass status. The status
 * is undefined if not ticket keys are provided.
 */
const getWabbiGatePass = async (wabbiHost, wabbiGateToken,
	wabbiProjectId, wabbiGateId, ticketKeys) => {

	// if ticket keys array is empty or does not exist, the gate pass status is undefined
	if (!Array.isArray(ticketKeys) || !ticketKeys.length) {
		return undefined;
	}

	// Define wabbi gates endpoint
	const authenticateUrl = `${wabbiHost}/auth/refresh`;
	const postAuthenticate = bent(authenticateUrl, 'POST', 'json');
	const gatesUrl = `${wabbiHost}/api/projects/${wabbiProjectId}/security-gates/${wabbiGateId}/passes`;
	const postGates = bent(gatesUrl, 'POST', 'json');

	// Define authentication header for authenticate endpoint
	const authenticateHeader = {
		Authorization: `Bearer ${wabbiGateToken}`
	};

	// Access wabbi gate with Jira Ticket keys info and get gate status
	let result = await postAuthenticate(null, {}, authenticateHeader);
	const tokenHeader = {
		'Content-Type': 'application/json',
		'Content-Length': 0,
		Authorization: `Bearer ${result.accessToken}`
	};
	// Stringiffy the ticket key array for wabbi gates pass request body
	// example ['AB-1', 'AB-2', 'AB-3'] becomes '["AB-1","AB-2","AB-3"]
	const gatesBody = {
		ticketKeys: `["${ticketKeys.join('","')}"]`
	};

	result = await postGates(null, gatesBody, tokenHeader);
	let status = result && result.lastPass ? result.lastPass.status : undefined;
	return status;
};

module.exports = getWabbiGatePass;
