import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as os from 'os'

const IsMacOS = os.platform() === 'darwin'

async function Run()
{
	try {
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
		process.env.GYM_EXPORT_METHOD = core.getInput('export-method')
		process.env.GYM_EXPORT_TEAM_ID = core.getInput('team-id')

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
