async function getUserCredentials(formValues) {

    // cognito identity pool --> unauthorized access
    const IDENTITY_POOL_ID = "us-east-1:36443c37-e549-4df6-a605-ac0d9ffd6742";
    AWS.config.region = formValues.region;
    AWS.config.credentials = await new AWS.CognitoIdentityCredentials({IdentityPoolId: IDENTITY_POOL_ID,
        RoleArn: 'arn:aws:iam::238354970690:role/Cognito_voting_appUnauth_Role'});
  }