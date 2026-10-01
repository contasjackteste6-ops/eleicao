Add-Type -AssemblyName System.Drawing
$filePath = "C:\Users\Jack\Desktop\MULTIATENDIMENTO NOVO\public\eleicoes2026.png"
$outputPath = "C:\Users\Jack\Desktop\MULTIATENDIMENTO NOVO\public\eleicoes2026_transp.png"

$img = [System.Drawing.Bitmap]::FromFile($filePath)
$img.MakeTransparent([System.Drawing.Color]::White)
$img.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()

Remove-Item $filePath -Force
Rename-Item $outputPath $filePath -Force
Write-Host "PNG com fundo transparente criado!"
