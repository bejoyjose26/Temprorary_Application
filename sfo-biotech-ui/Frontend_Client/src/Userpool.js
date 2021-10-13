import { CognitoUserPool } from 'amazon-cognito-identity-js';


const poolData = {
  UserPoolId: 'us-west-2_sYDErn7SE',
  ClientId: '3rfiqbq2nb1lcaorgnekd47hae'
};

export default new CognitoUserPool(poolData);