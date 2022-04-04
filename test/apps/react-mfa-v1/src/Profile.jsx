import React, { useContext, useEffect, useState } from 'react';
import OktaContext from './OktaContext';

const Profile = () => {
  const { oktaAuth, authState } = useContext(OktaContext);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const { accessToken } = authState;
    if (!accessToken) {
      setUserInfo(null);
    } else {
      oktaAuth.getUser().then((info) => {
        setUserInfo(info);
      });
    }
  }, [oktaAuth, authState]);

  if (!userInfo) {
    return (
      <div>
        <p>Fetching user profile...</p>
      </div>
    );
  }

  return (
    <div id="user-info">
      <h1>My User Profile</h1>
      <table>
        <thead>
          <tr>
            <th>Claim</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(userInfo).map((claimEntry) => {
            const claimName = claimEntry[0];
            const claimValue = claimEntry[1];
            const claimId = `claim-${claimName}`;
            return (
              <tr key={claimName}>
                <td>{claimName}</td>
                <td id={claimId}>{claimValue.toString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Profile;
