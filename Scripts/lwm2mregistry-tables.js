// LwM2M Object tables created using Web Components
//
/* eslint max-classes-per-file: ["error", 2] */


// Define the store for DynamicTable
import {LitElement, css, html, unsafeHTML} from 'https://cdn.jsdelivr.net/gh/lit/dist@2.8.0/all/lit-all.min.js'

// @filters - Array of the advance filters to be applyed
//   each element should have:
//   * key - name of the property in the row
//   * title - title to be used for this property
//   * type - 'text' or 'number' indication the type of the property value

export class DynamicTable extends LitElement {
  static properties = {
    caption: { type: String, value: ''},
    data: { type: Array },
    columns: { type: Array },
    filters: { type: Array },
    page: { type: Number, value: 1 },
    perPage: { type: Number, value: 10 },
    q: { type: String },
    selectedFilters: { type: Array }
  }

  static PER_PAGE_LIST = [10, 25, 50, 100]

  constructor(){
    super()
    this.caption = ''
    this.data = []
    this.columns = []
    this.filters = []
    this.page = 1
    this.perPage = 10
    this.maxPage = this.page
    this.q = ''
    this.selectedFilters = []
    this.numberOfRecords = this.data.length
  }

  createRenderRoot() {
    return this;
  }

  updateData(data) {
    this.data = data.map(el => el)
    this.updateDisplayData()
  }

  updateFilterData(data) {
    const tableFilter = this.querySelector('table-filters')

    if (tableFilter) {
      const stats = this._genStats(data)
      tableFilter.updateFilters(stats, this.filters, this.selectedFilters)
    }
  }

  updateDisplayData() {
    const tableData = this.querySelector('table-data')

    if (tableData) {

      const displayData = []
      tableData.columns = this.columns
      let filteredData = this.filterData()

      const keys2Search = this.columns.filter(f => f.search).map(e => e.key)

      if (this.q.length > 0) {
        filteredData = filteredData.reduce((res, el) => {
          let finded = false
          for (let index = 0; index < keys2Search.length; index++) {
            const key = keys2Search[index];
            finded = el[key]?.toLowerCase().includes(this.q.toLowerCase())
            if (finded) {
              res.push(el)
              break
            }
          }
          return res
        }, [])
      }

      this.numberOfRecords = filteredData.length
      if (this.perPage === -1) {
        this.maxPage = 1
        this.page = 1

        for (let index = 0; index < filteredData.length; index++) {
          displayData.push(filteredData[index])
        }
      } else {
        this.maxPage = Math.floor(this.numberOfRecords / this.perPage) + 1
        this.page = this.page > this.maxPage ? this.maxPage : this.page
        const firstRecord = this.page * this.perPage - this.perPage
        const lastRecord= firstRecord + this.perPage > this.numberOfRecords ? this.numberOfRecords : firstRecord + this.perPage

        for (let index = firstRecord; index < lastRecord; index++) {
          displayData.push(filteredData[index])
        }
      }
      this.updateFilterData(filteredData)
      tableData.updateDisplayData(displayData)
      this.requestUpdate()
    }
  }

  filterData() {
    if (this.selectedFilters.length > 0) {
      return this.selectedFilters.reduce((res, el) => {
        if (res.length === 0) {
          res = this.data.filter(item => item[el.key] === el.value)
        } else {
          res = res.filter(item => item[el.key] === el.value)
        }
        return res
      }, [])
    } else {
      return this.data
    }
  }

  _genStats(data) {
    const stats = {}

    this.filters.forEach(filter => {
      stats[filter.key] = {}
    })

    data.forEach(item => {
      this.filters.forEach(filter => {
        if (Object.keys(item).includes(filter.key)) {
          const label = item[filter.key]
          stats[filter.key][label] = stats[filter.key][label] ? stats[filter.key][label] + 1 : 1
        }
      })
    })

    return stats
  }

  pageChange(e) {
    this.page = Number(e.detail.value)
    console.log(`new page = ${this.page}`)
    this.updateDisplayData()
  }

  perPageChange(e) {
    this.perPage = Number(e.detail.value)
    this.page = 1
    console.log(`new perPage = ${this.perPage}`)
    this.updateDisplayData()
  }

  filterChange(e) {
    const filterKey = e.detail.key
    const filterValue = e.detail.value

    const selected = this.selectedFilters.filter(el => el.key === filterKey && el.value === filterValue)

    if (selected.length > 0) {
      this.selectedFilters = this.selectedFilters.filter(el => el != selected[0])
    } else {
      this.selectedFilters.push({ key: filterKey, value: filterValue})
    }

    this.page = 1

    this.updateDisplayData()
  }

  queryChange(e) {
    const query = e.detail.query
    this.q = query
    this.updateDisplayData()
  }

  render() {
    return html`
       <div class="dataTables_wrapper no-footer">
        <table-search
          perPage=${this.perPage}
          @perPageChange="${this.perPageChange}"
          @queryChenge="${this.queryChange}"
        ></table-search>
        <table-filters @filterChange="${this.filterChange}"></table-filters>
        <table-data caption=${this.caption}></table-data>
        <table-pagination
          perPage=${this.perPage}
          page=${this.page}
          maxPage=${this.maxPage}
          numberOfRecords=${this.numberOfRecords}
          @pageChange="${this.pageChange}"
        >
        </table-pagination>
      </div>
    `
  }
}

customElements.define('dynamic-table', DynamicTable)


export class DynamicTableSearch extends LitElement {
  static properties = {
    perPage: { type: Number, value: 10 }
  }

  createRenderRoot() {
    return this;
  }

  render() {
    const perPage = [...DynamicTable.PER_PAGE_LIST, -1]
    return html`
      <div class="tableSearch">
        <div class="clearfix">
          <div class="dataTables_length">
            <label>
              Show
              <select @change="${this.perPageChange}">
                ${perPage.map(item => {
                  return html`
                    <option key="${item}" value="${item}" ${this.perPage === item ? 'selected' : ''}>
                      ${item === -1 ? 'All' : item}
                    </option>
                  `
                })}
              </select>
            </label>
          </div>
          <div class="topic-search dataTables_filter">
            <label>
              Search
              <input type="search" @keyup="${this.search}" />
            </label>
          </div>
        </div>
      </div<>
    `
  }

  perPageChange(e) {
    this.perPage = e.target.value
    this.dispatchEvent(new CustomEvent('perPageChange', {detail: { value: this.perPage }, bubbles: true, composed: true}))
  }

  search(e) {
    console.log(e.target.value)
    this.dispatchEvent(new CustomEvent('queryChenge', {detail: { query: e.target.value }, bubbles: true, composed: true}))
  }
}

customElements.define('table-search', DynamicTableSearch)

export class DynamicTableFilters extends LitElement {
  constructor() {
    super()
    this.accordionId = `${Math.floor(Math.random() * 1000)}_accordion`
    this.headerId = `${Math.floor(Math.random() * 1000)}_accordion_header`
    this.collapseId = `${Math.floor(Math.random() * 1000)}_accordion_collapse`
    this.filters = []
    this.selected = []
    this.stats = {}
  }

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div class="table-filters">
        ${this.filters.length > 0 ? this.renderFiltrAccordion() : ''}
      </div>
    `
  }

  updateFilters(stats, config, selected) {
    this.stats = stats
    this.filters = config
    this.selected = selected
    this.requestUpdate()
  }

  getFilterKeys() {
    return this.filters.map(item => item.key)
  }

  getFilterTitle(key) {
    let title = ''
    for (let index = 0; index < this.filters.length; index++) {
      if(this.filters[index].key === key) {
        title = this.filters[index].title
        break
      }
    }
    return title
  }

  getFilterItemByKey(key) {
    if (this.stats[key]) {
      let keys = Object.keys(this.stats[key])
      keys.sort()
      return keys
    }
    return []
  }

  isActiveFilter(key, item) {
    let res = this.selected.filter(el => el.key === key && el.value === item)
    return res.length > 0
 }

  filterBy(e) {
    const key = e.target.getAttribute('data-filter-key')
    const value = e.target.getAttribute('data-filter-value')
    this.dispatchEvent(new CustomEvent('filterChange', {detail: { key, value }, bubbles: true, composed: true}))
  }

  renderListItemContent(key, item) {
    return html`
          ${item}
          <span class="badge">${this.stats[key][item]}</span>
      `
  }

  renderPaneListItem(key, item) {
    return html`
      <li
        class="list-group-item ${this.isActiveFilter(key, item) ? 'active' : ''}"
        data-filter-key="${key}"
        data-filter-value="${item}"
        @click="${this.filterBy}"
      >
          ${this.renderListItemContent(key, item)}
      </li>
    `
  }

  renderFilterPanel(key) {
    return html`
      <div class="col-sm-3">
        <h5 class="text-center">${this.getFilterTitle(key)}</h5>
        <ul class="list-group dt-advance-filter-panel">
          ${this.getFilterItemByKey(key)?.map(item => this.renderPaneListItem(key, item))}
        </ul>
      </div>
    `
  }

  renderFiltrAccordion() {
    return html`
      <div class="panel-group mb-0" id="${this.accordionId}" role="tablist" aria-multiselectable="true">
        <div class="panel panel-default">
          <div class="panel-heading" role="tab" id="${this.headerId}">
            <h4 class="panel-title">
              <button
                type="button"
                class="btn-link toggle-button"
                data-toggle="collapse"
                data-target="#${this.collapseId}"
                data-parent="#${this.accordionId}"
                aria-expanded="true"
                aria-controls="#${this.collapseId}">
                Advance filtering
              </button>
            </h4>
          </div>
          <div id="${this.collapseId}" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="${this.headerId}">
            <div class="">
              <div class="row row-no-gutters">
                ${this.getFilterKeys()?.map(key => this.renderFilterPanel(key))}
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

customElements.define('table-filters', DynamicTableFilters)

export class DynamicTableData extends LitElement {
  static properties = {
    caption: { type: String, value: ''},
    displayData: {type: Array, attribute: false, value: []},
    columns: {type: Array, attribute: false, value: []}
  }

  constructor() {
    super()
    this.caption = ''
    this.displayData = []
    this.columns = []
  }

  createRenderRoot() {
    return this;
  }

  updateDisplayData(data) {
    if (data?.length > 0) {
      this.displayData = data.map(el => el)
    } else {
      this.displayData = []
    }
  }

  render() {
    return html`
      <table>
        ${this.generateTableHead()}
        ${this.generateTableBody()}
        ${this.generateCaption()}
      </table>
    `
  }

  generateTableHead() {
    const tableNames = [...this.columns.map(el => el.title)]

    return html`
      <thead>
        <tr>
          ${tableNames.map(item => {
            return html`<th>${item}</th>`
          })}
        </tr>
      </thead>
    `
  }

  renderTableRow(row) {
    return html`
      <tr>
        ${this.columns.map(cell => this.renderTableCell(cell, row))}
      </tr>
    `
  }

  renderTableCell(cell, row) {
    let res = ''
    switch (cell.type) {
      case 'text':
        res =  html`<td class="${cell.class}">${row[cell.key]}</td>`
        break
      case 'function':
        res = html`<td class="${cell.class}">${unsafeHTML(cell.format(row))}`
        break
      default:
        console.log(cell)
    }
    return res
  }

  generateTableBody() {
    return html`
      <tbody>
        ${this.displayData.map(row => {
          return this.renderTableRow(row)
        })}
      </tbody>
    `
  }

  generateCaption() {
    return html`
      <caption>
        ${unsafeHTML(this.caption)}
      </caption>
    `
  }
}

customElements.define('table-data', DynamicTableData)

export class DynamicTablePagination extends LitElement {
  static properties = {
    page: { type: Number },
    perPage: { type: Number },
    maxPage: {type: Number },
    numberOfRecords: { type: Number }
  }

  constructor() {
    super()
    this.page = 1
    this.perPage = 10
    this.maxPage = 1
    this.numberOfRecords = 0
  }

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div class="">
        <div class="dataTables_info">${this.getPagingInfoMessage()}</div>
        <div class="dataTables_paginate paging_simple_numbers">
          ${this.renderPrev()}
          ${this.paginate()}
          ${this.renderNext()}
        </div>
      </div>
    `
  }

  renderPrev() {
    return html`
      <a
        class="paginate_button previous"
        ${this.page === 1 ? 'disabled' : ''}
        data-page-idx=${this.page <= 1 ? 1 : this.page - 1}
        table-index=-1
        @click="${this.gotoPage}"
      >
        Previous
      </a>
    `
  }

  renderNext() {
    return html`
      <a
        class="paginate_button next"
        ${this.page === this.maxPage ? 'disabled' : ''}
        data-page-idx=${this.page >= this.maxPage ? this.maxPage : this.page + 1}
        table-index=-1
        @click="${this.gotoPage}"
      >
        Next
      </a>
    `
  }

  renderPage(index, active) {
    return html`
      <a
        class="paginate_button ${active}"
        data-page-idx=${index}
        table-index=0
        @click="${this.gotoPage}"
      >
        ${index}
      </a>
    `
  }

  renderDots() {
    return html`<span class="ellipsis">_</span>`
  }

  getPagingInfoMessage() {
    if (this.perPage === -1) {
      return `Showing 1 to ${this.numberOfRecords} of ${this.numberOfRecords} entries`
    } else {
    let firstRecord = (this.page - 1) * this.perPage
    firstRecord = firstRecord <= 0 ? 1 : firstRecord + 1
    let lastRecord = firstRecord - 1 + this.perPage
    lastRecord = lastRecord < this.numberOfRecords ? lastRecord : this.numberOfRecords
    return `Showing ${firstRecord} to ${lastRecord} of ${this.numberOfRecords} entries`
    }
  }

  paginate() {
    let render = []
    const range = 5
    let renderTwoSide = []
    let countTruncate = 0

    const numberTruncateLeft = this.page - 1
    const numberTruncateRight = this.page + 1
    let active = ''

    render = []

    for (let pos = 1; pos <= this.maxPage; pos += 1) {
      active = pos === this.page ? 'current' : ''

      if (this.maxPage >= 2 * range - 1) {
        if (numberTruncateLeft > 3 && numberTruncateRight < this.maxPage - 3 + 1) {
          if (pos >= numberTruncateLeft && pos <= numberTruncateRight ) {
            renderTwoSide.push(this.renderPage(pos, active))
          }
        } else if (
          (this.page < range && pos <= range) ||
          (this.page > this.maxPage - range && pos >= this.maxPage - range + 1) ||
          pos === this.maxPage || pos === 1
        ) {
          render.push(this.renderPage(pos, active))
        } else {
          countTruncate += 1
          if (countTruncate === 1) {
            render.push(this.renderDots())
          }
        }
      } else {
        render.push(this.renderPage(pos, active))
      }
    }

    if (renderTwoSide.length > 0) {
      return [this.renderPage(1), this.renderDots(), ...renderTwoSide, this.renderDots(), this.renderPage(this.maxPage)]
    }
    return render
  }

  gotoPage(e) {
    const page = parseInt(e.target.getAttribute('data-page-idx'), 10)
    console.log(page)
    if (page !== this.page) {
      this.page = page
      this.dispatchEvent(new CustomEvent('pageChange', {detail: { value: this.page }, bubbles: true, composed: true}))
    }
  }
}

customElements.define('table-pagination', DynamicTablePagination)

