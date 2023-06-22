import { Files } from 'cafe-node-utility'
import { Objects, Strings } from 'cafe-utility'
import { GlobalState, getPath } from '../engine/GlobalState'
import { createDiscordSvg } from './DiscordSvg'
import { createGithubSvg } from './GithubSvg'
import { createHomeSvg } from './HomeSvg'
import { createModalCode } from './Modal'
import { createNewsletterSvg } from './NewsletterSvg'
import { createRedditSvg } from './RedditSvg'
import { createSwarmSvg } from './SwarmSvg'
import { createTwitterSvg } from './TwitterSvg'
import { createYoutubeSvg } from './YoutubeSvg'

export async function createFooter(globalState: GlobalState, depth: number) {
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
    const link = Objects.getDeep(globalState.configuration as any, 'header.link')
    const linkHtml = link
        ? `${Strings.resolveMarkdownLinks(
              link as string,
              (_, link) => `<a class="footer-link" href="${link}" target="_blank">${createHomeSvg()} Visit website</a>`
          )}`
        : ''
    const newsletterHtml = (await Files.existsAsync(getPath('.jot.newsletter.html')))
        ? `<a class="footer-link" href="${'../'.repeat(
              depth
          )}newsletter" target="_blank">${createNewsletterSvg()} Newsletter</a>`
        : ''

    return `
    <footer>
        <div class="grid-container content-area">
            <div class="grid-3 footer-info">
                ${createSwarmSvg()}${descriptionHtml}
            </div>
            <div class="grid-3">
            </div>
            <div class="grid-3">
                ${linkHtml}
                ${newsletterHtml}
            </div>
            <div class="grid-3 footer-links">
                ${discordHtml}
                ${githubHtml}
                ${twitterHtml}
                ${redditHtml}
                ${youtubeHtml}
            </div>
        </div>
        <script>
            ${createModalCode()}
        </script>
    </footer>`
}

function createLinkSvg(svg: string, label: string, url: string) {
    return `<a class="footer-link" href="${url}" target="_blank">${svg} ${label}</a>`
}
