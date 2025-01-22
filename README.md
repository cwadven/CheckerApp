Error: EMFILE: too many open files, watch
    at FSEvent.FSWatcher._handle.onchange (node:internal/fs/watchers:207:21

watchman watch-del-all

## [ Build Android ]

npx expo prebuild -p android --clean

cd android
./gradlew clean
./gradlew assembleRelease
