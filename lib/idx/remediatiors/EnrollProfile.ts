import Base from './Base';

export default class EnrollProfile extends Base {
  map = {};

  mapUserProfile() {
    const { firstName, lastName, email } = this.values;
    return {
      firstName,
      lastName,
      email,
    };
  }
}