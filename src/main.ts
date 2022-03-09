import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as os from 'os'
import * as tmp from 'tmp'
import * as path from 'path'
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

		process.env.MATCH_APP_IDENTIFIER = core.getInput('app-identifier')
		process.env.MATCH_TYPE = core.getInput('type')
		process.env.FASTLANE_TEAM_ID = core.getInput('team-id')
		process.env.MATCH_GIT_URL = core.getInput('git-url')
		process.env.MATCH_PASSWORD = core.getInput('git-passphase')
		process.env.APP_STORE_CONNECT_API_KEY_PATH = APIKeyPath
		process.env.MATCH_KEYCHAIN_NAME = path.basename(core.getInput('keychain'))
		process.env.MATCH_KEYCHAIN_PASSWORD = core.getInput('keychain-password')

		await exec.exec('fastlane', ['match', '--readonly', 'true'])
	} catch (ex: any) {
		core.setFailed(ex.message)
	}
}

if (!IsMacOS) {
	core.setFailed('Action requires macOS agent.')
} else {
	Run()
}
