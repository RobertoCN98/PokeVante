Add-Type -AssemblyName System.Drawing
$param = "jugadorPequeño.png"
$files = Get-ChildItem "c:\Users\adrib\Desktop\PokeVante\public\assets\sprites" -Filter $param
foreach ($file in $files) {
    $img = [System.Drawing.Image]::FromFile($file.FullName)
    Write-Output "TARGET: $($file.Name) : $($img.Width) x $($img.Height)"
    $img.Dispose()
}
