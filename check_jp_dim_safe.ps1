Add-Type -AssemblyName System.Drawing
$file = Get-ChildItem "c:\Users\adrib\Desktop\PokeVante\public\assets\sprites" -Filter "*Peque*.png" | Select-Object -First 1
if ($file) {
    $img = [System.Drawing.Image]::FromFile($file.FullName)
    Write-Output "TARGET: $($file.Name) : $($img.Width) x $($img.Height)"
    $img.Dispose()
} else {
    Write-Output "File not found"
}
