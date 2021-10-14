# Get Wabbi Gate By Issue Action
Based on the status of Wabbi gate associated with the issue keys defined 
in the pull request's commit messages, the pull request's title and the pull 
request's source branch, this action will display the Wabbi gate status. If the
gate status is FAILED, the action exit code will be set to failure.

## Inputs
### `wabbiHost`
**Required** URL to Wabbi site
### `wabbiProjectId`
**Required** Wabbi project id associated with the GitHub repo
### `issuePrefixes`
**Required** Comma separated list of associated issue project prefixes
### `wabbiGateId`
**Required** Id of the Wabbi gate associated with the GitHub repo
### `wabbiGateToken`
**Required** Token to access the wabbi gate. save as secret named GATE_TOKEN
### `githubtoken`
**Required** Token to access GitHub repo data, use githubToken: ${{ GITHUB_TOKEN }}

## Outputs
### `status`
The status of the Wabbi gate pass for the associated issue keys.

## Example usage of "wabbi gate by issues" action
```
on: [pull_request]

jobs:
  pull_request_job:
    runs-on: ubuntu-latest
    name: A job to process pull request validation
    steps:
      - name: validate wabbi gate
        id: validate_gate
        uses: hiwabbi/wabbi-gate-by-issue@main
        with:
          wabbiHost: https://symphony.wabbi.io
          wabbiProjectId: 1
          jiraPrefixes: AB,CD,EF
          wabbiGateId: 1
          wabbiGateToken: ${{ secrets.GATE_TOKEN }}
          githubToken: ${{ secrets.GITHUB_TOKEN }}
      - name: display wabbi gate status
        run: echo "wabbi gate status ${{ steps.validate_gate.outputs.status }}"
```