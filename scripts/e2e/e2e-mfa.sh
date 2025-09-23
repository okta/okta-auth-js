#!/bin/bash

source $(dirname "${BASH_SOURCE[0]}")/../setup-e2e.sh

setup_e2e

# overrides
export USERNAME=email-login@email.ghostinspector.com
# NOTE: uses same password as george

export TEST_NAME=e2e-mfa

# This client has MFA (security question) enabled
export CLIENT_ID=0oa41zpqqxar7OFl84x7
export SPA_CLIENT_ID=0oa41zpqqxar7OFl84x7
export MFA_ENABLED=true

get_terminus_secret "/" security_question_answer SECURITY_QUESTION_ANSWER
get_terminus_secret "/" a18n_api_key A18N_API_KEY
export A18N_API_KEY='foo'

run_e2e
