; Plenio VST3 for Windows: puts Plenio.vst3 where every DAW looks for VST3 plug-ins
; (C:\Program Files\Common Files\VST3) and takes it out again. Built by tools/package.ps1 (and the release workflow):
;   iscc /DAppVersion=2.0.0 /DBundleDir=<Plenio.vst3> /DOutputDir=<folder> installer\windows\PlenioVST3.iss

#define AppName "Plenio VST3"
#ifndef AppVersion
  #define AppVersion "0.0.0-dev"
#endif
#ifndef BundleDir
  #define BundleDir "..\..\build\VST3\Release\Plenio.vst3"
#endif
#ifndef OutputDir
  #define OutputDir "..\..\dist"
#endif

[Setup]
; the same AppId for every version: a new one replaces the old one
AppId={{B6D3A0F4-5C2E-4E8B-9A61-3F2D7C9E1A57}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher=Johannes Plenio
AppPublisherURL=https://github.com/jplenio/Plenio-Music-Production-System/tree/main/vst3
AppSupportURL=https://github.com/jplenio/Plenio-Music-Production-System/issues
AppUpdatesURL=https://github.com/jplenio/Plenio-Music-Production-System/releases
; the bundle is the installation: Common Files\VST3\Plenio.vst3
DefaultDirName={commoncf64}\VST3\Plenio.vst3
DisableDirPage=yes
DisableProgramGroupPage=yes
DisableReadyPage=no
; the uninstaller stays out of the bundle (a host must find only the plug-in there)
UninstallFilesDir={commonappdata}\Plenio VST3
UninstallDisplayName={#AppName}
UninstallDisplayIcon={app}\PlugIn.ico
PrivilegesRequired=admin
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0.17763
OutputDir={#OutputDir}
OutputBaseFilename=Plenio-VST3-{#AppVersion}-windows-x64-setup
SetupIconFile=..\..\resources\plenio.ico
WizardStyle=modern
WizardSmallImageFile=wizard-small.bmp
WizardImageFile=wizard-large.bmp
Compression=lzma2/max
SolidCompression=yes
LicenseFile=..\..\..\LICENSE
InfoBeforeFile=before.txt
InfoAfterFile=after.txt
CloseApplications=no

[Files]
Source: "{#BundleDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[InstallDelete]
; an older version's files that a new one no longer has
Type: filesandordirs; Name: "{app}\Contents"

[Code]
const
  WebView2Key = 'SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}';
  WebView2KeyUser = 'Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}';

function WebView2Installed(): Boolean;
var
  Version: String;
begin
  Result := (RegQueryStringValue(HKLM, WebView2Key, 'pv', Version) and (Version <> '') and (Version <> '0.0.0.0')) or
            (RegQueryStringValue(HKCU, WebView2KeyUser, 'pv', Version) and (Version <> '') and (Version <> '0.0.0.0'));
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  Code: Integer;
begin
  if (CurStep = ssPostInstall) and (not WizardSilent()) and (not WebView2Installed()) then
    if MsgBox('Plenio''s window needs the Microsoft Edge WebView2 Runtime, which this computer does not seem to have ' +
              '(Windows 11 comes with it). Open its download page now?', mbConfirmation, MB_YESNO) = IDYES then
      ShellExec('open', 'https://developer.microsoft.com/microsoft-edge/webview2/', '', '', SW_SHOWNORMAL, ewNoWait, Code);
end;
