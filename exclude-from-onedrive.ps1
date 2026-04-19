# Exclude development folders from OneDrive sync
# Run this script whenever OneDrive re-enables sync for these folders

Write-Host "Excluding folders from OneDrive sync..." -ForegroundColor Cyan

$projectRoot = "c:\Users\bussi\OneDrive\Documents\tridim-cognition-ui"

$foldersToExclude = @(
    "$projectRoot\node_modules",
    "$projectRoot\build",
    "$projectRoot\cognition-board-ui\node_modules",
    "$projectRoot\cognition-board-ui-fresh\node_modules",
    "$projectRoot\cognition-board-ui-fresh\build"
)

foreach ($folder in $foldersToExclude) {
    if (Test-Path $folder) {
        Write-Host "  ✓ Excluding: $folder" -ForegroundColor Green
        attrib +U "$folder" /S /D 2>$null
    } else {
        Write-Host "  - Skipped (not found): $folder" -ForegroundColor Yellow
    }
}

Write-Host "`nDone! These folders are now local-only." -ForegroundColor Green
Write-Host "OneDrive will not sync them to the cloud." -ForegroundColor Gray
