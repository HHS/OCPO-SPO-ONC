## onc-frame-client-side-solution

Foe detailed design and code documentation please refer to the design document. 

### Building the code

```bash
git clone the repo
npm i
npm i -g gulp
gulp
```

This package produces the following:

* lib/* - intermediate-stage commonjs build artifacts
* dist/* - the bundled script, along with other resources
* deploy/* - all resources which should be uploaded to a CDN.

### Build options

```bash
gulp bundle --ship
gulp package-solution --ship
```

### SharePoint deployable solution package

The file can be located at: ```sharepoint/solution/onc-frame.sppkg```