# Read inner content from the downloaded white SVG
$svgFile = "C:\Users\User\Downloads\white svg(1).svg"
$svgRaw = [System.IO.File]::ReadAllText($svgFile, [System.Text.Encoding]::UTF8)

# Extract everything between the opening <svg ...> tag and closing </svg>
$innerMatch = [regex]::Match($svgRaw, '<svg[^>]+>([\s\S]*)</svg>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$innerPaths = $innerMatch.Groups[1].Value.Trim()

$BASE = "C:\Users\User\Claude Code website"
$SKIP = @('logo-preview3.html','logo-preview4.html','logo-preview5.html','logo-preview.html','logo-preview2.html')

# Pattern to match old logo SVG (preserving height)
$pattern = [regex]::new(
    '<svg\s+xmlns="http://www\.w3\.org/2000/svg"\s+viewBox="0 0 420 120"\s+height="(\d+)"\s+aria-hidden="true">[\s\S]*?</svg>',
    [System.Text.RegularExpressions.RegexOptions]::Singleline
)

$totalReplacements = 0

Get-ChildItem -Path $BASE -Filter "*.html" -Recurse | ForEach-Object {
    $file = $_
    if ($SKIP -contains $file.Name) { return }

    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)

    $matches = $pattern.Matches($content)
    if ($matches.Count -eq 0) { return }

    $newContent = $pattern.Replace($content, {
        param($m)
        $h = $m.Groups[1].Value
        return "<svg xmlns=`"http://www.w3.org/2000/svg`" viewBox=`"0 0 1912 535`" height=`"$h`" aria-hidden=`"true`">`n$innerPaths`n</svg>"
    })

    [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
    $rel = $file.FullName.Replace($BASE + "\", "")
    Write-Host "$($matches.Count)x  $rel"
    $totalReplacements += $matches.Count
}

Write-Host ""
Write-Host "Total: $totalReplacements replacements across all files"
