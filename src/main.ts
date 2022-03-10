import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as io from '@actions/io'
import * as os from 'os'
import * as tmp from 'tmp'
import * as fs from 'fs/promises';
import { BooleanStateValue, StringStateValue } from './StateHelper'

const IsMacOS = os.platform() === 'darwin'

const PostProcess = new BooleanStateValue('IS_POST_PROCESS')
const ProvisioningProfile = new StringStateValue('PROVISIONING_PROFILE')

function GetProvisioningProfileUUID(output: string): string
{
	const match = output.match(/.*Profile UUID.*$/gm)

	if (match === null) {
		throw new Error('Not found provisioning profile')
	}

	return match.join("\n").split('|')[3].trim()
}

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

		let output: string = ''
		const options: exec.ExecOptions = {
			listeners: {
				stdout: (data: Buffer) => {
					output += data.toString()
				}
			}
		}

		await exec.exec('fastlane', ['match'], options)

		const workspace = core.getInput('workspace')
		if (workspace !== '') {
			process.env.GYM_WORKSPACE = workspace
		} else {
			process.env.GYM_PROJECT = core.getInput('project')
		}

		const UUID = GetProvisioningProfileUUID(output)
		process.env.PROVISIONING_PROFILE = `${process.env.HOME}/Library/MobileDevice/Provisioning Profiles/${UUID}.mobileprovision`
		ProvisioningProfile.Set(process.env.PROVISIONING_PROFILE)

		io.cp(process.env.PROVISIONING_PROFILE, `${process.env.RUNNER_TEMP || '$RUNNER_TEMP'}/temp-provisiong-profile.mobileprovision`)
		await exec.exec('fastlane', [
			'run',
			'update_project_provisioning',
			`profile:"${process.env.RUNNER_TEMP}/temp-provisiong-profile.mobileprovision"`,
			`xcodeproj:"${process.env.GYM_PROJECT}"`,
			`target_filter:"${core.getInput('target-filter')}"`
		])

		process.env.GYM_SCHEME = core.getInput('scheme')
		process.env.GYM_OUTPUT_DIRECTORY = core.getInput('output-directory')
		process.env.GYM_CONFIGURATION = core.getInput('configuration')
		process.env.GYM_INCLUDE_BITCODE = core.getBooleanInput('include-bitcode').toString()
		process.env.GYM_INCLUDE_SYMBOLS = core.getBooleanInput('include-symbols').toString()
		process.env.GYM_EXPORT_METHOD = exportMethod
		process.env.GYM_EXPORT_TEAM_ID = teamID

		await exec.exec('fastlane', ['gym'])
	} catch (ex: any) {
		core.setFailed(ex.message)
	}
}

async function Cleanup()
{
	try {
		core.info('Remove provisioning profile')
		await io.rmRF(ProvisioningProfile.Get())
	} catch (ex: any) {
		core.setFailed(ex.message)
	}
}

if (!IsMacOS) {
	core.setFailed('Action requires macOS agent.')
} else {
	if (!!PostProcess.Get()) {
		Cleanup()
	} else {
		Run()
	}
	
	PostProcess.Set(true)
}
