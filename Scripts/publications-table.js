// Publications table created by using the https://alpinejs.dev/
//

document.addEventListener('alpine:init', () => {
  window.Alpine.store('publicationData', {
    records: {
    },
    query: {
      q: '',
      enablerAbbreviations: '',
      version: '',
      status: '',
      docType: '',
      year: 0,
      page: 1,
      perPage: 10
    },
    PUB_STATUS: [
      { name: 'D', description: 'Draft' },
      { name: 'C', description: 'Candidate' },
      { name: 'A', description: 'Approved' },
      { name: 'H', description: 'Historic' }
    ],
    PER_PAGE_LIST: [10, 25, 50, 100],
    getStatusFromDescription(str) {
      return this.PUB_STATUS.filter(item => item.description === str)
    },
    DOC_TYPES: [
      { name: 'AC', description: 'Application Characteristics' },
      { name: 'AD', description: 'Architecture Document' },
      { name: 'API', description: 'Application Programming Interface' },
      { name: 'ASN', description: 'Abstract Syntax Notation' },
      { name: 'DDF', description: 'Device Description Framework' },
      { name: 'DDS', description: 'Data Definition Specification' },
      { name: 'DTD', description: 'Document Type Definition' },
      { name: 'ER', description: 'Enabler Release' },
      { name: 'ERELD', description: 'Enabler Release Definition' },
      { name: 'ERP', description: 'Enabler Release Package' },
      { name: 'ETR', description: 'Enabler Test Requirements' },
      { name: 'ETS', description: 'Enabler Test Specification' },
      { name: 'EVP', description: 'Enabler Validation Plan' },
      { name: 'MO', description: 'Management Object' },
      { name: 'OD', description: 'Overview Document' },
      { name: 'OMA', description: 'Open Mobile Alliance' },
      { name: 'RD', description: 'Requirement Document' },
      { name: 'RR', description: 'Reference Release' },
      { name: 'RRELD', description: 'Reference Release Definition' },
      { name: 'RRP', description: 'Reference Release Package' },
      { name: 'SUP', description: 'Support Document' },
      { name: 'TFP', description: 'Test Files Package' },
      { name: 'TS', description: 'Technical Specification' },
      { name: 'WIDL', description: 'Web Interface Definition Language' },
      { name: 'WSDL', description: 'Web Interface Definition Language' },
      { name: 'XML', description: 'Extensible Markup Language' },
      { name: 'XSD', description: 'XML Schema Document' },
    ],
    getDocTypeFromDescription(str) {
      return this.DOC_TYPES.filter(item => item.description === str)
    }
  })

  window.Alpine.data('tableSearch', () => ({
    render() {
      return `
        <div class="tableSearch" >
          <div class="clearfix">
            <div class="dataTables_length">
              <label>
                Show
                <select class="" @change="perPageChange">
                <template x-for="pp in getPerPageSelection()">
                  <option :key="pp" :value="pp" x-text="pp"></option>
                </template>
                </select>
                entries
              </label>
            </div>
            <div class="topic-search dataTables_filter">
              <label>
                Search
                <input type="search"
                  @keyup="search"
                  x-model="message">
              </label>
            </div>
          </div>
          <div class="panel-group mb-0" id="publications-accordion" role="tablist" aria-multiselectable="true">
            <div class="panel panel-default">
              <div class="panel-heading" role="tab" id="headingOne">
                <h4 class="panel-title">
                  <button
                    type="button"
                    class="btn-link toggle-button"
                    data-toggle="collapse"
                    data-target="#collapseOne"
                    data-parent="#publications-accordion"
                    aria-expanded="true"
                    aria-controls="collapseOne">
                    Advance filtering
                  </button>
                </h4>
              </div>
              <div id="collapseOne" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">
                <div class="panel-body">
                  <div class="row row-no-gutters" >
                  <template x-for="key in getFilterTitles()">
                    <div :class="(key === 'enablerAbbreviations' || key === 'docTypes') ? 'col-sm-3' : 'col-sm-2'"
                      class=""
                    >
                      <h5 class="text-center" x-text="getTitle(key)"></h5>
                      <ul class="list-group dt-advance-filter-panel">
                        <template x-for="item in getAdvanceFilterItemByKey(key)">
                          <li
                            class="list-group-item"
                            :class="isActiveFilter(key, item) ? 'active' : ''"
                            x-html="renderFilterItem(item, key)"
                            @click="filterBy(key, item)"></li>
                        </template>
                      </ul>
                    </div>
                  </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        <div>
        `
    },
    message: '',
    search() {
      if (this.$store.publicationData.query.q !== this.message) {
        this.$store.publicationData.query.q = this.message
        this.$store.publicationData.query.page = 1
      }
    },
    clearSearch() {
      if (this.message.length < 1) {
        this.$store.publicationData.query.q = this.message
        this.$store.publicationData.query.page = 1
      }
    },
    getPerPageSelection(){
      return this.$store.publicationData.PER_PAGE_LIST || []
    },
    perPageChange(e) {
      const perPage = Number(e.target.value)
      if(this.$store.publicationData.query.perPage !== perPage) {
        this.$store.publicationData.query.perPage = perPage
        this.$store.publicationData.query.page = 1
      }
    },
    getTitle(key) {
      let res = ''
      switch (key) {
        case 'years': {
          res = 'Year'
          break;
        }
        case 'statuses': {
          res = 'Status'
          break;
        }
        case 'versions': {
          res = 'Version'
          break;
        }
        case 'enablerAbbreviations': {
          res = 'Enabler'
          break;
        }
        case 'docTypes':{
          res = 'Doc Type'
          break;
        }
        default:
          break;
      }
      return res
    },
    getFilterTitles() {
      return Object.keys(this.$store.publicationData.records.stats || [])
    },
    getAdvanceFilterItemByKey(key) {
      return Object.keys(this.$store.publicationData.records.stats[key])
    },
    renderFilterItem(item, key) {
      return `
          ${item}
          <span class="badge">${this.$store.publicationData.records.stats[key][item]}</span>
      `
    },
    filterBy(key, item) {
      switch (key) {
        case 'years': {
          const year = parseInt(item, 10)
          this.$store.publicationData.query.year = this.$store.publicationData.query.year === year ? null : year
          this.$store.publicationData.query.page = 1
          break;
        }
        case 'statuses': {
          const status = this.$store.publicationData.getStatusFromDescription(item)
          if (status.length > 0) {
            const statusName = status[0].name
            this.$store.publicationData.query.status = this.$store.publicationData.query.status === statusName ? '' : statusName
            this.$store.publicationData.query.page = 1
          }
          break;
        }
        case 'versions': {
          this.$store.publicationData.query.version = this.$store.publicationData.query.version === item ? '' : item
          this.$store.publicationData.query.page = 1
          break;
        }
        case 'enablerAbbreviations': {
          this.$store.publicationData.query.enablerAbbreviation = this.$store.publicationData.query.enablerAbbreviation === item ? '' : item
          this.$store.publicationData.query.page = 1
          break;
        }
        case 'docTypes':{
          const docTypes = this.$store.publicationData.getDocTypeFromDescription(item)
          if (docTypes.length > 0) {
            const docType = docTypes[0].name
            this.$store.publicationData.query.docType = this.$store.publicationData.query.docType === docType ? '' : docType
            this.$store.publicationData.query.page = 1
          }
          break;
        }
        default:
          window.console.log(`${key} - ${item}`)
          break;
      }
    },
    isActiveFilter(key, item) {
      let res = false
      switch (key) {
        case 'years': {
          const year = parseInt(item, 10)
          res = this.$store.publicationData.query.year === year
          break;
        }
        case 'statuses': {
          const status = this.$store.publicationData.getStatusFromDescription(item)
          if (status.length > 0) {
            const statusName = status[0].name
            res = this.$store.publicationData.query.status === statusName
          }
          break;
        }
        case 'versions': {
          res = this.$store.publicationData.query.version === item
          break;
        }
        case 'enablerAbbreviations': {
          res = this.$store.publicationData.query.enablerAbbreviation === item
          break;
        }
        case 'docTypes':{
          const docTypes = this.$store.publicationData.getDocTypeFromDescription(item)
          if (docTypes.length > 0) {
            const docType = docTypes[0].name
            res = this.$store.publicationData.query.docType === docType
          }
          break;
        }
        default:
          break;
      }
      return res
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
    getPagingInfoMessage() {
      const data = this.getPagingData()
      if (data) {
        let firstRecord = (data.page - 1) * data.perPage
        firstRecord = firstRecord <= 0 ? 1 : firstRecord + 1
        let lastRecord = firstRecord - 1 + data.perPage
        lastRecord = lastRecord < data.numberOfRecords ? lastRecord : data.numberOfRecords
        return `Showing ${firstRecord} to ${lastRecord} of ${data.numberOfRecords} entries`
      }
      return ''
    },
    render() {
      return `
        <div class="dataTables_info" x-text="getPagingInfoMessage()"></div>
        <div class="dataTables_paginate paging_simple_numbers">${this.renderPrev()}${this.paginate()}${this.renderNext()}</div>
      `
    }
  }))

  window.Alpine.data('publicationsTable', () => ({
    async init() {
      window.console.info('Start fetching pubications data')
      await this.fetchData()
      this.$watch('$store.publicationData.query.page', (newValue, oldValue) => this.onPaginationChange(newValue, oldValue))
      this.$watch('$store.publicationData.query.perPage', (newValue, oldValue) => this.onPerPaginationChange(newValue, oldValue))
      this.$watch('$store.publicationData.query.version', (newValue, oldValue) => this.onSearchChange(newValue, oldValue))
      this.$watch('$store.publicationData.query.enablerAbbreviation', (newValue, oldValue) => this.onSearchChange(newValue, oldValue))
      this.$watch('$store.publicationData.query.status', (newValue, oldValue) => this.onSearchChange(newValue, oldValue))
      this.$watch('$store.publicationData.query.docType', (newValue, oldValue) => this.onSearchChange(newValue, oldValue))
      this.$watch('$store.publicationData.query.year', (newValue, oldValue) => this.onSearchChange(newValue, oldValue))
      this.$watch('$store.publicationData.query.q', (newValue, oldValue) => this.onQueryChange(newValue, oldValue))
    },
    async fetchData() {
      const param = {
        page: this.$store.publicationData.query.page,
        perPage: this.$store.publicationData.query.perPage
      }

      if (this.$store.publicationData.query.version) {
        param.version = this.$store.publicationData.query.version
      }
      if (this.$store.publicationData.query.enablerAbbreviation) {
        param.abbr = this.$store.publicationData.query.enablerAbbreviation
      }
      if (this.$store.publicationData.query.year) {
        param.year = this.$store.publicationData.query.year
      }
      if (this.$store.publicationData.query.q ) {
        param.q = this.$store.publicationData.query.q
      }
      if (this.$store.publicationData.query.status) {
        param.status = this.$store.publicationData.query.status
      }
      if (this.$store.publicationData.query.docType) {
        param.docType = this.$store.publicationData.query.docType
      }

      this.$store.publicationData.records = await $.getJSON('https://ar10tsw1za.execute-api.eu-north-1.amazonaws.com/prod/publications', param)
        .done(response => this.processResponse(response))
        .catch((response) => {
          window.console.error(response.status);
          return [];
        })
    },
    processResponse(records) {
      if (this.$store.publicationData.query.page !== records.metadata.page) {
        this.$store.publicationData.query.page = records.metadata.page
      }
      return records
    },
    async onPaginationChange(newValue, oldValue) {
      if (newValue === oldValue) return

      await this.fetchData()
    },
    async onPerPaginationChange(newValue, oldValue) {
      if (newValue === oldValue) return

      await this.fetchData()
    },
    async onSearchChange(newValue, oldValue) {
      if (newValue === oldValue) return
      await this.fetchData()
    },
    async onQueryChange(newValue, oldValue) {
      if (newValue === oldValue) return
      await this.fetchData()
    },
    render () {
      return `
        <div class="pubications-table dataTables_wrapper no-footer" >
          <div x-data="tableSearch" x-html="render()" class="table-search"></div>
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
      const versionURl = item.url.substring(0, item.url.lastIndexOf('/') + 1)
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

