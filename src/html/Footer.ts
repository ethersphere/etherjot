import { Objects } from 'cafe-utility'
import { GlobalState } from '../engine/GlobalState'
import { createDiscordSvg } from './DiscordSvg'
import { createGithubSvg } from './GithubSvg'
import { createRedditSvg } from './RedditSvg'
import { createSwarmSvg } from './SwarmSvg'
import { createTwitterSvg } from './TwitterSvg'
import { createYoutubeSvg } from './YoutubeSvg'

export function createFooter(globalState: GlobalState) {
    const description = Objects.getDeep(globalState.configuration as any, 'footer.description')
    const descriptionHtml = description ? `<p class="footer-description">${description}</p>` : ''
    const discord = Objects.getDeep(globalState.configuration as any, 'footer.links.discord')
    const discordHtml = discord ? createLinkSvg(createDiscordSvg(), 'Discord', discord as string) : ''
    const github = Objects.getDeep(globalState.configuration as any, 'footer.links.github')
    const githubHtml = github ? createLinkSvg(createGithubSvg(), 'GitHub', github as string) : ''
    const twitter = Objects.getDeep(globalState.configuration as any, 'footer.links.twitter')
    const twitterHtml = twitter ? createLinkSvg(createTwitterSvg(), 'Twitter', twitter as string) : ''
    const reddit = Objects.getDeep(globalState.configuration as any, 'footer.links.reddit')
    const redditHtml = reddit ? createLinkSvg(createRedditSvg(), 'Reddit', reddit as string) : ''
    const youtube = Objects.getDeep(globalState.configuration as any, 'footer.links.youtube')
    const youtubeHtml = youtube ? createLinkSvg(createYoutubeSvg(), 'YouTube', youtube as string) : ''
    return `
    <footer>
        <div class="content-area">
            <div class="footer-container">
                <div class="footer-info">
                    ${createSwarmSvg()}${descriptionHtml}
                </div>
                <div class="footer-links">
                    ${discordHtml}
                    ${githubHtml}
                    ${twitterHtml}
                    ${redditHtml}
                    ${youtubeHtml}
                </div>
            </div>
        </div>
    </footer>`
}

function createLinkSvg(svg: string, label: string, url: string) {
    return `<a class="footer-link" href="${url}" target="_blank">${svg} ${label}</a>`
}
