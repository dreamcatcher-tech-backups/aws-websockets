const aws = require('aws-sdk')
const { pick, mergeDeepRight, not } = require('ramda')
const { Component } = require('@serverless/core')
const {
  getApiId,
  createApi,
  updateApi,
  createIntegration,
  getRoutes,
  createRoute,
  removeRoutes,
  createDeployment,
  removeApi,
  getWebsocketUrl
} = require('./utils')

const outputsList = [
  'name',
  'stage',
  'description',
  'routeSelectionExpression',
  'routes',
  'id',
  'url',
  'region'
]

const defaults = {
  stage: 'dev',
  description: 'Serverless WebSockets',
  routeSelectionExpression: '$request.body.action',
  routes: {}, // key (route): value (lambda arn)
  region: 'us-east-1'
}

class WebSockets extends Component {
  async default(inputs = {}) {
    const config = mergeDeepRight(defaults, inputs)

    config.name = this.state.name || this.context.resourceId()

    const apig2 = new aws.ApiGatewayV2({
      region: config.region,
      credentials: this.context.credentials.aws
    })
    const lambda = new aws.Lambda({
      region: config.region,
      credentials: this.context.credentials.aws
    })

    this.context.status(`Deploying`)
    this.context.debug(
      `Deploying websockets api with name ${config.name} to the ${config.region} region.`
    )

    config.id = await getApiId({ apig2, id: config.id || this.state.id }) // validate with provider

    const definedRoutes = Object.keys(config.routes || {})
    const providerRoutes = await getRoutes({ apig2, id: config.id })

    if (!config.id) {
      this.context.status(`Creating`)
      this.context.debug(
        `Creating websockets api named ${config.name} in the ${config.region} region.`
      )
      config.id = await createApi({ apig2, ...config })
    } else {
      this.context.status(`Updating`)
      this.context.debug(
        `Updating websockets api named ${config.name} in the ${config.region} region.`
      )
      await updateApi({ apig2, ...config })
    }

    const routesToDeploy = definedRoutes.filter((route) => not(providerRoutes.includes(route)))
    const routesToRemove = providerRoutes.filter((route) => not(definedRoutes.includes(route)))

    this.context.debug(`Deploying routes for websockets api named ${config.name}.`)

    await Promise.all(
      routesToDeploy.map(async (route) => {
        const arn = config.routes[route]
        const integrationId = await createIntegration({ apig2, lambda, id: config.id, arn })
        await createRoute({ apig2, id: config.id, integrationId, route })
      })
    )

    this.context.debug(`Removing outdated routes for websockets api named ${config.name}.`)
    // remove routes that don't exist in inputs
    await removeRoutes({ apig2, id: config.id, routes: routesToRemove })

    this.context.debug(`Creating new deployment for websockets api named ${config.name}.`)
    // deploy the API
    await createDeployment({ apig2, id: config.id, deploymentStage: config.stage })

    config.url = getWebsocketUrl({
      id: config.id,
      region: config.region,
      deploymentStage: config.stage
    })

    this.context.debug(
      `Websockets api with id ${config.id} was successfully deployed in the ${config.region} region.`
    )
    this.context.debug(`Websockets url is ${config.url}.`)

    // if the user has changed thse id,
    // remove the previous API
    if (this.state.id && this.state.id !== config.id) {
      this.context.status(`Replacing`)
      await removeApi({ apig2, id: config.id })
    }

    this.state.name = config.name
    this.state.id = config.id
    this.state.url = config.url
    this.state.region = config.region
    await this.save()

    const outputs = pick(outputsList, config)

    return outputs
  }

  async remove() {
    const { id, region } = this.state

    if (!id) {
      this.context.debug(`Aboring removal. Websockets id not found in state.`)
    }
    const apig2 = new aws.ApiGatewayV2({
      region: region,
      credentials: this.context.credentials.aws
    })

    this.context.status(`Removing`)
    this.context.debug(`Removing websockets api with id ${id} from the ${region} region.`)

    await removeApi({ apig2, id })

    this.context.debug(
      `Websockets api with id ${id} was successfully removed from the ${region} region.`
    )

    this.state = {}
    await this.save()

    return {}
  }
}

module.exports = WebSockets
