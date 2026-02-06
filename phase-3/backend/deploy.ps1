# PowerShell script to deploy backend to Hugging Face Spaces
# Usage: .\deploy.ps1

Write-Host "🚀 Deploying Backend to Hugging Face Spaces..." -ForegroundColor Cyan

# Check if HF Space directory exists
$hfSpacePath = "..\Hackthon2Phase3"
if (-not (Test-Path $hfSpacePath)) {
    Write-Host "❌ Hugging Face Space directory not found at: $hfSpacePath" -ForegroundColor Red
    Write-Host "Please clone the Space first:" -ForegroundColor Yellow
    Write-Host "  git clone https://huggingface.co/spaces/aleemakhan/Hackthon2Phase3" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found HF Space directory" -ForegroundColor Green

# Files to copy
$filesToCopy = @(
    "app.py",
    "Dockerfile",
    "requirements.txt",
    ".dockerignore",
    "README.md",
    "alembic.ini"
)

# Directories to copy
$dirsToCopy = @(
    "src",
    "alembic"
)

Write-Host "📋 Copying files..." -ForegroundColor Cyan

# Copy files
foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $hfSpacePath -Force
        Write-Host "  ✅ Copied $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  File not found: $file" -ForegroundColor Yellow
    }
}

# Copy directories
foreach ($dir in $dirsToCopy) {
    if (Test-Path $dir) {
        $destPath = Join-Path $hfSpacePath $dir
        if (Test-Path $destPath) {
            Remove-Item $destPath -Recurse -Force
        }
        Copy-Item -Recurse $dir -Destination $hfSpacePath -Force
        Write-Host "  ✅ Copied directory $dir" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Directory not found: $dir" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Files copied successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Navigate to HF Space directory: cd $hfSpacePath" -ForegroundColor Yellow
Write-Host "  2. Review changes: git status" -ForegroundColor Yellow
Write-Host "  3. Add files: git add ." -ForegroundColor Yellow
Write-Host "  4. Commit: git commit -m 'Add FastAPI backend'" -ForegroundColor Yellow
Write-Host "  5. Push: git push" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔐 Don't forget to set secrets in HF Space settings:" -ForegroundColor Cyan
Write-Host "  - DATABASE_URL" -ForegroundColor Yellow
Write-Host "  - BETTER_AUTH_SECRET" -ForegroundColor Yellow
Write-Host "  - OPENAI_API_KEY" -ForegroundColor Yellow
Write-Host "  - CORS_ORIGINS (optional)" -ForegroundColor Yellow

