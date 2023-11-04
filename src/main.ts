import * as core from '@actions/core'
import * as os from 'os'
import XcodeHelper from './XcodeHelper'

const IsMacOS = os.platform() === 'darwin'

async function Run()
{
	try {
		const plist = await XcodeHelper.GenerateExportOptionsPlist(
			process.env.RUNNER_TEMP || '',
			core.getInput('app-id'),
			core.getInput('provisioning-profile-name'),
			core.getBooleanInput('include-bitcode'),
			core.getBooleanInput('include-symbols'),
			core.getBooleanInput('strip-swift-symbols'))

		await XcodeHelper.Export(
			core.getInput('configuration'),
			core.getInput('export-method'),
			core.getBooleanInput('include-bitcode'),
			core.getBooleanInput('include-symbols'),
			core.getInput('output-directory'),
			core.getInput('output-name'),
			plist,
			core.getInput('project-directory'),
			core.getInput('scheme'),
			core.getInput('sdk'),
			core.getInput('team-id'))
	} catch (ex: any) {
		core.setFailed(ex.message)
	}
}

if (!IsMacOS) {
	core.setFailed('Action requires macOS agent.')
} else {
	Run()
}
