Add-Type -AssemblyName System.Drawing
$imagePath = "c:\Users\adrib\Desktop\PokeVante\public\assets\sprites\jugadorPequeño.png"
$img = [System.Drawing.Image]::FromFile($imagePath)
Write-Output "Dimensions: $($img.Width) x $($img.Height)"
$img.Dispose()
