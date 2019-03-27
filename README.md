# AwsWebSockets
A serverless component that provisions an Aws Websockets API

## Usage

### Declarative

```yml

name: my-websockets-api
stage: dev

AwsWebSockets@0.1.1::my-websockets:
  name: my-websockets-api
  description: My Websockets API
  deploymentStage: dev # AWS API Stage
  routeSelectionExpression: '$request.body.action'
  routes:
    $connect: arn:aws:some:lambda:arn
    $disconnect: arn:aws:some:lambda:arn
    $default: arn:aws:some:lambda:arn
  regoin: us-east-1
```



### Programatic

```
npm i --save @serverless/aws-websockets
```

```js

const websockets = await this.load('@serverless/aws-websockets')

const inputs = {
  name: 'my-websockets-api',
  deploymentStage: 'dev',
  description: 'Serverless WebSockets',
  routeSelectionExpression: '$request.body.action',
  routes: {
    '$connect': 'arn:aws:some:lambda:arn',
    '$disconnect': 'arn:aws:some:lambda:arn',
    '$default': 'arn:aws:some:lambda:arn' 
  },
  region: 'us-east-1'
}

await websockets(inputs)

```

