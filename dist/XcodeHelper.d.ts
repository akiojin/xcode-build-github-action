export default class XcodeHelper {
    static Export(configuration: string, exportMethod: string, includeBitcode: boolean, includeSymbols: boolean, outputDirectory: string, outputName: string, plist: string, projectDirectory: string, scheme: string, sdk: string, teamID: string): Promise<void>;
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
    static GenerateExportOptionsPlist(outputDirctory: string, appID: string, provisioningProfilesName: string, compileBitcode: boolean, uploadSymbols: boolean, stripSwiftSymbols: boolean): Promise<string>;
    static Generate(compileBitcode: boolean, uploadSymbols: boolean, stripSwiftSymbols: boolean): string;
    static GenerateWithAppID(appID: string, provisioningProfilesName: string, compileBitcode: boolean, uploadSymbols: boolean, stripSwiftSymbols: boolean): string;
}
