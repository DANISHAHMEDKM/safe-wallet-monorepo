# Safe Mobile App 👋

## Setup the project

It is pretty straight

```bash
npm install
```

## Running the App

```bash
   npx expo run:ios --device
```

or for android

```bash
   npx expo run:android --device
```

## Running the storybook

1. run the storybook command on your terminal

```bash
   npm run storybook
```

2. press `i` for ios or `a` for android

## How to run the e2e tests

We're using DETOX for e2e. Before run the tests script, you shuold first install DETOX by following this steps bellow:

### 1. install DETOX cli:

```bash
npm install detox-cli --global
```

### 2. [MacOS Only] applesimutils

This tool is required by Detox to work with iOS simulators. The recommended way to install applesimutils is via Homebrew:

```bash
brew tap wix/brew
brew install applesimutils
```

### 3. Build the detox configs

for IOS:

```bash
detox build --configuration ios.sim.debug
```

or for Android:

```bash
detox build --configuration android.emu.debug
```

### 4. Run the tests

Since this is a debug configuration, you need to have React Native packager running in parallel before you start Detox tests:

```bash
npx expo start
```

in another terminal, you can run:

for ios:

```bash
detox test --configuration ios.sim.debug
```

or for android:

```bash
detox test --configuration android.emu.debug
```
