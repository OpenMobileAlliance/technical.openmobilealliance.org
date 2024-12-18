**Note: This repository is archived and will not receive further updates, including dependency updates or security fixes from bots like Dependabot.**
For any updates or forks, please refer to [https://github.com/OpenMobileAlliance/oma-knowledge-base].  


# How to run the technical.openmobilealliance.org pages locally

### Install node on Mac:
Follow the instructions here: https://treehouse.github.io/installation-guides/mac/node-mac.html

tldr: In terminal run:
`brew update`
`brew install node`

### Clone the repository to a local directory:
`git clone https://github.com/OpenMobileAlliance/technical.openmobilealliance.org.git`

### Choose or create a branch that you want to work in
New branch:
`git checkout -b new-branch`

Use existing branch
`git checkout existing-branch`

### Install dependencies
In the folder for the local repository run:
`npm install`

Run the code
`npm start`

Notes
>At this point you can make any changes to the code and you should see them automatically appear in the browser window that has opened.

### Check-in code
When you're happy the new code is working. Either push to Github and do a pull request to master. Or merge to master and push to Github.

### Publish code
Merge master to gh-pages and push. Or do a pull request to gh-pages from master.

## How to Maintain enablers.json File

The `enablers.json` file contains three main objects:

* `id`
    * The schema.

* `organization`: Open Mobile Alliance
    * `abbreviation`: OMA
    * `schemaVersion`: 1.0
    * `url`: 
        * this ulr points to the technical pages of the Open Mobile Alliance website
    * `ftp`
        * https://www.openmobilealliance.org/release/
        * this value it is used as a prefix to preceed on all `url` properties listed in the `enabler.json` file
    * `about`
        * this document contains a reference to all the Enabler Releases published by OMA over the years.
    * `email`
        * OMA contact email, helpdesk@omaorg.org

* `enablers`
    * `name`: full name of the Enabler
    * `logo`: logo of the Enabler (if exist)
    * `abbreviation`: Enabler abbreviation, e.g., DM
    * `data`:  # contains three objects (`name`, `resourceType` and `url`)
        * `resources` # it is an array that contains resources associated to each Enabler.
            * `name`: name of the resource
            * `resourceType`: type of resource (Overview, Issues, EVP, ETS, Tool, Registry, Dependency)
                * The `Overview` resource type accepts global url on its property `url`.
            * `url`: at the time of displaying, the value in the property is appended with the value of the `ftp`  property previously defined.
        * `publications`
            * `url`: as above the value of this property is prefix with the value of the `ftp` at the time of displaying
            * `file`: file name
            * `status`: status of the document, (D: Draft, C: Candidate, A: Approved, H: Historic)
            * `version`: version VX.Y.Z
            * `date`: date when the document was approved. It is displayed in the format YYYY-MM-DD
            * `contentMediaType`: property to identify the type of file, e.g. text/plain
        * `versions`: this object is an array that represents the versions associated to each Relase.
            * `name`: name of the ftp folder that contains the Release. The format for this name is: V_X_Y_Z-YYYYMMDD-Status
            * `status`: status of the document, (D: Draft, C: Candidate, A: Approved, H: Historic)
            * `version`: version VX.Y.Z
            * `date`: date when the Release was approved, in the format: YYYY-MM-DD
            * `display`: this property allows override any display critieria. If the value is set to `true`, then the Release version details will be displayed independent of the rendering criteria. If the value is set to `false`, then the Release version won't be displayed independent of the rendering criteria. If it is set to `false` the information for that Release will be displayed when displaying ALL the versions for that Enabler.
