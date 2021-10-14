const bent = require('bent');

/**
 * Given a list of Jira project prefixes, returns an array of unique ticket keys
 * contained in the pull request title, source branch name and commit messages.
 * @param {string} jiraPrefixes comma separated list of Jira project prefix codes
 * @param {string} pullRequestTitle GitHub title for pull request
 * @param {string} pullRequestSource GitHub source branch for pull request
 * @param {string} commitsUrl URL for Jira endpoint used to obtain commit
 * messages associated with pull request
 * @param {string} githubToken Authentiction token to access GitHub endpoints
 * @returns {Array} Jira ticket keys
 */
const getTicketKeys = async (jiraPrefixes, pullRequestTitle, pullRequestSource,
	commitsUrl, githubToken) => {

	// Define regular expressions patterns to find Jira Ticket IDs
	const prefixes = jiraPrefixes.replace(/,/g, '|');
	const ticketKeyAtBeginning = new RegExp(`^(${prefixes})-\\d+`, 'g');
	const ticketKeyAnywhere = new RegExp(`\\b(${prefixes})-\\d+`, 'g');

	// Define endpoint used to obtain commit messages
	const getCommits = bent(commitsUrl, 'GET', 'json');
	const gitHeader = {
		Accept: 'application/vnd.github.v3+json',
		'User-Agent': 'node/12',
		Authorization: `bearer ${githubToken}`
	};

	try {
		// Retrieve commit messages and extract any Jira Ticket Keys
		let commitsArray = await getCommits(null, null, gitHeader);

		let ticketKeys = [];
		for (let element of commitsArray) {
			let ticketKeysInMessage = element.commit && element.commit.message ?
				element.commit.message.match(ticketKeyAnywhere) : undefined ;
			if (ticketKeysInMessage) {
				ticketKeys = ticketKeys.concat(ticketKeysInMessage);
			}
		}

		// Get source branch, PR title and extract any Jira Ticket Keys
		let ticketKeyInSource = pullRequestSource.match(ticketKeyAtBeginning);
		if (ticketKeyInSource) {
			ticketKeys = ticketKeys.concat(ticketKeyInSource);
		}
		let ticketKeyInTitle = pullRequestTitle.match(ticketKeyAtBeginning);
		if (ticketKeyInTitle) {
			ticketKeys = ticketKeys.concat(ticketKeyInTitle);
		}

		// remove duplicates and return array of ticket keys
		return [...new Set(ticketKeys)];
	}
	catch (error) {
		throw new Error(`Failed to obtain ticket keys ${error.message}`);
	}
};

module.exports = getTicketKeys;