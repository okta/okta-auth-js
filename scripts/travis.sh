set -e

# run the validate and unit tests
# validate will run lint and typescript build
yarn validate
yarn test:unit