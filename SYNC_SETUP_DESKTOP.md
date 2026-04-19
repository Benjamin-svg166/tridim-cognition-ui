# Setup Instructions for Desktop PC

## Step 1: Verify OneDrive Sync
1. Open OneDrive and ensure Documents folder is syncing
2. Wait for `cognition-board-ui-react` folder to appear in:
   ```
   C:\Users\[YourUsername]\Documents\cognition-board-ui-react
   ```
3. Source files (.js, .jsx, .md, etc.) should sync automatically
4. `node_modules` and `build` folders will NOT sync (by design)

## Step 2: Open Project in VS Code
```powershell
cd C:\Users\[YourUsername]\Documents\cognition-board-ui-react
code .
```

## Step 3: Install Dependencies
The `node_modules` folder doesn't sync, so install on desktop:
```bash
npm install
```

## Step 4: Build the Project
The `build` folder doesn't sync, so create it on desktop:
```bash
npm run build
```

## Step 5: Run Development Server
```bash
npm start
```

## Step 6: Exclude Build Folders on Desktop Too
After the first build, exclude from OneDrive on your desktop:
```powershell
.\exclude-from-onedrive.ps1
```

---

## Why This Setup?

**What DOES sync via OneDrive:**
- ✅ All source code (.js, .jsx, .css files)
- ✅ Configuration files (package.json, .gitignore)
- ✅ Documentation (.md files)
- ✅ Chess analysis scripts
- ✅ Your VS Code settings (if Settings Sync is enabled)

**What DOESN'T sync (by design):**
- ❌ `node_modules/` - Too many files, causes OneDrive conflicts
- ❌ `build/` - Generated files, can be rebuilt anytime
- ❌ `.git/` objects - Use Git for version control instead

## Benefits:
- No OneDrive conflicts during npm install
- Faster sync (only 10MB of source vs 200MB+ with node_modules)
- Each machine has optimized local builds
- No file locking issues during development

## Alternative: Use Git Instead
For better version control between machines:
```bash
# On laptop - commit and push changes
git add .
git commit -m "Update feature"
git push

# On desktop - pull changes
git pull
npm install  # If package.json changed
npm run build
```
