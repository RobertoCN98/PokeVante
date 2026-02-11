Add-Type -AssemblyName System.Drawing
$files = Get-ChildItem "c:\Users\adrib\Desktop\PokeVante\public\assets\sprites" -Filter "*.png"
foreach ($file in $files) {
    try {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        Write-Output "$($file.Name): $($img.Width) x $($img.Height)"
        $img.Dispose()
    } catch {
        Write-Output "Error reading $($file.Name): $_"
    }
}
