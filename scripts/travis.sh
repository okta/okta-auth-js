set -e
# if this build was triggered via a cron job, run tests on sauce labs
if [ "${TRAVIS_EVENT_TYPE}" = "cron" ] ; then
    export RUN_SAUCE_TESTS=true;
    yarn test:e2e
else
    # run the validate and e2e tests (on chrome headless)
    # validate will run lint and typescript build
    yarn validate
    yarn test
fi
