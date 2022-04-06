/*
 * Module to dynamically render OMA enablers data
 *
*/

const createAndPopulateEnablersTable = function createAndPopulateEnablersTable() {
  window.console.info('We are about to start rendering the OMA Enablers!');
  return fetchEnablers()
    .then(renderEnablers)
    .then(applayDynamicTable)
    .catch(window.console.error);
}

const applayDynamicTable = (data) => {
  $(document).ready(() => {
    window.console.info('Applayng Dynamic Table')
    $('#table-of-enablers').DataTable({
      columns: [
        { orderable: true },
        { orderable: false },
        { orderable: false },
        { orderable: false }
      ]
    });
  });
  return data;
}

const fetchEnablers = function fetchEnablers() {
  window.console.info('Start fetching enablers data');
  return $.getJSON('/enablers.json')
    .done(response => response)
    .catch((response) => {
      window.console.error(response.status);
      return [];
    })
}

const renderEnablers = function renderEnablers(data) {
  window.console.info('Start rendering enablers data');
  $('#enablers-table').append(generateTable(data));
  return data;
}

const generateTable = function generateTable(data) {
  let result = ''
  if (data && data.enablers.length > 0) {
    const table = document.createElement('table');
    table.setAttribute('class', 'enablers-data');
    table.setAttribute('id', 'table-of-enablers');
    table.appendChild(createTableHeader());
    const tbody = document.createElement('tbody');
    const config = {};
    config.url = data.organization.url;
    config.ftp = data.organization.ftp;

    data.enablers.forEach((enabler) => {
      tbody.appendChild(createEnablerRow(enabler, config));
    });

    table.appendChild(tbody);

    result = table;
  } else {
    result = document.createTextNode('No Enabler data loaded');
  }
  return result;
}

const createTableHeader = function createTableHeader() {
  const ENABLRS_TABLE_HEADER_ITEMS = ['List of Releases - Directory Names', 'Resources', 'OMA Status - Candidate', 'OMA Status - Release'];
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');

  ENABLRS_TABLE_HEADER_ITEMS.forEach((headerText) => {
    window.console.info(headerText);
    const th = document.createElement('th');
    th.appendChild(document.createTextNode(headerText));
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  return thead;
}

const createEnablerRow = function createEnablerRow(row, config) {
  const tr = document.createElement('tr');
  const info = Object.create(config);

  if (row) {
    tr.appendChild(populateListOfReleasesCell(row, info));
    tr.appendChild(populateResourcesCell(row, info));
    tr.appendChild(populateCandidateCell(row, info));
    tr.appendChild(populateReleaseCell(row, info));
  }
  return tr;
}

const createEnablerInfoTitle = (item, config) => {
  const div = document.createElement('div');
  div.setAttribute('class', 'enabler-url');

  const link = document.createElement('a');
  link.setAttribute('href', `${config.ftp}${item.abbreviation}`);
  link.setAttribute('target', 'blank');

  link.appendChild(document.createTextNode(`${item.name} - `));
  const abb = document.createElement('span');
  abb.setAttribute('class', 'enabler-abbreviation');
  abb.appendChild(document.createTextNode(item.abbreviation));
  link.appendChild(abb);

  div.appendChild(link);
  return div;
}

const createEnablerInfoMetaLogo = (item) => {
  const div = document.createElement('div');
  div.setAttribute('class', 'col-md-6 enabler-info-meta-logo');

  if (item.logo) {
    const logo = document.createElement('img');
    logo.setAttribute('src', item.logo);
    logo.setAttribute('alt', item.name);
    logo.setAttribute('width', '200px');
    logo.setAttribute('height', '100px');

    div.appendChild(logo);
  }

  return div;
}

const createEnablerInfoMetaListTitle = () => {
  const div = document.createElement('div');
  div.setAttribute('class', 'enabler-info-meta-list-title');
  const listTitle = document.createElement('span');
  listTitle.appendChild(document.createTextNode('Linked Enablers:'));
  div.appendChild(listTitle);
  return div;
}

const createEnablerInfoMetaList = (item, config) => {
  const div = document.createElement('div');
  div.setAttribute('class', 'enabler-info-meta-list');

  const list = document.createElement('ul');
  list.setAttribute('class', 'list-group');

  item.data.resources.forEach(resource => {
    if (resource.resourceType === 'Dependency') {
      const listItem = document.createElement('li');
      listItem.setAttribute('class', 'list-group-item');
      const link = document.createElement('a');
      link.setAttribute('class', 'linked-resource-link');
      link.setAttribute('href', `${config.ftp}${resource.url}`);
      link.setAttribute('target', 'blank');
      link.appendChild(document.createTextNode(resource.name));

      listItem.appendChild(link);

      list.appendChild(listItem);
    }
  })

  div.appendChild(list);

  return div;
}

const createEnablerInfoMetaListCard = (item, config) => {
  const div = document.createElement('div');
  div.setAttribute('class', 'col-md-6 enabler-info-meta-list-card');
  if (containsDependencies(item)) {
    div.appendChild(createEnablerInfoMetaListTitle());
    div.appendChild(createEnablerInfoMetaList(item, config));
  }
  return div;
}

const createEnablerInfoMetaInfo = (item, config) => {
  const div = document.createElement('div');
  div.setAttribute('class', 'enabler-info-meta');
  const row = document.createElement('div');
  row.setAttribute('class', 'row');

  row.appendChild(createEnablerInfoMetaLogo(item, config));
  row.appendChild(createEnablerInfoMetaListCard(item, config));
  div.appendChild(row);

  return div;
}

const containsDependencies = (item) => {
  let list = [];
  if (item && item.data.resources.length > 0) {
    list = item.data.resources.filter(resource => resource.resourceType === 'Dependency')
  }
  return list.length > 0;
}

const createEnablerInfoDiv = (item, config) => {
  const div = document.createElement('div');
  div.setAttribute('class', 'enabler-info');

  div.appendChild(createEnablerInfoTitle(item, config));
  div.appendChild(createEnablerInfoMetaInfo(item, config));
  return div;
}

const populateListOfReleasesCell = function populateListOfReleasesCell(row, config) {
  const listOfreleases = document.createElement('td');

  listOfreleases.appendChild(createEnablerInfoDiv(row, config));
  return listOfreleases;
}

const populateResourcesCell =function populateResourcesCell(row, config) {
  const resources = document.createElement('td');
  const div = document.createElement('div');
  div.setAttribute('class', 'enabler-resources');
  row.data.resources.forEach(resource => {
    const link = document.createElement('a');
    const resourceType = resource.resourceType
    let url = ''
    let iconImg = ''

    if (resourceType === 'Overview') {
      url = `${config.ftp}${row.abbreviation}/${resource.url}`
      iconImg = 'fas fa-book'
    } else if (resourceType === 'API') {
      url = resource.url
      iconImg = 'fas fa-search'
    } else if (resourceType === 'Issue') {
      url = resource.url
      iconImg = 'fas fa-bug'
    } else if (resourceType === 'Tool') {
      url = resource.url
      iconImg = 'fas fa-wrench'
    } else if (resourceType === 'Registry') {
      url = resource.url
      iconImg = 'fab fa-github'
    }

    link.setAttribute('href', url);
    link.setAttribute('class', 'resource-link');
    link.setAttribute('title', resource.name);
    link.setAttribute('target', 'blank');

    const icon = document.createElement('i');
    icon.setAttribute('class', iconImg);
    link.appendChild(icon)

    div.appendChild(link)
  });
  resources.appendChild(div);
  return resources;
}

const selectVersionsByStatus = function selectVersionsByStatus(versions, status) {
    const result = [];
    versions.forEach((version) => {
      if (version.status === status) {
        result.push(version);
      }
    });
  return result
}

const populateCandidateCell = function populateCandidateCell(row, config) {
  const omaCandidateStatus = document.createElement('td');
  if (row && row.data && row.data.versions && row.data.versions.length > 0) {
    const candidateSet = selectVersionsByStatus(row.data.versions, 'Candidate');

    candidateSet.reverse().forEach((item) => {
      const spanVersion = document.createElement('span');
      spanVersion.setAttribute('class', 'enabler-version');
      const link = document.createElement('a');
      link.setAttribute('href', `${config.ftp}${row.abbreviation}/${item.name}`);
      link.setAttribute('target', 'blank');
      link.appendChild(document.createTextNode(`${item.version}`));
      spanVersion.appendChild(link);

      const spanDate = document.createElement('span');
      spanDate.setAttribute('class', 'enabler-date')
      spanDate.appendChild(document.createTextNode(item.date));

      omaCandidateStatus.appendChild(spanVersion);
      omaCandidateStatus.appendChild(spanDate);
      omaCandidateStatus.appendChild(document.createElement('br'));
    })

  }
  return omaCandidateStatus;
}

const populateReleaseCell =function populateReleaseCell(row, config) {
  const omaReleaseStatus = document.createElement('td');
  if (row && row.data && row.data.versions && row.data.versions.length > 0) {
    const releaseSet = selectVersionsByStatus(row.data.versions, 'Approved');

    releaseSet.reverse().forEach((item) => {
      const spanVersion = document.createElement('span');
      spanVersion.setAttribute('class', 'enabler-version')
      const link = document.createElement('a');
      link.setAttribute('href', `${config.ftp}${row.abbreviation}/${item.name}`);
      link.setAttribute('target', 'blank');
      link.appendChild(document.createTextNode(`${item.version}`));
      spanVersion.appendChild(link);

      const spanDate = document.createElement('span');
      spanDate.setAttribute('class', 'enabler-date')
      spanDate.appendChild(document.createTextNode(item.date));

      omaReleaseStatus.appendChild(spanVersion);
      omaReleaseStatus.appendChild(spanDate);
      omaReleaseStatus.appendChild(document.createElement('br'));
    })
  }
  return omaReleaseStatus;
}

$(document).ready(createAndPopulateEnablersTable());
