// Default config. Properties here match the names of query parameters in the URL
var config = {
  issuer: '',
  clientId: '',
  scopes: {{{ scopes }}},
  storage: '{{ storage }}',
  useInteractionCodeFlow: true,
  requireUserSession: '{{ requireUserSession }}',
  authMethod: '{{ authMethod }}',
  startService: false,
  useDynamicForm: false,
  uniq: Date.now() + Math.round(Math.random() * 1000), // to guarantee a unique state
  {{#if signinWidget}}
  idps: '',
  {{/if}}
  idpDisplay: 'popup'
};

/* eslint-disable max-statements,complexity */
function loadConfig() {
  // Read all config from the URL
  var url = new URL(window.location.href);
  var redirectUri = window.location.origin + '{{ redirectPath }}'; // Should also be set in Okta Admin UI
  
  // Params which are not in the state
  var stateParam = url.searchParams.get('state'); // received on login redirect callback
  var error = url.searchParams.get('error'); // received on login redirect callback
  var showForm = url.searchParams.get('showForm'); // forces config form to show
  var getTokens = url.searchParams.get('getTokens'); // forces redirect to get tokens
  var recoveryToken = url.searchParams.get('recoveryToken');

  // Params which are encoded into the state
  var issuer;
  var clientId;
  var appUri;
  var storage;
  var authMethod;
  var startService;
  var requireUserSession;
  var scopes;
  var useInteractionCodeFlow;
  var useDynamicForm;
  var idpDisplay;

  {{#if signinWidget}}
  var idps;
  {{/if}}

  var state;
  try {
    // State will be passed on callback. If state exists in the URL parse it as a JSON object and use those values.
    state = stateParam ? JSON.parse(stateParam) : null;
  } catch (e) {
    console.warn('Could not parse state from the URL.');
  }
  if (state) {
    // Read from state
    issuer = state.issuer;
    clientId = state.clientId;
    storage = state.storage;
    authMethod = state.authMethod;
    startService = state.startService;
    requireUserSession = state.requireUserSession;
    scopes = state.scopes;
    useInteractionCodeFlow = state.useInteractionCodeFlow;
    useDynamicForm = state.useDynamicForm;
    config.uniq = state.uniq;
    {{#if signinWidget}}
    idps = state.idps;
    {{/if}}
    idpDisplay = state.idpDisplay;
  } else {
    // Read individually named parameters from URL, or use defaults
    // Note that "uniq" is not read from the URL to prevent stale state
    issuer = url.searchParams.get('issuer') || config.issuer;
    clientId = url.searchParams.get('clientId') || config.clientId;
    storage = url.searchParams.get('storage') || config.storage;
    authMethod = url.searchParams.get('authMethod') || config.authMethod;
    startService = url.searchParams.get('startService') === 'true' || config.startService;
    requireUserSession = url.searchParams.get('requireUserSession') ? 
      url.searchParams.get('requireUserSession')  === 'true' : config.requireUserSession;
    scopes = url.searchParams.get('scopes') ? url.searchParams.get('scopes').split(' ') : config.scopes;
    useInteractionCodeFlow = url.searchParams.get('useInteractionCodeFlow') === 'true' || config.useInteractionCodeFlow;
    useDynamicForm = url.searchParams.get('useDynamicForm') === 'true' || config.useDynamicForm;
    {{#if signinWidget}}
    idps = url.searchParams.get('idps') || config.idps;
    {{/if}}
    idpDisplay = url.searchParams.get('idpDisplay') || config.idpDisplay;
  }
  // Create a canonical app URI that allows clean reloading with this config
  appUri = window.location.origin + '/' + '?' + Object.entries({
    issuer,
    clientId,
    storage,
    requireUserSession,
    authMethod,
    startService,
    scopes: scopes.join(' '),
    useInteractionCodeFlow,
    useDynamicForm,
    {{#if signinWidget}}
    idps,
    {{/if}}
    idpDisplay
  }).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  // Add all app options to the state, to preserve config across redirects
  state = {
    uniq: config.uniq,
    issuer,
    clientId,
    storage,
    requireUserSession,
    authMethod,
    startService,
    scopes,
    useInteractionCodeFlow,
    useDynamicForm,
    {{#if signinWidget}}
    idps,
    {{/if}}
    idpDisplay
  };
  var newConfig = {};
  Object.assign(newConfig, state);
  Object.assign(newConfig, {
    // ephemeral options, will not survive a redirect
    appUri,
    redirectUri,
    state,
    error,
    showForm,
    getTokens,
    recoveryToken
  });
  Object.assign(config, newConfig);
  // Render the config to HTML
  var logConfig = {};
  var skipKeys = ['state', 'appUri', 'error', 'showForm', 'getTokens']; // internal config
  Object.keys(config).forEach(function(key) {
    if (skipKeys.indexOf(key) < 0) {
      logConfig[key] = config[key];
    }
  });
  document.getElementById('config').innerText = stringify(logConfig);
}


function showForm() {
  // Set values from config
  document.getElementById('issuer').value = config.issuer;
  document.getElementById('clientId').value = config.clientId;
  document.getElementById('scopes').value = config.scopes.join(' ');
  {{#if signinWidget}}
  document.getElementById('idps').value = config.idps;
  {{/if}}
  try {
    document.querySelector(`#authMethod [value="${config.authMethod || ''}"]`).selected = true;
  } catch (e) { showError(e); }

  if (config.startService) {
    document.getElementById('startService-on').checked = true;
  } else {
    document.getElementById('startService-off').checked = true;
  }

  if (config.requireUserSession) {
    document.getElementById('requireUserSession-on').checked = true;
  } else {
    document.getElementById('requireUserSession-off').checked = true;
  }
  try {
    document.querySelector(`#storage [value="${config.storage || ''}"]`).selected = true;
  } catch (e) { showError(e); }

  {{#if authn}}
  if (config.useInteractionCodeFlow) {
    document.getElementById('useInteractionCodeFlow-on').checked = true;
  } else {
    document.getElementById('useInteractionCodeFlow-off').checked = true;
  }
  {{/if}}
  
  if (config.useDynamicForm) {
    document.getElementById('useDynamicForm-on').checked = true;
  } else {
    document.getElementById('useDynamicForm-off').checked = true;
  }

  if (config.idpDisplay === 'page') {
    document.getElementById('idpDisplay-page').checked = true;
  } else {
    document.getElementById('idpDisplay-popup').checked = true;
  }

  // Show the form
  document.getElementById('config-form').style.display = 'block'; // show form

  onChangeAuthMethod();
}

function onChangeAuthMethod() {
  const authMethod = document.getElementById('authMethod').value;
  document.querySelector('#form .field-useDynamicForm').style.display = authMethod == 'form' ? 'block' : 'none';
  {{#if signinWidget}}
  document.querySelector('#form .field-idps').style.display = authMethod == 'widget' ? 'block' : 'none';
  {{/if}}
}
window._onChangeAuthMethod = onChangeAuthMethod;

// Keep us in the same tab
function onSubmitForm(event) {
  event.preventDefault();

  // clear transaction data to prevent odd behavior when switching to static form
  sessionStorage.clear();

  // eslint-disable-next-line no-new
  new FormData(document.getElementById('form')); // will fire formdata event
}
window._onSubmitForm = onSubmitForm;

function onFormData(event) {
  let data = event.formData;
  let params = {};
  for (let key of data.keys()) {
    params[key] = data.get(key);
  }
  const query = '?' + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  const newUri = window.location.origin + '/' + query;
  window.location.replace(newUri);
}
window._onFormData = onFormData;
