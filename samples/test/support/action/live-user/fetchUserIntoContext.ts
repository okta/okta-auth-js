import { getConfig } from '../../../util';
import ActionContext from '../../context';
import fetchUser from '../../management-api/fetchUser';

export default async function(this: ActionContext) {
  const {username} = getConfig(); 
  this.user = await fetchUser(username as string);
}