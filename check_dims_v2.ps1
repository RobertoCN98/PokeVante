Add-Type -AssemblyName System.Drawing
$files = Get-ChildItem "c:\Users\adrib\Desktop\PokeVante\public\assets\sprites" -Filter "*.png"
foreach ($file in $files) {
    try {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        $out = "$($file.Name): $($img.Width) x $($img.Height)"
        [Console]::WriteLine($out)
        $img.Dispose()
    } catch {
        [Console]::WriteLine("Error reading $($file.Name)")
    }
}
