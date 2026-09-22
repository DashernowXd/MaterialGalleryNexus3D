<#
.SYNOPSIS
    Genera automaticamente el andamiaje para un nuevo componente React idiomatico.
.DESCRIPTION
    Crea el componente React (TypeScript/JavaScript), su archivo de estilos (CSS Module opcional),
    un Custom Hook asociado si se solicita, y el archivo barrel index.ts para exportacion limpia.
.PARAMETER Name
    Nombre del componente en PascalCase (ej. 'UserProfile', 'NavigationDrawer') o kebab-case ('user-profile').
.PARAMETER Destination
    Directorio base donde se generara la carpeta del componente. Por defecto: './src/components'.
.PARAMETER TypeScript
    Genera archivos en TypeScript (.tsx/.ts). Valor por defecto: $true.
.PARAMETER CssModule
    Crea un archivo CSS Module acompanante (<Name>.module.css). Valor por defecto: $false.
.PARAMETER WithHook
    Genera simultaneamente un Custom Hook desacoplado (use<Name>.ts). Valor por defecto: $false.
.PARAMETER Force
    Sobrescribe archivos existentes si ya existen.
.EXAMPLE
    powershell -File .\scaffold-component.ps1 -Name "UserCard" -CssModule -TypeScript
.EXAMPLE
    powershell -File .\scaffold-component.ps1 -Name "data-table" -WithHook -Destination "./src/features"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false, Position = 0)]
    [string]$Name = '',

    [Parameter(Mandatory = $false)]
    [string]$Destination = './src/components',

    [Parameter(Mandatory = $false)]
    [switch]$TypeScript = $true,

    [Parameter(Mandatory = $false)]
    [switch]$CssModule = $false,

    [Parameter(Mandatory = $false)]
    [switch]$WithHook = $false,

    [Parameter(Mandatory = $false)]
    [switch]$Force = $false,

    [Parameter(Mandatory = $false)]
    [Alias('h', '?')]
    [switch]$Help = $false
)

$ErrorActionPreference = 'Stop'

if ($Help -or [string]::IsNullOrWhiteSpace($Name)) {
    Get-Help $MyInvocation.MyCommand.Path -Detailed
    exit 0
}

# Normalizar nombre a PascalCase y kebab-case
$cleanName = $Name.Trim()
if ($cleanName -match '^[a-z]+(-[a-z0-9]+)+$') {
    # Viene en kebab-case: convertir a PascalCase
    $words = $cleanName -split '-' | ForEach-Object { (Get-Culture).TextInfo.ToTitleCase($_) }
    $componentName = $words -join ''
    $kebabName = $cleanName
} else {
    # Viene en PascalCase: asegurar mayuscula inicial
    $componentName = (Get-Culture).TextInfo.ToTitleCase($cleanName)
    # Convertir a kebab-case
    $kebabName = ($componentName -replace '([a-z])([A-Z])', '$1-$2').ToLower()
}

$ext = if ($TypeScript) { 'tsx' } else { 'jsx' }
$codeExt = if ($TypeScript) { 'ts' } else { 'js' }

$targetDir = Join-Path $Destination $componentName
if (Test-Path $targetDir) {
    if (-not $Force) {
        Write-Error "El directorio '$targetDir' ya existe. Usa -Force para sobrescribir."
        exit 1
    }
} else {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

# 1. Generar archivo de componente
$componentFilePath = Join-Path $targetDir "$componentName.$ext"
$cssImport = if ($CssModule) { "import styles from './$componentName.module.css';" } else { "" }
$cssClass = if ($CssModule) { "styles.container" } else { "`"$kebabName`"" }

$lines = @(
    "import React from 'react';",
    $cssImport,
    "",
    "export interface ${componentName}Props {",
    "  /** Titulo principal del componente */",
    "  title?: string;",
    "  /** Contenido secundario opcional */",
    "  children?: React.ReactNode;",
    "  /** Clase CSS adicional */",
    "  className?: string;",
    "}",
    "",
    "export function ${componentName}({",
    "  title = '${componentName}',",
    "  children,",
    "  className = '',",
    "}: ${componentName}Props) {",
    "  return (",
    "    <section className={`{$cssClass} `$className`.trim()}>",
    "      <header>",
    "        <h2>{title}</h2>",
    "      </header>",
    "      {children && <div>{children}</div>}",
    "    </section>",
    "  );",
    "}",
    "",
    "export default $componentName;"
)
$componentCode = ($lines | Where-Object { $_ -ne $null }) -join [Environment]::NewLine
[System.IO.File]::WriteAllText($componentFilePath, $componentCode, [System.Text.Encoding]::UTF8)
Write-Host "[OK] Creado: $componentFilePath" -ForegroundColor Green

# 2. Generar CSS Module si se solicito
if ($CssModule) {
    $cssFilePath = Join-Path $targetDir "$componentName.module.css"
    $cssLines = @(
        ".container {",
        "  padding: 1.5rem;",
        "  border-radius: 0.5rem;",
        "  background-color: #ffffff;",
        "  border: 1px solid #e2e8f0;",
        "  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);",
        "}",
        "",
        ".container h2 {",
        "  margin: 0 0 1rem 0;",
        "  font-size: 1.25rem;",
        "  color: #1e293b;",
        "}"
    )
    $cssCode = $cssLines -join [Environment]::NewLine
    [System.IO.File]::WriteAllText($cssFilePath, $cssCode, [System.Text.Encoding]::UTF8)
    Write-Host "[OK] Creado: $cssFilePath" -ForegroundColor Green
}

# 3. Generar Custom Hook si se solicito
if ($WithHook) {
    $hookName = "use$componentName"
    $hookFilePath = Join-Path $targetDir "$hookName.$codeExt"
    $hookLines = @(
        "import { useState, useCallback } from 'react';",
        "",
        "export function $hookName() {",
        "  const [isActive, setIsActive] = useState(false);",
        "",
        "  const toggle = useCallback(() => {",
        "    setIsActive(prev => !prev);",
        "  }, []);",
        "",
        "  return {",
        "    isActive,",
        "    toggle,",
        "  };",
        "}"
    )
    $hookCode = $hookLines -join [Environment]::NewLine
    [System.IO.File]::WriteAllText($hookFilePath, $hookCode, [System.Text.Encoding]::UTF8)
    Write-Host "[OK] Creado: $hookFilePath" -ForegroundColor Green
}

# 4. Generar barrel export index.ts
$indexFilePath = Join-Path $targetDir "index.$codeExt"
$indexLines = @(
    "export * from './$componentName';",
    "export { default } from './$componentName';"
)
if ($WithHook) {
    $indexLines += "export * from './use$componentName';"
}
$indexCode = ($indexLines -join [Environment]::NewLine) + [Environment]::NewLine
[System.IO.File]::WriteAllText($indexFilePath, $indexCode, [System.Text.Encoding]::UTF8)
Write-Host "[OK] Creado: $indexFilePath" -ForegroundColor Green

Write-Host "`nComponente '$componentName' andamiado exitosamente en $targetDir" -ForegroundColor Cyan
