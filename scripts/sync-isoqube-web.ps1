param(
  [string]$IsoQubeProject = (Join-Path $PSScriptRoot '..\..\..\Other\iso\isonative')
)

$ErrorActionPreference = 'Stop'

$websiteRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$projectRoot = (Resolve-Path -LiteralPath $IsoQubeProject).Path
$buildRoot = Join-Path $projectRoot 'build\web'
$targetRoot = [System.IO.Path]::GetFullPath((Join-Path $websiteRoot 'public\isoqube'))
$expectedTargetParent = [System.IO.Path]::GetFullPath((Join-Path $websiteRoot 'public'))

if ([System.IO.Path]::GetDirectoryName($targetRoot) -ne $expectedTargetParent) {
  throw "Refusing to replace an unexpected target: $targetRoot"
}

Push-Location $projectRoot
try {
  flutter build web --release --base-href /isoqube/ --pwa-strategy=none
  if ($LASTEXITCODE -ne 0) {
    throw "Flutter web build failed with exit code $LASTEXITCODE"
  }
} finally {
  Pop-Location
}

if (Test-Path -LiteralPath $targetRoot) {
  Remove-Item -LiteralPath $targetRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $targetRoot | Out-Null
New-Item -ItemType Directory -Path (Join-Path $targetRoot 'canvaskit\chromium') -Force | Out-Null

Copy-Item -LiteralPath (Join-Path $buildRoot 'assets') -Destination $targetRoot -Recurse
Copy-Item -LiteralPath (Join-Path $buildRoot 'icons') -Destination $targetRoot -Recurse

$topLevelFiles = @(
  'index.html',
  'flutter_bootstrap.js',
  'main.dart.js',
  'isoqube_service_worker.js',
  'manifest.json',
  'version.json',
  'favicon.png'
)

foreach ($fileName in $topLevelFiles) {
  Copy-Item -LiteralPath (Join-Path $buildRoot $fileName) -Destination $targetRoot
}

foreach ($fileName in @('canvaskit.js', 'canvaskit.wasm')) {
  Copy-Item -LiteralPath (Join-Path $buildRoot "canvaskit\$fileName") -Destination (Join-Path $targetRoot 'canvaskit')
  Copy-Item -LiteralPath (Join-Path $buildRoot "canvaskit\chromium\$fileName") -Destination (Join-Path $targetRoot 'canvaskit\chromium')
}

$copiedFiles = Get-ChildItem -LiteralPath $targetRoot -Recurse -File
$copiedMiB = [math]::Round((($copiedFiles | Measure-Object Length -Sum).Sum / 1MB), 2)
Write-Output "Synced $($copiedFiles.Count) files ($copiedMiB MiB) to $targetRoot"
