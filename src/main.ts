import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { ArgumentBuilder } from '@akiojin/argument-builder'
import * as os from 'os'

const IsMacOS = os.platform() === 'darwin'

async function BuildXcodeProject()
{
	const builder = new ArgumentBuilder()
	builder.Append('gym')

	const workspace = core.getInput('workspace')
	if (workspace !== '') {
		builder.Append('--workspace', workspace)
	} else {
		builder.Append('--project', core.getInput('project'))
	}

	builder
		.Append('--scheme', core.getInput('scheme'))
		.Append('--sdk', core.getInput('sdk'))
		.Append('--output_directory', core.getInput('output-directory'))
		.Append('--configuration', core.getInput('configuration'))
		.Append('--include_bitcode', core.getBooleanInput('include-bitcode').toString())
		.Append('--include_symbols', core.getBooleanInput('include-symbols').toString())
		.Append('--export_method', core.getInput('export-method'))
		.Append('--export_team_id', core.getInput('team-id'))

	core.startGroup('Run fastlane "gym"')
	await exec.exec('fastlane', builder.Build())
	core.endGroup()
}

async function Run()
{
	try {
		BuildXcodeProject()
	} catch (ex: any) {
		core.setFailed(ex.message)
	}
}

if (!IsMacOS) {
	core.setFailed('Action requires macOS agent.')
} else {
	Run()
}
