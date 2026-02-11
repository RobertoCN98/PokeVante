Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("c:\Users\adrib\Desktop\PokeVante\public\assets\sprites\jugador.png")
Write-Output "jugador.png: $($img.Width) x $($img.Height)"
$img.Dispose()
