#Ideas 

# Open source development

Because *Api* - is a simple configured function it is easy to create APIs for popular open api services and publish them
to npm. 

For example twitter api:

```js
// twitter-api.js
import api from 'bivrost/http/api';

export default (authToken, config = {}) => {
  const adapter = fetchAdapter();
  
  let apiInstance = api({
    protocol: 'https:',
    host: 'api.twitter.com'
    prefix: '1.1',
    ...config,
    headers: {
      ...config.headers,
      TwitterOAuth: authToken
    },
    adapter: fetchAdapter();
  });
   
  // Returns the 20 most recent mentions (tweets containing a users’s @screen_name) 
  // for the authenticating user.
  apiInstance.mentionsTimeline = apiInstance('GET /statuses/mentions_timeline');
  
  // Returns a single Tweet, specified by the id parameter.
  apiInstance.show = apiInstance('GET /statuses/show/:id');
  
  return apiInstance;
}
```

```js
import twitterApi from 'twitter-api'

const api = twitterApi(AUTH_TOKEN);

api.mentionsTimeline()
    .then(() => {}, () => {});

api.show({
    id: TWEET_ID
}).then(() => {}, () => {});
```

Same could be implemented for

- Github
- Open weather api
- Slack chat
- Reddit
- Twitter
- numbers of other services

# Slack API

[Slack](https://slack.com/) - is a cloud-based team collaboration tool with powerful api. So we could provide api function
that post messages to slack channels.


# Local development

Api could be grouped by environment:
 
 - api/dev
 - api/staging
 - api/prod

Also it is easy to auto generate api function according to environment config:
```js
import fetchAdapter from 'bivrost-fetch-adapter';
import env from 'environment';

export default () => {
  return api({
    adapter: fetchAdapter(),
    protocol: env('api.protocol'),
    host: env('api.host'),
    prefix: env('api.prefix')
  });
}
```
  
Another useful case - group api by services:
 
 - api/auth
 - api/users
 - api/statistics

This is very useful because such api functions could be easily shared between other application via local npm 
or git repositories.
