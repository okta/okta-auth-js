# MyAccount API

MyAccount APIs enables everything needed for the customer's end user to manage one's account. The API assumes the access token is obtained through the OAuth2 either by the classic or IDX flow.

Certain token scopes will be needed to gain the permission to read/manage the account resources:

* profile:
```
okta.myAccount.read
okta.myAccount.manage
```

* email:
```
okta.myaccount.email.read
okta.myaccount.email.manage
```

* phone:
```
okta.myaccount.phone.read
okta.myaccount.phone.manage
```

See [MyAccount API Doc](/docs/myaccount/modules/index.md) for detailed API definitions.