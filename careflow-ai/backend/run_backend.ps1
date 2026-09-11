# Load .env if present
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not ($line.StartsWith("#"))) {
            $parts = $line.Split("=", 2)
            if ($parts.Length -eq 2) {
                $varName = $parts[0].Trim()
                $varVal = $parts[1].Trim()
                [System.Environment]::SetEnvironmentVariable($varName, $varVal, "Process")
                Set-Item -Path "env:$varName" -Value $varVal
            }
        }
    }
}

Write-Host "Starting CareFlow AI Backend on http://localhost:9090..."
if (Test-Path "target/careflow-backend-0.0.1-SNAPSHOT.jar") {
    java -jar target/careflow-backend-0.0.1-SNAPSHOT.jar
} else {
    $jars = (Get-ChildItem -Path "$env:USERPROFILE\.m2\repository" -Filter "*.jar" -Recurse | Where-Object { $_.FullName -notmatch "slf4j-api-1\." } | Select-Object -ExpandProperty FullName) -join ";"
    $classpath = "target/classes;$jars"
    java -cp $classpath com.careflow.CareFlowApplication
}
