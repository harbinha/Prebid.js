# Gannett Build Instructions

## Install
```bash
git clone https://github.com/prebid/Prebid.js.git
cd Prebid.js
yarn install
```

## Checkout appropriate version
```bash
git checkout tags/$(<version.txt)
```

## Build
```bash
git checkout master -- modules.json
gulp build --modules=modules.json
```

## Publish to CDN
```bash
gsutil cp ./build/dist/prebid.js gs://ads-gci-www-gannett-cdn-com/vendor/pbjsandwich.min.js
```

# Adding a Module
Add module name to `modules.json`

# Bumping Prebid Version
- Ensure desired version exists in current tags:
    - `git tag -l | grep "my-desired-version"`
    - If your version is not listed, an upstream merge will be required (see below)
- `echo "my-desired-version" > version.txt`

# Merging Upstream Changes
```bash
git remote add upstream git@github.com:prebid/Prebid.js.git
git checkout [-b] my-update-branch
git fetch upstream --prune
git rebase -i upstream/master my-update-branch
```
Who knows, you might not even have any merge conflicts! :crossed_fingers:
