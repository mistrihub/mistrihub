# MistriHub Android App

Android-only Expo app for MistriHub. This app uses the same Supabase backend as the website.

## Features

- Home page with MistriHub branding
- Search workers by city/location
- Category filter
- Worker cards with rating, experience, price, WhatsApp
- Public worker profile with call, WhatsApp, service details, reviews
- Customer review submit
- Latest work photos/videos feed
- Worker signup/login with Supabase Auth
- Worker dashboard
- Profile photo upload
- Worker profile create/edit
- Work photo/video upload
- Android Play Store ready config

## Folder

This app lives inside:

```txt
android-app/
```

## Setup

1. Open terminal inside `android-app`.

```bash
cd android-app
npm install
```

2. Copy env file if needed:

```bash
copy .env.example .env
```

3. Add your Supabase anon key in `.env`.

```txt
EXPO_PUBLIC_SUPABASE_URL=https://bdxdczvcgldnezpclycv.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_SITE_URL=https://mistrihub.in
```

## Test on Android phone

1. Install Expo Go from Play Store.
2. Run:

```bash
npm run start
```

3. Scan QR code with Expo Go.

## Build APK for testing

```bash
npm install -g eas-cli
npx eas login
npx eas build:configure
npm run build:preview
```

This creates an APK for phone testing.

## Build AAB for Play Store

```bash
npm run build:android
```

Play Store needs the `.aab` file from EAS.

## Play Store checklist

You need:

- Google Play Console account
- App name: MistriHub
- Package name: `in.mistrihub.app`
- App icon already added in `assets/icon.png`
- Feature graphic: create from your MistriHub banner
- Screenshots from Android app
- Privacy policy URL: `https://mistrihub.in/privacy`
- Terms URL: `https://mistrihub.in/terms`
- Contact email
- App category: Business or Lifestyle
- Data safety form: app uses email login, media upload, phone/WhatsApp contact, and user-generated content

## Important Supabase setup

The app expects these Supabase tables/buckets from the website:

- `workers`
- `reviews`
- `work_posts`
- storage bucket: `worker-images`

If upload fails, check that `worker-images` bucket exists and storage policies allow logged-in users to upload.

## GitHub upload

Upload the complete `android-app` folder.

Do not upload:

```txt
android-app/node_modules/
```

You can upload `.env.example`, but do not upload `.env` if you want to keep keys out of GitHub.
