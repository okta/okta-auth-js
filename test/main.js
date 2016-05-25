function requireAll(requireContext) {
  requireContext.keys().map(requireContext);
}
require('./util/jasmine-extensions');
requireAll(require.context('./spec', true, /.*/));
