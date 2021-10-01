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
