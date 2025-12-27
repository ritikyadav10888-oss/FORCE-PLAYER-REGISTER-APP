Write-Host "Starting Ngrok on Port 5000..."
npx ngrok http 5000 --log=stdout > ngrok.log 2>&1
