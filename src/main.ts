import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as os from 'os'
import * as tmp from 'tmp'
import * as fs from 'fs/promises';

const IsMacOS = os.platform() === 'darwin'

async function Run()
{
	try {
		let APIKeyPath = core.getInput('api-key-path')
		const APIKeyBase64 = core.getInput('api-key-base64')
		if (APIKeyBase64 !== '') {
			APIKeyPath = tmp.fileSync().name
			await fs.writeFile(APIKeyPath, Buffer.from(APIKeyBase64, 'base64'))
		}

		const teamID = core.getInput('team-id')
		const appID = core.getInput('app-identifier')
		const exportMethod = core.getInput('export-method')

		process.env.MATCH_APP_IDENTIFIER = appID
		process.env.MATCH_TYPE = exportMethod
		process.env.FASTLANE_TEAM_ID = teamID
		process.env.MATCH_GIT_URL = core.getInput('git-url')
		process.env.MATCH_PASSWORD = core.getInput('git-passphrase')
		process.env.APP_STORE_CONNECT_API_KEY_PATH = APIKeyPath
		process.env.MATCH_KEYCHAIN_NAME = core.getInput('keychain')
		process.env.MATCH_KEYCHAIN_PASSWORD = core.getInput('keychain-password')
		process.env.MATCH_READONLY = 'true'

		await exec.exec('fastlane', ['match'])

		const workspace = core.getInput('workspace')
		if (workspace !== '') {
			process.env.GYM_WORKSPACE = workspace
		} else {
			process.env.GYM_PROJECT = core.getInput('project')
		}

		process.env.GYM_SCHEME = core.getInput('scheme')
		process.env.GYM_OUTPUT_DIRECTORY = core.getInput('output-directory')
		process.env.GYM_CONFIGURATION = core.getInput('configuration')
		process.env.GYM_INCLUDE_BITCODE = core.getBooleanInput('include-bitcode').toString()
		process.env.GYM_INCLUDE_SYMBOLS = core.getBooleanInput('include-symbols').toString()
		process.env.GYM_EXPORT_METHOD = exportMethod
		process.env.GYM_EXPORT_TEAM_ID = teamID
		process.env.GYM_XCARGS = `PROVISIONING_PROFILE_SPECIFIER="match ${exportMethod} ${appID}"`

		await exec.exec('fastlane', ['gym'])
	} catch (ex: any) {
		core.setFailed(ex.message)
	}
}

if (!IsMacOS) {
	core.setFailed('Action requires macOS agent.')
} else {
	Run()
}
