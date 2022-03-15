# xcode-build-github-action
This action will build with Xcode and output ipa.
Parameters are customized for Unity, but can be used without Unity by specifying parameters.

## Requirement
You will need to install [fastlane][1]

### Installation
```sh
brew install fastlane
```

## Usage

### Simple usage
```yml
- uses: akiojin/xcode-build-github-action@v1.0
  id: xcode-build
  with:
    export-method: 'development'
    project: <Xcode project path>
    output-directory: <ipa output directory path>
    team-id: <Team ID>
```

## Arguments

|Name|Required|Type|Default|Description|
|:--|:--|:--|:--|:--|
|export-method|`false`|`string`|development|Define the profile type, can be appstore, adhoc, development, enterprise, developer_id, mac_installer_distribution.|
|configuration|`false`|`string`|Debug|The configuration to use when building the app.|
|workspace|`false`|`string`|""|Path to the workspace file. If this parameter is omitted, `project` must be specified.|
|project|`false`|`string`|""|Path to the project file. If `workspace` is omitted, this value is used.|
|scheme|`false`|`string`|Unity-iPhone|The project's scheme.|
|sdk|`false`|`string`|iphoneos|The SDK that should be used for building the application.|
|include-bitcode|`false`|`boolean`|`false`|Should the ipa file include bitcode?|
|include-symbols|`false`|`boolean`|`false`|Should the ipa file include symbols?|
|output-directory|`true`|`string`||The directory in which the ipa file should be stored in.|
|team-id|`true`|`string`||The ID of your Developer Portal team if you're in multiple teams.|

## License
Any contributions made under this project will be governed by the [MIT License][3].

[0]: https://github.com/akiojin/xcode-build-github-action/actions/workflows/Test.yml/badge.svg
[1]: https://docs.fastlane.tools/
[2]: https://github.com/akiojin/xcode-build-github-action/blob/main/action.yml
[3]: https://github.com/akiojin/xcode-build-github-action/blob/main/LICENSE