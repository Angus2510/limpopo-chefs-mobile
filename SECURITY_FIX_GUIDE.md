# Security Fix Guide - Google Services API Key Exposure

## ⚠️ What Happened

Your `google-services.json` file containing the Firebase API key `AIzaSyArVr9lmFMWvvzdHWROvnff_8Bo8gkeyis` was accidentally committed to your public GitHub repository and detected by Google's security scanner.

## ✅ Immediate Actions Taken

1. Removed `google-services.json` from git tracking
2. Added `google-services.json` and `GoogleService-Info.plist` to `.gitignore`
3. Committed these changes locally

## 🔧 Required Actions (YOU MUST DO THIS)

### 1. Push the Changes to GitHub

Run this command to push the security fix:

```bash
git push
```

### 2. Regenerate the Compromised API Key

**This is the most critical step!** The exposed API key must be rotated.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **limpopochefs-mobile**
3. Navigate to: **APIs & Services → Credentials**
4. Find the API key: `AIzaSyArVr9lmFMWvvzdHWROvnff_8Bo8gkeyis`
5. Click on the key to edit it
6. Click **"Regenerate Key"** button
7. Download the new `google-services.json` file
8. Replace your local `google-services.json` file with the new one

### 3. Add API Key Restrictions

While regenerating, add these restrictions to your new API key:

**Application restrictions:**

- Select: "Android apps"
- Add package name: `com.limpopoChefs.mobile`
- Add SHA-1 certificate fingerprint (from your keystore)

**API restrictions:**

- Restrict to only the APIs you're using:
  - Firebase Cloud Messaging API
  - Firebase Installations API
  - Any other Firebase services you use

### 4. Update EAS Build Secrets

After regenerating the key, you'll need to update your EAS build:

```bash
# The google-services.json should already be in your local directory (not in git)
# EAS will upload it from your local file during build

# Rebuild the app with the new credentials
eas build --platform android --profile production
```

### 5. Remove File from Git History (Optional but Recommended)

The file is still in your git history. To completely remove it:

```bash
# Install BFG Repo Cleaner or use git filter-branch
# WARNING: This rewrites history, coordinate with team if working with others

# Using BFG (recommended):
git clone --mirror https://github.com/Angus2510/limpopo-chefs-mobile.git
bfg --delete-files google-services.json limpopo-chefs-mobile.git
cd limpopo-chefs-mobile.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force

# Or contact GitHub support to purge cached copies
```

## 🔒 Security Best Practices

### For EAS Build

EAS Build handles sensitive files securely:

1. Keep `google-services.json` in your `.gitignore` (already done)
2. Keep the file in your local project directory
3. EAS automatically uploads it during build (it's not stored in git)
4. The file is referenced in `app.json` but not committed to the repo

### For Future Reference

- **Never commit**: API keys, credentials, or service account files
- **Always use**: `.gitignore` for sensitive files
- **Use EAS Secrets**: For environment variables and sensitive config
- **Add restrictions**: Always restrict API keys to specific apps/APIs
- **Monitor regularly**: Check Google Cloud Console for unusual activity

## 📊 Monitoring

After fixing, monitor your Firebase/Google Cloud Console for:

- Unusual API usage
- Unexpected billing charges
- New devices/apps using your API key

## ✅ Verification Checklist

- [ ] Pushed changes to remove file from current tracking
- [ ] Regenerated the compromised API key in Google Cloud Console
- [ ] Downloaded new `google-services.json` locally
- [ ] Added API restrictions to the new key
- [ ] Updated local project with new file
- [ ] Built new app version with EAS
- [ ] (Optional) Removed file from git history
- [ ] Verified no unusual activity in Google Cloud Console

## 📞 Need Help?

- [Firebase Security Best Practices](https://firebase.google.com/docs/projects/api-keys)
- [EAS Build Configuration](https://docs.expo.dev/build/introduction/)
- [Google Cloud Console](https://console.cloud.google.com/)
