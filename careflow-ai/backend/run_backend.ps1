$jars = (Get-ChildItem -Path "C:\Users\navee\.m2\repository" -Filter "*.jar" -Recurse | Select-Object -ExpandProperty FullName) -join ";"
$classpath = "target/classes;$jars"

Write-Host "Starting CareFlow AI Backend on http://localhost:8080..."
java -cp $classpath com.careflow.CareFlowApplication
