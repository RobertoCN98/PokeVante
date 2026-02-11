Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("c:\Users\adrib\Desktop\PokeVante\public\assets\sprites\jugadorMAbajo.png")
Write-Output "jugadorMAbajo.png: $($img.Width) x $($img.Height)"
$img.Dispose()
