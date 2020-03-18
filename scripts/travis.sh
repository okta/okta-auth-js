set -e
# if this build was triggered via a cron job, run tests on sauce labs
if [ "${TRAVIS_EVENT_TYPE}" = "cron" ] ; then
    export RUN_SAUCE_TESTS=true;
    yarn test:e2e
else
    # run the lint and e2e tests (on chrome headless)
    yarn lint
    yarn test
fi
