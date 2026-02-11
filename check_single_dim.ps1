Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("c:\Users\adrib\Desktop\PokeVante\public\assets\sprites\jugadorMA.png")
Write-Output "jugadorMA.png: $($img.Width) x $($img.Height)"
$img.Dispose()
