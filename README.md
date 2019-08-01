# aws-websockets
Easily provision an AWS API Gateway Websockets using [Serverless Components](https://github.com/serverless/components)

&nbsp;

1. [Install](#1-install)
2. [Create](#2-create)
3. [Configure](#3-configure)
4. [Deploy](#4-deploy)

&nbsp;


### 1. Install

```console
$ npm install -g serverless
```

### 2. Create


```console
$ mkdir my-websockets-backend && cd my-websockets-backend
```

the directory should look something like this:


```
|- serverless.yml
|- .env           # your AWS api keys
|- code
  |- handler.js   # the lambda function handler that would receive the websockets events
  |- package.json # optional
```
```
# .env
AWS_ACCESS_KEY_ID=XXX
AWS_SECRET_ACCESS_KEY=XXX
```

### 3. Configure

```yml
# serverless.yml

myLambda:
  component: "@serverless/aws-lambda"
  inputs:
    code: ./code
    handler: handler.hello
myWebsocketApig:
  component: "@serverless/aws-websockets"
  inputs:
    description: My Websockets API
    deploymentStage: dev # AWS API Stage
    routeSelectionExpression: '$request.body.action'
    routes:
      $connect: ${myLambda.arn}
      $disconnect: ${myLambda.arn}
      $default: ${myLambda.arn}
      message: ${myLambda.arn} # you can specify any route
    regoin: us-east-1
```

### 4. Deploy

```console
$ serverless
```
For a real world example of how this component could be used, [take a look at how the socket component is using it](https://github.com/serverless-components/backend-socket/).

&nbsp;

### New to Components?

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
