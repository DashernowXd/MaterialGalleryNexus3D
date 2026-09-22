<#
.SYNOPSIS
    Genera automáticamente el andamiaje (scaffold) para una nueva Skill de Google Antigravity.
.DESCRIPTION
    Crea la jerarquía de carpetas requerida y genera el archivo SKILL.md inicial con frontmatter YAML
    y la plantilla adaptada al arquetipo seleccionado.
.PARAMETER Name
    Identificador único de la skill en formato kebab-case (ej. 'deploy-preview', 'react-three-expert').
.PARAMETER Archetype
    Arquetipo de la skill: 'workflow', 'tool-wrapper', 'domain-expert', 'code-scaffold', 'diagnostic-auditor'.
.PARAMETER Description
    Descripción en tercera persona para el frontmatter. Si no se indica, se genera una plantilla guía.
.PARAMETER Scope
    Ámbito de la skill: 'workspace' (por defecto, en .agents/skills/) o 'global' (en ~/.gemini/config/skills/).
.EXAMPLE
    .\scaffold-skill.ps1 -Name "nextjs-deploy" -Archetype "workflow" -Scope "workspace"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidatePattern('^[a-z0-9]+(-[a-z0-9]+)*$')]
    [string]$Name,

    [Parameter(Mandatory = $false, Position = 1)]
    [ValidateSet('workflow', 'tool-wrapper', 'domain-expert', 'code-scaffold', 'diagnostic-auditor')]
    [string]$Archetype = 'domain-expert',

    [Parameter(Mandatory = $false)]
    [string]$Description = '',

    [Parameter(Mandatory = $false)]
    [ValidateSet('workspace', 'global')]
    [string]$Scope = 'workspace',

    [Parameter(Mandatory = $false)]
    [string]$WorkspaceRoot = ''
)

$ErrorActionPreference = 'Stop'

# Determinar la raíz del workspace si no se especifica
if ([string]::IsNullOrWhiteSpace($WorkspaceRoot)) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    # Intentar buscar hacia arriba .agents o .git
    $current = Get-Item $scriptDir
    while ($current -and -not (Test-Path (Join-Path $current.FullName '.agents')) -and -not (Test-Path (Join-Path $current.FullName '.git'))) {
        $current = $current.Parent
    }
    if ($current) {
        $WorkspaceRoot = $current.FullName
    } else {
        $WorkspaceRoot = (Get-Location).Path
    }
}

# Determinar destino
if ($Scope -eq 'workspace') {
    $baseSkillsDir = Join-Path $WorkspaceRoot '.agents\skills'
} else {
    $userProfile = [Environment]::GetFolderPath('UserProfile')
    $baseSkillsDir = Join-Path $userProfile '.gemini\config\skills'
}

$targetSkillDir = Join-Path $baseSkillsDir $Name

if (Test-Path $targetSkillDir) {
    Write-Warning "El directorio de la skill ya existe en: $targetSkillDir"
    $overwrite = Read-Host "¿Deseas sobrescribir? (s/n)"
    if ($overwrite -ne 's') {
        Write-Host "Operación cancelada."
        exit 0
    }
} else {
    New-Item -ItemType Directory -Path $targetSkillDir -Force | Out-Null
}

# Crear subcarpetas según estándar de Antigravity
$subFolders = @('scripts', 'resources', 'references', 'examples')
foreach ($folder in $subFolders) {
    $folderPath = Join-Path $targetSkillDir $folder
    if (-not (Test-Path $folderPath)) {
        New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
    }
}

# Ubicación de plantillas
$templatesDir = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) '..\resources\templates'
$templateFile = Join-Path $templatesDir "template-$Archetype.md"

if (Test-Path $templateFile) {
    $templateContent = Get-Content -Raw -Encoding UTF8 $templateFile
} else {
    $templateContent = @"
---
name: {{SKILL_NAME}}
description: >-
  {{SKILL_DESCRIPTION}}
---

# {{SKILL_TITLE}}

Instrucciones para la skill {{SKILL_NAME}}.
"@
}

# Preparar descripciones y títulos
if ([string]::IsNullOrWhiteSpace($Description)) {
    $Description = "Executes procedures and best practices for $Name. Use when working on tasks related to $Name or when invoked via /$Name."
}

$titleWords = $Name -split '-' | ForEach-Object { (Get-Culture).TextInfo.ToTitleCase($_) }
$skillTitle = $titleWords -join ' '

# Reemplazo de variables
$finalContent = $templateContent `
    -replace '\{\{SKILL_NAME\}\}', $Name `
    -replace '\{\{SKILL_DESCRIPTION\}\}', $Description `
    -replace '\{\{SKILL_TITLE\}\}', $skillTitle `
    -replace '\{\{WORKFLOW_OBJECTIVE\}\}', "el proceso de $skillTitle" `
    -replace '\{\{TOOL_NAME\}\}', $Name `
    -replace '\{\{DOMAIN_NAME\}\}', $skillTitle `
    -replace '\{\{ARTIFACT_TYPE\}\}', $skillTitle `
    -replace '\{\{SYSTEM_NAME\}\}', $skillTitle

# Escribir SKILL.md
$skillMdPath = Join-Path $targetSkillDir 'SKILL.md'
[System.IO.File]::WriteAllText($skillMdPath, $finalContent, [System.Text.Encoding]::UTF8)

# Crear archivo README / placeholder en references
$refPlaceholder = Join-Path (Join-Path $targetSkillDir 'references') 'overview.md'
if (-not (Test-Path $refPlaceholder)) {
    $refText = "# Referencia Técnica para $skillTitle" + [Environment]::NewLine + [Environment]::NewLine + "Documentación detallada y manuales técnicos."
    [System.IO.File]::WriteAllText($refPlaceholder, $refText, [System.Text.Encoding]::UTF8)
}

Write-Host "Skill '$Name' creada con éxito." -ForegroundColor Green
Write-Host "Ubicación: $targetSkillDir" -ForegroundColor Cyan
Write-Host "Arquetipo: $Archetype" -ForegroundColor Yellow
Write-Host "Invocación slash command: /$Name" -ForegroundColor Magenta
Write-Host "Siguiente paso: edita $skillMdPath para ajustar los pasos e instrucciones."

