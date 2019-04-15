# AwsWebSockets
Easily provision an AWS API Gateway Websockets using [Serverless Components](https://github.com/serverless/components)

&nbsp;

1. [Install](#1-install)
2. [Create](#2-create)
3. [Configure](#3-configure)
4. [Deploy](#4-deploy)

&nbsp;


### 1. Install

```console
$ npm install -g @serverless/components
```

### 2. Create


```console
$ mkdir my-websockets-backend && cd my-websockets-backend
```

the directory should look something like this:


```
|- code
  |- handler.js   # the lambda function handler that would receive the websockets events
  |- package.json # optional
|- serverless.yml
|- .env      # your development AWS api keys
|- .env.prod # your production AWS api keys
```
the `.env` files are not required if you have the aws keys set globally and you want to use a single stage, but they should look like this.

```
AWS_ACCESS_KEY_ID=XXX
AWS_SECRET_ACCESS_KEY=XXX
```

### 3. Configure

```yml
# serverless.yml

name: my-websockets-backend
stage: dev

myLambda:
  component: "@serverless/aws-lambda"
  inputs:
    name: my-function
    code: ./code
    handler: handler.hello
myWebsocketApig:
  component: "@serverless/aws-websockets"
  inputs:
    name: my-websockets-api
    description: My Websockets API
    deploymentStage: dev # AWS API Stage
    routeSelectionExpression: '$request.body.action'
    routes:
      $connect: ${comp:myLambda.arn}
      $disconnect: ${comp:myLambda.arn}
      $default: ${comp:myLambda.arn}
      message: ${comp:myLambda.arn} # you can specify any route
    regoin: us-east-1
```

### 4. Deploy

```console
myWebsocketApig (master)$ components

  myLambda › outputs:
  name:  'my-function'
  description:  'AWS Lambda Component'
  memory:  512
  timeout:  10
  code:  './code'
  bucket:  undefined
  shims:  []
  handler:  'handler.hello'
  runtime:  'nodejs8.10'
  env: 
  role: 
    name:  'my-function'
    arn:  'arn:aws:iam::552760238299:role/my-function'
    service:  'lambda.amazonaws.com'
    policy:  { arn: 'arn:aws:iam::aws:policy/AdministratorAccess' }
  arn:  'arn:aws:lambda:us-east-1:552760238299:function:my-function'

  myWebsocketApig › outputs:
  name:  'my-websockets-api'
  deploymentStage:  'dev'
  description:  'My Websockets API'
  routeSelectionExpression:  '$request.body.action'
  routes: 
    $connect:  'arn:aws:lambda:us-east-1:552760238299:function:my-function'
    $disconnect:  'arn:aws:lambda:us-east-1:552760238299:function:my-function'
    $default:  'arn:aws:lambda:us-east-1:552760238299:function:my-function'
    message:  'arn:aws:lambda:us-east-1:552760238299:function:my-function'
  id:  'vwd0sx6f5g'
  url:  'wss://vwd0sx6f5g.execute-api.us-east-1.amazonaws.com/dev/'


  32s › dev › my-websockets-backend › done

myWebsocketApig (master)$
```
For a real world example of how this component could be used, [take a look at how the Socket component is using it](https://github.com/serverless-components/Socket/blob/master/serverless.js#L62).

&nbsp;

### New to Components?

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
