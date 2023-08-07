// Publications table created by using the https://alpinejs.dev/
//

document.addEventListener('alpine:init', () => {
  window.console.log('we are rolling!!');
  window.Alpine.data('tableSearch', () => ({
    render() {
      return `<div class="tableSearch" >
           <input type="text" x-model="message">
           <button @click="search"><i class="fas fa-search"></i></button>
         <dv>
        `
    },
    message: '',
    search() {
      window.alert(this.message)
    },
  }))

  window.Alpine.data('publicationsTable', () => ({
    async init() {
      window.console.info('Start fetching pubications data')
      this.publicationData = await $.getJSON('https://ar10tsw1za.execute-api.eu-north-1.amazonaws.com/prod/publications')
        .done(response => response)
        .catch((response) => {
          window.console.error(response.status);
          return [];
        })
    },
    render () {
      return `
        <div class="pubications-table">
          <div x-data="tableSearch" x-html="render()" class="table-search"></div>
          <div class="quick-filter-wrapper">
            <div class="quick-filter-header">
            </div>
            <div class="quick-filter-body">
            </div>
          </div>
          <div class="publications-table-data">
            <div class="table-date">
              <table class="">
                <thead>
                  <tr>
                    <th>Name<th>
                    <th>Enabler<th>
                    <th>Status</th>
                    <th>Version</th>
                    <th>DocType</th>
                  </tr>
                </thead>
                <tbody>
                <template x-for="row in getPublications()">
                  <tr>
                    <td x-html="createLinkToPublication(row)"><td>
                    <td class="text-center" x-html="createEnablerInfo(row)"><td>
                    <td class="text-center" x-text="row.status"></td>
                    <td class="text-center" x-html="getVersionUrl(row)"></td>
                    <td class="text-center" x-text="row.docType"></td>
                  </tr>
                </template>
                <tbody>
              </table>
            </div>
            <div class="paggination"></div>
          </div>
        </div>`
    },
    createLinkToPublication(item) {
      return `
        <a href="${item.url}"
           title="${item.description || ''}"
           target="_blank"
        >
          ${item.fileName}
        </a>`
    },
    createEnablerInfo(item) {
      return `
        <a href="https://www.openmobilealliance.org/release/${item.enablerAbbreviation}"
           title="${item.enablerName}"
           target="_blank"
        ><strong>${item.enablerAbbreviation}</strong>
        </a>
      `
    },
    getVersionUrl(item) {
      const versionURl = item.url.replace(item.fileName, '')
      return `
        <a href="${versionURl}"
           target="_blank"
        >${item.version}
        </a>
      `
    },
    getPublications() {
      return this.publicationData.Publications || []
    },
    publicationData: {
    },

  }))
})

