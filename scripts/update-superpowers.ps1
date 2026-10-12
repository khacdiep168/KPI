# Script to update Superpowers repository and synchronize skills in KPT_TKV project
Write-Host "Updating Superpowers submodule from upstream..." -ForegroundColor Cyan
git submodule update --remote --merge .agents/superpowers

Write-Host "Synchronizing skills to .agents/skills/..." -ForegroundColor Cyan
Copy-Item -Path ".agents/superpowers/skills/*" -Destination ".agents/skills" -Recurse -Force

Write-Host "Superpowers skills updated successfully!" -ForegroundColor Green
