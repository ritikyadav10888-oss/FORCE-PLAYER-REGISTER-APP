$env:REACT_NATIVE_PACKAGER_HOSTNAME = "192.168.1.173"
Write-Host "Forcing Expo to use Wi-Fi IP: $env:REACT_NATIVE_PACKAGER_HOSTNAME"
npx expo start --clear
