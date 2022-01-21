
function Get-ScriptDirectory {
    if ($psise) {
        Split-Path $psise.CurrentFile.FullPath
    }
    else {
        $global:PSScriptRoot
    }
}
$rootFolder = Get-ScriptDirectory
$ProjectTemplateFolder = [System.IO.Path]::Combine($rootFolder, "ProjectTemplate")
$ComponentTemplateFolder = [System.IO.Path]::Combine($rootFolder, "ComponentTemplate")

function Get-ProjectTemplates {
    Get-ChildItem -Path $ProjectTemplateFolder -Directory | %{        
        $_.Name
    }
}

function Get-ComponentTemplates {
    Get-ChildItem -Path $ComponentTemplateFolder -Directory | %{        
        $_.Name
    }
}


function GeneratorProject{
    [CmdletBinding()]
    param(
        [Parameter(Position = 0, Mandatory)]
        [ArgumentCompleter(
            {
                param($Command, $Parameter, $WordToComplete, $CommandAst, $FakeBoundParams)

                Get-ProjectTemplates
            }
        )]
        [string] $Template,
        [Parameter(Position = 1, Mandatory)]
        [string] $Name
    )
    [string] $upName = $Name.Substring(0,1).ToUpper() + $Name.Substring(1)
    [string] $lcName = $Name.Substring(0,1).ToLower() + $Name.Substring(1)

    <#
    Write-Host "upName        : $upName;"
    Write-Host "lcName        : $lcName;"
    #>
        
    if ([string]::IsNullOrEmpty($Location)){
        $Location = $PWD.Path
    } else {
        $Location = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($PWD.Path, $Location))
    }
    <#
    Write-Host "Location      : $Location"
    #>

    [string]$TemplateFolder = [System.IO.Path]::Combine($ProjectTemplateFolder, $Template)
    [string]$TargetFolder = [System.IO.Path]::Combine($Location, $upName)
        
    <#
    Write-Host "TemplateFolder: $TemplateFolder;"
    Write-Host "TargetFolder  : $TargetFolder;"
    #>

    $TemplateFiles = Get-ChildItem -Path $TemplateFolder  -Filter *.* -File -Recurse

    [bool] $conflict = $false
    $TemplateFiles | Foreach-Object {
        [string] $FullTemplatePath = $_.FullName
        [string] $RelativeTemplatePath = $FullTemplatePath.Substring($TemplateFolder.Length+1)
        [string] $RelativeTargetPath = $RelativeTemplatePath.Replace("__Name__", $upName).Replace("__name__", $lcName)
        [string] $FullTargetPath =  [System.IO.Path]::Combine($TargetFolder, $RelativeTargetPath)
        [string] $FullTargetFolder = [System.IO.Path]::GetDirectoryName($FullTargetPath)
        if ([System.IO.Directory]::Exists($FullTargetFolder)){ 
            if ([System.IO.File]::Exists($FullTargetPath)) {
                Write-Host "Conflicting  $FullTargetPath"
                $conflict = $true
            }
        } else {
            # ok
        }
    }
    if ($conflict){
        Write-Host "skipped"
    } else {
        $TemplateFiles | Foreach-Object {
            [string]$FullTemplatePath = $_.FullName
            [string]$RelativeTemplatePath = $FullTemplatePath.Substring($TemplateFolder.Length+1)
            [string]$RelativeTargetPath = $RelativeTemplatePath.Replace("__Name__", $upName).Replace("__name__", $lcName)
            
            [string]$FullTargetPath =  [System.IO.Path]::Combine($TargetFolder, $RelativeTargetPath)
            [string] $content = [System.IO.File]::ReadAllText($_.FullName)
            $content = $content.Replace("__Name__", $upName).Replace("__name__", $lcName)
            [string] $FullTargetFolder = [System.IO.Path]::GetDirectoryName($FullTargetPath)
            if (-not ([System.IO.Directory]::Exists($FullTargetFolder))){
                [System.IO.Directory]::CreateDirectory($FullTargetFolder) | Out-Null
            }
            if ([System.IO.File]::Exists($FullTargetPath)) {
            } else {
                [System.IO.File]::WriteAllText($FullTargetPath, $content) | Out-Null
                Write-Host $FullTargetPath
            }
        }
        Write-Host "TargetFolder  : $TargetFolder;"
    }
}

function GeneratorComponent{
    [CmdletBinding()]
    param(
        [Parameter(Position = 0, Mandatory)]
        [ArgumentCompleter(
            {
                param($Command, $Parameter, $WordToComplete, $CommandAst, $FakeBoundParams)

                # Get-ValidValues -Path (Get-Location)
                Get-ComponentTemplates
            }
        )]
        [string] $Template,
        [Parameter(Position = 1, Mandatory)]
        [string] $Name,
        [Parameter(Position = 2)]
        [string] $Key,
        [Parameter(Position = 2)]
        [string] $Location
    )
    [string] $upName = $Name.Substring(0,1).ToUpper() + $Name.Substring(1)
    [string] $lcName = $Name.Substring(0,1).ToLower() + $Name.Substring(1)

    <#
    Write-Host "upName        : $upName;"
    Write-Host "lcName        : $lcName;"
    #>
        
    if ([string]::IsNullOrEmpty($Location)){
        
        $Location = $PWD.Path
    } else {
        $Location = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($PWD.Path, $Location))
    }
    <#
    Write-Host "Location      : $Location"
    #>

    [string]$TemplateFolder = [System.IO.Path]::Combine($ComponentTemplateFolder, $Template)
    [string]$TargetFolder = $Location
    
    <#
    Write-Host "TemplateFolder: $TemplateFolder;"
    Write-Host "TargetFolder  : $TargetFolder;"
    #>

    $TemplateFiles = Get-ChildItem -Path $TemplateFolder  -Filter *.* -File -Recurse

    [bool] $conflict = $false
    $TemplateFiles | Foreach-Object {
        [string] $FullTemplatePath = $_.FullName
        [string] $RelativeTemplatePath = $FullTemplatePath.Substring($TemplateFolder.Length+1)
        [string] $RelativeTargetPath = $RelativeTemplatePath.Replace("__Name__", $upName).Replace("__name__", $lcName)
        [string] $FullTargetPath =  [System.IO.Path]::Combine($TargetFolder, $RelativeTargetPath)
        [string] $FullTargetFolder = [System.IO.Path]::GetDirectoryName($FullTargetPath)
        if ([System.IO.Directory]::Exists($FullTargetFolder)){ 
            if ([System.IO.File]::Exists($FullTargetPath)) {
                Write-Host "Conflicting  $FullTargetPath"
                $conflict = $true
            }
        } else {
            # ok
        }
    }
    if ($conflict){
        Write-Host "skipped"
    } else {
        $TemplateFiles | Foreach-Object {
            [string]$FullTemplatePath = $_.FullName
            [string]$RelativeTemplatePath = $FullTemplatePath.Substring($TemplateFolder.Length+1)
            [string]$RelativeTargetPath = $RelativeTemplatePath.Replace("__Name__", $upName).Replace("__name__", $lcName)
            
            [string]$FullTargetPath =  [System.IO.Path]::Combine($TargetFolder, $RelativeTargetPath)
            [string] $content = [System.IO.File]::ReadAllText($_.FullName)
            $content = $content.Replace("__Name__", $upName).Replace("__name__", $lcName)
            [string] $FullTargetFolder = [System.IO.Path]::GetDirectoryName($FullTargetPath)
            if (-not ([System.IO.Directory]::Exists($FullTargetFolder))){
                [System.IO.Directory]::CreateDirectory($FullTargetFolder) | Out-Null
            }
            if ([System.IO.File]::Exists($FullTargetPath)) {
            } else {
                [System.IO.File]::WriteAllText($FullTargetPath, $content) | Out-Null
                Write-Host $FullTargetPath
            }
        }
        Write-Host "TargetFolder  : $TargetFolder;"
    }
}

Write-Host ""
Write-Host "GeneratorProject"
Get-ProjectTemplates | ForEach-Object{
    Write-Host "GeneratorProject -Template $($_) -Name abc"
}

Write-Host ""
Write-Host "GeneratorComponent"
Get-ComponentTemplates | ForEach-Object{
    Write-Host "GeneratorComponent -Template $($_) -Name abc"
}