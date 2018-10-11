module.exports = {
  "status": 200,
  "responseType": "json",
  "response": {
    "subject": "acct:john.joe@example.com",
    "links":
    [
      {
        "rel" : "okta:idp",
        "href" : "https://org.okta.com/sso/saml2/0oad5lTSBOMUBOBVVQSC",
        "titles": {
          "und" : "Acme Partner IdP"
        },
        "properties": {
          "okta:logo" : "https://ok3static.oktacdn.com/bc/image/fileStoreRecord?id=fs0w8swww6KGUZZWGSHS",
          "okta:idp:metadata": "http://org.okta.com/api/v1/idps/0oamy8gz2llVopxdr0g3/metadata.xml",
          "okta:idp:id": "0oamy8gz2llVopxdr0g3",
          "okta:idp:type": "SAML2"
        }
      }
    ]
  }
};
