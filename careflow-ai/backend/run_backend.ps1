Write-Host "Starting CareFlow AI Backend on http://localhost:9090..."
if (Test-Path "target/careflow-backend-0.0.1-SNAPSHOT.jar") {
    java -jar target/careflow-backend-0.0.1-SNAPSHOT.jar
} else {
    $jars = (Get-ChildItem -Path "$env:USERPROFILE\.m2\repository" -Filter "*.jar" -Recurse | Where-Object { $_.FullName -notmatch "slf4j-api-1\." } | Select-Object -ExpandProperty FullName) -join ";"
    $classpath = "target/classes;$jars"
    java -cp $classpath com.careflow.CareFlowApplication
}
