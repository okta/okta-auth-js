
class Unauth {
  get body() { return 'body.unauth'; }
  get loginRedirect() { return '#login-redirect'; }
}

export default new Unauth();
