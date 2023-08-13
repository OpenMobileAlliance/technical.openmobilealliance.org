// Publications table created by using the https://alpinejs.dev/
//

document.addEventListener('alpine:init', () => {
  window.Alpine.store('publicationData', {
    records: {
    },
    query: {
      q: '',
      version: '',
      status: '',
      docType: '',
      page: 1
    }
  })

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
    }
  }))

  window.Alpine.data('publicationPagination', () => ({
    getPagingData() {
      return this.$store.publicationData.records.metadata || []
    },
    paginate() {
      let render = ''
      if (this.getPagingData()) {
        const data = this.getPagingData()
        const range = 5
        let renderTwoSide = ''
        let countTruncate = 0

        const numberTruncateLeft = data.page - 1
        const numberTruncateRight = data.page + 1
        let active = ''

        for (let pos = 1; pos <= data.maxPage; pos += 1) {
          active = pos === data.page ? 'current' : ''

          if (data.maxPage >= 2 * range - 1) {
            if (numberTruncateLeft > 3 && numberTruncateRight < data.maxPage - 3 + 1) {
              if (pos >= numberTruncateLeft && pos <= numberTruncateRight ) {
                renderTwoSide += this.renderPage(pos, active)
              }
            } else if (
              (data.page < range && pos <= range) ||
              (data.page > data.maxPage - range && pos >= data.maxPage - range + 1) ||
              pos === data.maxPage || pos === 1
            ) {
              render += this.renderPage(pos, active)
            } else {
              countTruncate += 1
              if (countTruncate === 1) {
                render += this.renderDots()
              }
            }
          } else {
            render += this.renderPage(pos, active)
          }
        }

        if (renderTwoSide) {
          return `${this.renderPage(1)}${this.renderDots()}${renderTwoSide}${this.renderDots()}${this.renderPage(data.maxPage)}`
        }
      }
      return render
    },
    gotoPage(e) {
      const index = parseInt(e.target.getAttribute('data-page-idx'), 10)
      const data = this.getPagingData()

      if (data.page === index || index <= 0 || index > data.maxPage) return
      this.$store.publicationData.query.page = index
    },
    renderPage(index, active) {
      return `<a class="paginate_button ${active}" @click.click="gotoPage" data-page-idx="${index}" tabindex="0">${index}</a>`
    },
    renderDots() {
      return `<span class="ellipsis">…</span>`
    },
    renderPrev() {
      if (this.getPagingData()) {
        const data = this.getPagingData()
        return `<a class="paginate_button previous ${data.page === 1 ? 'disabled' : ''}"
          @click.click="gotoPage"
          data-page-idx="${data.page <= 1 ? 1 : data.page - 1}"
          tabindex="-1" id="table-of-pubications_previous">Previous</a>`
      }
      return ''
    },
    renderNext() {
      if (this.getPagingData()) {
        const data = this.getPagingData()
        return `<a class="paginate_button next" @click.click="gotoPage"
          ${data.page === data.maxPage ? 'disabled' : ''}
          data-page-idx="${data.page >= data.maxPage ? data.maxPage : data.page + 1}"
          tabindex="0" id="table-of-pubications_next">Next</a>`
      }
      return ''
    },
    render() {
      return `<div class="dataTables_paginate paging_simple_numbers">${this.renderPrev()}${this.paginate()}${this.renderNext()}</div>`
    }
  }))

  window.Alpine.data('publicationsTable', () => ({
    async init() {
      window.console.info('Start fetching pubications data')
      await this.fetchData()
      this.$watch('$store.publicationData.query.page', (newValue, oldValue) => this.onPaginationChange(newValue, oldValue))
    },
    async fetchData() {
      this.$store.publicationData.records = await $.getJSON('https://ar10tsw1za.execute-api.eu-north-1.amazonaws.com/prod/publications', {
        page: this.$store.publicationData.query.page})
        .done(response => response)
        .catch((response) => {
          window.console.error(response.status);
          return [];
        })
    },
    async onPaginationChange(newValue, oldValue) {
      if (newValue === oldValue) return

      await this.fetchData()
    },
    render () {
      return `
        <div class="pubications-table dataTables_wrapper no-footer" >
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
            <div x-data="publicationPagination" x-html="render()" class=""></div>
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
      return this.$store.publicationData.records.Publications || []
    }
  }))
})

