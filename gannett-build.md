# Gannett Build Instructions

## Quickstart
1. [Install `yarn`](https://yarnpkg.com/lang/en/docs/install/)
1. Clone
    ```bash
    git clone https://github.com/GannettDigital/Prebid.js.git
    cd Prebid.js
    ```
1. Run build command
    ```bash
    make build
    ```    
Compiled script will be built to `build/dist/prebid.js`

If you have access to the `ads-gci-www-gannett-cdn-com` Google Cloud bucket and have `gcloud` installed, you can automatically build and upload to the CDN in one step using `make sync`. This also builds and uploads a `dev` (unminified) version.

Details on steps run during this process can be found below in [Build Details](#build-details).

# Adding a Module
Add module name to `modules.json`

# Bumping Prebid Version
- Ensure desired version exists in current tags:
    - `git tag -l | grep "my-desired-version"`
    - If your version is not listed, an upstream merge will be required (see below)
- `echo "my-desired-version" > gannett-version.txt`

# Merging Upstream Changes
```bash
git remote add upstream git@github.com:prebid/Prebid.js.git
git checkout [-b] my-update-branch
git fetch upstream --prune
git rebase -i upstream/master my-update-branch
```
Who knows, you might not even have any merge conflicts! :crossed_fingers:

# Build Details
What happens when I run `make build`/`make sync`?

1. Checkout appropriate version based on contents of [gannett-version.txt](gannett-version.txt)
    ```bash
    git checkout tags/$(<gannett-version.txt)
    ```
1. Checkout `modules.json` from `master` since it won't exist at the tag
    ```bash
    git checkout master -- modules.json
    ```
1. Run gulp build command
    ```bash
    gulp build --modules=modules.json
    ```
1. (`make-sync` only) Upload production file to CDN
    ```bash
    gsutil cp ./build/dist/prebid.js gs://ads-gci-www-gannett-cdn-com/vendor/pbjsandwich.min.js
    ```
1. (`make-sync` only) Build dev file
    ```bash
    gulp build-bundle-dev --modules=modules.json
    ```
1. (`make-sync` only) Upload dev file to CDN
    ```bash
    gsutil cp build/dev/prebid.js gs://ads-gci-www-gannett-cdn-com/vendor/pbjsandwich.js
    ```
