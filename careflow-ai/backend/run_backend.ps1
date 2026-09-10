$jars = (Get-ChildItem -Path "C:\Users\navee\.m2\repository" -Filter "*.jar" -Recurse | Where-Object { $_.FullName -notmatch "slf4j-api-1\." } | Select-Object -ExpandProperty FullName) -join ";"
$classpath = "target/classes;$jars"

Write-Host "Starting CareFlow AI Backend on http://localhost:9090..."
java -cp $classpath com.careflow.CareFlowApplication
