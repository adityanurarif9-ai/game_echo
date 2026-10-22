param(
  [string]$Source,
  [string]$Destination
)
$ErrorActionPreference='Stop'
if (-not $Source -and -not $Destination) {
  $spriteDirectory=Join-Path $PSScriptRoot '..\public\sprites'
  $frames=Get-ChildItem -LiteralPath $spriteDirectory -Filter '*.png' -File
  foreach ($frame in $frames) {
    $temp=Join-Path $frame.DirectoryName ($frame.BaseName+'.sharp.png')
    & $PSCommandPath -Source $frame.FullName -Destination $temp
    Move-Item -LiteralPath $temp -Destination $frame.FullName -Force
  }
  Write-Output "Processed $($frames.Count) sprite frames"
  return
}
if (-not $Source -or -not $Destination) { throw 'Provide both Source and Destination, or neither to process every sprite.' }
Add-Type -AssemblyName System.Drawing
$inputBitmap = [System.Drawing.Bitmap]::new($Source)
$outputBitmap = [System.Drawing.Bitmap]::new($inputBitmap.Width, $inputBitmap.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
try {
  for ($y=0; $y -lt $inputBitmap.Height; $y++) {
    for ($x=0; $x -lt $inputBitmap.Width; $x++) {
      $center=$inputBitmap.GetPixel($x,$y)
      if ($center.A -lt 32) { $outputBitmap.SetPixel($x,$y,[System.Drawing.Color]::Transparent); continue }
      $neighbors=@()
      foreach ($offset in @(@(-1,0),@(1,0),@(0,-1),@(0,1))) {
        $nx=$x+$offset[0]; $ny=$y+$offset[1]
        if ($nx -ge 0 -and $nx -lt $inputBitmap.Width -and $ny -ge 0 -and $ny -lt $inputBitmap.Height) {
          $neighbor=$inputBitmap.GetPixel($nx,$ny)
          if ($neighbor.A -ge 96) { $neighbors += $neighbor }
        }
      }
      $alpha=[Math]::Min(255,[Math]::Max(0,[Math]::Round(($center.A-32)*255/223)))
      if ($neighbors.Count -eq 0) {
        $outputBitmap.SetPixel($x,$y,[System.Drawing.Color]::FromArgb([int]$alpha,$center.R,$center.G,$center.B))
        continue
      }
      $red=0; $green=0; $blue=0
      foreach ($neighbor in $neighbors) { $red+=$neighbor.R; $green+=$neighbor.G; $blue+=$neighbor.B }
      $factor=0.55/$neighbors.Count
      $r=[Math]::Min(255,[Math]::Max(0,[Math]::Round($center.R*1.55-$red*$factor)))
      $g=[Math]::Min(255,[Math]::Max(0,[Math]::Round($center.G*1.55-$green*$factor)))
      $b=[Math]::Min(255,[Math]::Max(0,[Math]::Round($center.B*1.55-$blue*$factor)))
      $outputBitmap.SetPixel($x,$y,[System.Drawing.Color]::FromArgb([int]$alpha,[int]$r,[int]$g,[int]$b))
    }
  }
  $outputBitmap.Save($Destination,[System.Drawing.Imaging.ImageFormat]::Png)
} finally {
  $outputBitmap.Dispose()
  $inputBitmap.Dispose()
}
