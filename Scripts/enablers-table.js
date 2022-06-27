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

const compareVersions = function compareVersions(verA, verB, level) {
  if (typeof verA !== 'string' || typeof verB !== 'string') {
    return false;
  }
  const v1 = verA.substring(1, verA.length).split('.').map(i => parseInt(i, 10))
  const v2 = verB.substring(1, verA.length).split('.').map(i => parseInt(i, 10))

  while (v1.length < v2.length)  { v1.push(0) }
  while (v2.length < v1.length)  { v2.push(0) }

  const len = (level === undefined || level < 1) ? v1.length : Math.min(v1.length, level)

  for (let i = 0; i < len; i += 1) {
    if (v1[i] > v2[i]) return 1
    if (v2[i] > v1[i]) return -1
  }

  return 0
}

const isCandidateVersionApproved = function isCandidateVersionApproved(versions, versionStr) {
  const sameVarsionApproved = versions.filter((item) => ['Approved', 'Historic'].includes(item.status) &&
    compareVersions(item.version, versionStr) === 0);
  return sameVarsionApproved.length > 0;
}

const filterLastCandicatePerVersion = function filterLastCandicatePerVersion(versions, versionStr) {
  const sameVersionCandidate = versions.filter(item => ['Candidate'].includes(item.status) &&
    compareVersions(item.version, versionStr, 2) === 0);

  sameVersionCandidate.sort((a, b) => a.date > b.date);
  sameVersionCandidate.forEach((item, index) => {
    if (index === 0) {
      item.important = true;
    } else {
      item.important = false;
    }
  });
}

const markInportantVersion = function markInportantVersion(item, index, items) {
  item.important = true;
  if (item.status === 'Candidate') {
    // check if there is Approved or Historic version based on this one
    if (isCandidateVersionApproved(items, item.version)) {
      item.important = false;
    } else {
      filterLastCandicatePerVersion(items, item.version);
    }
  }
};

const removeRedundantItems = function removeRedundantItems(item, index, items) {
  if (item.important) {
    if (item.status === 'Candidate') {
      // is this the highest candidate
      const MajorItems = items.filter(element => (element.status === 'Candidate' &&
        element.important && compareVersions(element.version, item.version) > 0))

      if (MajorItems.length > 0) {
        item.important = false
      }
    } else if (item.status === 'Approved') {
      // is this the highest Approved version
      const MajorItems = items.filter(element => (element.status === 'Approved' &&
        element.important && compareVersions(element.version, item.version, 2) === 0) && element !== item)

      const sameHistoric = items.filter(element => (element.status === 'Historic' &&
        element.important && compareVersions(element.version, item.version) === 0))

      if ((MajorItems.length > 0 && MajorItems[0].date > item.date) || sameHistoric.length > 0) {
        item.important = false
      }
    }
  }
};

const prepareRowData = function prepareRowData(rowData) {
  // Select most resent Candidate version
  // that is not been Approved
  if (rowData && rowData.versions && rowData.versions.length > 0) {
   rowData.versions.forEach(markInportantVersion);
   rowData.versions.forEach(removeRedundantItems);
  }
}

const createEnablerRow = function createEnablerRow(row, config) {
  const tr = document.createElement('tr');
  const info = Object.create(config);

  if (row) {
    prepareRowData(row.data);
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

const isExternalUrl = function isExternalUrl(str) {
  const urlRegEx = /^(https?):\/\/[^\s$.?#].[^\s*$]/gm

  return urlRegEx.test(str)
}

const populateResourcesCell = function populateResourcesCell(row, config) {
  const resources = document.createElement('td');
  const div = document.createElement('div');
  div.setAttribute('class', 'enabler-resources');
  row.data.resources.forEach((resource, index, arr) => {
    const link = document.createElement('a');
    const resourceType = resource.resourceType
    let url = ''
    let iconImg = ''

    if (resourceType === 'Overview') {
      if (isExternalUrl(row.url)) {
        url = `${resource.url}`
      } else {
        url = `${config.ftp}${row.abbreviation}/${resource.url}`
      }
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
    } else if (resourceType === 'ETS') {
      url = resource.url
      iconImg = 'fas fa-flask'
    } else if (resourceType === 'EVP') {
      url = resource.url
      iconImg = 'fas fa-cubes'
    } else if (resourceType === 'TFP') {
      url = resource.url
      iconImg = 'fas fa-box'
    }

    link.setAttribute('href', url);
    link.setAttribute('class', 'resource-link');
    link.setAttribute('title', resource.name);
    link.setAttribute('target', 'blank');

    const icon = document.createElement('i');
    icon.setAttribute('class', iconImg);
    link.appendChild(icon)

    div.appendChild(link)
    if (arr.length > 6 && index > 0 && index % 4 === 0 ) {
      div.appendChild(document.createElement('br'));
    }
  });
  resources.appendChild(div);
  return resources;
}

const selectVersionsByStatus = function selectVersionsByStatus(versions, statuses) {
    const result = [];
    versions.forEach((version) => {
      if (statuses.includes(version.status) && version.important) {
        result.push(version);
      }
    });
  return result
}

const populateCandidateCell = function populateCandidateCell(row, config) {
  const omaCandidateStatus = document.createElement('td');
  if (row && row.data && row.data.versions && row.data.versions.length > 0) {
    const candidateSet = selectVersionsByStatus(row.data.versions, ['Candidate']);

    candidateSet.reverse().forEach((item) => {
      const spanVersion = document.createElement('span');
      spanVersion.setAttribute('class', 'enabler-version');
      const link = document.createElement('a');
      const linkText = item.status === 'Historic' ? `${item.version} Historic` : item.version;

      link.setAttribute('href', `${config.ftp}${row.abbreviation}/${item.name}`);
      link.setAttribute('target', 'blank');
      link.setAttribute('class', item.status === 'Historic' ? 'link-historic-version': 'link-candidate-version');

      if (item.date) {
        const dateStr = (new Date(item.date)).toLocaleDateString('en-US', {month: 'long', year: 'numeric'})
        link.setAttribute('title', dateStr);
      }
      link.appendChild(document.createTextNode(`${linkText}`));
      spanVersion.appendChild(link);

      omaCandidateStatus.appendChild(spanVersion);
      omaCandidateStatus.appendChild(document.createElement('br'));
      omaCandidateStatus.setAttribute('class', 'candidate-td');
    })

  }
  return omaCandidateStatus;
}

const populateReleaseCell =function populateReleaseCell(row, config) {
  const omaReleaseStatus = document.createElement('td');
  if (row && row.data && row.data.versions && row.data.versions.length > 0) {
    const releaseSet = selectVersionsByStatus(row.data.versions, ['Approved', 'Historic']);

    releaseSet.reverse().forEach((item) => {
      const spanVersion = document.createElement('span');
      spanVersion.setAttribute('class', 'enabler-version');
      const link = document.createElement('a');
      const linkText = item.status === 'Historic' ? `${item.version} Historic` : item.version;

      link.setAttribute('href', `${config.ftp}${row.abbreviation}/${item.name}`);
      link.setAttribute('target', 'blank');
      link.setAttribute('class', item.status === 'Historic' ? 'link-historic-version': 'link-approved-version');

      if (item.date) {
        const dateStr = (new Date(item.date)).toLocaleDateString('en-US', {month: 'long', year: 'numeric'});
        link.setAttribute('title', dateStr);
      }
      link.appendChild(document.createTextNode(`${linkText}`));
      spanVersion.appendChild(link);

      omaReleaseStatus.appendChild(spanVersion);
      omaReleaseStatus.appendChild(document.createElement('br'));
      omaReleaseStatus.setAttribute('class', 'approved-td');
    })
  }
  return omaReleaseStatus;
}

$(document).ready(createAndPopulateEnablersTable());
