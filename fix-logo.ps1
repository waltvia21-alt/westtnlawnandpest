$content = [System.IO.File]::ReadAllText("C:\Users\User\Claude Code website\LOGO\SVG TXT", [System.Text.Encoding]::UTF8)
$start = $content.IndexOf('<path fill="#FEFEFE"')
$green = $content.IndexOf('<path fill="#328A36"')
Write-Host "White at: $start, Green at: $green"
$result = $content.Substring(0, $start) + $content.Substring($green)
[System.IO.File]::WriteAllText("C:\Users\User\Claude Code website\images\logo-transparent.svg", $result, [System.Text.Encoding]::UTF8)
Write-Host "Done"
