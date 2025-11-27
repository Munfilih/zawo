param(
  [int]$Port = 5173
)

Write-Host "Installing dependencies (if needed)..."
npm install

Write-Host "Starting Vite dev server (detached)..."
Start-Process -FilePath "npm" -ArgumentList "run dev" -WindowStyle Normal

Start-Sleep -Seconds 2
$url = "http://localhost:$Port"
Write-Host "Opening $url in default browser..."
Start-Process $url
