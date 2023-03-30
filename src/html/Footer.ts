import { createSwarmSvg } from './SwarmSvg'

export function createFooter() {
    return `<footer>${createSwarmSvg()} Hosted on Swarm</footer>`
}
