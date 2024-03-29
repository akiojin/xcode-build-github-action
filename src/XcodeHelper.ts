import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs/promises'
import path from 'path'
import { ArgumentBuilder } from '@akiojin/argument-builder'

export default class XcodeHelper
{
  static async Export(
    configuration: string,
    exportMethod: string,
    includeBitcode: boolean,
    includeSymbols: boolean,
    outputDirectory: string,
    outputName: string,
    plist: string,
    projectDirectory: string,
    scheme: string,
    sdk: string,
    teamID: string): Promise<void>
  {
    const builder = new ArgumentBuilder()
      .Append('gym')
      .Append('--scheme', scheme)
      .Append('--clean')
      .Append('--output_directory', outputDirectory)
      .Append('--configuration', configuration)
      .Append('--silent')
      .Append('--include_bitcode', includeBitcode.toString())
      .Append('--include_symbols', includeSymbols.toString())
      .Append('--export_method', exportMethod)
      .Append('--export_options', plist)
      .Append('--skip_build_archive', `false`)
      .Append('--sdk', sdk)
      .Append('--export_team_id', teamID)
      .Append('--skip_profile_detection')
      .Append('--output_name', outputName)
    
    try {
      const workspace = path.join(projectDirectory, 'Unity-iPhone.xcworkspace')
      await fs.access(workspace)
      builder.Append('--workspace', workspace)
    } catch (ex: any) {
      builder.Append('--project', path.join(projectDirectory, 'Unity-iPhone.xcodeproj'))
    }
    
    core.startGroup('Run fastlane "gym"')
    await exec.exec('fastlane', builder.Build())
    core.endGroup()
  }
    
  /**
   * Output ExportOptions.plist.
   * 
   * @param outputDirctory Output directory.
   * @param appID Export App ID
   * @param provisioningProfilesName Export Provisioning Profiles Name
   * @param compileBitcode Output Bitcode?
   * @param uploadSymbols Output Symbols?
   * @param stripSwiftSymbols Strip Swift Symbols?
   * @returns Path of ExportOptions.plist
   */
  static async GenerateExportOptionsPlist(
    outputDirctory: string,
    appID: string,
    provisioningProfilesName: string,
    compileBitcode: boolean,
    uploadSymbols: boolean,
    stripSwiftSymbols: boolean): Promise<string>
  {
    let script;

    if (!appID || !provisioningProfilesName) {
      script = XcodeHelper.Generate(
        compileBitcode,
        uploadSymbols,
        stripSwiftSymbols)
    } else {
      script = XcodeHelper.GenerateWithAppID(
        appID,
        provisioningProfilesName,
        compileBitcode,
        uploadSymbols,
        stripSwiftSymbols)
    }

    const plist = path.join(outputDirctory, 'ExportOptions.plist')

    await fs.writeFile(plist, script)

    core.startGroup('Generate "ExportOptions.plist"')
    core.info(`ExportOptions.plist:\n${script}`)
    core.endGroup()
    
    return plist
  }
    
  static Generate(
    compileBitcode: boolean,
    uploadSymbols: boolean,
    stripSwiftSymbols: boolean): string
  {
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>compileBitcode</key>
    <${compileBitcode}/>
    <key>thinning</key>
    <string>&lt;none&gt;</string>
    <key>uploadBitcode</key>
    <${compileBitcode}/>
    <key>uploadSymbols</key>
    <${uploadSymbols}/>
    <key>stripSwiftSymbols</key>
    <${stripSwiftSymbols}/>
  </dict>
</plist>`;
  }
    
  static GenerateWithAppID(
    appID: string,
    provisioningProfilesName: string,
    compileBitcode: boolean,
    uploadSymbols: boolean,
    stripSwiftSymbols: boolean): string
  {
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>compileBitcode</key>
    <${compileBitcode}/>
    <key>provisioningProfiles</key>
    <dict>
        <key>${appID}</key>
        <string>${provisioningProfilesName}</string>
    </dict>
    <key>thinning</key>
    <string>&lt;none&gt;</string>
    <key>uploadBitcode</key>
    <${compileBitcode}/>
    <key>uploadSymbols</key>
    <${uploadSymbols}/>
    <key>stripSwiftSymbols</key>
    <${stripSwiftSymbols}/>
  </dict>
</plist>`;
  }
}