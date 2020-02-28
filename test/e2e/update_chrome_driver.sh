#! /bin/bash

function getOs() {
    # MacOS or Linux?
    sw_vers 2>/dev/null
    RETVAL=$?
    if [[ ${RETVAL} == 0 ]];
    then
      OS=mac
    else
      OS=*nix
    fi
    echo "OS: ${OS}"
}

function getChromeVersion() {
    getOs
    # chrome version
    if [[ ${OS} == "mac" ]];
    then
      TEMP_CHROME_VER=$(/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version)
    else
      TEMP_CHROME_VER=$(google-chrome --product-version)
    fi
    echo "Chrome Version: ${TEMP_CHROME_VER}"
    CHROME_VER=$(echo ${TEMP_CHROME_VER} | sed -En 's/[^0-9]*([0-9]+)\..*/\1/p')
    echo "Chrome Version: ${CHROME_VER}"
}

function setChromeDriverVersion() {
    if [[ -z ${CHROME_DRIVER_VER} ]];
    then
        getChromeVersion

        # Chrome Version to chromedriver mapping
        case $CHROME_VER in
            73)
                CHROMEDRIVER_VERSION=LATEST_73 npm install chromedriver
            ;;
            74)
                CHROMEDRIVER_VERSION=LATEST_74 npm install chromedriver
            ;;
            75)
                CHROMEDRIVER_VERSION=LATEST_75 npm install chromedriver
            ;;
            76)
                CHROMEDRIVER_VERSION=LATEST_76 npm install chromedriver
            ;;
            77)
                CHROMEDRIVER_VERSION=LATEST_77 npm install chromedriver
            ;;
            78)
                CHROMEDRIVER_VERSION=LATEST_78 npm install chromedriver
            ;;
            79)
                CHROMEDRIVER_VERSION=LATEST_79 npm install chromedriver
            ;;	
            80)
                CHROMEDRIVER_VERSION=LATEST_80 npm install chromedriver
            ;;
        esac
    fi
    echo "Chrome Driver Version: ${CHROME_DRIVER_VER}"
}

setChromeDriverVersion
