set -e

# run the validate and unit tests
# validate will run lint and typescript build
yarn validate
mkdir coverage  # needed for reports to have a place to go
yarn test:unit
