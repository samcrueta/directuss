# ---------------------------------------------------------------------------
# Lumina Academy - Windows runner
#
#   .\run.cmd setup     create env files, generate secrets, install deps
#   .\run.cmd start     setup (if needed) + up
#   .\run.cmd up        Directus in Docker + Payload, Keystone, frontend
#   .\run.cmd down      stop host services and the Docker stack
#   .\run.cmd restart   down + up
#   .\run.cmd status    process and health summary
#   .\run.cmd logs [directus|payload|keystone|frontend|all]
#   .\run.cmd seed      reseed Directus, Payload, Keystone
#   .\run.cmd reset     delete local databases, restart, reseed
#
# Run this through run.cmd so the PowerShell execution policy does not block it.
# ---------------------------------------------------------------------------

#Requires -Version 5.1

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$script:Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $script:Root

$script:ComposeFile = Join-Path $script:Root 'cms\compose.yaml'
$script:RunDir = Join-Path $script:Root '.run'
$script:HostServices = @('frontend', 'keystone', 'payload')
$script:DefaultDirectusEmail = 'admin@example.com'
$script:DefaultDirectusPassword = 'LuminaAdmin123!'
$script:DefaultPayloadEmail = 'admin@lumina.local'
$script:DefaultPayloadPassword = 'lumina-payload-admin'
$script:DefaultPayloadServiceEmail = 'service@lumina.local'
$script:DefaultPayloadServicePassword = 'lumina-payload-service'
$script:DefaultKeystoneEmail = 'admin@lumina.local'
$script:DefaultKeystonePassword = 'lumina-keystone-admin'

$env:NEXT_TELEMETRY_DISABLED = '1'

# ---------------------------------------------------------------------------
# Output helpers
# ---------------------------------------------------------------------------

function Write-Step([string]$Message) {
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Info([string]$Message) {
  Write-Host $Message
}

function Write-Warn([string]$Message) {
  Write-Host "warning: $Message" -ForegroundColor Yellow
}

function Fail([string]$Message) {
  Write-Host "error: $Message" -ForegroundColor Red
  exit 1
}

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    Fail "missing required command: $Name"
  }
}

# ---------------------------------------------------------------------------
# Service metadata
# ---------------------------------------------------------------------------

function Get-ServicePort([string]$Name) {
  switch ($Name) {
    'frontend' { return 3000 }
    'payload'  { return 3002 }
    'keystone' { return 3003 }
    'directus' { return 8055 }
    default    { Fail "unknown service: $Name" }
  }
}

function Get-ServiceHealthUrl([string]$Name) {
  switch ($Name) {
    'frontend' { return 'http://localhost:3000/' }
    'payload'  { return 'http://localhost:3002/api/lumina/health' }
    'keystone' { return 'http://localhost:3003/api/lumina/health' }
    'directus' { return 'http://localhost:8055/server/ping' }
    default    { Fail "unknown service: $Name" }
  }
}

function Get-PidFile([string]$Name) {
  return (Join-Path $script:RunDir "$Name.pid")
}

function Get-LogFile([string]$Name) {
  return (Join-Path $script:RunDir "$Name.log")
}

function Get-StoredPid([string]$Name) {
  $file = Get-PidFile $Name
  if (-not (Test-Path -LiteralPath $file)) { return 0 }
  try {
    $value = (Get-Content -LiteralPath $file -Raw).Trim()
    if ([string]::IsNullOrWhiteSpace($value)) { return 0 }
    return [int]$value
  } catch {
    return 0
  }
}

function Test-ProcessRunning([string]$Name) {
  $processId = Get-StoredPid $Name
  if ($processId -le 0) { return $false }
  $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
  return ($null -ne $process)
}

function Test-Url([string]$Url) {
  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    return ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400)
  } catch {
    return $false
  }
}

function Test-Healthy([string]$Name) {
  return (Test-Url (Get-ServiceHealthUrl $Name))
}

function Test-PortInUse([int]$Port) {
  if (Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue) {
    try {
      $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
      if ($connections) { return $true }
    } catch {
      # Fall through to netstat below.
    }
  }

  $netstat = & netstat.exe -ano -p tcp 2>$null
  foreach ($line in $netstat) {
    if ($line -match "[:.]$Port\s+.*LISTENING") { return $true }
  }
  return $false
}

function Test-Docker {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { return $false }
  try {
    & docker info *> $null
    return ($LASTEXITCODE -eq 0)
  } catch {
    return $false
  }
}

function Test-ComposeServiceRunning([string]$Service) {
  if (-not (Test-Docker)) { return $false }
  try {
    $output = & docker compose -f $script:ComposeFile ps --status running --format '{{.Service}}' 2>$null
    if ($LASTEXITCODE -ne 0) { return $false }
    return (@($output) -contains $Service)
  } catch {
    return $false
  }
}

function Invoke-Compose {
  & docker compose -f $script:ComposeFile @args
  if ($LASTEXITCODE -ne 0) {
    Fail "docker compose $($args -join ' ') failed"
  }
}

function Invoke-Npm([string]$Directory, [string[]]$NpmArgs) {
  $target = Join-Path $script:Root $Directory
  Push-Location -LiteralPath $target
  try {
    & npm.cmd @NpmArgs
    if ($LASTEXITCODE -ne 0) {
      Fail "npm $($NpmArgs -join ' ') failed in $Directory"
    }
  } finally {
    Pop-Location
  }
}

function Wait-For([string]$Name, [string]$Url, [int]$Seconds = 180) {
  for ($i = 1; $i -le $Seconds; $i++) {
    if (Test-Url $Url) {
      Write-Info "  $Name ready ($Url)"
      return $true
    }
    Start-Sleep -Seconds 1
  }
  return $false
}

function Wait-ForApp([string]$Name, [int]$Seconds = 180) {
  $url = Get-ServiceHealthUrl $Name
  for ($i = 1; $i -le $Seconds; $i++) {
    if (Test-Url $url) {
      Write-Info "  $Name ready ($url)"
      return $true
    }
    if (-not (Test-ProcessRunning $Name)) {
      return $false
    }
    Start-Sleep -Seconds 1
  }
  return $false
}

function Show-ServiceFailure([string]$Name) {
  Write-Host ''
  Write-Warn "$Name did not become healthy. Recent output:"
  if ($Name -eq 'directus') {
    & docker compose -f $script:ComposeFile logs --tail=40 directus
  } else {
    $log = Get-LogFile $Name
    if (Test-Path -LiteralPath $log) {
      Get-Content -LiteralPath $log -Tail 40 | ForEach-Object { Write-Host $_ }
    } else {
      Write-Host "  no log file at .run\$Name.log"
    }
  }
}

# ---------------------------------------------------------------------------
# Environment file helpers
# ---------------------------------------------------------------------------

function Read-EnvFile([string]$Path) {
  $map = @{}
  if (-not (Test-Path -LiteralPath $Path)) { return $map }

  foreach ($line in Get-Content -LiteralPath $Path) {
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$') {
      $map[$matches[1]] = $matches[2].Trim()
    }
  }
  return $map
}

function Set-EnvValue([string]$Path, [string]$Key, [string]$Value) {
  $lines = @()
  if (Test-Path -LiteralPath $Path) {
    $lines = @(Get-Content -LiteralPath $Path)
  }

  $pattern = '^\s*' + [regex]::Escape($Key) + '\s*='
  $found = $false
  $output = New-Object System.Collections.Generic.List[string]

  foreach ($line in $lines) {
    if ($line -match $pattern) {
      if (-not $found) {
        $output.Add("$Key=$Value")
        $found = $true
      }
    } else {
      $output.Add($line)
    }
  }

  if (-not $found) { $output.Add("$Key=$Value") }
  Set-Content -LiteralPath $Path -Value $output.ToArray() -Encoding ASCII
}

function Ensure-EnvValue([string]$Path, [string]$Key, [string]$Value) {
  $map = Read-EnvFile $Path
  if (-not $map.ContainsKey($Key) -or (Test-Placeholder $map[$Key])) {
    Set-EnvValue $Path $Key $Value
  }
}

function Test-Placeholder([string]$Value) {
  if ([string]::IsNullOrWhiteSpace($Value)) { return $true }
  return ($Value -match '^replace-')
}

function New-HexSecret([int]$Bytes = 32) {
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $buffer = New-Object byte[] $Bytes
    $rng.GetBytes($buffer)
    return (-join ($buffer | ForEach-Object { $_.ToString('x2') }))
  } finally {
    $rng.Dispose()
  }
}

function Test-NodeVersion {
  try {
    $version = (& node -v).Trim()
  } catch {
    return
  }

  if ($version -notmatch '^v?(\d+)\.(\d+)\.(\d+)') {
    Write-Warn "could not read the Node.js version ($version)"
    return
  }

  $major = [int]$matches[1]
  $minor = [int]$matches[2]
  $patch = [int]$matches[3]
  $tooOld = $false

  if ($major -lt 22) {
    $tooOld = $true
  } elseif ($major -eq 22 -and ($minor -lt 23 -or ($minor -eq 23 -and $patch -lt 4))) {
    $tooOld = $true
  } elseif ($major -eq 23) {
    $tooOld = $true
  } elseif ($major -eq 24 -and ($minor -lt 22 -or ($minor -eq 22 -and $patch -lt 1))) {
    $tooOld = $true
  }

  if ($tooOld) {
    Write-Warn "Node.js $version is outside Payload's supported range (^22.23.4 or >=24.22.1)."
  } else {
    Write-Info "  node $version"
  }
}

function Test-NodeModulesReady([string]$Directory) {
  $modules = Join-Path $script:Root "$Directory\node_modules"
  if (-not (Test-Path -LiteralPath $modules)) { return $false }

  # A Windows install contains .cmd shims. A node_modules tree copied from
  # Linux/macOS does not, and its native better-sqlite3 build will not load.
  switch ($Directory) {
    'payload'  { return (Test-Path -LiteralPath (Join-Path $modules '.bin\next.cmd')) }
    'frontend' { return (Test-Path -LiteralPath (Join-Path $modules '.bin\next.cmd')) }
    'keystone' {
      return ((Test-Path -LiteralPath (Join-Path $modules '.bin\keystone.cmd')) -and
              (Test-Path -LiteralPath (Join-Path $modules 'better-sqlite3')))
    }
    default { return $true }
  }
}

function Initialize-DataDirectories {
  foreach ($path in @(
      'cms\data\database',
      'cms\data\uploads',
      'payload\data',
      'payload\media',
      'keystone\data')) {
    New-Item -ItemType Directory -Force -Path (Join-Path $script:Root $path) | Out-Null
  }
}

function Initialize-Environment {
  $cmsPath = Join-Path $script:Root 'cms\.env'
  $payloadPath = Join-Path $script:Root 'payload\.env'
  $keystonePath = Join-Path $script:Root 'keystone\.env'
  $frontendPath = Join-Path $script:Root 'frontend\.env.local'

  if (-not (Test-Path -LiteralPath $cmsPath)) {
    Copy-Item -LiteralPath (Join-Path $script:Root 'cms\.env.example') -Destination $cmsPath
    Write-Info '  created cms/.env'
  }
  if (-not (Test-Path -LiteralPath $payloadPath)) {
    Copy-Item -LiteralPath (Join-Path $script:Root 'payload\.env.example') -Destination $payloadPath
    Write-Info '  created payload/.env'
  }
  if (-not (Test-Path -LiteralPath $keystonePath)) {
    Copy-Item -LiteralPath (Join-Path $script:Root 'keystone\.env.example') -Destination $keystonePath
    Write-Info '  created keystone/.env'
  }

  # --- Directus -----------------------------------------------------------
  $map = Read-EnvFile $cmsPath
  if (Test-Placeholder $map['DIRECTUS_KEY']) { Set-EnvValue $cmsPath 'DIRECTUS_KEY' (New-HexSecret 32) }
  if (Test-Placeholder $map['DIRECTUS_SECRET']) { Set-EnvValue $cmsPath 'DIRECTUS_SECRET' (New-HexSecret 32) }
  if (Test-Placeholder $map['DIRECTUS_ADMIN_TOKEN']) { Set-EnvValue $cmsPath 'DIRECTUS_ADMIN_TOKEN' (New-HexSecret 32) }
  if (Test-Placeholder $map['LAB_SECRET']) { Set-EnvValue $cmsPath 'LAB_SECRET' (New-HexSecret 24) }
  if (Test-Placeholder $map['DIRECTUS_ADMIN_EMAIL']) { Set-EnvValue $cmsPath 'DIRECTUS_ADMIN_EMAIL' $script:DefaultDirectusEmail }
  if (Test-Placeholder $map['DIRECTUS_ADMIN_PASSWORD']) { Set-EnvValue $cmsPath 'DIRECTUS_ADMIN_PASSWORD' $script:DefaultDirectusPassword }
  Ensure-EnvValue $cmsPath 'DIRECTUS_PUBLIC_URL' 'http://localhost:8055'
  Ensure-EnvValue $cmsPath 'WEB_ORIGIN' 'http://localhost:3000'
  Ensure-EnvValue $cmsPath 'PAYLOAD_URL' 'http://host.docker.internal:3002'
  Ensure-EnvValue $cmsPath 'PAYLOAD_PUBLIC_URL' 'http://localhost:3002'
  Ensure-EnvValue $cmsPath 'KEYSTONE_URL' 'http://host.docker.internal:3003'
  Ensure-EnvValue $cmsPath 'KEYSTONE_PUBLIC_URL' 'http://localhost:3003'

  # run.cmd up keeps the Next.js app on the host, so Directus must reach it
  # through host.docker.internal rather than the production-only "web" service.
  $map = Read-EnvFile $cmsPath
  if (Test-Placeholder $map['MOCK_API_URL'] -or $map['MOCK_API_URL'] -eq 'http://web:3000') {
    Set-EnvValue $cmsPath 'MOCK_API_URL' 'http://host.docker.internal:3000'
  }

  # --- Payload ------------------------------------------------------------
  $map = Read-EnvFile $payloadPath
  if (Test-Placeholder $map['PAYLOAD_SECRET']) { Set-EnvValue $payloadPath 'PAYLOAD_SECRET' (New-HexSecret 32) }
  if (Test-Placeholder $map['PAYLOAD_ADMIN_EMAIL']) { Set-EnvValue $payloadPath 'PAYLOAD_ADMIN_EMAIL' $script:DefaultPayloadEmail }
  if (Test-Placeholder $map['PAYLOAD_ADMIN_PASSWORD']) { Set-EnvValue $payloadPath 'PAYLOAD_ADMIN_PASSWORD' $script:DefaultPayloadPassword }
  if (Test-Placeholder $map['PAYLOAD_SERVICE_EMAIL']) { Set-EnvValue $payloadPath 'PAYLOAD_SERVICE_EMAIL' $script:DefaultPayloadServiceEmail }
  if (Test-Placeholder $map['PAYLOAD_SERVICE_PASSWORD']) { Set-EnvValue $payloadPath 'PAYLOAD_SERVICE_PASSWORD' $script:DefaultPayloadServicePassword }
  Ensure-EnvValue $payloadPath 'DATABASE_URL' 'file:./data/payload.db'
  Ensure-EnvValue $payloadPath 'WEB_ORIGIN' 'http://localhost:3000'
  Ensure-EnvValue $payloadPath 'MEDIA_DIR' './media'

  if (Test-Placeholder $map['PAYLOAD_PUBLIC_SERVER_URL'] -or $map['PAYLOAD_PUBLIC_SERVER_URL'] -match ':3001/?$') {
    Set-EnvValue $payloadPath 'PAYLOAD_PUBLIC_SERVER_URL' 'http://localhost:3002'
  }

  # --- Keystone -----------------------------------------------------------
  $map = Read-EnvFile $keystonePath
  if (Test-Placeholder $map['SESSION_SECRET']) { Set-EnvValue $keystonePath 'SESSION_SECRET' (New-HexSecret 32) }
  if (Test-Placeholder $map['KEYSTONE_ADMIN_EMAIL']) { Set-EnvValue $keystonePath 'KEYSTONE_ADMIN_EMAIL' $script:DefaultKeystoneEmail }
  if (Test-Placeholder $map['KEYSTONE_ADMIN_PASSWORD']) { Set-EnvValue $keystonePath 'KEYSTONE_ADMIN_PASSWORD' $script:DefaultKeystonePassword }
  Ensure-EnvValue $keystonePath 'DATABASE_URL' 'file:./data/keystone.db'
  Ensure-EnvValue $keystonePath 'PORT' '3003'
  Ensure-EnvValue $keystonePath 'WEB_ORIGIN' 'http://localhost:3000'
  Ensure-EnvValue $keystonePath 'KEYSTONE_PUBLIC_URL' 'http://localhost:3003'

  # --- Shared secrets -----------------------------------------------------
  # Payload validates the key itself, so payload/.env wins if it is set.
  $cms = Read-EnvFile $cmsPath
  $payload = Read-EnvFile $payloadPath
  $keystone = Read-EnvFile $keystonePath

  $payloadKey = $payload['PAYLOAD_API_KEY']
  if (Test-Placeholder $payloadKey) { $payloadKey = $cms['PAYLOAD_API_KEY'] }
  if (Test-Placeholder $payloadKey) { $payloadKey = New-HexSecret 24 }
  Set-EnvValue $payloadPath 'PAYLOAD_API_KEY' $payloadKey
  Set-EnvValue $cmsPath 'PAYLOAD_API_KEY' $payloadKey

  # Keystone validates LUMINA_SECRET itself, so keystone/.env wins.
  $keystoneSecret = $keystone['LUMINA_SECRET']
  if (Test-Placeholder $keystoneSecret) { $keystoneSecret = $cms['KEYSTONE_SECRET'] }
  if (Test-Placeholder $keystoneSecret) { $keystoneSecret = New-HexSecret 32 }
  Set-EnvValue $keystonePath 'LUMINA_SECRET' $keystoneSecret
  Set-EnvValue $cmsPath 'KEYSTONE_SECRET' $keystoneSecret

  $cms = Read-EnvFile $cmsPath
  $directusToken = $cms['DIRECTUS_ADMIN_TOKEN']
  $labSecret = $cms['LAB_SECRET']

  # --- Frontend -----------------------------------------------------------
  $frontendExists = Test-Path -LiteralPath $frontendPath
  if (-not $frontendExists) { Write-Info '  created frontend/.env.local' }

  Ensure-EnvValue $frontendPath 'DIRECTUS_URL' 'http://localhost:8055'
  Set-EnvValue   $frontendPath 'DIRECTUS_TOKEN' $directusToken
  Set-EnvValue   $frontendPath 'LAB_SECRET' $labSecret
  Ensure-EnvValue $frontendPath 'PAYLOAD_URL' 'http://localhost:3002'
  Ensure-EnvValue $frontendPath 'PAYLOAD_PUBLIC_URL' 'http://localhost:3002'
  Set-EnvValue   $frontendPath 'PAYLOAD_API_KEY' $payloadKey
  Ensure-EnvValue $frontendPath 'KEYSTONE_URL' 'http://localhost:3003'
  Ensure-EnvValue $frontendPath 'KEYSTONE_PUBLIC_URL' 'http://localhost:3003'
  Set-EnvValue   $frontendPath 'KEYSTONE_SECRET' $keystoneSecret

  # An empty DIRECTUS_WS_URL is valid (the app derives it), so only fill it in
  # when the key is genuinely absent.
  $frontendMap = Read-EnvFile $frontendPath
  if (-not $frontendMap.ContainsKey('DIRECTUS_WS_URL')) {
    Set-EnvValue $frontendPath 'DIRECTUS_WS_URL' 'ws://localhost:8055/websocket'
  }

  Write-Info '  environment files are ready'
}

function Install-Dependencies([bool]$ForceReinstall) {
  foreach ($directory in @('payload', 'keystone', 'frontend')) {
    if ($ForceReinstall -or -not (Test-NodeModulesReady $directory)) {
      Write-Info "  $directory`: npm ci"
      Invoke-Npm $directory @('ci', '--no-audit', '--no-fund')
    } else {
      Write-Info "  $directory`: node_modules ready (use setup -Force to reinstall)"
    }
  }
}

function Write-Credentials {
  $cms = Read-EnvFile (Join-Path $script:Root 'cms\.env')
  $payload = Read-EnvFile (Join-Path $script:Root 'payload\.env')
  $keystone = Read-EnvFile (Join-Path $script:Root 'keystone\.env')

  Write-Host ''
  Write-Host 'Local development credentials:' -ForegroundColor Cyan
  Write-Host "  Directus  $($cms['DIRECTUS_ADMIN_EMAIL']) / $($cms['DIRECTUS_ADMIN_PASSWORD'])"
  Write-Host "  Payload   $($payload['PAYLOAD_ADMIN_EMAIL']) / $($payload['PAYLOAD_ADMIN_PASSWORD'])"
  Write-Host "  Keystone  $($keystone['KEYSTONE_ADMIN_EMAIL']) / $($keystone['KEYSTONE_ADMIN_PASSWORD'])"
  Write-Host ''
  Write-Host 'Change these before exposing any port beyond localhost.' -ForegroundColor DarkGray
}

# ---------------------------------------------------------------------------
# Process management
# ---------------------------------------------------------------------------

function Start-AppService([string]$Name, [string]$Directory) {
  if (Test-ProcessRunning $Name) {
    Write-Info "  $Name already running (pid $(Get-StoredPid $Name))"
    return
  }

  if ($Name -ne 'frontend' -and (Test-Healthy $Name)) {
    Write-Info "  $Name already responding on :$(Get-ServicePort $Name) (started outside run.cmd)"
    return
  }

  $port = Get-ServicePort $Name
  if (Test-PortInUse $port) {
    if ($Name -eq 'frontend') {
      Fail "port 3000 is in use (Docker 'web' container?). Run .\run.cmd down first."
    }
    Fail "port $port is in use by another process; stop it first."
  }

  New-Item -ItemType Directory -Force -Path $script:RunDir | Out-Null
  $log = Get-LogFile $Name
  Set-Content -LiteralPath $log -Value '' -Encoding ASCII

  $serviceDirectory = Join-Path $script:Root $Directory
  $launcher = Join-Path $script:RunDir "$Name.cmd"
  $launcherLines = @(
    '@echo off',
    "cd /d `"$serviceDirectory`"",
    "npm run dev > `"$log`" 2>&1"
  )
  Set-Content -LiteralPath $launcher -Value $launcherLines -Encoding ASCII

  $process = Start-Process -FilePath $launcher -WindowStyle Hidden -PassThru
  Set-Content -LiteralPath (Get-PidFile $Name) -Value $process.Id -Encoding ASCII
  Write-Info "  $Name started (pid $($process.Id), log .run\$Name.log)"
}

function Stop-AppService([string]$Name) {
  $processId = Get-StoredPid $Name
  $pidFile = Get-PidFile $Name

  if (Test-Path -LiteralPath $pidFile) {
    Remove-Item -LiteralPath $pidFile -Force
  }
  if ($processId -le 0) { return }
  if ($null -eq (Get-Process -Id $processId -ErrorAction SilentlyContinue)) { return }

  & taskkill.exe /PID $processId /T /F *> $null
  Write-Info "  $Name stopped"
}

# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

function Invoke-Setup([bool]$ForceReinstall) {
  Require-Command 'node'
  Require-Command 'npm.cmd'
  Require-Command 'docker'

  Write-Step 'checking prerequisites'
  Test-NodeVersion
  Write-Info "  docker $(& docker --version)"

  Write-Step 'environment files'
  Initialize-Environment

  Write-Step 'data directories'
  Initialize-DataDirectories
  Write-Info '  cms/data, payload/data, payload/media, keystone/data'

  Write-Step 'dependencies'
  Install-Dependencies $ForceReinstall

  Write-Credentials
  Write-Host ''
  Write-Info 'Setup complete. Start everything with: .\run.cmd up'
}

function Invoke-Up {
  Require-Command 'node'
  Require-Command 'npm.cmd'
  Require-Command 'docker'
  if (-not (Test-Docker)) {
    Fail 'Docker is not running. Start Docker Desktop, then run .\run.cmd up again.'
  }

  $required = @(
    'cms\.env',
    'payload\.env',
    'keystone\.env',
    'frontend\.env.local'
  )
  foreach ($file in $required) {
    if (-not (Test-Path -LiteralPath (Join-Path $script:Root $file))) {
      Fail "$file is missing; run .\run.cmd setup first."
    }
  }

  Initialize-DataDirectories

  $freshDirectus = -not (Test-Path -LiteralPath (Join-Path $script:Root 'cms\data\database\data.db'))
  $freshPayload = -not (Test-Path -LiteralPath (Join-Path $script:Root 'payload\data\payload.db'))

  if (Test-ComposeServiceRunning 'web') {
    Write-Step 'stopping Docker web (the dev frontend needs port 3000)'
    Invoke-Compose stop web
  }

  Write-Step 'Directus'
  Invoke-Compose up -d directus
  if (-not (Wait-For 'directus' (Get-ServiceHealthUrl 'directus') 120)) {
    Show-ServiceFailure 'directus'
    Fail 'Directus did not become healthy.'
  }

  if ($freshDirectus) {
    Write-Step 'first run: seeding Directus'
    Invoke-Compose exec -T directus node /seed/seed.mjs
  }

  if ($freshPayload) {
    Write-Step 'first run: seeding Payload'
    Invoke-Npm 'payload' @('run', 'seed')
  }

  Write-Step 'Payload'
  Start-AppService 'payload' 'payload'
  if (-not (Wait-ForApp 'payload' 180)) {
    Show-ServiceFailure 'payload'
    Fail 'Payload did not become healthy.'
  }

  Write-Step 'Keystone'
  Start-AppService 'keystone' 'keystone'
  if (-not (Wait-ForApp 'keystone' 180)) {
    Show-ServiceFailure 'keystone'
    Fail 'Keystone did not become healthy.'
  }

  Write-Step 'Lumina Academy'
  Start-AppService 'frontend' 'frontend'
  if (-not (Wait-ForApp 'frontend' 180)) {
    Show-ServiceFailure 'frontend'
    Fail 'The frontend did not become healthy.'
  }

  Write-Host ''
  Write-Host 'Lumina Academy  http://localhost:3000' -ForegroundColor Green
  Write-Host 'Directus Studio http://localhost:8055'
  Write-Host 'Payload Admin   http://localhost:3002/admin'
  Write-Host 'Keystone Admin  http://localhost:3003/'
  Write-Host ''
  Write-Host 'Next: .\run.cmd status | .\run.cmd logs | .\run.cmd down'
}

function Invoke-Down {
  Write-Step 'host services'
  foreach ($service in $script:HostServices) {
    Stop-AppService $service
  }

  if ((Get-Command docker -ErrorAction SilentlyContinue) -and (Test-Docker)) {
    Write-Step 'docker'
    Invoke-Compose stop
  }
  Write-Info 'stopped'
}

function Invoke-Status {
  $rows = @()
  foreach ($service in @('directus', 'frontend', 'payload', 'keystone')) {
    if ($service -eq 'directus') {
      if ((Test-Docker) -and (Test-ComposeServiceRunning 'directus')) {
        $state = 'docker'
      } else {
        $state = 'stopped'
      }
    } elseif (Test-ProcessRunning $service) {
      $state = "pid $(Get-StoredPid $service)"
    } elseif (Test-Healthy $service) {
      $state = 'external'
    } else {
      $state = 'stopped'
    }

    $rows += [pscustomobject]@{
      SERVICE = $service
      STATE   = $state
      URL     = (Get-ServiceHealthUrl $service)
    }
  }

  $rows | Format-Table -AutoSize

  foreach ($service in @('directus', 'payload', 'keystone', 'frontend')) {
    if (Test-Healthy $service) {
      Write-Host ("  {0,-9} ok" -f $service) -ForegroundColor Green
    } else {
      Write-Host ("  {0,-9} FAIL" -f $service) -ForegroundColor Red
    }
  }

  if ((Test-PortInUse 3000) -and -not (Test-ProcessRunning 'frontend')) {
    Write-Warn 'port 3000 is held by another process (possibly the Docker web container); the frontend dev server cannot start.'
  }
}

function Show-LogTail([string]$Name) {
  $log = Get-LogFile $Name
  if (-not (Test-Path -LiteralPath $log)) {
    Fail "no log yet: .run\$Name.log"
  }
  Get-Content -LiteralPath $log -Tail 100 -Wait
}

function Follow-AllLogs {
  New-Item -ItemType Directory -Force -Path $script:RunDir | Out-Null
  $logs = @(Get-ChildItem -LiteralPath $script:RunDir -Filter '*.log' -ErrorAction SilentlyContinue)
  if ($logs.Count -eq 0) { Fail 'no service logs yet' }

  $positions = @{}
  foreach ($file in $logs) {
    Write-Host ''
    Write-Host "===== $($file.Name) =====" -ForegroundColor Cyan
    foreach ($line in @(Get-Content -LiteralPath $file.FullName -Tail 40 -ErrorAction SilentlyContinue)) {
      Write-Host $line
    }
    $positions[$file.FullName] = $file.Length
  }

  Write-Host ''
  Write-Host 'Following logs. Press Ctrl+C to stop.' -ForegroundColor DarkGray

  while ($true) {
    Start-Sleep -Milliseconds 750
    foreach ($path in @($positions.Keys)) {
      $file = Get-Item -LiteralPath $path -ErrorAction SilentlyContinue
      if ($null -eq $file) { continue }

      $position = [int64]$positions[$path]
      if ($file.Length -lt $position) { $position = 0 }
      if ($file.Length -le $position) { continue }

      $stream = [System.IO.File]::Open(
        $path,
        [System.IO.FileMode]::Open,
        [System.IO.FileAccess]::Read,
        [System.IO.FileShare]::ReadWrite
      )
      try {
        $stream.Seek($position, [System.IO.SeekOrigin]::Begin) | Out-Null
        $remaining = [int]($file.Length - $position)
        $buffer = New-Object byte[] $remaining
        $read = $stream.Read($buffer, 0, $remaining)
        if ($read -gt 0) {
          $text = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $read)
          Write-Host $text -NoNewline
          $positions[$path] = $position + $read
        }
      } finally {
        $stream.Dispose()
      }
    }
  }
}

function Invoke-Logs([string]$Target) {
  switch ($Target) {
    'directus' {
      & docker compose -f $script:ComposeFile logs -f --tail=100 directus
    }
    { $_ -in @('frontend', 'payload', 'keystone') } {
      Show-LogTail $Target
    }
    'all' {
      Follow-AllLogs
    }
    default {
      Fail 'usage: .\run.cmd logs [directus|payload|keystone|frontend|all]'
    }
  }
}

function Invoke-Seed {
  Require-Command 'node'
  Require-Command 'npm.cmd'
  Require-Command 'docker'
  if (-not (Test-Docker)) { Fail 'Docker is not running.' }
  if (-not (Test-ComposeServiceRunning 'directus')) {
    Fail 'Directus is not running; run .\run.cmd up first.'
  }

  $payloadWasRunning = Test-ProcessRunning 'payload'

  Write-Step 'Directus seed'
  Invoke-Compose exec -T directus node /seed/seed.mjs

  if ($payloadWasRunning) {
    Stop-AppService 'payload'
  }
  Write-Step 'Payload seed'
  Invoke-Npm 'payload' @('run', 'seed')
  if ($payloadWasRunning) {
    Start-AppService 'payload' 'payload'
    if (-not (Wait-ForApp 'payload' 180)) {
      Show-ServiceFailure 'payload'
      Fail 'Payload did not restart.'
    }
  }

  if (Test-ProcessRunning 'keystone') {
    Write-Step 'Keystone is running; it seeds itself on connection (skipped)'
  } else {
    Write-Step 'Keystone seed'
    Invoke-Npm 'keystone' @('run', 'seed')
  }

  Write-Info 'seed complete'
}

function Invoke-Reset([bool]$SkipPrompt) {
  if (-not $SkipPrompt) {
    $answer = Read-Host 'Delete all local databases (including learner submissions) and reseed? [y/N]'
    if ($answer -notmatch '^[Yy]') {
      Write-Info 'cancelled'
      return
    }
  }

  Invoke-Down
  Write-Step 'deleting databases'

  $patterns = @(
    'cms\data\database\data.db*',
    'payload\data\payload.db*',
    'keystone\data\keystone.db*'
  )
  foreach ($pattern in $patterns) {
    Get-ChildItem -Path (Join-Path $script:Root $pattern) -Force -ErrorAction SilentlyContinue |
      Remove-Item -Force -ErrorAction SilentlyContinue
  }

  Invoke-Up
}

function Show-Usage {
  Write-Host @'
Usage: .\run.cmd <command>

  setup     Create env files, generate matching secrets, install dependencies
  start     setup + up (one command for a fresh checkout)
  up        Start Directus (Docker) + Payload, Keystone, frontend (host)
  down      Stop host services and the Docker stack
  restart   down + up
  status    Process and health summary
  logs      Follow logs: .\run.cmd logs [directus|payload|keystone|frontend|all]
  seed      Reseed Directus, Payload, and Keystone
  reset     Delete local databases, restart, reseed (--yes to skip prompt)

Options:
  -Force    setup/start: reinstall node_modules
'@
}

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

$command = 'help'
$rest = @()

if ($args.Count -gt 0) {
  $command = ([string]$args[0]).ToLowerInvariant()
  if ($args.Count -gt 1) {
    $rest = @($args[1..($args.Count - 1)])
  }
}

$forceReinstall = ($rest -contains '-Force') -or ($rest -contains '--force')
$skipPrompt = ($rest -contains '-Yes') -or ($rest -contains '--yes')
$logTarget = 'all'
if ($command -eq 'logs') {
  $candidate = @($rest | Where-Object { $_ -notmatch '^-' } | Select-Object -First 1)
  if ($candidate.Count -gt 0) { $logTarget = ([string]$candidate[0]).ToLowerInvariant() }
}

switch ($command) {
  'setup'   { Invoke-Setup $forceReinstall }
  'start'   { Invoke-Setup $forceReinstall; Invoke-Up }
  'up'      { Invoke-Up }
  'down'    { Invoke-Down }
  'restart' { Invoke-Down; Invoke-Up }
  'status'  { Invoke-Status }
  'logs'    { Invoke-Logs $logTarget }
  'seed'    { Invoke-Seed }
  'reset'   { Invoke-Reset $skipPrompt }
  'help'    { Show-Usage }
  '-h'      { Show-Usage }
  '--help'  { Show-Usage }
  default   { Show-Usage }
}
